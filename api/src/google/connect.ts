import { google } from 'googleapis'

import createLocalLogger from '@utils/localLogger'

import type { GoogleModule } from '@google/types'
import type { Auth } from 'googleapis'

const logger = createLocalLogger('google')

const requiredEnvVariables = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI']

const googleService: GoogleModule = {
  oauth2Client: null,
  initializeGoogle: (): Auth.OAuth2Client => {
    try {
      requiredEnvVariables.forEach((envVar) => {
        if (!process.env[envVar]) {
          logger.error(`[initializeGoogle] Missing environment variable: "${envVar}"`)
          process.exit(1)
        }
      })

      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      )

      googleService.oauth2Client = client
      logger.info('Google OAuth2 Client initialized successfully via environment variables')

      return client
    } catch (error) {
      logger.error('[initializeGoogle] Google OAuth initialization error')
      logger.error(String(error))
      process.exit(1)
    }
  },
  getInstance: (): Auth.OAuth2Client => {
    if (!googleService.oauth2Client) {
      logger.info('[getInstance] Google OAuth2 Client not initialized, initializing now')
      return googleService.initializeGoogle()
    }
    return googleService.oauth2Client
  }
}

export const connectGoogle = googleService.initializeGoogle

export default googleService
