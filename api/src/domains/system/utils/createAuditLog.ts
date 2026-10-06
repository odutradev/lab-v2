import logRepository from '@domains/system/repositories/log'

import type { CreateLogPayload, LogModelType } from '@domains/system/repositories/log/types'

const createAuditLog = async (payload: CreateLogPayload): Promise<LogModelType> => {
  return await logRepository.create(payload)
}

export default createAuditLog