import Redis from 'ioredis'
import createLocalLogger from '@utils/localLogger'

const logger = createLocalLogger('cache')

let isRedisReady = false
let redisClient: Redis | null = null

const getRedisClient = (): Redis => {
  if (redisClient) return redisClient

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy: (times) => {
      // Exponential backoff limitado a no máximo 5 segundos
      return Math.min(times * 200, 5000)
    }
  })

  redisClient.on('connect', () => {
    isRedisReady = true
    logger.info('Connected to Redis')
  })

  redisClient.on('ready', () => {
    isRedisReady = true
  })

  redisClient.on('error', (err) => {
    isRedisReady = false
    logger.warn(`Redis connection error: ${err.message}`)
  })

  redisClient.on('close', () => {
    isRedisReady = false
  })

  return redisClient
}

/**
 * Conecta ao Redis de forma não bloqueante.
 * Se o Redis não estiver disponível, registra o aviso e mantém a API operacional sem cache.
 */
export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient()
    await client.connect()
  } catch (error) {
    isRedisReady = false
    logger.warn('Could not establish initial connection to Redis. Continuing in bypass mode.')
  }
}

/**
 * Desconecta o cliente Redis graciosamente.
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit()
      logger.info('Redis client disconnected cleanly')
    } catch (error) {
      logger.error('Error disconnecting Redis client:', error)
    } finally {
      isRedisReady = false
      redisClient = null
    }
  }
}

// Mapa em memória para deduplicação de chamadas concorrentes (Single-flight)
const flightMap = new Map<string, Promise<unknown>>()

/**
 * Executa uma função assíncrona garantindo que chamadas idênticas em andamento
 * compartilhem a mesma Promise (evita Cache Stampede / Thundering Herd).
 */
export const singleFlight = async <T>(flightKey: string, fn: () => Promise<T>): Promise<T> => {
  const existing = flightMap.get(flightKey)
  if (existing) {
    return existing as Promise<T>
  }

  const promise = fn().finally(() => {
    flightMap.delete(flightKey)
  })

  flightMap.set(flightKey, promise)
  return promise
}

export const cacheService = {
  isAvailable(): boolean {
    return isRedisReady && redisClient !== null
  },

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null

    try {
      const data = await redisClient!.get(key)
      if (!data) return null
      return JSON.parse(data) as T
    } catch (error) {
      logger.warn(`Failed to read cache key "${key}":`, error)
      return null
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.isAvailable() || ttlSeconds <= 0) return

    try {
      const payload = JSON.stringify(value)
      await redisClient!.set(key, payload, 'EX', ttlSeconds)
    } catch (error) {
      logger.warn(`Failed to write cache key "${key}":`, error)
    }
  },

  async del(key: string): Promise<void> {
    if (!this.isAvailable()) return

    try {
      await redisClient!.del(key)
    } catch (error) {
      logger.warn(`Failed to delete cache key "${key}":`, error)
    }
  },

  async delPattern(pattern: string): Promise<void> {
    if (!this.isAvailable()) return

    try {
      let cursor = '0'
      do {
        const [nextCursor, keys] = await redisClient!.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
        cursor = nextCursor
        if (keys.length > 0) {
          await redisClient!.del(...keys)
        }
      } while (cursor !== '0')
    } catch (error) {
      logger.warn(`Failed to delete cache pattern "${pattern}":`, error)
    }
  },

  /**
   * Padrão Cache-Aside com Single-Flight integrado:
   * 1. Consulta o cache no Redis.
   * 2. Se não encontrar, protege com singleFlight para não duplicar chamadas à fonte externa.
   * 3. Salva no Redis com o TTL especificado.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    return singleFlight(key, async () => {
      // Re-checa o cache caso outra promise concorrente tenha recém-populado
      const secondCheck = await this.get<T>(key)
      if (secondCheck !== null) {
        return secondCheck
      }

      const freshData = await fetcher()
      if (freshData !== undefined && freshData !== null) {
        await this.set(key, freshData, ttlSeconds)
      }
      return freshData
    })
  }
}

export default cacheService
