import { useState, useEffect, useCallback, useMemo } from 'react'

import { getDaySummaryAction, scheduleHabitAction, createHabitAction, toggleCheckinAction, removeHabitAction, listHabitsAction } from '@actions/habits'
import useToastStore from '@stores/toast'

import type { CreateHabitFormData } from '@pages/habits/components/habitsModal/types'
import type { DaySummaryResponse, Habit } from '@actions/habits/types'
import type { UseHabitsPageReturn } from './types'

const getTodayString = (): string => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const shiftDate = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const formatDateBR = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dayStr = String(day).padStart(2, '0')
  const monthStr = date.toLocaleDateString('pt-BR', { month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayStr} de ${monthStr}`
}

export const useHabitsPage = (): UseHabitsPageReturn => {
  const todayStr = useMemo(() => getTodayString(), [])
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [daySummary, setDaySummary] = useState<DaySummaryResponse | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isScheduling, setIsScheduling] = useState<boolean>(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { showToast } = useToastStore()

  const isToday = selectedDate === todayStr
  const formattedDate = useMemo(() => formatDateBR(selectedDate), [selectedDate])

  const dayHabitIds = useMemo(() => {
    if (!daySummary) return new Set<string>()
    return new Set(daySummary.items.map((item) => item.habitId))
  }, [daySummary])

  const reloadData = useCallback(async (date: string) => {
    setIsLoading(true)
    try {
      const [summaryData, habitsData] = await Promise.all([
        getDaySummaryAction(date),
        listHabitsAction({ active: true })
      ])
      setDaySummary(summaryData)
      setHabits(habitsData)
    } catch {
      showToast('Falha ao carregar as metas e resumo do dia.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        const [summaryData, habitsData] = await Promise.all([
          getDaySummaryAction(selectedDate),
          listHabitsAction({ active: true })
        ])
        if (!isCancelled) {
          setDaySummary(summaryData)
          setHabits(habitsData)
        }
      } catch {
        if (!isCancelled) {
          showToast('Falha ao carregar as metas e resumo do dia.', 'error')
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
  }, [selectedDate, showToast])

  const handlePreviousDay = () => {
    setSelectedDate((prev) => shiftDate(prev, -1))
  }

  const handleNextDay = () => {
    setSelectedDate((prev) => shiftDate(prev, 1))
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
        frequency: data.frequency
      })
      showToast('Meta cadastrada com sucesso!', 'success')
      await reloadData(selectedDate)
    } catch {
      showToast('Erro ao cadastrar a meta. Verifique os dados.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleCheckin = async (habitId: string) => {
    setTogglingId(habitId)

    setDaySummary((prev) => {
      if (!prev) return prev
      const updatedItems = prev.items.map((item) => {
        if (item.habitId === habitId) {
          return { ...item, completed: !item.completed }
        }
        return item
      })
      const completedHabits = updatedItems.filter((i) => i.completed).length
      const totalHabits = updatedItems.length
      const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

      return {
        ...prev,
        items: updatedItems,
        completedHabits,
        completionRate
      }
    })

    try {
      await toggleCheckinAction({
        habitId,
        date: selectedDate
      })
      const freshSummary = await getDaySummaryAction(selectedDate)
      setDaySummary(freshSummary)
    } catch {
      showToast('Não foi possível salvar o status da meta.', 'error')
      const fallbackSummary = await getDaySummaryAction(selectedDate)
      setDaySummary(fallbackSummary)
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
      showToast('Meta incluída na agenda deste dia!', 'success')
      const updatedSummary = await getDaySummaryAction(selectedDate)
      setDaySummary(updatedSummary)
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
      await reloadData(selectedDate)
    } catch {
      showToast('Não foi possível remover a meta.', 'error')
    }
  }

  return {
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
  }
}

export default useHabitsPage
