import type { SleepRecord } from '@stores/health/types'
import SleepTrackerCard from '@pages/home/components/sleepTrackerCard'

export interface CompactSleepCardProps {
  sleepHistory: SleepRecord[]
  selectedDate?: string
  onSaveSleep: (hours: number, quality: number, date?: string) => void
}

export const CompactSleepCard = ({
  sleepHistory,
  selectedDate,
  onSaveSleep
}: CompactSleepCardProps) => {
  return (
    <SleepTrackerCard
      sleepHistory={sleepHistory}
      selectedDate={selectedDate}
      onSaveSleep={onSaveSleep}
    />
  )
}

export default CompactSleepCard
