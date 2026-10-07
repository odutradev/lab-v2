export const capitalize = (value: string): string => {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export const formatDisplayName = (name?: string): string => {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''

  if (parts.length === 1) {
    return capitalize(parts[0])
  }

  const firstName = capitalize(parts[0])
  const lastName = capitalize(parts[parts.length - 1])
  return `${firstName} ${lastName}`
}

export const getInitials = (name?: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
