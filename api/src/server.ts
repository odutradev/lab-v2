import { createServer } from 'http'
import mongoose from 'mongoose'
import 'dotenv/config'

import createLocalLogger from '@utils/localLogger'
import connectMongoose from '@database/connect'
import { connectEmail } from '@email/connect'
import { connectRedis, disconnectRedis } from '@cache'
import buildApp from './app'

import type { Server } from 'http'

const localLogger = createLocalLogger('core')

const startServer = async (): Promise<void> => {
  const app = buildApp()
  const server: Server = createServer(app)
  const port = process.env.PORT ?? 3000

  await Promise.all([
    connectMongoose(),
    connectEmail(),
    connectRedis()
  ])

  server.listen(port, () => {
    localLogger.info(`Server running on port ${port}`)
  })

  const handleShutdown = (signal: string): void => {
    localLogger.info(`Received ${signal}. Shutting down gracefully...`)

    server.close(async (error) => {
      if (error) {
        localLogger.error(`Error closing HTTP server: ${error.message}`)
      }

      try {
        await Promise.allSettled([
          mongoose.disconnect(),
          disconnectRedis()
        ])
        localLogger.info('Databases and cache disconnected. Server shut down successfully.')
        process.exit(0)
      } catch (disconnectError) {
        localLogger.error(`Error disconnecting services: ${(disconnectError as Error).message}`)
        process.exit(1)
      }
    })
  }

  process.on('SIGINT', () => handleShutdown('SIGINT'))
  process.on('SIGTERM', () => handleShutdown('SIGTERM'))
}

startServer().catch(localLogger.error)