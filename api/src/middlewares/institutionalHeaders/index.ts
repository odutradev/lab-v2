import defaultApiConfig from '@config/defaultConfig'

import type { RequestHandler } from 'express'

const institutionalHeaders: RequestHandler = (_req, res, next) => {
  res.set('api-database-name', defaultApiConfig.clusterName)
  res.set('api-version', defaultApiConfig.version)
  res.set('api-mode', defaultApiConfig.mode)
  next()
}

export default institutionalHeaders
