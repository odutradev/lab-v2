import Redis from 'ioredis'

import createLocalLogger from '@utils/localLogger'

const logger = createLocalLogger('cache')

const redisState: { isReady: boolean; client: Redis | null } = {
  isReady: false,
  client: null
}

const getRedisClient = (): Redis => {
  if (redisState.client) return redisState.client

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy: (times) => Math.min(times * 200, 5000)
  })

  client.on('connect', () => {
    redisState.isReady = true
    logger.info('Connected to Redis')
  })

  client.on('ready', () => {
    redisState.isReady = true
  })

  client.on('error', (error) => {
    redisState.isReady = false
    logger.warn(`Redis connection error: ${error.message}`)
  })

  client.on('close', () => {
    redisState.isReady = false
  })

  redisState.client = client

  return client
}

export const connectRedis = async (): Promise<void> => {
  try {
    await getRedisClient().connect()
  } catch {
    redisState.isReady = false
    logger.warn('Could not establish initial connection to Redis. Continuing in bypass mode.')
  }
}

export const disconnectRedis = async (): Promise<void> => {
  if (!redisState.client) return

  try {
    await redisState.client.quit()
    logger.info('Redis client disconnected cleanly')
  } catch (error) {
    logger.error('Error disconnecting Redis client:', error)
  } finally {
    redisState.isReady = false
    redisState.client = null
  }
}

const flightMap = new Map<string, Promise<unknown>>()

export const singleFlight = async <T>(flightKey: string, fetcher: () => Promise<T>): Promise<T> => {
  const existingFlight = flightMap.get(flightKey)
  if (existingFlight) return existingFlight as Promise<T>

  const flight = fetcher().finally(() => {
    flightMap.delete(flightKey)
  })

  flightMap.set(flightKey, flight)
  return flight
}

const getAvailableClient = (): Redis | null => {
  return redisState.isReady ? redisState.client : null
}

const deleteKeysByPattern = async (client: Redis, pattern: string, cursor: string = '0'): Promise<void> => {
  const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)

  if (keys.length > 0) await client.del(...keys)
  if (nextCursor === '0') return

  return deleteKeysByPattern(client, pattern, nextCursor)
}

export const cacheService = {
  isAvailable: (): boolean => getAvailableClient() !== null,

  get: async <T>(key: string): Promise<T | null> => {
    const client = getAvailableClient()
    if (!client) return null

    try {
      const cachedValue = await client.get(key)
      if (!cachedValue) return null
      return JSON.parse(cachedValue) as T
    } catch (error) {
      logger.warn(`Failed to read cache key "${key}":`, error)
      return null
    }
  },

  set: async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
    const client = getAvailableClient()
    if (!client || ttlSeconds <= 0) return

    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch (error) {
      logger.warn(`Failed to write cache key "${key}":`, error)
    }
  },

  del: async (key: string): Promise<void> => {
    const client = getAvailableClient()
    if (!client) return

    try {
      await client.del(key)
    } catch (error) {
      logger.warn(`Failed to delete cache key "${key}":`, error)
    }
  },

  delPattern: async (pattern: string): Promise<void> => {
    const client = getAvailableClient()
    if (!client) return

    try {
      await deleteKeysByPattern(client, pattern)
    } catch (error) {
      logger.warn(`Failed to delete cache pattern "${pattern}":`, error)
    }
  },

  getOrSet: async <T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> => {
    const cachedValue = await cacheService.get<T>(key)
    if (cachedValue !== null) return cachedValue

    return singleFlight(key, async () => {
      const secondCheck = await cacheService.get<T>(key)
      if (secondCheck !== null) return secondCheck

      const freshValue = await fetcher()
      if (freshValue !== undefined && freshValue !== null) await cacheService.set(key, freshValue, ttlSeconds)

      return freshValue
    })
  }
}

export default cacheService
