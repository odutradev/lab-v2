import { Stack, Box, Text } from "@mantine/core";

import ProfileHeader from "./subcomponents/profileHeader";
import ProfileProgressCard from "./subcomponents/profileProgressCard";
import ProfileInfoCard from "./subcomponents/profileInfoCard";
import ProfilePhysicalCard from "./subcomponents/profilePhysicalCard";
import ProfilePerformanceWeightsCard from "./subcomponents/profilePerformanceWeightsCard";
import ProfileSecurityCard from "./subcomponents/profileSecurityCard";
import { containerStyle } from "./styles";
import useProfile from "./hook";

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
    isClearCacheModalOpen,
    isClearingCache,
    openClearCacheModal,
    closeClearCacheModal,
    handleClearCache,
    formatDate
  } = useProfile();

  if (!user) {
    return null;
  }

  return (
    <Box style={containerStyle}>
      <Stack gap="lg">
        <ProfileHeader user={user} initials={initials} />

        <ProfileProgressCard calendarStatus={calendarStatus} onConnectCalendar={handleConnectGoogleCalendar} />

        <ProfileInfoCard user={user} formatDate={formatDate} />

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
          Versão {__APP_VERSION__}
        </Text>
      </Stack>
    </Box>
  );
};

export default ProfilePage;
