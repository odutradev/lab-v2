import * as checkinActions from '@domains/habits/actions/checkin'
import * as habitActions from '@domains/habits/actions/habit'
import * as metricsActions from '@domains/habits/actions/metrics'

import type { DomainModule } from '@projectTypes/domain'

const habitsDomain: DomainModule = {
  name: 'habits',
  actions: [
    habitActions,
    checkinActions,
    metricsActions
  ],
  envVariables: []
}

export default habitsDomain
