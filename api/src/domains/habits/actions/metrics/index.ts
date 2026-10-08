import { monthlyMetricsResponseSchema, monthlyMetricsBodySchema } from './schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import { isHabitScheduledForDate } from '@domains/habits/utils/recurrence'
import { formatTimestamp } from '@utils/date'
import defineAction from '@factories/defineAction'

import type { MonthlyMetricsResponse, MonthlyMetricsBody, MonthlyMetricsDayItem } from './types'

const monthNamesPT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const weekDaysPT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const getMonthlyMetricsAction = defineAction(
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

    const body = (data || {}) as MonthlyMetricsBody
    const todayFull = formatTimestamp().split(' ')[0]
    const targetMonth = body.month || todayFull.slice(0, 7)

    const [yearStr, monthStr] = targetMonth.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr)

    const daysInMonth = new Date(year, month, 0).getDate()
    const startDate = `${targetMonth}-01`
    const endDate = `${targetMonth}-${String(daysInMonth).padStart(2, '0')}`

    const activeHabits = await habitRepository.findAllByUser(ids.userId, { active: true })
    const checkins = await habitCheckinRepository.findByUserAndDateRange(ids.userId, startDate, endDate)

    const checkinMap = new Map<string, boolean>()
    checkins.forEach((item) => {
      checkinMap.set(`${item.date}_${item.habitId.toString()}`, item.completed)
    })

    const waterDailyMap = body.waterDailyMap || {}
    const defaultWaterGoal = body.waterGoalBottles || 4
    const waterExtraTargetMap = body.waterExtraTargetMap || {}

    const days: MonthlyMetricsDayItem[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${targetMonth}-${String(day).padStart(2, '0')}`
      const dateObj = new Date(year, month - 1, day)
      const dayOfWeek = weekDaysPT[dateObj.getDay()]
      const isToday = dateStr === todayFull
      const isFuture = dateStr > todayFull

      const scheduledHabits = activeHabits.filter((habit) => {
        if (checkinMap.has(`${dateStr}_${habit.id.toString()}`)) return true
        return isHabitScheduledForDate(habit, dateStr)
      })

      const totalHabits = scheduledHabits.length
      const completedHabits = scheduledHabits.filter((h) => checkinMap.get(`${dateStr}_${h.id.toString()}`)).length
      const habitRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

      const waterConsumedBottles = waterDailyMap[dateStr] || 0
      const waterGoalBottles = defaultWaterGoal + (waterExtraTargetMap[dateStr] || 0)
      const waterGoalReached = waterGoalBottles > 0 ? waterConsumedBottles >= waterGoalBottles : false
      const waterRate = waterGoalBottles > 0
        ? Math.min(100, Math.round((waterConsumedBottles / waterGoalBottles) * 100))
        : 100

      let overallRate = 0

      if (!isFuture) {
        if (totalHabits > 0) {
          const totalGoals = totalHabits + 1
          const waterFraction = waterGoalBottles > 0 ? Math.min(1, waterConsumedBottles / waterGoalBottles) : 1
          const completedGoals = completedHabits + waterFraction
          overallRate = Math.min(100, Math.round((completedGoals / totalGoals) * 100))
        } else {
          overallRate = waterRate
        }
      }

      days.push({
        date: dateStr,
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
        overallRate
      })
    }

    const trackedDays = days.filter((d) => !d.isFuture)
    const trackedDaysCount = trackedDays.length

    const sumOverall = trackedDays.reduce((acc, d) => acc + d.overallRate, 0)
    const sumHabits = trackedDays.reduce((acc, d) => acc + d.habitRate, 0)
    const sumWater = trackedDays.reduce((acc, d) => acc + d.waterRate, 0)
    const perfectDaysCount = trackedDays.filter((d) => d.overallRate >= 100).length

    const averageOverallRate = trackedDaysCount > 0 ? Math.round(sumOverall / trackedDaysCount) : 0
    const averageHabitRate = trackedDaysCount > 0 ? Math.round(sumHabits / trackedDaysCount) : 0
    const averageWaterRate = trackedDaysCount > 0 ? Math.round(sumWater / trackedDaysCount) : 0

    const monthLabel = `${monthNamesPT[month - 1]} de ${year}`
    const formulaExplanation =
      'O índice de constância diária pondera todos os hábitos agendados mais a sua meta diária de hidratação. Por exemplo: se você tiver 3 hábitos e 1 meta de água, o dia possui 4 metas totais (cada uma valendo 25%). Ao cumprir os 3 hábitos e atingir a meta de água, sua taxa diária é de 100%.'

    const response: MonthlyMetricsResponse = {
      month: targetMonth,
      monthLabel,
      averageOverallRate,
      averageHabitRate,
      averageWaterRate,
      perfectDaysCount,
      trackedDaysCount,
      daysInMonth,
      formulaExplanation,
      days
    }

    return response
  }
)
