import * as challengeActions from '@domains/challenges/actions/challenge'

import type { DomainModule } from '@projectTypes/domain'

const challengesDomain: DomainModule = {
  name: 'challenges',
  actions: [
    challengeActions
  ],
  envVariables: []
}

export default challengesDomain
