import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Box, Grid, Text } from '@mantine/core'
import { TbRulerMeasure, TbUser } from 'react-icons/tb'

import Card from '@components/ui/card'
import Button from '@components/ui/button'
import useHealthStore from '@stores/health'

import HabitsCalendarToolbar from './components/habitsCalendarToolbar'
import HabitsMonthView from './components/habitsMonthView'
import HabitsWeekView from './components/habitsWeekView'
import HabitsDayView from './components/habitsDayView'
import HabitsModal from './components/habitsModal'
import RecurringScopeModal from './components/recurringScopeModal'
import GeneralPerformanceCard from './components/generalPerformanceCard'
import CompactWeightCard from './components/compactWeightCard'
import CompactWaterCard from './components/compactWaterCard'
import { containerStyle } from './styles'
import useHabitsPage from './hook'
import useMonthlyMetrics from './hook/useMonthlyMetrics'

import type { CreateHabitFormData } from './components/habitsModal/types'
import type { RecurrenceScopeMode } from '@actions/habits/types'

export const HabitsPage = () => {
  const navigate = useNavigate()
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

  const isBioConfigured = Boolean(
    healthProfile.height &&
    healthProfile.age &&
    healthProfile.height > 0 &&
    healthProfile.age > 0
  )

  const consumedWaterBottles = waterDailyMap[selectedDate] || 0
  const extraWaterBottlesTarget = waterExtraTargetMap[selectedDate] || 0
  const dayWeightRecord = weightHistory.find((r) => r.date === selectedDate)
  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : undefined
  const currentWeightForDay = dayWeightRecord?.weight || latestWeight

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
    handleToggleWaterBottle(index, selectedDate)
    triggerMetricsRefresh()
  }

  const handleAddExtraWaterWithMetrics = () => {
    handleAddExtraWaterBottle(selectedDate)
    triggerMetricsRefresh()
  }

  const handleRemoveExtraWaterWithMetrics = () => {
    handleRemoveExtraWaterBottle(selectedDate)
    triggerMetricsRefresh()
  }

  const handleSaveWeightWithMetrics = (weight: number, date?: string) => {
    handleSaveWeight(weight, date || selectedDate)
    triggerMetricsRefresh()
  }

  const handleUpdateWaterSettingsWithMetrics = (settings: { bottleMl: number }) => {
    handleUpdateWaterSettings(settings)
    triggerMetricsRefresh()
  }

  return (
    <Box style={containerStyle}>
      <Grid gap="md" align="stretch" style={{ flex: 1 }}>
        {/* Lado Esquerdo: CALENDARIO */}
        <Grid.Col span={{ base: 12, lg: 7 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Stack gap="md" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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

        {/* Lado Direito: DESEMPENHO GERAL, PESO, AGUA (ou AVISO DE CONFIGURAÇÃO) */}
        <Grid.Col span={{ base: 12, lg: 5 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <Stack gap="md" style={{ flex: 1, justifyContent: 'space-between' }}>
            {/* Topo: DESEMPENHO GERAL em linha inteira */}
            <GeneralPerformanceCard
              metrics={metrics}
              isLoading={isMetricsLoading}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />

            {isBioConfigured ? (
              <>
                {/* Meio: PESO & IMC */}
                <CompactWeightCard
                  heightCm={healthProfile.height}
                  weightHistory={weightHistory}
                  selectedDate={selectedDate}
                  onSaveWeight={handleSaveWeightWithMetrics}
                />

                {/* Fundo: AGUA */}
                <CompactWaterCard
                  currentWeight={currentWeightForDay}
                  currentAge={healthProfile.age}
                  currentHeight={healthProfile.height}
                  consumedBottles={consumedWaterBottles}
                  extraBottlesTarget={extraWaterBottlesTarget}
                  bottleMl={waterBottleMl}
                  selectedDate={selectedDate}
                  onToggleBottle={handleToggleWaterWithMetrics}
                  onAddExtraBottle={handleAddExtraWaterWithMetrics}
                  onRemoveExtraBottle={handleRemoveExtraWaterWithMetrics}
                  onUpdateSettings={handleUpdateWaterSettingsWithMetrics}
                />
              </>
            ) : (
              /* Aviso indicando para ir ao perfil quando altura e idade não estão configuradas */
              <Card style={{ position: 'relative', overflow: 'hidden', padding: '24px 20px', textAlign: 'center' }}>
                <Box
                  style={{
                    position: 'absolute',
                    top: -24,
                    right: -24,
                    width: 110,
                    height: 110,
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />
                <Stack align="center" gap="sm">
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8'
                    }}
                  >
                    <TbRulerMeasure size={24} />
                  </Box>

                  <Stack gap={4} align="center">
                    <Text fw={700} size="sm" c="white">
                      Altura e idade não configuradas
                    </Text>
                    <Text size="xs" c="dimmed" maw={340} ta="center" style={{ lineHeight: 1.5 }}>
                      Configure sua altura e idade no seu perfil para habilitar o acompanhamento de Peso & IMC e a meta calculada de Hidratação.
                    </Text>
                  </Stack>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/profile')}
                    leftIcon={<TbUser size={14} />}
                    style={{ marginTop: 4 }}
                  >
                    Ir para o Perfil
                  </Button>
                </Stack>
              </Card>
            )}
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
