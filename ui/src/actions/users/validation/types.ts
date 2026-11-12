export type ValidationPurpose = 'email_verification' | 'password_reset'

export interface RequestCodePayload {
  email: string
}

export interface VerifyCodePayload {
  email: string
  code: string
}

export interface VerificationResponse {
  success: boolean
  resetToken?: string
}
