import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

import createLocalLogger from '@utils/localLogger'

import type { StorageInstance, StorageModule, Bucket } from '@storage/types'

const logger = createLocalLogger('storage')

const requiredEnvVariables = ['FIREBASE_STORAGE_BUCKET', 'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL']

const storage: StorageModule = {
  bucket: null,
  initializeStorage: async (): Promise<StorageInstance> => {
    try {
      requiredEnvVariables.forEach((envVar) => {
        if (!process.env[envVar]) {
          logger.error(`[initializeStorage] Missing environment variable: "${envVar}"`)
          process.exit(1)
        }
      })

      if (getApps().length === 0) {
        const formattedPrivateKey = (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n')
        
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID as string,
            privateKey: formattedPrivateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string
        })
      }

      storage.bucket = getStorage().bucket()
      logger.info('Firebase Storage initialized successfully via environment variables')
      
      return { bucket: storage.bucket }
    } catch (error) {
      logger.error('[initializeStorage] Storage initialization error')
      logger.error(String(error))
      process.exit(1)
    }
  },
  getInstance: async (): Promise<Bucket> => {
    if (!storage.bucket) {
      logger.info('[getInstance] Storage not initialized, initializing now')
      await storage.initializeStorage()
      if (!storage.bucket) {
        logger.error('[getInstance] Failed to initialize Storage instance')
        throw new Error('Failed to initialize Storage instance')
      }
    }
    return storage.bucket
  }
}

export const connectStorage = storage.initializeStorage

export default storage