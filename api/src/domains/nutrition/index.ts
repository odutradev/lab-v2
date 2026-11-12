import * as mealPlanActions from '@domains/nutrition/actions/mealPlan'
import * as profileActions from '@domains/nutrition/actions/profile'
import * as diaryActions from '@domains/nutrition/actions/diary'
import * as foodActions from '@domains/nutrition/actions/food'

import type { DomainModule } from '@projectTypes/domain'

const nutritionDomain: DomainModule = {
  name: 'nutrition',
  actions: [
    profileActions,
    foodActions,
    mealPlanActions,
    diaryActions
  ],
  envVariables: []
}

export default nutritionDomain
