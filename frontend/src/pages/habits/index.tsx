import { Stack, Box, SimpleGrid } from '@mantine/core'

import Card from '@components/ui/card'
import useHealthStore from '@stores/health'
import CharacterCard from '@pages/home/components/characterCard'
import WeightImcCard from '@pages/home/components/weightImcCard'
import WaterTrackerCard from '@pages/home/components/waterTrackerCard'

import HabitsCalendarToolbar from './components/habitsCalendarToolbar'
import HabitsMonthView from './components/habitsMonthView'
import HabitsWeekView from './components/habitsWeekView'
import HabitsDayView from './components/habitsDayView'
import HabitsModal from './components/habitsModal'
import RecurringScopeModal from './components/recurringScopeModal'
import { containerStyle } from './styles'
import useHabitsPage from './hook'

export const HabitsPage = () => {
  const {
    selectedDate,
    todayStr,
    headerTitle,
    isToday,
    viewMode,
    setViewMode,
    daySummary,
    rangeSummariesMap,
    weekDays,
    monthCells,
    isLoading,
    isCreating,
    togglingId,
    isModalOpen,
    editingHabit,
    isScopeModalOpen,
    scopeActionType,
    handleSelectDate,
    handlePreviousPeriod,
    handleNextPeriod,
    handleToday,
    handleOpenModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveHabit,
    handleToggleCheckin,
    handleRemoveHabit,
    handleConfirmScopeAction,
    handleCloseScopeModal
  } = useHabitsPage()

  const {
    profile: healthProfile,
    weightHistory,
    waterDailyMap,
    waterExtraTargetMap,
    updateProfile: handleUpdateHealthProfile,
    saveWeightRecord: handleSaveWeight,
    toggleWaterBottle: handleToggleWaterBottle,
    addExtraWaterBottle: handleAddExtraWaterBottle,
    resetTodayWater: handleResetTodayWater
  } = useHealthStore()

  const consumedWaterBottles = waterDailyMap[todayStr] || 0
  const extraWaterBottlesTarget = waterExtraTargetMap[todayStr] || 0
  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : undefined

  return (
    <Box style={containerStyle}>
      <Stack gap="xl" w="100%">
        {/* Personagem Interativo: clique para configurar idade e altura */}
        <CharacterCard
          profile={healthProfile}
          latestWeight={latestWeight}
          onUpdateProfile={handleUpdateHealthProfile}
        />

        {/* Grid de Saúde: Controle de Peso & IMC + Hidratação Diária */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
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

        {/* Agenda e Metas de Hábitos */}
        <Card>
          <Stack gap="lg">
            <HabitsCalendarToolbar
              headerTitle={headerTitle}
              viewMode={viewMode}
              isToday={isToday}
              onViewModeChange={setViewMode}
              onPrevious={handlePreviousPeriod}
              onNext={handleNextPeriod}
              onToday={handleToday}
              onOpenNewHabitModal={handleOpenModal}
            />

            {viewMode === 'month' && (
              <HabitsMonthView
                monthCells={monthCells}
                rangeSummariesMap={rangeSummariesMap}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onToggleCheckin={handleToggleCheckin}
                onEditItem={handleOpenEditModal}
              />
            )}

            {viewMode === 'week' && (
              <HabitsWeekView
                weekDays={weekDays}
                todayStr={todayStr}
                rangeSummariesMap={rangeSummariesMap}
                selectedDate={selectedDate}
                togglingId={togglingId}
                onSelectDate={handleSelectDate}
                onToggleCheckin={handleToggleCheckin}
                onEditItem={handleOpenEditModal}
              />
            )}

            {viewMode === 'day' && (
              <HabitsDayView
                selectedDate={selectedDate}
                isToday={isToday}
                daySummary={daySummary}
                isLoading={isLoading}
                togglingId={togglingId}
                onToggleCheckin={handleToggleCheckin}
                onEditItem={handleOpenEditModal}
                onRemoveItem={handleRemoveHabit}
              />
            )}
          </Stack>
        </Card>
      </Stack>

      <HabitsModal
        isOpen={isModalOpen}
        isLoading={isCreating}
        initialDate={selectedDate}
        initialHabit={editingHabit}
        onClose={handleCloseModal}
        onSubmit={handleSaveHabit}
        onDelete={(id) => handleRemoveHabit(id, selectedDate)}
      />

      <RecurringScopeModal
        isOpen={isScopeModalOpen}
        actionType={scopeActionType}
        onClose={handleCloseScopeModal}
        onConfirm={handleConfirmScopeAction}
        isLoading={isCreating}
      />
    </Box>
  )
}

export default HabitsPage
