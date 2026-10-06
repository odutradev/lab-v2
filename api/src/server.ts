import { createServer } from 'http'
import mongoose from 'mongoose'
import 'dotenv/config'

//import { connectStorage } from '@storage/connect'
import createLocalLogger from '@utils/localLogger'
import connectMongoose from '@database/connect'
import { connectEmail } from '@email/connect'
import buildApp from './app'

import type { Server } from 'http'

const localLogger = createLocalLogger('core')

const startServer = async (): Promise<void> => {
  const app = buildApp()
  const server: Server = createServer(app)
  const port = process.env.PORT ?? 3000

  await Promise.all([
    connectMongoose(),
    //connectStorage(),
    connectEmail(),
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
        await mongoose.disconnect()
        localLogger.info('Mongoose disconnected. Server shut down successfully.')
        process.exit(0)
      } catch (disconnectError) {
        localLogger.error(`Error disconnecting Mongoose: ${(disconnectError as Error).message}`)
        process.exit(1)
      }
    })
  }

  process.on('SIGINT', () => handleShutdown('SIGINT'))
  process.on('SIGTERM', () => handleShutdown('SIGTERM'))
}

startServer().catch(localLogger.error)