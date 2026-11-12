import nutritionProfileRepository from '@domains/nutrition/repositories/nutritionProfile'
import { calculateNutritionTargets, findMissingBodyMetrics } from './energy'
import userRepository from '@domains/users/repositories/user'

export const resolveUserNutrition = async (userId: string) => {
  const [profile, bodyMetrics] = await Promise.all([
    nutritionProfileRepository.findByUser(userId),
    userRepository.findBodyMetrics(userId)
  ])

  const metrics = { weight: bodyMetrics?.weight, height: bodyMetrics?.height, age: bodyMetrics?.age }
  const targets = profile ? calculateNutritionTargets(profile, metrics) : null

  return {
    profile,
    metrics,
    weightHistory: bodyMetrics?.weightHistory || [],
    missingFields: findMissingBodyMetrics(metrics),
    targets
  }
}
