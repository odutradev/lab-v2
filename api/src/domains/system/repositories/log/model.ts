import { Schema, model } from 'mongoose'

import type { LogDocument } from '@domains/system/repositories/log/types'

const logSchema = new Schema<LogDocument>(
  {
    actorId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    summary: { type: String, required: false },
    entityId: { type: String, required: false },
    details: { type: Schema.Types.Mixed, required: false }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

logSchema.index({ actorId: 1, createdAt: -1 })
logSchema.index({ action: 1, createdAt: -1 })
logSchema.index({ entity: 1, createdAt: -1 })

export const LogModel = model<LogDocument>('Log', logSchema)