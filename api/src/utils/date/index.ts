export const formatTimestamp = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

export const formatDateBR = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${dd}/${mm}/${yyyy}`
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)

  result.setDate(result.getDate() + days)

  return result
}

export const isPast = (date: Date): boolean => {
  return date.getTime() < new Date().getTime()
}

export const isDateValid = (dateStr: string): boolean => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 30
}

export const getDayName = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date(year, month - 1, day).getDay()]
}

export const timeToMins = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const minsToTime = (totalMins: number): string => {
  const h = String(Math.floor(totalMins / 60)).padStart(2, '0')
  const m = String(totalMins % 60).padStart(2, '0')
  return `${h}:${m}`
}
