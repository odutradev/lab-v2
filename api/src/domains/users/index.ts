import * as validationActions from '@domains/users/actions/validation'
import * as documentActions from '@domains/users/actions/document'
import * as profileActions from '@domains/users/actions/profile'
import * as authActions from '@domains/users/actions/auth'

import type { DomainModule } from '@projectTypes/domain'

const usersDomain: DomainModule = {
  name: 'users',
  actions: [
    authActions,
    profileActions,
    documentActions,
    validationActions
  ],
  envVariables: ['JWT_SECRET']
}

export default usersDomain