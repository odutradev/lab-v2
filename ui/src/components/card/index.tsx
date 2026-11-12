import { Paper, Title, Text, Box } from '@mantine/core'

import type { CardProps } from './types'

export const CardHeader = ({ children, className, ...props }: CardProps) => {
  return (
    <Box
      mb="md"
      pb="xs"
      className={className}
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
      {...props}
    >
      {children}
    </Box>
  )
}

export const CardTitle = ({ children, className, ...props }: CardProps) => {
  return (
    <Title order={4} fw={600} c="white" className={className} {...props}>
      {children}
    </Title>
  )
}

export const CardDescription = ({ children, className, ...props }: CardProps) => {
  return (
    <Text size="sm" c="dimmed" mt={4} className={className} {...props}>
      {children}
    </Text>
  )
}

export const CardContent = ({ children, className, ...props }: CardProps) => {
  return (
    <Box className={className} {...props}>
      {children}
    </Box>
  )
}

export const CardFooter = ({ children, className, ...props }: CardProps) => {
  return (
    <Box
      mt="md"
      pt="xs"
      className={className}
      style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
      {...props}
    >
      {children}
    </Box>
  )
}

export const Card = ({ children, className, p = 'xl', ...props }: CardProps) => {
  return (
    <Paper
      p={p}
      radius="lg"
      withBorder
      shadow="md"
      bg="rgba(17, 24, 39, 0.7)"
      className={className}
      style={{ backdropFilter: 'blur(16px)' }}
      {...props}
    >
      {children}
    </Paper>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
