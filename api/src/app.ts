import express from 'express'

import institutionalHeaders from '@middlewares/institutionalHeaders'
import registerActions from '@factories/defineAction/register'
import propertiesDomain from '@domains/properties'
import createLocalLogger from '@utils/localLogger'
import configureDocs from '@factories/docs'
import reviewsDomain from '@domains/reviews'
import systemDomain from '@domains/system'
import configureCors from '@config/cors'
import adminDomain from '@domains/admin'
import usersDomain from '@domains/users'
import chatsDomain from '@domains/chats'

import type { Application } from 'express'

const logger = createLocalLogger('app')

const domains = [systemDomain, usersDomain, propertiesDomain, chatsDomain, reviewsDomain, adminDomain]

const buildApp = (): Application => {
  const app = express()

  app.use(institutionalHeaders)
  app.use(configureCors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  configureDocs(app)

  domains.forEach((domain) => {
    domain.envVariables.forEach((envVar) => {
      if (!process.env[envVar]) {
        logger.error(`[buildApp] Missing environment variable: "${envVar}" used in ${domain.name} domain`)
        process.exit(1)
      }
    })
    const router = registerActions(domain.actions, domain.name, domain.rateLimit)
    app.use(router)
  })

  return app
}

export default buildApp