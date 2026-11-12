import type { Challenge } from '@actions/challenges/types'

export interface ChallengeMilestone {
  days: number
  title: string
  emoji: string
  achieved: boolean
  remainingDays: number
}

export const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDaysToDateString = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  const py = dt.getFullYear()
  const pm = String(dt.getMonth() + 1).padStart(2, '0')
  const pd = String(dt.getDate()).padStart(2, '0')
  return `${py}-${pm}-${pd}`
}

export const formatDisplayDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/**
 * Calcula a sequência contínua (streak) até uma data de referência (padrão hoje).
 */
export const calculateStreak = (
  checkins: string[],
  freezeDates: string[] = [],
  referenceDate = getTodayDateString()
): number => {
  if ((!checkins || checkins.length === 0) && (!freezeDates || freezeDates.length === 0)) return 0

  const checkinSet = new Set(checkins || [])
  const freezeSet = new Set(freezeDates || [])

  // Verifica se o dia de referência ou o dia anterior está marcado ou congelado
  let current = referenceDate
  if (!checkinSet.has(current) && !freezeSet.has(current)) {
    const [y, m, d] = referenceDate.split('-').map(Number)
    const yesterday = new Date(y, m - 1, d - 1)
    const py = yesterday.getFullYear()
    const pm = String(yesterday.getMonth() + 1).padStart(2, '0')
    const pd = String(yesterday.getDate()).padStart(2, '0')
    current = `${py}-${pm}-${pd}`
    if (!checkinSet.has(current) && !freezeSet.has(current)) {
      return 0
    }
  }

  let streak = 0
  let iterDate = current

  while (checkinSet.has(iterDate) || freezeSet.has(iterDate)) {
    if (checkinSet.has(iterDate)) {
      streak++
    }
    const [y, m, d] = iterDate.split('-').map(Number)
    const prev = new Date(y, m - 1, d - 1)
    const py = prev.getFullYear()
    const pm = String(prev.getMonth() + 1).padStart(2, '0')
    const pd = String(prev.getDate()).padStart(2, '0')
    iterDate = `${py}-${pm}-${pd}`
  }

  return streak
}

export interface ChallengeStats {
  completedDays: number
  targetDays: number
  percentage: number
  streak: number
  isCompletedToday: boolean
  isFrozenToday: boolean
  freezeDaysPerMonth: number
  freezesUsedThisMonth: number
  freezesRemainingThisMonth: number
  estimatedEndDate: string
  milestones: ChallengeMilestone[]
}

export const calculateChallengeStats = (
  challenge: Challenge,
  referenceDate = getTodayDateString()
): ChallengeStats => {
  const completedDays = challenge.checkins ? challenge.checkins.length : 0
  const targetDays = challenge.targetDays || 90
  const percentage = Math.min(100, Math.round((completedDays / targetDays) * 100))
  const streak = challenge.type === 'streak'
    ? calculateStreak(challenge.checkins, challenge.freezeDates, referenceDate)
    : completedDays

  const isCompletedToday = Boolean(challenge.checkins?.includes(referenceDate))
  const isFrozenToday = Boolean(challenge.freezeDates?.includes(referenceDate))

  const freezeDaysPerMonth = typeof challenge.freezeDaysPerMonth === 'number' ? challenge.freezeDaysPerMonth : 2
  const currentMonth = referenceDate.slice(0, 7)
  const freezesUsedThisMonth = (challenge.freezeDates || []).filter((d) => d.startsWith(currentMonth)).length
  const freezesRemainingThisMonth = Math.max(0, freezeDaysPerMonth - freezesUsedThisMonth)

  // Previsão de data de conclusão
  const remaining = Math.max(0, targetDays - completedDays)
  const estimatedEndDate = addDaysToDateString(referenceDate, remaining)

  // Marcos com base na meta total
  const milestoneDays = [
    { days: Math.min(7, targetDays), title: '1ª Semana', emoji: '🥉' },
    { days: Math.min(30, targetDays), title: '30 Dias', emoji: '🥈' },
    { days: Math.min(60, targetDays), title: '60 Dias', emoji: '🥇' },
    { days: targetDays, title: `${targetDays} Dias (Meta)`, emoji: '🏆' }
  ].filter((m, idx, arr) => arr.findIndex((x) => x.days === m.days) === idx)

  const milestones: ChallengeMilestone[] = milestoneDays.map((m) => {
    const achieved = completedDays >= m.days
    return {
      days: m.days,
      title: m.title,
      emoji: m.emoji,
      achieved,
      remainingDays: Math.max(0, m.days - completedDays)
    }
  })

  return {
    completedDays,
    targetDays,
    percentage,
    streak,
    isCompletedToday,
    isFrozenToday,
    freezeDaysPerMonth,
    freezesUsedThisMonth,
    freezesRemainingThisMonth,
    estimatedEndDate,
    milestones
  }
}
