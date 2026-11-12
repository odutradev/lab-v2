import type { AuthMode } from '../../types'

export interface AuthTabsProps {
  value: AuthMode
  onChange: (value: string) => void
}
