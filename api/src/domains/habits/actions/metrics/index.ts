import { monthlyMetricsResponseSchema, monthlyMetricsBodySchema } from './schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import { isHabitScheduledForDate } from '@domains/habits/utils/recurrence'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import defineAction from '@factories/defineAction'
import { formatDateKey } from '@utils/date'

import type { MonthlyMetricsResponse, MonthlyMetricsBody, MonthlyMetricsDayItem } from './types'

const MonthLabels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const WeekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const getMonthlyMetricsAction = defineAction<{ body: MonthlyMetricsBody }>(
  {
    method: 'post',
    path: '/habits/metrics/monthly',
    summary: 'Calcula as métricas de constância diária do mês integrando hábitos e meta de água',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      body: monthlyMetricsBodySchema
    },
    responses: {
      200: {
        description: 'Métricas diárias consolidadas do mês',
        schema: monthlyMetricsResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const body = data || {}
    const todayKey = formatDateKey(new Date())
    const targetMonth = body.month || todayKey.slice(0, 7)

    const [year, month] = targetMonth.split('-').map(Number)

    const daysInMonth = new Date(year, month, 0).getDate()
    const startDate = `${targetMonth}-01`
    const endDate = `${targetMonth}-${String(daysInMonth).padStart(2, '0')}`

    const [activeHabits, checkins] = await Promise.all([
      habitRepository.findAllByUser(ids.userId, { active: true }),
      habitCheckinRepository.findByUserAndDateRange(ids.userId, startDate, endDate)
    ])

    const checkinMap = new Map(checkins.map((checkin) => [`${checkin.date}_${checkin.habitId.toString()}`, checkin.completed]))

    const waterDailyMap = body.waterDailyMap || {}
    const defaultWaterGoal = body.waterGoalBottles || 4
    const waterExtraTargetMap = body.waterExtraTargetMap || {}
    const sleepDailyMap = body.sleepDailyMap || {}
    const defaultSleepGoal = body.sleepMinRecommendedHours || 7

    const userWeights = body.performanceWeights || { habits: 50, water: 25, sleep: 25 }
    const rawSum = (userWeights.habits ?? 50) + (userWeights.water ?? 25) + (userWeights.sleep ?? 25)
    const normalizationFactor = rawSum > 0 ? 100 / rawSum : 1
    const weightHabits = Math.round((userWeights.habits ?? 50) * normalizationFactor)
    const weightWater = Math.round((userWeights.water ?? 25) * normalizationFactor)
    const weightSleep = Math.max(0, 100 - weightHabits - weightWater)

    const days: MonthlyMetricsDayItem[] = Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const day = dayIndex + 1
      const dateKey = `${targetMonth}-${String(day).padStart(2, '0')}`
      const dayOfWeek = WeekDayLabels[new Date(year, month - 1, day).getDay()]
      const isToday = dateKey === todayKey
      const isFuture = dateKey > todayKey

      const scheduledHabits = activeHabits.filter((habit) => checkinMap.has(`${dateKey}_${habit.id.toString()}`) || isHabitScheduledForDate(habit, dateKey))

      const totalHabits = scheduledHabits.length
      const completedHabits = scheduledHabits.filter((habit) => checkinMap.get(`${dateKey}_${habit.id.toString()}`)).length
      const habitRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 100

      const waterConsumedBottles = waterDailyMap[dateKey] || 0
      const waterGoalBottles = defaultWaterGoal + (waterExtraTargetMap[dateKey] || 0)
      const waterGoalReached = waterGoalBottles > 0 ? waterConsumedBottles >= waterGoalBottles : false
      const waterRate = waterGoalBottles > 0
        ? Math.min(100, Math.round((waterConsumedBottles / waterGoalBottles) * 100))
        : 100

      const sleepHours = sleepDailyMap[dateKey] || 0
      const sleepGoalHours = defaultSleepGoal
      const sleepGoalReached = sleepGoalHours > 0 ? sleepHours >= sleepGoalHours : false
      const sleepRate = sleepGoalHours > 0
        ? Math.min(100, Math.round((sleepHours / sleepGoalHours) * 100))
        : 100

      const waterFraction = waterGoalBottles > 0 ? Math.min(1, waterConsumedBottles / waterGoalBottles) : 1
      const sleepFraction = sleepGoalHours > 0 ? Math.min(1, sleepHours / sleepGoalHours) : 1
      const habitFraction = totalHabits > 0 ? completedHabits / totalHabits : 1

      const overallRate = isFuture
        ? 0
        : Math.min(100, Math.round((habitFraction * weightHabits) + (waterFraction * weightWater) + (sleepFraction * weightSleep)))

      return {
        date: dateKey,
        day,
        dayOfWeek,
        isToday,
        isFuture,
        totalHabits,
        completedHabits,
        habitRate: isFuture ? 0 : habitRate,
        waterConsumedBottles,
        waterGoalBottles,
        waterGoalReached,
        waterRate: isFuture ? 0 : waterRate,
        sleepHours,
        sleepGoalHours,
        sleepGoalReached,
        sleepRate: isFuture ? 0 : sleepRate,
        overallRate
      }
    })

    const trackedDays = days.filter((dayItem) => !dayItem.isFuture)
    const trackedDaysCount = trackedDays.length

    const sumOverall = trackedDays.reduce((total, dayItem) => total + dayItem.overallRate, 0)
    const sumHabits = trackedDays.reduce((total, dayItem) => total + dayItem.habitRate, 0)
    const sumWater = trackedDays.reduce((total, dayItem) => total + dayItem.waterRate, 0)
    const sumSleep = trackedDays.reduce((total, dayItem) => total + dayItem.sleepRate, 0)
    const perfectDaysCount = trackedDays.filter((dayItem) => dayItem.overallRate >= 100).length

    const averageOverallRate = trackedDaysCount > 0 ? Math.round(sumOverall / trackedDaysCount) : 0
    const averageHabitRate = trackedDaysCount > 0 ? Math.round(sumHabits / trackedDaysCount) : 0
    const averageWaterRate = trackedDaysCount > 0 ? Math.round(sumWater / trackedDaysCount) : 0
    const averageSleepRate = trackedDaysCount > 0 ? Math.round(sumSleep / trackedDaysCount) : 0

    const monthLabel = `${MonthLabels[month - 1]} de ${year}`
    const formulaExplanation =
      `O índice de constância diária pondera os três pilares com base nas suas metas e pesos configurados: Hábitos (${weightHabits}%), Água (${weightWater}%) e Sono (${weightSleep}%). A contagem começa em 100% no dia e desconta o que não for cumprido (dias sem hábitos programados mantêm 100% desse pilar).`

    const response: MonthlyMetricsResponse = {
      month: targetMonth,
      monthLabel,
      averageOverallRate,
      averageHabitRate,
      averageWaterRate,
      averageSleepRate,
      perfectDaysCount,
      trackedDaysCount,
      daysInMonth,
      formulaExplanation,
      performanceWeights: {
        habits: weightHabits,
        water: weightWater,
        sleep: weightSleep
      },
      days
    }

    return response
  }
)
