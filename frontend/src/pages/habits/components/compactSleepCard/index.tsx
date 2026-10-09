import type { SleepRecord } from '@stores/health/types'
import SleepTrackerCard from '@pages/home/components/sleepTrackerCard'

export interface CompactSleepCardProps {
  sleepHistory: SleepRecord[]
  selectedDate?: string
  hoveredDate?: string | null
  onSaveSleep: (hours: number, quality: number, date?: string) => void
  onHoverDate?: (date: string | null) => void
}

export const CompactSleepCard = ({
  sleepHistory,
  selectedDate,
  hoveredDate,
  onSaveSleep,
  onHoverDate
}: CompactSleepCardProps) => {
  return (
    <SleepTrackerCard
      sleepHistory={sleepHistory}
      selectedDate={selectedDate}
      hoveredDate={hoveredDate}
      onSaveSleep={onSaveSleep}
      onHoverDate={onHoverDate}
    />
  )
}

export default CompactSleepCard
