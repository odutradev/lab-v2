import type { AccountType } from '../../../types/user'

export interface RegisterFormValues {
  name: string
  email: string
  password: string
  accountType: AccountType
  document: string
  phone: string
}
