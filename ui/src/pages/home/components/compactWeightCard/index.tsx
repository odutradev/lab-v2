import WeightImcCard from '../weightImcCard'

import type { WeightRecord } from '@stores/health/types'

export interface CompactWeightCardProps {
  heightCm?: number
  weightHistory: WeightRecord[]
  selectedDate?: string
  hoveredDate?: string | null
  onSaveWeight: (weight: number, date?: string) => void
  onHoverDate?: (date: string | null) => void
}

export const CompactWeightCard = ({
  heightCm,
  weightHistory,
  selectedDate,
  hoveredDate,
  onSaveWeight,
  onHoverDate
}: CompactWeightCardProps) => {
  return (
    <WeightImcCard
      heightCm={heightCm}
      weightHistory={weightHistory}
      selectedDate={selectedDate}
      hoveredDate={hoveredDate}
      onSaveWeight={onSaveWeight}
      onHoverDate={onHoverDate}
    />
  )
}

export default CompactWeightCard
