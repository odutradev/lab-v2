import type { CSSProperties } from 'react'
import { colors } from '@styles/theme'
import { alpha } from '@mantine/core'

export const containerStyle: CSSProperties = {
  maxWidth: 820,
  margin: '0 auto',
  width: '100%',
  paddingBottom: 48
}

export const sectionTitleStyle: CSSProperties = {
  color: colors.white,
  fontSize: '1.15rem',
  fontWeight: 600,
  marginBottom: 8
}

export const textStyle: CSSProperties = {
  color: colors.slate400,
  lineHeight: 1.7,
  fontSize: '0.95rem'
}

export const highlightBoxStyle: CSSProperties = {
  background: alpha(colors.cyan500, 0.08),
  border: `1px solid ${alpha(colors.cyan500, 0.2)}`,
  borderRadius: 12,
  padding: '16px 20px',
  marginTop: 12,
  marginBottom: 12
}
