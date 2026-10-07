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
        />
      </Stack>
    </Box>
  )
}

export default ProfilePage
