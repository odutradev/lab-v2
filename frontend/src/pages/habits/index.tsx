import { SimpleGrid, Stack, Box } from '@mantine/core'

import HabitsScoreCard from './components/habitsScoreCard'
import HabitsChecklist from './components/habitsChecklist'
import HabitsHeader from './components/habitsHeader'
import HabitsModal from './components/habitsModal'
import HabitsPool from './components/habitsPool'
import { containerStyle } from './styles'
import useHabitsPage from './hook'

export const HabitsPage = () => {
  const {
    selectedDate,
    formattedDate,
    isToday,
    daySummary,
    habits,
    dayHabitIds,
    isLoading,
    isCreating,
    isScheduling,
    togglingId,
    isModalOpen,
    handlePreviousDay,
    handleNextDay,
    handleToday,
    handleOpenModal,
    handleCloseModal,
    handleCreateHabit,
    handleToggleCheckin,
    handleScheduleForDay,
    handleRemoveHabit
  } = useHabitsPage()

  const totalHabits = daySummary?.totalHabits ?? 0
  const completedHabits = daySummary?.completedHabits ?? 0
  const completionRate = daySummary?.completionRate ?? 0
  const items = daySummary?.items ?? []

  return (
    <Box style={containerStyle}>
      <Stack gap="xl">
        <HabitsHeader
          selectedDate={selectedDate}
          formattedDate={formattedDate}
          isToday={isToday}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onToday={handleToday}
          onOpenNewHabitModal={handleOpenModal}
        />

        <HabitsScoreCard
          totalHabits={totalHabits}
          completedHabits={completedHabits}
          completionRate={completionRate}
          isLoading={isLoading}
        />

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <HabitsChecklist
            items={items}
            isLoading={isLoading}
            togglingId={togglingId}
            onToggle={handleToggleCheckin}
          />

          <HabitsPool
            habits={habits}
            dayHabitIds={dayHabitIds}
            onScheduleForDay={handleScheduleForDay}
            onRemoveHabit={handleRemoveHabit}
            isScheduling={isScheduling}
          />
        </SimpleGrid>

        <HabitsModal
          isOpen={isModalOpen}
          isLoading={isCreating}
          onClose={handleCloseModal}
          onSubmit={handleCreateHabit}
        />
      </Stack>
    </Box>
  )
}

export default HabitsPage
