import type { CalendarViewMode, CalendarDayCell } from '@pages/habits/types'
import type { CreateHabitFormData } from '@pages/habits/components/habitsModal/types'
import type { RecurringActionType } from '@pages/habits/components/recurringScopeModal/types'
import type { DaySummaryResponse, Habit, RecurrenceScopeMode } from '@actions/habits/types'

export interface UseHabitsPageReturn {
  selectedDate: string
  todayStr: string
  formattedDate: string
  headerTitle: string
  isToday: boolean
  viewMode: CalendarViewMode
  setViewMode: (mode: CalendarViewMode) => void
  daySummary: DaySummaryResponse | null
  habits: Habit[]
  dayHabitIds: Set<string>
  rangeSummariesMap: Map<string, DaySummaryResponse>
  weekDays: string[]
  monthCells: CalendarDayCell[]
  isLoading: boolean
  isCreating: boolean
  isScheduling: boolean
  togglingId: string | null
  isModalOpen: boolean
  editingHabit: Habit | null
  isScopeModalOpen: boolean
  scopeActionType: RecurringActionType
  handleSelectDate: (date: string) => void
  handlePreviousPeriod: () => void
  handleNextPeriod: () => void
  handleToday: () => void
  handleOpenModal: () => void
  handleOpenEditModal: (habitId: string, date?: string) => void
  handleCloseModal: () => void
  handleSaveHabit: (data: CreateHabitFormData) => Promise<void>
  handleToggleCheckin: (habitId: string, date?: string) => Promise<void>
  handleScheduleForDay: (habitId: string) => Promise<void>
  handleRemoveHabit: (habitId: string, date?: string) => Promise<void>
  handleConfirmScopeAction: (mode: RecurrenceScopeMode) => Promise<void>
  handleCloseScopeModal: () => void
}
