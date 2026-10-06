import { Schema, model } from 'mongoose'

import type { UserDocument } from '@domains/users/repositories/user/types'

const bankDetailsSchema = new Schema(
  {
    bankName: { type: String, required: true },
    pixKeyType: { type: String, enum: ['cpf', 'cnpj', 'email', 'phone', 'random'], required: true },
    pixKey: { type: String, required: true },
    accountHolder: { type: String, required: true }
  },
  { _id: false }
)

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, required: false },
    superAdmin: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    birthDate: { type: String, required: true },
    phone: { type: String, required: true },
    referralSource: { type: String, required: true },
    accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active', required: true },
    bankDetails: { type: bankDetailsSchema, required: false }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete (ret as Record<string, unknown>).password
        return ret
      }
    },
    toObject: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete (ret as Record<string, unknown>).password
        return ret
      }
    }
  }
)

export const UserModel = model<UserDocument>('User', userSchema)