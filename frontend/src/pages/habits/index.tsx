import { SimpleGrid, Stack, Box } from '@mantine/core'

import HabitsCalendarToolbar from './components/habitsCalendarToolbar'
import HabitsScoreCard from './components/habitsScoreCard'
import HabitsChecklist from './components/habitsChecklist'
import HabitsMonthView from './components/habitsMonthView'
import HabitsWeekView from './components/habitsWeekView'
import HabitsModal from './components/habitsModal'
import HabitsPool from './components/habitsPool'
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
    habits,
    dayHabitIds,
    rangeSummariesMap,
    weekDays,
    monthCells,
    isLoading,
    isCreating,
    isScheduling,
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
    handleScheduleForDay,
    handleRemoveHabit,
    handleConfirmScopeAction,
    handleCloseScopeModal
  } = useHabitsPage()

  const totalHabits = daySummary?.totalHabits ?? 0
  const completedHabits = daySummary?.completedHabits ?? 0
  const completionRate = daySummary?.completionRate ?? 0
  const items = daySummary?.items ?? []

  return (
    <Box style={containerStyle}>
      <Stack gap="xl">
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

        <HabitsScoreCard
          totalHabits={totalHabits}
          completedHabits={completedHabits}
          completionRate={completionRate}
          isLoading={isLoading}
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

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <HabitsChecklist
            items={items}
            isLoading={isLoading}
            togglingId={togglingId}
            onToggle={(habitId) => handleToggleCheckin(habitId, selectedDate)}
            onEdit={handleOpenEditModal}
            onRemove={handleRemoveHabit}
          />

          <HabitsPool
            habits={habits}
            dayHabitIds={dayHabitIds}
            onScheduleForDay={handleScheduleForDay}
            onRemoveHabit={handleRemoveHabit}
            onEditHabit={handleOpenEditModal}
            isScheduling={isScheduling}
          />
        </SimpleGrid>

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
      </Stack>
    </Box>
  )
}

export default HabitsPage

