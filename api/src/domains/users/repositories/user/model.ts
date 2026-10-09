import { Schema, model } from 'mongoose'

import type { UserDocument } from '@domains/users/repositories/user/types'

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, required: false },
    superAdmin: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active', required: true },
    integrations: {
      googleCalendar: {
        connected: { type: Boolean, default: false },
        email: { type: String, required: false },
        refreshToken: { type: String, required: false, select: false },
        calendarId: { type: String, required: false },
        calendarName: { type: String, required: false },
        connectedAt: { type: Date, required: false }
      }
    },
    health: {
      height: { type: Number, required: false },
      age: { type: Number, required: false },
      characterId: { type: String, default: 'spark' },
      weightHistory: [
        {
          _id: false,
          date: { type: String, required: true },
          weight: { type: Number, required: true }
        }
      ],
      sleepHistory: [
        {
          _id: false,
          date: { type: String, required: true },
          hours: { type: Number, required: true },
          quality: { type: Number, required: true }
        }
      ],
      waterDailyMap: { type: Schema.Types.Mixed, default: {} },
      waterExtraTargetMap: { type: Schema.Types.Mixed, default: {} },
      waterBottleMl: { type: Number, default: 500 },
      waterTargetBottles: { type: Number, required: false },
      performanceWeights: {
        _id: false,
        habits: { type: Number, default: 50 },
        water: { type: Number, default: 25 },
        sleep: { type: Number, default: 25 }
      }
    }
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