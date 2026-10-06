import { Schema, model } from 'mongoose'

import type { VerificationCodeDocument } from '@domains/users/repositories/verificationCode/types'

const verificationCodeSchema = new Schema<VerificationCodeDocument>(
  {
    userId: { type: String, required: false },
    email: { type: String, required: true },
    code: { type: String, required: true },
    purpose: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
verificationCodeSchema.index({ email: 1, purpose: 1, code: 1 })

export const VerificationCodeModel = model<VerificationCodeDocument>('VerificationCode', verificationCodeSchema)