import swaggerUi from 'swagger-ui-express'

import buildOpenApiDocument from '@factories/docs/generator'

import type { Router, Request, Response } from 'express'

const configureDocs = (router: Router): void => {
  const document = buildOpenApiDocument()
  const swaggerConfig = {
    swaggerOptions: {
      persistAuthorization: true
    }
  }
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(document, swaggerConfig))
  router.get('/swagger.json', (_req: Request, res: Response) => {
    res.json(document)
  })
}

export default configureDocs