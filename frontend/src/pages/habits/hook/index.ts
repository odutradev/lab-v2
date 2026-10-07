import { useState, useEffect, useCallback, useMemo } from 'react'

import { getRangeSummaryAction, scheduleHabitAction, createHabitAction, toggleCheckinAction, removeHabitAction, listHabitsAction } from '@actions/habits'
import useToastStore from '@stores/toast'

import type { CalendarViewMode, CalendarDayCell } from '@pages/habits/types'
import type { CreateHabitFormData } from '@pages/habits/components/habitsModal/types'
import type { DaySummaryResponse, Habit } from '@actions/habits/types'
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
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCreateHabit = async (data: CreateHabitFormData) => {
    setIsCreating(true)
    try {
      await createHabitAction({
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        startDate: data.startDate,
        allDay: data.allDay,
        startTime: data.startTime,
        endTime: data.endTime,
        recurrence: data.recurrence
      })
      showToast('Meta agendada com sucesso!', 'success')
      await reloadData(visibleRange.startDate, visibleRange.endDate)
    } catch {
      showToast('Erro ao cadastrar a meta. Verifique os dados.', 'error')
    } finally {
      setIsCreating(false)
    }
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

  const handleRemoveHabit = async (habitId: string) => {
    try {
      await removeHabitAction(habitId)
      showToast('Meta removida com sucesso.', 'info')
      await reloadData(visibleRange.startDate, visibleRange.endDate)
    } catch {
      showToast('Não foi possível remover a meta.', 'error')
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
    handleSelectDate,
    handlePreviousPeriod,
    handleNextPeriod,
    handleToday,
    handleOpenModal,
    handleCloseModal,
    handleCreateHabit,
    handleToggleCheckin,
    handleScheduleForDay,
    handleRemoveHabit
  }
}

export default useHabitsPage
