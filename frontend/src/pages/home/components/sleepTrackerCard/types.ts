import type { SleepRecord } from '@stores/health/types'

export interface SleepTrackerCardProps {
  sleepHistory: SleepRecord[]
  selectedDate?: string
  onSaveSleep: (hours: number, quality: number, date?: string) => void
}
