import type { ManageRequestSchema, ManageRequestBody, ManageErrorParams, FileData } from '@middlewares/manageRequest/types'
import type { Response, Request } from 'express'

export const buildRequestContext = <T extends ManageRequestSchema>(
  req: Request,
  res: Response,
  manageError: (data: ManageErrorParams) => void
): ManageRequestBody<T> => {
  return {
    ids: { userId: res.locals?.userId as string | undefined },
    defaultExpress: { req, res },
    params: req.params as T['params'],
    query: req.query as T['query'],
    data: req.body as T['body'],
    file: (req as Request & { file?: FileData }).file,
    manageError
  }
}