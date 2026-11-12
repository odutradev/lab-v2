import type { ImcResult } from '@stores/health/types'

export interface ImcGaugeChartProps {
  imcResult: ImcResult | null
  heightCm?: number
  currentWeight?: number
}
