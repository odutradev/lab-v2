import { Stack, Box } from '@mantine/core'

import ProfileHeader from './components/profileHeader'
import ProfileInfoCard from './components/profileInfoCard'
import ProfileSecurityCard from './components/profileSecurityCard'
import { containerStyle } from './styles'
import useProfile from './hook'

export const ProfilePage = () => {
  const {
    user,
    initials,
    calendarStatus,
    isCalendarLoading,
    isConnectingCalendar,
    isDisconnectingCalendar,
    handleConnectGoogleCalendar,
    handleDisconnectGoogleCalendar,
    handleNavigateResetPassword,
    handleNavigateHome,
    formatDate
  } = useProfile()

  if (!user) {
    return null
  }

  return (
    <Box style={containerStyle}>
      <Stack gap="lg">
        <ProfileHeader
          user={user}
          initials={initials}
          onBack={handleNavigateHome}
        />

        <ProfileInfoCard
          user={user}
          formatDate={formatDate}
        />

        <ProfileSecurityCard
          onNavigateResetPassword={handleNavigateResetPassword}
          calendarStatus={calendarStatus}
          isCalendarLoading={isCalendarLoading}
          isConnectingCalendar={isConnectingCalendar}
          isDisconnectingCalendar={isDisconnectingCalendar}
          onConnectCalendar={handleConnectGoogleCalendar}
          onDisconnectCalendar={handleDisconnectGoogleCalendar}
        />
      </Stack>
    </Box>
  )
}

export default ProfilePage
