import { RedisMemoryServer } from 'redis-memory-server'

const port = Number(process.env.REDIS_PORT || 6379)

const start = async () => {
  try {
    const server = new RedisMemoryServer({
      instance: {
        port
      }
    })

    await server.start()
    const host = await server.getHost()
    const activePort = await server.getPort()

    console.log(`[redis] In-memory Redis server running on ${host}:${activePort}`)

    const handleShutdown = async () => {
      console.log('[redis] Stopping in-memory Redis server...')
      try {
        await server.stop()
      } catch {}
      process.exit(0)
    }

    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  } catch (error) {
    const errMsg = String(error?.message || error)
    if (errMsg.includes('EADDRINUSE') || (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE')) {
      console.log(`[redis] Port ${port} is already in use. Assuming external Redis instance is active.`)
      setInterval(() => {}, 1000 * 60 * 60)
      return
    }

    console.warn('[redis] Warning: Could not start local Redis memory server:', errMsg)
    console.warn('[redis] The API will continue in fallback mode without cache.')
    setInterval(() => {}, 1000 * 60 * 60)
  }
}

start()
