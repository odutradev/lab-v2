import { useState, useEffect } from "react";
import { Box, Group, Stack, Text, SimpleGrid, ThemeIcon, ActionIcon, Tooltip, Badge, alpha } from "@mantine/core";
import { TbTrophy, TbPlus, TbChevronDown, TbChevronUp, TbFlame } from "react-icons/tb";

import Button from "@components/button";
import ChallengeCard from "./subcomponents/challengeCard";
import ChallengeDetailModal from "./subcomponents/challengeDetailModal";
import ChallengeFormModal from "./subcomponents/challengeFormModal";
import ChallengeSlipModal from "./subcomponents/challengeSlipModal";
import useChallengesStore from "@stores/challenges";

import type { Challenge, CreateChallengePayload } from "@actions/challenges/types";
import { colors, tokens } from "@styles/theme";

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
    toggleFreeze,
    toggleChecklistItem
  } = useChallengesStore();

  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [slipTargetChallenge, setSlipTargetChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  const handleOpenNew = () => {
    setEditingChallenge(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleOpenSlip = (challenge: Challenge) => {
    setSlipTargetChallenge(challenge);
    setIsSlipOpen(true);
  };

  const handleFormSubmit = async (data: CreateChallengePayload) => {
    if (editingChallenge) {
      const updated = await updateChallenge(editingChallenge.id, data);
      if (selectedChallenge?.id === updated.id) {
        setSelectedChallenge(updated);
      }
    } else {
      await createChallenge(data);
    }
  };

  const handleToggleCheckin = async (id: string, date?: string) => {
    const res = await toggleCheckin(id, date);
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(res.challenge);
    }
  };

  const handleSlipConfirm = async (resetStreak: boolean) => {
    if (!slipTargetChallenge) return;
    const updated = await recordSlip(slipTargetChallenge.id, { resetCheckins: resetStreak });
    if (selectedChallenge?.id === updated.id) {
      setSelectedChallenge(updated);
    }
    setIsSlipOpen(false);
  };

  const handleToggleFreeze = async (id: string, date?: string) => {
    const res = await toggleFreeze(id, date);
    if (res.error) {
      alert(res.error);
    }
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(res.challenge);
    }
    return res;
  };

  const handleRemove = async (id: string) => {
    await removeChallenge(id);
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(null);
    }
  };

  const handleToggleChecklistItem = async (id: string, itemId: string) => {
    const updated = await toggleChecklistItem(id, itemId);
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(updated);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        width: "100%"
      }}
    >
      {/* Cabeçalho da Seção */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group
          gap="xs"
          align="center"
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setIsSectionOpen((prev) => !prev)}
        >
          <ThemeIcon size="md" radius="md" variant="light" color="indigo">
            <TbFlame size={18} />
          </ThemeIcon>
          <Box>
            <Group gap="xs" align="center">
              <Text fw={600} size="sm" c={tokens.textPrimary}>
                Desafios de constância
              </Text>
              {activeChallenges.length > 0 && (
                <Badge size="sm" color="orange">
                  {activeChallenges.length} {activeChallenges.length === 1 ? "ativo" : "ativos"}
                </Badge>
              )}
            </Group>
            <Text size="11px" c="dimmed">
              Metas de ofensiva (ex: 90 dias sem refri) com contagem regressiva
            </Text>
          </Box>
        </Group>

        <Group gap="xs">
          <Button size="sm" variant="primary" onClick={handleOpenNew} leftIcon={<TbPlus size={14} />}>
            Novo desafio
          </Button>
          <Tooltip label={isSectionOpen ? "Recolher seção" : "Expandir seção"} withArrow>
            <ActionIcon
              aria-label={isSectionOpen ? "Recolher desafios" : "Expandir desafios"}
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
                padding: "24px 20px",
                textAlign: "center",
                backgroundColor: tokens.surfaceSubtle,
                borderRadius: 14,
                border: `1px dashed ${tokens.border}`
              }}
            >
              <Stack align="center" gap="xs">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: alpha(colors.orange500, 0.12),
                    border: `1px solid ${alpha(colors.orange500, 0.3)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.orange400
                  }}
                >
                  <TbTrophy size={22} />
                </Box>
                <Text fw={600} size="sm" c={tokens.textPrimary}>
                  Nenhum desafio em andamento
                </Text>
                <Text size="xs" c="dimmed" maw={400} ta="center" style={{ lineHeight: 1.5 }}>
                  Crie seu primeiro desafio de constância! Estabeleça uma meta numérica de dias (ex: 90 dias sem
                  refrigerante, 30 dias de treinos) e sinta o poder da disciplina diária.
                </Text>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleOpenNew}
                  leftIcon={<TbPlus size={14} />}
                  style={{ marginTop: 6 }}
                >
                  Criar meu primeiro desafio
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
                  🏆 {completedChallenges.length}{" "}
                  {completedChallenges.length === 1
                    ? "desafio concluído com vitória!"
                    : "desafios concluídos com vitória!"}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* Modais */}
      <ChallengeDetailModal
        isOpen={Boolean(selectedChallenge)}
        challenge={challenges.find((c) => c.id === selectedChallenge?.id) || selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onToggleCheckin={handleToggleCheckin}
        onToggleFreeze={handleToggleFreeze}
        onToggleChecklistItem={handleToggleChecklistItem}
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
        challengeTitle={slipTargetChallenge?.title || ""}
        onClose={() => setIsSlipOpen(false)}
        onConfirm={handleSlipConfirm}
        isLoading={isActionLoading}
      />
    </Box>
  );
};

export default ChallengesSection;
