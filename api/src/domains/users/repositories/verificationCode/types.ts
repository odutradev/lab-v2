import type { HydratedDocument, Document } from 'mongoose'

export interface VerificationCode {
  userId?: string
  email: string
  code: string
  purpose: string
  expiresAt: Date
}

export interface VerificationCodeDocument extends VerificationCode, Document {
  createdAt: Date
  updatedAt: Date
}

export type VerificationCodeModelType = HydratedDocument<VerificationCodeDocument>

export type CreateVerificationCodePayload = {
  userId?: string
  email: string
  code: string
  purpose: string
  expiresAt: Date
}