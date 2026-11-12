import type { PrivacyPolicyPageProps } from '../types'

export type UsePrivacyPolicyOptions = PrivacyPolicyPageProps

export interface UsePrivacyPolicyReturn {
  lastUpdated: string
  handleBack: () => void
}
