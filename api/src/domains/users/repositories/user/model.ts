import { Schema, model } from 'mongoose'

import type { UserDocument } from '@domains/users/repositories/user/types'

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, required: false },
    superAdmin: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active', required: true }
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