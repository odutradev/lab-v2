import { Container, Box } from '@mantine/core'

import type { PageContainerProps } from './types'

export const PageContainer = ({
  children,
  center = false,
  className,
  size = 'xl'
}: PageContainerProps) => {
  return (
    <Box component="main" flex={1} display="flex" style={{ flexDirection: 'column' }}>
      <Container
        size={size}
        w="100%"
        py="lg"
        px="md"
        flex={1}
        display="flex"
        className={className}
        style={{
          flexDirection: 'column',
          justifyContent: center ? 'center' : 'flex-start',
          alignItems: center ? 'center' : 'stretch'
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

export default PageContainer
