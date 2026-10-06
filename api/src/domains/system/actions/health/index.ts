import { healthResponseSchema } from '@domains/system/actions/health/schemas'
import defaultApiConfig from '@config/defaultConfig'
import defineAction from '@factories/defineAction'

export const healthAction = defineAction(
  {
    method: 'get',
    path: '/health',
    summary: 'Verifica saúde da API',
    tags: ['System'],
    responses: {
      200: {
        description: 'API está online e saudável',
        schema: healthResponseSchema
      }
    }
  },
  () => ({
    status: 'OK',
    uptime: process.uptime(),
    ...defaultApiConfig
  })
)