import type { TermsOfServicePageProps } from '../types'

export type UseTermsOfServiceOptions = TermsOfServicePageProps

export interface UseTermsOfServiceReturn {
  lastUpdated: string
  handleBack: () => void
}
