const MillisecondsPerDay = 1000 * 60 * 60 * 24

const DayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const padTwoDigits = (value: number): string => String(value).padStart(2, '0')

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`
}

export const formatTimeKey = (date: Date): string => {
  return `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`
}

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const countDaysBetween = (startDate: Date, endDate: Date): number => {
  return Math.round((endDate.getTime() - startDate.getTime()) / MillisecondsPerDay)
}

export const formatTimestamp = (date: Date = new Date()): string => {
  return `${formatDateKey(date)} ${formatTimeKey(date)}:${padTwoDigits(date.getSeconds())}`
}

export const formatDateBR = (date: Date): string => {
  return `${padTwoDigits(date.getDate())}/${padTwoDigits(date.getMonth() + 1)}/${date.getFullYear()}`
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)

  result.setDate(result.getDate() + days)

  return result
}

export const isPast = (date: Date): boolean => {
  return date.getTime() < new Date().getTime()
}

export const isDateValid = (dateKey: string): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const differenceInDays = countDaysBetween(today, parseDateKey(dateKey))
  return differenceInDays >= 0 && differenceInDays <= 30
}

export const getDayName = (dateKey: string): string => {
  return DayNames[parseDateKey(dateKey).getDay()]
}

export const timeToMins = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const minsToTime = (totalMinutes: number): string => {
  return `${padTwoDigits(Math.floor(totalMinutes / 60))}:${padTwoDigits(totalMinutes % 60)}`
}
