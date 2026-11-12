import { nutritionProfileResponseSchema, updateNutritionProfileBodySchema } from './schemas'
import nutritionProfileRepository from '@domains/nutrition/repositories/nutritionProfile'
import { resolveUserNutrition } from '@domains/nutrition/utils/targets'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import createAuditLog from '@domains/system/utils/createAuditLog'
import { GoalDefaults } from '@domains/nutrition/utils/energy'
import defineAction from '@factories/defineAction'
import { formatDateKey } from '@utils/date'

import type { NutritionProfileModelType } from '@domains/nutrition/repositories/nutritionProfile/types'
import type { UpdateNutritionProfileBody } from './types'

const resolveOptionalValue = <T>(value: T | null | undefined, currentValue: T | undefined): T | undefined => {
  if (value === null) return undefined
  return value ?? currentValue
}

const buildPhaseHistory = (current: NutritionProfileModelType | null, nextGoal: string, todayKey: string, currentWeight?: number) => {
  if (!current || current.goal === nextGoal) return current?.phaseHistory || []
  return [
    ...current.phaseHistory,
    { goal: current.goal, startDate: current.phaseStartDate, endDate: todayKey, startWeight: current.phaseStartWeight, endWeight: currentWeight }
  ]
}

export const getNutritionProfileAction = defineAction(
  {
    method: 'get',
    path: '/nutrition/profile/details',
    summary: 'Busca o perfil nutricional e as metas calculadas (kcal e macros)',
    tags: ['Nutrition'],
    authenticate: true,
    responses: {
      200: { description: 'Perfil nutricional e metas', schema: nutritionProfileResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { profile, metrics, missingFields, targets } = await resolveUserNutrition(ids.userId)

    return { profile, metrics, missingFields, targets }
  }
)

export const updateNutritionProfileAction = defineAction(
  {
    method: 'patch',
    path: '/nutrition/profile/update',
    summary: 'Cria ou atualiza o perfil nutricional (fase, atividade e macros)',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { body: updateNutritionProfileBodySchema },
    responses: {
      200: { description: 'Perfil atualizado com as metas recalculadas', schema: nutritionProfileResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as UpdateNutritionProfileBody
    const { profile: current, metrics } = await resolveUserNutrition(ids.userId)

    const sex = payload.sex || current?.sex
    const activityLevel = payload.activityLevel || current?.activityLevel
    const goal = payload.goal || current?.goal
    if (!sex || !activityLevel || !goal) return manageError({ code: 'validation_error' })

    const todayKey = formatDateKey(new Date())
    const isNewPhase = !current || current.goal !== goal
    const goalDefaults = GoalDefaults[goal]

    await nutritionProfileRepository.save(ids.userId, {
      sex,
      activityLevel,
      goal,
      adjustmentPercent: payload.adjustmentPercent ?? (isNewPhase ? goalDefaults.adjustmentPercent : current.adjustmentPercent),
      proteinPerKg: payload.proteinPerKg ?? (isNewPhase ? goalDefaults.proteinPerKg : current.proteinPerKg),
      fatPerKg: payload.fatPerKg ?? (isNewPhase ? goalDefaults.fatPerKg : current.fatPerKg),
      customCalories: resolveOptionalValue(payload.customCalories, current?.customCalories),
      includeWorkoutCalories: payload.includeWorkoutCalories ?? current?.includeWorkoutCalories ?? false,
      targetWeight: resolveOptionalValue(payload.targetWeight, current?.targetWeight),
      phaseStartDate: isNewPhase ? todayKey : current.phaseStartDate,
      phaseStartWeight: isNewPhase ? metrics.weight : current.phaseStartWeight,
      phaseEndDate: resolveOptionalValue(payload.phaseEndDate, isNewPhase ? undefined : current.phaseEndDate),
      phaseHistory: buildPhaseHistory(current, goal, todayKey, metrics.weight)
    })

    const updated = await resolveUserNutrition(ids.userId)

    await createAuditLog({
      actorId: ids.userId,
      action: current ? 'update_nutrition_profile' : 'create_nutrition_profile',
      entity: 'NutritionProfile',
      entityId: String(updated.profile?.id),
      summary: isNewPhase ? 'Nova fase nutricional iniciada pelo usuário.' : 'Perfil nutricional atualizado pelo usuário.',
      details: payload
    })

    return { profile: updated.profile, metrics: updated.metrics, missingFields: updated.missingFields, targets: updated.targets }
  }
)
