import * as healthActions from '@domains/system/actions/health'
import * as auditActions from '@domains/system/actions/audit'

import type { DomainModule } from '@projectTypes/domain'

const systemDomain: DomainModule = {
  name: 'system',
  actions: [healthActions, auditActions],
  envVariables: []
}

export default systemDomain