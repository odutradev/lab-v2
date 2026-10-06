import mongoose from 'mongoose'

import defaultApiConfig from '@config/defaultConfig'
import createLocalLogger from '@utils/localLogger'

const localLogger = createLocalLogger('database')

const requiredEnvVariables = ['MONGO_URI']

const connectMongoose = async () => {
  try {
    mongoose.set('strictQuery', true)

    requiredEnvVariables.forEach((envVar) => {
      if (!process.env[envVar]) {
        localLogger.error(`[connectMongoose] Missing environment variable: "${envVar}"`)
        process.exit(1)
      }
    })

    const connected = await mongoose.connect(process.env.MONGO_URI as string, {
      writeConcern: {
        w: 'majority'
      }
    })

    const clusterName = connected.connection.name
    defaultApiConfig.clusterName = clusterName

    localLogger.info('Database connected: ' + clusterName)

    return { clusterName }
  } catch (error) {
    localLogger.error('[connectMongoose] Database connect error')
    localLogger.clean(error)
    process.exit(1)
  }
}

export default connectMongoose