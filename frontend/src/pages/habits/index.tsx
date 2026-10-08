import { useState } from 'react'
import { Stack, Box, Grid, SimpleGrid } from '@mantine/core'

import Card from '@components/ui/card'
import useHealthStore from '@stores/health'

import HabitsCalendarToolbar from './components/habitsCalendarToolbar'
import HabitsMonthView from './components/habitsMonthView'
import HabitsWeekView from './components/habitsWeekView'
import HabitsDayView from './components/habitsDayView'
import HabitsModal from './components/habitsModal'
import RecurringScopeModal from './components/recurringScopeModal'
import GeneralPerformanceCard from './components/generalPerformanceCard'
import CompactCharacterCard from './components/compactCharacterCard'
import CompactWeightCard from './components/compactWeightCard'
import CompactWaterCard from './components/compactWaterCard'
import { containerStyle } from './styles'
import useHabitsPage from './hook'
import useMonthlyMetrics from './hook/useMonthlyMetrics'

import type { CreateHabitFormData } from './components/habitsModal/types'
import type { RecurrenceScopeMode } from '@actions/habits/types'

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
    waterBottleMl,
    waterTargetBottles,
    updateProfile: handleUpdateHealthProfile,
    saveWeightRecord: handleSaveWeight,
    toggleWaterBottle: handleToggleWaterBottle,
    addExtraWaterBottle: handleAddExtraWaterBottle,
    removeExtraWaterBottle: handleRemoveExtraWaterBottle,
    updateWaterSettings: handleUpdateWaterSettings
  } = useHealthStore()

  // Revisão para disparar recálculo das métricas do mês quando dados mudarem
  const [metricsRevision, setMetricsRevision] = useState(0)
  const currentMonth = selectedDate.slice(0, 7)

  const { metrics, isLoading: isMetricsLoading } = useMonthlyMetrics({
    month: currentMonth,
    triggerRevision: metricsRevision
  })

  const consumedWaterBottles = waterDailyMap[todayStr] || 0
  const extraWaterBottlesTarget = waterExtraTargetMap[todayStr] || 0
  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : undefined

  const triggerMetricsRefresh = () => {
    setMetricsRevision((prev) => prev + 1)
  }

  const handleToggleCheckinWithMetrics = async (habitId: string, date?: string) => {
    await handleToggleCheckin(habitId, date)
    triggerMetricsRefresh()
  }

  const handleSaveHabitWithMetrics = async (data: CreateHabitFormData) => {
    await handleSaveHabit(data)
    triggerMetricsRefresh()
  }

  const handleRemoveHabitWithMetrics = async (habitId: string, date?: string) => {
    await handleRemoveHabit(habitId, date)
    triggerMetricsRefresh()
  }

  const handleConfirmScopeActionWithMetrics = async (mode: RecurrenceScopeMode) => {
    await handleConfirmScopeAction(mode)
    triggerMetricsRefresh()
  }

  const handleToggleWaterWithMetrics = (index: number) => {
    handleToggleWaterBottle(index)
    triggerMetricsRefresh()
  }

  const handleAddExtraWaterWithMetrics = () => {
    handleAddExtraWaterBottle()
    triggerMetricsRefresh()
  }

  const handleRemoveExtraWaterWithMetrics = () => {
    handleRemoveExtraWaterBottle()
    triggerMetricsRefresh()
  }

  const handleUpdateWaterSettingsWithMetrics = (settings: { bottleMl: number; targetBottles: number }) => {
    handleUpdateWaterSettings(settings)
    triggerMetricsRefresh()
  }

  return (
    <Box style={containerStyle}>
      <Grid gap="md" align="stretch">
        {/* Lado Esquerdo: CALENDARIO */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack gap="md" style={{ flex: 1 }}>
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
                  onToggleCheckin={handleToggleCheckinWithMetrics}
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
                  onToggleCheckin={handleToggleCheckinWithMetrics}
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
                  onToggleCheckin={handleToggleCheckinWithMetrics}
                  onEditItem={handleOpenEditModal}
                  onRemoveItem={handleRemoveHabitWithMetrics}
                />
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Lado Direito: DESEMPENHO GERAL, PESSOA, PESO, AGUA */}
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md" h="100%" justify="space-between">
            {/* Topo: DESEMPENHO GERAL e PESSOA lado a lado */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <GeneralPerformanceCard
                metrics={metrics}
                isLoading={isMetricsLoading}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />

              <CompactCharacterCard
                profile={healthProfile}
                latestWeight={latestWeight}
                onUpdateProfile={handleUpdateHealthProfile}
              />
            </SimpleGrid>

            {/* Meio: PESO */}
            <CompactWeightCard
              heightCm={healthProfile.height}
              weightHistory={weightHistory}
              onSaveWeight={handleSaveWeight}
            />

            {/* Fundo: AGUA */}
            <CompactWaterCard
              currentWeight={latestWeight}
              currentAge={healthProfile.age}
              currentHeight={healthProfile.height}
              consumedBottles={consumedWaterBottles}
              extraBottlesTarget={extraWaterBottlesTarget}
              bottleMl={waterBottleMl}
              customTargetBottles={waterTargetBottles}
              onToggleBottle={handleToggleWaterWithMetrics}
              onAddExtraBottle={handleAddExtraWaterWithMetrics}
              onRemoveExtraBottle={handleRemoveExtraWaterWithMetrics}
              onUpdateSettings={handleUpdateWaterSettingsWithMetrics}
            />
          </Stack>
        </Grid.Col>
      </Grid>

      <HabitsModal
        isOpen={isModalOpen}
        isLoading={isCreating}
        initialDate={selectedDate}
        initialHabit={editingHabit}
        onClose={handleCloseModal}
        onSubmit={handleSaveHabitWithMetrics}
        onDelete={(id) => handleRemoveHabitWithMetrics(id, selectedDate)}
      />

      <RecurringScopeModal
        isOpen={isScopeModalOpen}
        actionType={scopeActionType}
        onClose={handleCloseScopeModal}
        onConfirm={handleConfirmScopeActionWithMetrics}
        isLoading={isCreating}
      />
    </Box>
  )
}

export default HabitsPage
