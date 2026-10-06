import * as checkinActions from '@domains/habits/actions/checkin'
import * as habitActions from '@domains/habits/actions/habit'

import type { DomainModule } from '@projectTypes/domain'

const habitsDomain: DomainModule = {
  name: 'habits',
  actions: [
    habitActions,
    checkinActions
  ],
  envVariables: []
}

export default habitsDomain
