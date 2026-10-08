import type { WeightRecord } from '@stores/health/types'
import WeightImcCard from '@pages/home/components/weightImcCard'

export interface CompactWeightCardProps {
  heightCm?: number
  weightHistory: WeightRecord[]
  selectedDate?: string
  onSaveWeight: (weight: number, date?: string) => void
}

export const CompactWeightCard = ({
  heightCm,
  weightHistory,
  selectedDate,
  onSaveWeight
}: CompactWeightCardProps) => {
  return (
    <WeightImcCard
      heightCm={heightCm}
      weightHistory={weightHistory}
      selectedDate={selectedDate}
      onSaveWeight={onSaveWeight}
    />
  )
}

export default CompactWeightCard

