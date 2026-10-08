import { Stack, SimpleGrid } from '@mantine/core'

import ActionExecutorCard from './components/actionExecutorCard'
import HabitsBannerCard from './components/habitsBannerCard'
import SystemStatusGrid from './components/systemStatusGrid'
import WelcomeBanner from './components/welcomeBanner'
import ProfileCard from './components/profileCard'
import CharacterCard from './components/characterCard'
import WeightImcCard from './components/weightImcCard'
import WaterTrackerCard from './components/waterTrackerCard'
import useHomePage from './hook'

export const HomePage = () => {
  const {
    user,
    token,
    actionLoading,
    actionResult,
    handleFetchProfile,
    handleNavigateResetPassword,
    handleNavigateHabits,

    healthProfile,
    weightHistory,
    latestWeight,
    consumedWaterBottles,
    extraWaterBottlesTarget,
    handleUpdateHealthProfile,
    handleSaveWeight,
    handleToggleWaterBottle,
    handleAddExtraWaterBottle,
    handleResetTodayWater
  } = useHomePage()

  return (
    <Stack gap="xl" w="100%">
      <WelcomeBanner user={user} />

      {/* Personagem Interativo com Idade e Altura */}
      <CharacterCard
        profile={healthProfile}
        latestWeight={latestWeight}
        onUpdateProfile={handleUpdateHealthProfile}
      />

      {/* Grid de Saúde: Peso & IMC + Hidratação Diária */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <WeightImcCard
          heightCm={healthProfile.height}
          weightHistory={weightHistory}
          onSaveWeight={handleSaveWeight}
        />

        <WaterTrackerCard
          currentWeight={latestWeight}
          consumedBottles={consumedWaterBottles}
          extraBottlesTarget={extraWaterBottlesTarget}
          onToggleBottle={handleToggleWaterBottle}
          onAddExtraBottle={handleAddExtraWaterBottle}
          onResetToday={handleResetTodayWater}
        />
      </SimpleGrid>

      <HabitsBannerCard onNavigateHabits={handleNavigateHabits} />

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
