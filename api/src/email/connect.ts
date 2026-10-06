import nodemailer from 'nodemailer'

import { markdownPlugin } from '@email/markdownPlugin'
import createLocalLogger from '@utils/localLogger'

import type { EmailTransporter, EmailInstance, EmailModule, EmailConfig } from '@email/types'

const logger = createLocalLogger('email')

const requiredEnvVariables = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS']

const email: EmailModule = {
  transporter: null,
  initializeEmail: async (): Promise<EmailInstance> => {
    try {
      const host = process.env.EMAIL_HOST
      const port = Number(process.env.EMAIL_PORT || 465)
      const user = process.env.EMAIL_USER
      const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD

      if (!host || !user || !pass) {
        logger.error('[initializeEmail] Missing required email environment variables: EMAIL_HOST, EMAIL_USER and EMAIL_PASS/EMAIL_PASSWORD')
        process.exit(1)
      }

      process.env.EMAIL_PORT = String(port)
      process.env.EMAIL_PASS = pass

      const config: EmailConfig = {
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        }
      }

      email.transporter = nodemailer.createTransport(config)
      email.transporter.use('compile', markdownPlugin())

      logger.info('Email service initialized successfully with markdown support')

      return { transporter: email.transporter }
    } catch (error) {
      logger.error('[initializeEmail] Email initialization error')
      logger.clean(error)
      process.exit(1)
    }
  },
  getInstance: async (): Promise<EmailTransporter> => {
    if (!email.transporter) {
      logger.info('[getInstance] Email not initialized, initializing now')
      await email.initializeEmail()
      if (!email.transporter) {
        logger.error('[getInstance] Failed to initialize email transporter')
        throw new Error('Failed to initialize email transporter')
      }
    }
    return email.transporter
  }
}

export const connectEmail = email.initializeEmail

export default email