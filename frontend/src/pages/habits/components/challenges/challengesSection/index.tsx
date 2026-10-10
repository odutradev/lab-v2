import { useState, useEffect } from 'react'
import { Box, Group, Stack, Text, SimpleGrid, ThemeIcon, ActionIcon, Tooltip } from '@mantine/core'
import { TbTrophy, TbPlus, TbChevronDown, TbChevronUp, TbFlame } from 'react-icons/tb'

import Button from '@components/ui/button'
import ChallengeCard from '../challengeCard'
import ChallengeDetailModal from '../challengeDetailModal'
import ChallengeFormModal from '../challengeFormModal'
import ChallengeSlipModal from '../challengeSlipModal'
import useChallengesStore from '@stores/challenges'

import type { Challenge, CreateChallengePayload } from '@actions/challenges/types'

export const ChallengesSection = () => {
  const {
    challenges,
    isLoading,
    isActionLoading,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    removeChallenge,
    toggleCheckin,
    recordSlip,
    toggleFreeze
  } = useChallengesStore()

  const [isSectionOpen, setIsSectionOpen] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSlipOpen, setIsSlipOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [slipTargetChallenge, setSlipTargetChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const activeChallenges = challenges.filter((c) => c.status === 'active')
  const completedChallenges = challenges.filter((c) => c.status === 'completed')

  const handleOpenNew = () => {
    setEditingChallenge(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setIsFormOpen(true)
  }

  const handleOpenDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
  }

  const handleOpenSlip = (challenge: Challenge) => {
    setSlipTargetChallenge(challenge)
    setIsSlipOpen(true)
  }

  const handleFormSubmit = async (data: CreateChallengePayload) => {
    if (editingChallenge) {
      const updated = await updateChallenge(editingChallenge.id, data)
      if (selectedChallenge?.id === updated.id) {
        setSelectedChallenge(updated)
      }
    } else {
      await createChallenge(data)
    }
  }

  const handleToggleCheckin = async (id: string, date?: string) => {
    const res = await toggleCheckin(id, date)
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(res.challenge)
    }
  }

  const handleSlipConfirm = async (resetStreak: boolean) => {
    if (!slipTargetChallenge) return
    const updated = await recordSlip(slipTargetChallenge.id, { resetCheckins: resetStreak })
    if (selectedChallenge?.id === updated.id) {
      setSelectedChallenge(updated)
    }
    setIsSlipOpen(false)
  }

  const handleToggleFreeze = async (id: string, date?: string) => {
    const res = await toggleFreeze(id, date)
    if (res.error) {
      alert(res.error)
    }
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(res.challenge)
    }
    return res
  }

  const handleRemove = async (id: string) => {
    await removeChallenge(id)
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(null)
    }
  }

  return (
    <Box
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '16px 20px',
        width: '100%'
      }}
    >
      {/* Cabeçalho da Seção */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group
          gap="xs"
          align="center"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setIsSectionOpen((prev) => !prev)}
        >
          <ThemeIcon
            size="md"
            radius="md"
            variant="gradient"
            gradient={{ from: 'orange', to: 'pink' }}
          >
            <TbFlame size={18} />
          </ThemeIcon>
          <Box>
            <Group gap="xs" align="center">
              <Text fw={700} size="sm" c="white">
                Desafios de Constância
              </Text>
              {activeChallenges.length > 0 && (
                <Text
                  size="xs"
                  fw={700}
                  style={{
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    color: '#fb923c',
                    padding: '2px 8px',
                    borderRadius: 10,
                    border: '1px solid rgba(249, 115, 22, 0.4)'
                  }}
                >
                  {activeChallenges.length} {activeChallenges.length === 1 ? 'ativo' : 'ativos'}
                </Text>
              )}
            </Group>
            <Text size="11px" c="dimmed">
              Metas de ofensiva (ex: 90 dias sem refri) com contagem regressiva
            </Text>
          </Box>
        </Group>

        <Group gap="xs">
          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenNew}
            leftIcon={<TbPlus size={14} />}
          >
            Novo Desafio
          </Button>
          <Tooltip label={isSectionOpen ? 'Recolher seção' : 'Expandir seção'} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setIsSectionOpen((prev) => !prev)}
            >
              {isSectionOpen ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Conteúdo Expansível */}
      {isSectionOpen && (
        <Box mt="md">
          {challenges.length === 0 ? (
            <Box
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 14,
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}
            >
              <Stack align="center" gap="xs">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fb923c'
                  }}
                >
                  <TbTrophy size={22} />
                </Box>
                <Text fw={600} size="sm" c="white">
                  Nenhum desafio em andamento
                </Text>
                <Text size="xs" c="dimmed" maw={400} ta="center" style={{ lineHeight: 1.5 }}>
                  Crie seu primeiro desafio de constância! Estabeleça uma meta numérica de dias (ex: 90 dias sem refrigerante, 30 dias de treinos) e sinta o poder da disciplina diária.
                </Text>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleOpenNew}
                  leftIcon={<TbPlus size={14} />}
                  style={{ marginTop: 6 }}
                >
                  Criar Meu Primeiro Desafio
                </Button>
              </Stack>
            </Box>
          ) : (
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {challenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    onOpenDetails={handleOpenDetails}
                    onToggleCheckin={handleToggleCheckin}
                    isLoading={isLoading}
                  />
                ))}
              </SimpleGrid>

              {completedChallenges.length > 0 && (
                <Text size="xs" c="dimmed" ta="right">
                  🏆 {completedChallenges.length} {completedChallenges.length === 1 ? 'desafio concluído com vitória!' : 'desafios concluídos com vitória!'}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* Modais */}
      <ChallengeDetailModal
        isOpen={Boolean(selectedChallenge)}
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onToggleCheckin={handleToggleCheckin}
        onToggleFreeze={handleToggleFreeze}
        onOpenEdit={handleOpenEdit}
        onOpenSlip={handleOpenSlip}
        onRemove={handleRemove}
        isLoading={isActionLoading}
      />

      <ChallengeFormModal
        isOpen={isFormOpen}
        initialChallenge={editingChallenge}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isActionLoading}
      />

      <ChallengeSlipModal
        isOpen={isSlipOpen}
        challengeTitle={slipTargetChallenge?.title || ''}
        onClose={() => setIsSlipOpen(false)}
        onConfirm={handleSlipConfirm}
        isLoading={isActionLoading}
      />
    </Box>
  )
}

export default ChallengesSection
