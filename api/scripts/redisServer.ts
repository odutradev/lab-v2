import { RedisMemoryServer } from 'redis-memory-server'

import createLocalLogger from '@utils/localLogger'

const logger = createLocalLogger('redis')

const port = Number(process.env.REDIS_PORT || 6379)

const OneHourInMilliseconds = 1000 * 60 * 60

const keepProcessAlive = (): void => {
  setInterval(() => {}, OneHourInMilliseconds)
}

const getErrorMessage = (error: unknown): string => String((error as Error)?.message || error)

const isAddressInUse = (error: unknown): boolean => {
  const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  return getErrorMessage(error).includes('EADDRINUSE') || errorCode === 'EADDRINUSE'
}

const startRedisServer = async (): Promise<void> => {
  try {
    const server = new RedisMemoryServer({ instance: { port } })

    await server.start()
    const [host, activePort] = await Promise.all([server.getHost(), server.getPort()])

    logger.info(`In-memory Redis server running on ${host}:${activePort}`)

    const handleShutdown = async (): Promise<void> => {
      logger.info('Stopping in-memory Redis server...')
      await server.stop().catch(() => undefined)
      process.exit(0)
    }

    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  } catch (error) {
    if (isAddressInUse(error)) {
      logger.info(`Port ${port} is already in use. Assuming external Redis instance is active.`)
      keepProcessAlive()
      return
    }

    logger.warn('Could not start local Redis memory server:', getErrorMessage(error))
    logger.warn('The API will continue in fallback mode without cache.')
    keepProcessAlive()
  }
}

startRedisServer()
