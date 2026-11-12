import { SegmentedControl } from '@mantine/core'

import type { AuthTabsProps } from './types'

export const AuthTabs = ({ value, onChange }: AuthTabsProps) => {
  return (
    <SegmentedControl
      fullWidth
      value={value}
      onChange={onChange}
      data={[
        { label: 'Entrar', value: 'login' },
        { label: 'Cadastrar', value: 'register' }
      ]}
      color="indigo"
      radius="md"
      size="md"
      mb="lg"
    />
  )
}

export default AuthTabs
