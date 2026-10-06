import type { HydratedDocument, Document } from 'mongoose'

export interface Log {
  actorId: string
  action: string
  entity: string
  summary?: string
  entityId?: string
  details?: Record<string, unknown>
}

export interface LogDocument extends Log, Document {
  createdAt: Date
  updatedAt: Date
}

export type LogModelType = HydratedDocument<LogDocument>

export interface CreateLogPayload {
  actorId: string
  action: string
  entity: string
  summary?: string
  entityId?: string
  details?: Record<string, unknown>
}

export interface FindAllLogsFilters {
  limit?: number
  offset?: number
  actorId?: string
  filters?: Record<string, string>
}