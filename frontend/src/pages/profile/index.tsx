import { Stack, Box, Text } from '@mantine/core'
import packageJson from '@package'

import ProfileHeader from './components/profileHeader'
import ProfileProgressCard from './components/profileProgressCard'
import ProfileInfoCard from './components/profileInfoCard'
import ProfilePhysicalCard from './components/profilePhysicalCard'
import ProfilePerformanceWeightsCard from './components/profilePerformanceWeightsCard'
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
    isSavingCalendarName,
    isRecreatingCalendar,
    isDisconnectModalOpen,
    isEditCalendarNameModalOpen,
    calendarNameInput,
    setCalendarNameInput,
    openDisconnectModal,
    closeDisconnectModal,
    handleConfirmDisconnect,
    openEditCalendarNameModal,
    closeEditCalendarNameModal,
    handleSaveCalendarName,
    handleRecreateCalendar,
    handleConnectGoogleCalendar,
    handleNavigateResetPassword,
    handleNavigateHome,
    isClearCacheModalOpen,
    isClearingCache,
    openClearCacheModal,
    closeClearCacheModal,
    handleClearCache,
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

        <ProfileProgressCard
          calendarStatus={calendarStatus}
          onConnectCalendar={handleConnectGoogleCalendar}
        />

        <ProfileInfoCard
          user={user}
          formatDate={formatDate}
        />

        <ProfilePhysicalCard />

        <ProfilePerformanceWeightsCard />

        <ProfileSecurityCard
          onNavigateResetPassword={handleNavigateResetPassword}
          calendarStatus={calendarStatus}
          isCalendarLoading={isCalendarLoading}
          isConnectingCalendar={isConnectingCalendar}
          isDisconnectingCalendar={isDisconnectingCalendar}
          isSavingCalendarName={isSavingCalendarName}
          isRecreatingCalendar={isRecreatingCalendar}
          isDisconnectModalOpen={isDisconnectModalOpen}
          isEditCalendarNameModalOpen={isEditCalendarNameModalOpen}
          calendarNameInput={calendarNameInput}
          onCalendarNameInputChange={setCalendarNameInput}
          onConnectCalendar={handleConnectGoogleCalendar}
          onOpenDisconnectModal={openDisconnectModal}
          onCloseDisconnectModal={closeDisconnectModal}
          onConfirmDisconnect={handleConfirmDisconnect}
          onOpenEditCalendarNameModal={openEditCalendarNameModal}
          onCloseEditCalendarNameModal={closeEditCalendarNameModal}
          onSaveCalendarName={handleSaveCalendarName}
          onRecreateCalendar={handleRecreateCalendar}
          isClearCacheModalOpen={isClearCacheModalOpen}
          isClearingCache={isClearingCache}
          onOpenClearCacheModal={openClearCacheModal}
          onCloseClearCacheModal={closeClearCacheModal}
          onConfirmClearCache={handleClearCache}
        />

        <Text size="xs" c="dimmed" ta="center" pb="sm">
          Versão {packageJson.version}
        </Text>
      </Stack>
    </Box>
  )
}

export default ProfilePage
