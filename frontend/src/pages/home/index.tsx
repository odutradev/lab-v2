import { Stack, SimpleGrid } from '@mantine/core'

import WelcomeBanner from './components/welcomeBanner'
import ProfileCard from './components/profileCard'
import ActionExecutorCard from './components/actionExecutorCard'
import SystemStatusGrid from './components/systemStatusGrid'
import useHomePage from './hook'

export const HomePage = () => {
  const {
    user,
    token,
    actionLoading,
    actionResult,
    handleFetchProfile,
    handleNavigateResetPassword
  } = useHomePage()

  return (
    <Stack gap="xl" w="100%">
      <WelcomeBanner user={user} />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ProfileCard
          user={user}
          onResetPassword={handleNavigateResetPassword}
        />

        <ActionExecutorCard
          isLoading={actionLoading}
          actionResult={actionResult}
          onFetchProfile={handleFetchProfile}
        />
      </SimpleGrid>

      <SystemStatusGrid token={token} />
    </Stack>
  )
}

export default HomePage
