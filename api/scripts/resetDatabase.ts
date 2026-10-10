import 'dotenv/config'
import mongoose from 'mongoose'
import connectMongoose from '@database/connect'

const resetDatabase = async (): Promise<void> => {
  try {
    console.info('Conectando ao MongoDB...')
    await connectMongoose()

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Conexão ao banco não estabelecida com sucesso.')
    }

    const currentDbName = db.databaseName
    console.info(`Banco de dados conectado: "${currentDbName}"`)

    const collections = await db.listCollections().toArray()
    console.info(`Coleções encontradas (${collections.length}):`, collections.map(c => c.name))

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments()
      console.info(` - ${col.name}: ${count} documentos`)
    }

    console.info(`Executando dropDatabase em "${currentDbName}"...`)
    await db.dropDatabase()

    const collectionsAfter = await db.listCollections().toArray()
    console.info(`Drop concluído com sucesso. Coleções restantes: ${collectionsAfter.length}`)
    console.info('Banco de dados resetado com sucesso! Começando tudo do zero.')
  } catch (error) {
    console.error('Erro ao resetar o banco de dados:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

resetDatabase()
