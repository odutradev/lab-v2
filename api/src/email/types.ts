import type { Transporter } from 'nodemailer'

export type EmailTransporter = Transporter

export type EmailConfig = {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export type EmailTemplateVariables = Record<string, string | number | boolean>

export type EmailInstance = {
  transporter: EmailTransporter
}

export type EmailModule = {
  transporter: EmailTransporter | null
  initializeEmail: () => Promise<EmailInstance>
  getInstance: () => Promise<EmailTransporter>
}

export type ProcessTemplateParams = {
  template: string
  variables?: EmailTemplateVariables
}

export type ProcessTemplateResult = {
  processed: string
}

export type SendEmailParams = {
  to: string | string[]
  subject: string
  template: string
  variables?: EmailTemplateVariables
  from?: string
}

export type SendEmailResult = {
  success: boolean
  messageId?: string
  error?: string
}

export type SendEmailFromTemplateParams = {
  to: string | string[]
  trigger: string
  variables?: Record<string, string>
  from?: string
}

export type SendEmailFromTemplateResult = {
  success: boolean
  messageId?: string
  error?: string
}

export type LocalEmailTemplate = {
  subject: string
  markdownBody: string
}

export type EmailTemplateRegistry = Record<string, LocalEmailTemplate>

export type SendEnrichedEmailParams = {
  to: string | string[]
  variables?: EmailTemplateVariables
  from?: string
}

export type EnrichedEmailTemplate = LocalEmailTemplate & {
  send: (params: SendEnrichedEmailParams) => Promise<SendEmailResult>
}