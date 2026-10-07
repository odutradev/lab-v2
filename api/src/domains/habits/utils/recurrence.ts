export interface HabitRecurrenceRule {
  type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval?: number
  unit?: 'day' | 'week' | 'month' | 'year'
  daysOfWeek?: number[]
  endType?: 'never' | 'on_date' | 'after_occurrences'
  endDate?: string
  occurrences?: number
}

export interface HabitSchedulable {
  frequency?: string
  startDate?: string
  recurrence?: HabitRecurrenceRule
  excludedDates?: string[]
}

const parseDateParts = (dateStr: string): [number, number, number] => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return [y, m, d]
}

const getDayOfWeek = (dateStr: string): number => {
  const [y, m, d] = parseDateParts(dateStr)
  return new Date(y, m - 1, d).getDay()
}

const getDaysDiff = (startStr: string, targetStr: string): number => {
  const [sy, sm, sd] = parseDateParts(startStr)
  const [ty, tm, td] = parseDateParts(targetStr)
  const start = new Date(sy, sm - 1, sd).getTime()
  const target = new Date(ty, tm - 1, td).getTime()
  return Math.floor((target - start) / (1000 * 60 * 60 * 24))
}

export const isHabitScheduledForDate = (habit: HabitSchedulable, targetDateStr: string): boolean => {
  // Se a data específica foi excluída (ex: "Excluir este evento")
  if (Array.isArray(habit.excludedDates) && habit.excludedDates.includes(targetDateStr)) {
    return false
  }

  const startDate = habit.startDate

  // Se tiver startDate e a data do calendário for anterior ao início, não está agendado
  if (startDate && targetDateStr < startDate) {
    return false
  }

  const recurrence = habit.recurrence

  // Se não houver recorrência configurada explicitamente, mantém compatibilidade legada
  if (!recurrence || !recurrence.type) {
    if (habit.frequency === 'daily') return true
    if (startDate) return startDate === targetDateStr
    return false
  }

  // Verifica término da recorrência
  if (recurrence.endType === 'on_date' && recurrence.endDate && targetDateStr > recurrence.endDate) {
    return false
  }

  const type = recurrence.type
  const interval = Math.max(1, recurrence.interval || 1)

  if (type === 'none') {
    return startDate ? startDate === targetDateStr : true
  }

  const baseStart = startDate || targetDateStr

  if (type === 'daily' || (type === 'custom' && recurrence.unit === 'day')) {
    const diffDays = getDaysDiff(baseStart, targetDateStr)
    return diffDays >= 0 && diffDays % interval === 0
  }

  if (type === 'weekly' || (type === 'custom' && recurrence.unit === 'week')) {
    const targetDayOfWeek = getDayOfWeek(targetDateStr)
    const allowedDays = Array.isArray(recurrence.daysOfWeek) && recurrence.daysOfWeek.length > 0
      ? recurrence.daysOfWeek
      : [getDayOfWeek(baseStart)]

    if (!allowedDays.includes(targetDayOfWeek)) {
      return false
    }

    if (interval > 1) {
      const diffDays = getDaysDiff(baseStart, targetDateStr)
      const diffWeeks = Math.floor(diffDays / 7)
      if (diffWeeks % interval !== 0) return false
    }

    return true
  }

  if (type === 'monthly' || (type === 'custom' && recurrence.unit === 'month')) {
    const [, , targetDay] = parseDateParts(targetDateStr)
    const [sy, sm, startDay] = parseDateParts(baseStart)

    if (targetDay !== startDay) return false

    if (interval > 1) {
      const [ty, tm] = parseDateParts(targetDateStr)
      const diffMonths = (ty - sy) * 12 + (tm - sm)
      if (diffMonths % interval !== 0) return false
    }

    return true
  }

  if (type === 'yearly' || (type === 'custom' && recurrence.unit === 'year')) {
    const [ty, tm, targetDay] = parseDateParts(targetDateStr)
    const [sy, sm, startDay] = parseDateParts(baseStart)

    if (targetDay !== startDay || tm !== sm) return false

    if (interval > 1) {
      const diffYears = ty - sy
      if (diffYears % interval !== 0) return false
    }

    return true
  }

  return false
}

export default isHabitScheduledForDate
