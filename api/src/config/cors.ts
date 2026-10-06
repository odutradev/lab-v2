import cors from 'cors'

import type { RequestHandler } from 'express'
import type { CorsOptions } from 'cors'

const buildCorsOptions = (): CorsOptions => {
  const originConfig = process.env.CORS_ORIGIN

  if (!originConfig || originConfig === '*') {
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      optionsSuccessStatus: 200
    }
  }

  const allowedOrigins = originConfig
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)

  return {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        return callback(null, true)
      }

      const normalizedRequestOrigin = requestOrigin.replace(/\/$/, '')
      if (allowedOrigins.includes('*') || allowedOrigins.includes(normalizedRequestOrigin)) {
        return callback(null, true)
      }

      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
  }
}

const configureCors = (): RequestHandler => {
  const options = buildCorsOptions()
  return cors(options)
}

export default configureCors