import { Stack, Box } from '@mantine/core'

import Card from '@components/ui/card'
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

  return (
    <Box style={containerStyle}>
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

