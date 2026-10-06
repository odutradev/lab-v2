import email from '@email/connect'
import createLocalLogger from '@utils/localLogger'

import type { ProcessTemplateResult, ProcessTemplateParams, SendEmailResult, SendEmailParams, LocalEmailTemplate, EnrichedEmailTemplate, SendEnrichedEmailParams } from '@email/types'

const logger = createLocalLogger('email')

export const processTemplate = ({ template, variables = {} }: ProcessTemplateParams): ProcessTemplateResult => {
  const processed = Object.entries(variables).reduce((acc, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    return acc.replace(regex, String(value))
  }, template)

  return { processed }
}

export const sendEmail = async ({ to, subject, template, variables, from }: SendEmailParams): Promise<SendEmailResult> => {
  const recipient = Array.isArray(to) ? to.join(', ') : to
  const sender = from ?? process.env.EMAIL_FROM ?? process.env.EMAIL_USER

  logger.info(`[sendEmail] Disparando e-mail para "${recipient}" | Assunto: "${subject}" | Remetente: "${sender}"`)

  try {
    const transporter = await email.getInstance()
    const { processed } = processTemplate({ template, variables })

    const mailOptions = {
      from: sender,
      to: recipient,
      subject,
      markdown: processed
    }

    const info = await transporter.sendMail(mailOptions)

    logger.success(`[sendEmail] E-mail enviado com sucesso para "${recipient}". Message ID: ${info.messageId}`)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[sendEmail] Falha ao enviar e-mail para "${recipient}": ${errorMessage}`)
    logger.clean(error)

    throw error instanceof Error ? error : new Error(errorMessage)
  }
}

export const enrichTemplate = (templateDef: LocalEmailTemplate): EnrichedEmailTemplate => ({
  ...templateDef,
  send: async ({ to, variables, from }: SendEnrichedEmailParams): Promise<SendEmailResult> => {
    return sendEmail({
      to,
      subject: templateDef.subject,
      template: templateDef.markdownBody,
      variables,
      from
    })
  }
})