import { Request, Response, NextFunction, RequestHandler } from 'express'
import { Options } from 'multer'
import multer from 'multer'
import fs from 'fs'

import { errorResponseSchema } from '@factories/errors/schemas'
import sendError from '@factories/errors'

import type { UploadConfig } from '@middlewares/upload/types'

export const deleteUploadedFile = (path?: string): void => {
  if (!path) return
  fs.unlink(path, () => {})
}

export const createUploadMiddleware = (config: UploadConfig = {}): RequestHandler => {
  const fieldName = config.fieldName ?? 'file'
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = 'cache-upload-files'
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      cb(null, dir)
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
  })
  const options: Options = {
    storage,
    limits: config.maxSizeInBytes ? { fileSize: config.maxSizeInBytes } : undefined,
    fileFilter: (_req, file, callback) => {
      if (!config.allowedMimeTypes) {
        callback(null, true)
        return
      }
      if (config.allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true)
        return
      }
      callback(new Error('INVALID_FILE_TYPE'))
    }
  }
  const upload = multer(options).single(fieldName)
  const uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (!err) return next()
      if (err instanceof multer.MulterError) {
        sendError({
          code: 'validation_error',
          res,
          details: [{ field: fieldName, message: `Multer error: ${err.message}` }]
        })
        return
      }
      if (err instanceof Error) {
        sendError({
          code: 'validation_error',
          res,
          details: [{ field: fieldName, message: err.message }]
        })
        return
      }
      sendError({
        code: 'bad_request',
        res,
        details: [{ field: fieldName, message: 'Upload failed' }]
      })
    })
  }
  const uploadMiddlewareWithDocs = Object.assign(uploadMiddleware, {
    responses: {
      400: {
        description: 'Erro de validação no upload do arquivo ou arquivo ausente',
        schema: errorResponseSchema
      }
    }
  })
  return uploadMiddlewareWithDocs
}