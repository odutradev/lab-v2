import { useState, useEffect, useCallback, useMemo } from 'react'

import { getRangeSummaryAction, scheduleHabitAction, createHabitAction, updateHabitAction, toggleCheckinAction, removeHabitAction, listHabitsAction } from '@actions/habits'
import useToastStore from '@stores/toast'

import type { CalendarViewMode, CalendarDayCell } from '@pages/habits/types'
import type { CreateHabitFormData } from '@pages/habits/components/habitsModal/types'
import type { RecurringActionType } from '@pages/habits/components/recurringScopeModal/types'
import type { DaySummaryResponse, Habit, RecurrenceScopeMode } from '@actions/habits/types'
import type { UseHabitsPageReturn } from './types'

const formatDateToString = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const getTodayString = (): string => {
  return formatDateToString(new Date())
}

const shiftDate = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatDateToString(date)
}

const shiftMonth = (dateStr: string, delta: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const next = new Date(year, month - 1 + delta, day || 1)
  return formatDateToString(next)
}

const formatDateBR = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dayStr = String(day).padStart(2, '0')
  const monthStr = date.toLocaleDateString('pt-BR', { month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayStr} de ${monthStr}`
}

const calculateWeekDays = (dateStr: string): string[] => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay()
  const sunday = new Date(date)
  sunday.setDate(date.getDate() - dayOfWeek)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return formatDateToString(d)
  })
}

const calculateMonthCells = (dateStr: string, todayStr: string, selectedDateStr: string): CalendarDayCell[] => {
  const [year, month] = dateStr.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const start = new Date(firstDay)
  start.setDate(1 - firstDay.getDay())

  const end = new Date(lastDay)
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

  const cells: CalendarDayCell[] = []
  const current = new Date(start)

  while (current <= end) {
    const formatted = formatDateToString(current)
    cells.push({
      date: formatted,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month - 1,
      isToday: formatted === todayStr,
      isSelected: formatted === selectedDateStr
    })
    current.setDate(current.getDate() + 1)
  }

  return cells
}

export const useHabitsPage = (): UseHabitsPageReturn => {
  const todayStr = useMemo(() => getTodayString(), [])
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [rangeSummaries, setRangeSummaries] = useState<DaySummaryResponse[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isScheduling, setIsScheduling] = useState<boolean>(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  // Estados de confirmação de escopo de recorrência (Google Calendar)
  const [isScopeModalOpen, setIsScopeModalOpen] = useState<boolean>(false)
  const [scopeActionType, setScopeActionType] = useState<RecurringActionType>('delete')
  const [pendingScopeAction, setPendingScopeAction] = useState<{
    type: RecurringActionType
    habitId: string
    date: string
    payload?: CreateHabitFormData
  } | null>(null)

  const { showToast } = useToastStore()

  const isToday = selectedDate === todayStr
  const formattedDate = useMemo(() => formatDateBR(selectedDate), [selectedDate])

  const weekDays = useMemo(() => calculateWeekDays(selectedDate), [selectedDate])

  const monthCells = useMemo(() => {
    return calculateMonthCells(selectedDate, todayStr, selectedDate)
  }, [selectedDate, todayStr])

  const rangeSummariesMap = useMemo(() => {
    const map = new Map<string, DaySummaryResponse>()
    rangeSummaries.forEach((s) => map.set(s.date, s))
    return map
  }, [rangeSummaries])

  const daySummary = useMemo(() => {
    return rangeSummariesMap.get(selectedDate) ?? null
  }, [rangeSummariesMap, selectedDate])

  const dayHabitIds = useMemo(() => {
    if (!daySummary) return new Set<string>()
    return new Set(daySummary.items.map((item) => item.habitId))
  }, [daySummary])

  const headerTitle = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    if (viewMode === 'day') {
      return formattedDate
    }

    if (viewMode === 'week') {
      const firstStr = weekDays[0]
      const lastStr = weekDays[6]
      const [, , d1] = firstStr.split('-').map(Number)
      const [, m2, d2] = lastStr.split('-').map(Number)
      const lastDate = new Date(year, m2 - 1, d2)
      const monthName = lastDate.toLocaleDateString('pt-BR', { month: 'long' })
      return `${String(d1).padStart(2, '0')} a ${String(d2).padStart(2, '0')} de ${monthName} de ${lastDate.getFullYear()}`
    }

    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' })
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`
  }, [viewMode, selectedDate, formattedDate, weekDays])

  const visibleRange = useMemo(() => {
    if (viewMode === 'day') {
      return { startDate: selectedDate, endDate: selectedDate }
    }
    if (viewMode === 'week') {
      return { startDate: weekDays[0], endDate: weekDays[6] }
    }
    return { startDate: monthCells[0].date, endDate: monthCells[monthCells.length - 1].date }
  }, [viewMode, selectedDate, weekDays, monthCells])

  const reloadData = useCallback(async (start: string, end: string) => {
    setIsLoading(true)
    try {
      const [summaries, habitsData] = await Promise.all([
        getRangeSummaryAction({ startDate: start, endDate: end }),
        listHabitsAction({ active: true })
      ])
      setRangeSummaries(summaries)
      setHabits(habitsData)
    } catch {
      showToast('Falha ao carregar as metas do calendário.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        const [summaries, habitsData] = await Promise.all([
          getRangeSummaryAction({ startDate: visibleRange.startDate, endDate: visibleRange.endDate }),
          listHabitsAction({ active: true })
        ])
        if (!isCancelled) {
          setRangeSummaries(summaries)
          setHabits(habitsData)
        }
      } catch {
        if (!isCancelled) {
          showToast('Falha ao sincronizar o calendário.', 'error')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [visibleRange.startDate, visibleRange.endDate, showToast])

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
  }

  const handlePreviousPeriod = () => {
    if (viewMode === 'day') {
      setSelectedDate((prev) => shiftDate(prev, -1))
    } else if (viewMode === 'week') {
      setSelectedDate((prev) => shiftDate(prev, -7))
    } else {
      setSelectedDate((prev) => shiftMonth(prev, -1))
    }
  }

  const handleNextPeriod = () => {
    if (viewMode === 'day') {
      setSelectedDate((prev) => shiftDate(prev, 1))
    } else if (viewMode === 'week') {
      setSelectedDate((prev) => shiftDate(prev, 7))
    } else {
      setSelectedDate((prev) => shiftMonth(prev, 1))
    }
  }

  const handleToday = () => {
    setSelectedDate(todayStr)
  }

  const handleOpenModal = () => {
    setEditingHabit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (habitId: string, date?: string) => {
    const targetDate = date || selectedDate
    setSelectedDate(targetDate)

    const existingHabit = habits.find((h) => h.id === habitId)
    let foundSummaryItem = daySummary?.items.find((item) => item.habitId === habitId)
    if (!foundSummaryItem) {
      for (const s of rangeSummaries) {
        const it = s.items.find((i) => i.habitId === habitId)
        if (it) {
          foundSummaryItem = it
          break
        }
      }
    }

    if (existingHabit) {
      setEditingHabit({
        ...existingHabit,
        startTime: existingHabit.startTime ?? foundSummaryItem?.startTime,
        endTime: existingHabit.endTime ?? foundSummaryItem?.endTime,
        startDate: existingHabit.startDate || targetDate
      })
    } else if (foundSummaryItem) {
      setEditingHabit({
        id: habitId,
        userId: '',
        title: foundSummaryItem.title,
        description: foundSummaryItem.description,
        category: foundSummaryItem.category || 'habit',
        frequency: foundSummaryItem.frequency || 'daily',
        startDate: foundSummaryItem.startDate || targetDate,
        allDay: Boolean(foundSummaryItem.allDay),
        startTime: foundSummaryItem.startTime,
        endTime: foundSummaryItem.endTime,
        recurrence: { type: foundSummaryItem.frequency === 'daily' ? 'daily' : 'none' },
        active: true
      })
    }

    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHabit(null)
  }

  const handleSaveHabit = async (data: CreateHabitFormData) => {
    if (editingHabit) {
      const habit = habits.find((h) => h.id === editingHabit.id) || editingHabit
      const isRecurring = Boolean(
        (habit?.recurrence && habit.recurrence.type && habit.recurrence.type !== 'none') ||
        (habit?.frequency && habit.frequency !== 'none')
      )

      if (isRecurring) {
        if (isModalOpen) {
          setIsModalOpen(false)
        }
        setPendingScopeAction({
          type: 'edit',
          habitId: editingHabit.id,
          date: selectedDate,
          payload: data
        })
        setScopeActionType('edit')
        setIsScopeModalOpen(true)
        return
      }

      setIsCreating(true)
      try {
        await updateHabitAction(editingHabit.id, {
          title: data.title,
          description: data.description,
          category: data.category,
          frequency: data.frequency,
          startDate: data.startDate,
          allDay: data.allDay,
          startTime: data.startTime !== undefined ? data.startTime : null,
          endTime: data.endTime !== undefined ? data.endTime : null,
          recurrence: data.recurrence,
          mode: 'all'
        })
        showToast(
          data.category === 'task'
            ? 'Tarefa atualizada com sucesso!'
            : data.category === 'schedule'
              ? 'Agenda atualizada com sucesso!'
              : 'Hábito atualizado com sucesso!',
          'success'
        )
        await reloadData(visibleRange.startDate, visibleRange.endDate)
        handleCloseModal()
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string; details?: { message: string }[] } } })
            ?.response?.data?.details?.[0]?.message ||
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Erro ao salvar o item. Verifique os dados.'
        showToast(errorMessage, 'error')
      } finally {
        setIsCreating(false)
      }
      return
    }

    setIsCreating(true)
    try {
      await createHabitAction({
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        startDate: data.startDate,
        allDay: data.allDay,
        startTime: data.startTime ?? undefined,
        endTime: data.endTime ?? undefined,
        recurrence: data.recurrence
      })
      showToast(
        data.category === 'task'
          ? 'Tarefa criada com sucesso!'
          : data.category === 'schedule'
            ? 'Item adicionado à agenda!'
            : 'Hábito criado com sucesso!',
        'success'
      )
      await reloadData(visibleRange.startDate, visibleRange.endDate)
      handleCloseModal()
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string; details?: { message: string }[] } } })
          ?.response?.data?.details?.[0]?.message ||
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Erro ao salvar o item. Verifique os dados.'
      showToast(errorMessage, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRemoveHabit = async (habitId: string, date?: string) => {
    const targetDate = date || selectedDate
    const habit = habits.find((h) => h.id === habitId) || editingHabit
    const isRecurring = Boolean(
      (habit?.recurrence && habit.recurrence.type && habit.recurrence.type !== 'none') ||
      (habit?.frequency && habit.frequency !== 'none')
    )

    if (isRecurring) {
      if (isModalOpen) {
        setIsModalOpen(false)
      }
      setPendingScopeAction({
        type: 'delete',
        habitId,
        date: targetDate
      })
      setScopeActionType('delete')
      setIsScopeModalOpen(true)
      return
    }

    // Não recorrente: exclusão direta
    try {
      await removeHabitAction(habitId, { mode: 'all' })
      showToast('Item removido com sucesso.', 'info')
      if (isModalOpen) {
        handleCloseModal()
      }
      await reloadData(visibleRange.startDate, visibleRange.endDate)
    } catch {
      showToast('Não foi possível remover o item.', 'error')
    }
  }

  const handleConfirmScopeAction = async (mode: RecurrenceScopeMode) => {
    if (!pendingScopeAction) return

    setIsCreating(true)
    try {
      if (pendingScopeAction.type === 'delete') {
        await removeHabitAction(pendingScopeAction.habitId, {
          mode,
          date: pendingScopeAction.date
        })
        showToast('Item excluído com sucesso.', 'info')
      } else if (pendingScopeAction.type === 'edit' && pendingScopeAction.payload) {
        const payload = pendingScopeAction.payload
        await updateHabitAction(pendingScopeAction.habitId, {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          frequency: mode === 'this' ? 'none' : payload.frequency,
          startDate: mode === 'all' ? payload.startDate : pendingScopeAction.date,
          allDay: payload.allDay,
          startTime: payload.startTime !== undefined ? payload.startTime : null,
          endTime: payload.endTime !== undefined ? payload.endTime : null,
          recurrence: mode === 'this' ? { type: 'none' } : payload.recurrence,
          mode,
          date: pendingScopeAction.date
        })
        showToast('Item atualizado com sucesso!', 'success')
      }

      await reloadData(visibleRange.startDate, visibleRange.endDate)
      handleCloseScopeModal()
      handleCloseModal()
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string; details?: { message: string }[] } } })
          ?.response?.data?.details?.[0]?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível processar a ação.'
      showToast(errorMessage, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCloseScopeModal = () => {
    setIsScopeModalOpen(false)
    setPendingScopeAction(null)
  }

  const handleToggleCheckin = async (habitId: string, date: string = selectedDate) => {
    setTogglingId(habitId)

    setRangeSummaries((prev) => {
      return prev.map((day) => {
        if (day.date !== date) return day
        const updatedItems = day.items.map((item) => {
          if (item.habitId === habitId) {
            return { ...item, completed: !item.completed }
          }
          return item
        })
        const completedHabits = updatedItems.filter((i) => i.completed).length
        const totalHabits = updatedItems.length
        const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

        return {
          ...day,
          items: updatedItems,
          completedHabits,
          completionRate
        }
      })
    })

    try {
      await toggleCheckinAction({
        habitId,
        date
      })
    } catch {
      showToast('Não foi possível salvar o status da meta.', 'error')
      await reloadData(visibleRange.startDate, visibleRange.endDate)
    } finally {
      setTogglingId(null)
    }
  }

  const handleScheduleForDay = async (habitId: string) => {
    setIsScheduling(true)
    try {
      await scheduleHabitAction({
        habitId,
        date: selectedDate
      })
      showToast('Meta agendada para este dia!', 'success')
      await reloadData(visibleRange.startDate, visibleRange.endDate)
    } catch {
      showToast('Erro ao incluir meta na agenda.', 'error')
    } finally {
      setIsScheduling(false)
    }
  }

  return {
    selectedDate,
    todayStr,
    formattedDate,
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
  }
}

export default useHabitsPage

