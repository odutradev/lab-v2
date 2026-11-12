import { WorkoutModalities } from './catalog'

import type { CaloriesEstimateInput } from './types'

const DefaultWeightKg = 70
const DefaultDurationMinutes = 60
const DefaultEffort = 5

export const findModality = (modalityId: string) => {
  return WorkoutModalities.find((modality) => modality.id === modalityId)
}

export const getEffortFactor = (effort: number): number => {
  return 0.7 + effort * 0.06
}

export const estimateCaloriesBurned = ({ modalityId, weightKg, durationMinutes, effort }: CaloriesEstimateInput): number => {
  const modality = findModality(modalityId)
  const met = modality?.met ?? 4
  const weight = weightKg || DefaultWeightKg
  const hours = (durationMinutes || DefaultDurationMinutes) / 60

  return Math.round(met * weight * hours * getEffortFactor(effort || DefaultEffort))
}
