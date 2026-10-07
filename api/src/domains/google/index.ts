import * as calendarActions from '@domains/google/actions/calendar'

import type { DomainModule } from '@projectTypes/domain'

const googleDomain: DomainModule = {
  name: 'google',
  actions: [
    calendarActions
  ],
  envVariables: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'JWT_SECRET'
  ]
}

export default googleDomain
