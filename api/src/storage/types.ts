import { getStorage } from 'firebase-admin/storage'

export type Bucket = ReturnType<ReturnType<typeof getStorage>['bucket']>

export type StorageFile = ReturnType<Bucket['file']>

export type SignedUrlOptions = Parameters<StorageFile['getSignedUrl']>[0]

export type StorageInstance = {
  bucket: Bucket
}

export type StorageModule = {
  bucket: Bucket | null
  initializeStorage: () => Promise<StorageInstance>
  getInstance: () => Promise<Bucket>
}

export type UploadFileParams = {
  path: string
  buffer: Buffer
  mimeType: string
  isPublic?: boolean
}

export type UploadFileResult = {
  url: string
  bucket: Bucket
}

export type MoveFileParams = {
  sourcePath: string
  destinationPath: string
}

export type MoveFileResult = {
  success: boolean
  bucket: Bucket
}

export type DeleteFileParams = {
  path: string
}

export type DeleteFileResult = {
  success: boolean
  bucket: Bucket
}

export type GetFileParams = {
  path: string
}

export type GetFileResult = {
  buffer: Buffer
  metadata: unknown
  bucket: Bucket
}

export type GetSignedUrlParams = {
  path: string
  expiresInMinutes?: number
  forceDownload?: boolean
  filename?: string
}

export type GetSignedUrlResult = {
  signedUrl: string
  expiresAt: Date
}