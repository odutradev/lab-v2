import * as catalogActions from '@domains/workouts/actions/catalog'
import * as routineActions from '@domains/workouts/actions/routine'
import * as sessionActions from '@domains/workouts/actions/session'

import type { DomainModule } from '@projectTypes/domain'

const workoutsDomain: DomainModule = {
  name: 'workouts',
  actions: [
    catalogActions,
    routineActions,
    sessionActions
  ],
  envVariables: []
}

export default workoutsDomain
