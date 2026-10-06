import mongoose from 'mongoose'

import defaultApiConfig from '@config/defaultConfig'
import createLocalLogger from '@utils/localLogger'

const localLogger = createLocalLogger('database')

const connectMongoose = async () => {
  try {
    mongoose.set('strictQuery', true)

    const mongoUri = process.env.MONGO_URI || process.env.MONGOURI

    if (!mongoUri) {
      localLogger.error('[connectMongoose] Missing environment variable: "MONGO_URI"')
      process.exit(1)
    }

    const connected = await mongoose.connect(mongoUri, {
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