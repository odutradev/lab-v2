import storage from '@storage/connect'

import type {
  GetSignedUrlResult,
  GetSignedUrlParams,
  DeleteFileResult,
  DeleteFileParams,
  UploadFileResult,
  UploadFileParams,
  SignedUrlOptions,
  MoveFileResult,
  MoveFileParams,
  GetFileResult,
  GetFileParams
} from '@storage/types'

export const uploadFile = async ({ path, buffer, mimeType, isPublic = false }: UploadFileParams): Promise<UploadFileResult> => {
  const bucket = await storage.getInstance()
  const file = bucket.file(path)
  await file.save(buffer, {
    metadata: {
      contentType: mimeType
    },
    public: isPublic
  })
  if (isPublic) {
    await file.makePublic()
  }
  const url = isPublic ? `https://storage.googleapis.com/${bucket.name}/${path}` : `gs://${bucket.name}/${path}`
  return { url, bucket }
}

export const moveFile = async ({ sourcePath, destinationPath }: MoveFileParams): Promise<MoveFileResult> => {
  const bucket = await storage.getInstance()
  const sourceFile = bucket.file(sourcePath)
  const destinationFile = bucket.file(destinationPath)
  await sourceFile.move(destinationFile)
  return { success: true, bucket }
}

export const deleteFile = async ({ path }: DeleteFileParams): Promise<DeleteFileResult> => {
  const bucket = await storage.getInstance()
  const file = bucket.file(path)
  await file.delete()
  return { success: true, bucket }
}

export const getFile = async ({ path }: GetFileParams): Promise<GetFileResult> => {
  const bucket = await storage.getInstance()
  const file = bucket.file(path)
  const [buffer] = await file.download()
  const [metadata] = await file.getMetadata()
  return { buffer, metadata, bucket }
}

export const getSignedUrl = async ({ path, expiresInMinutes = 60, forceDownload = false, filename }: GetSignedUrlParams): Promise<GetSignedUrlResult> => {
  const bucket = await storage.getInstance()
  const file = bucket.file(path)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes)

  const baseOptions: SignedUrlOptions = {
    action: 'read',
    expires: expiresAt
  }

  const options: SignedUrlOptions = forceDownload
    ? {
        ...baseOptions,
        responseDisposition: `attachment; filename="${filename ?? path.split('/').pop()}"`,
        responseType: 'application/pdf'
      }
    : baseOptions

  const [signedUrl] = await file.getSignedUrl(options)

  return { signedUrl, expiresAt }
}