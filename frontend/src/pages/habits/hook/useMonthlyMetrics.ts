import { useState, useEffect, useCallback } from 'react'

import { getMonthlyMetricsAction } from '@actions/habits'
import useHealthStore from '@stores/health'
import { calculateDailyWaterGoal } from '@stores/health/utils'

import type { MonthlyMetricsResponse } from '@actions/habits/types'

interface UseMonthlyMetricsOptions {
  month: string
  triggerRevision?: number
}

export const useMonthlyMetrics = ({ month, triggerRevision = 0 }: UseMonthlyMetricsOptions) => {
  const [metrics, setMetrics] = useState<MonthlyMetricsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { waterDailyMap, waterExtraTargetMap, weightHistory, waterBottleMl, waterTargetBottles, profile } = useHealthStore()
  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : undefined
  const defaultWaterTargetBottles = calculateDailyWaterGoal(
    latestWeight,
    0,
    waterBottleMl,
    waterTargetBottles,
    profile.age,
    profile.height
  ).targetBottles

  const loadMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getMonthlyMetricsAction({
        month,
        waterDailyMap,
        waterGoalBottles: defaultWaterTargetBottles,
        waterExtraTargetMap
      })
      setMetrics(data)
    } catch (err) {
      console.error('Failed to load monthly metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [month, waterDailyMap, defaultWaterTargetBottles, waterExtraTargetMap])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics, triggerRevision])

  return {
    metrics,
    isLoading,
    refreshMetrics: loadMetrics
  }
}

export default useMonthlyMetrics
