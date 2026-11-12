import { Stack, Text, Group, Box, Badge, ThemeIcon, SimpleGrid, Checkbox, alpha } from "@mantine/core";
import {
  TbFlame,
  TbTrophy,
  TbCalendar,
  TbTrash,
  TbEdit,
  TbAlertTriangle,
  TbCheck,
  TbQuote,
  TbNotes,
  TbListCheck
} from "react-icons/tb";

import Modal from "@components/modal";
import Button from "@components/button";
import ChallengeGrid from "../challengeGrid";
import { calculateChallengeStats, formatDisplayDate } from "@utils/functions/challenges";

import type { Challenge } from "@actions/challenges/types";
import { colors, tokens } from "@styles/theme";

interface ChallengeDetailModalProps {
  isOpen: boolean;
  challenge: Challenge | null;
  onClose: () => void;
  onToggleCheckin: (id: string, date?: string) => Promise<unknown>;
  onToggleFreeze?: (id: string, date?: string) => Promise<unknown>;
  onToggleChecklistItem?: (id: string, itemId: string) => Promise<unknown>;
  onOpenEdit: (challenge: Challenge) => void;
  onOpenSlip: (challenge: Challenge) => void;
  onRemove: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const ChallengeDetailModal = ({
  isOpen,
  challenge,
  onClose,
  onToggleCheckin,
  onToggleFreeze,
  onToggleChecklistItem,
  onOpenEdit,
  onOpenSlip,
  onRemove,
  isLoading = false
}: ChallengeDetailModalProps) => {
  if (!challenge) return null;

  const stats = calculateChallengeStats(challenge);
  const isCompleted = challenge.status === "completed";
  const isStreakMode = challenge.type === "streak";

  const handleToggleSpecificDate = async (date: string) => {
    await onToggleCheckin(challenge.id, date);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja remover este desafio? O histórico será excluído.")) {
      await onRemove(challenge.id);
      onClose();
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} size="lg" withCloseButton>
      <Stack gap="lg">
        {/* Cabeçalho */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="center">
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: alpha(colors.indigo500, 0.15),
                border: `1px solid ${alpha(colors.indigo400, 0.3)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26
              }}
            >
              {challenge.emoji}
            </Box>
            <Box>
              <Group gap="xs" align="center">
                <Text fw={600} size="lg" c={tokens.textPrimary}>
                  {challenge.title}
                </Text>
                {isCompleted ? (
                  <Badge color="teal" variant="light" size="sm">
                    🏆 Concluído!
                  </Badge>
                ) : (
                  <Badge color="indigo" variant="light" size="sm">
                    {isStreakMode ? "🔥 Ofensiva" : "🎯 Acumulativo"}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed" mt={2}>
                Início: {formatDisplayDate(challenge.startDate)} • Meta: {challenge.targetDays} dias
              </Text>
            </Box>
          </Group>

          <Group gap="xs">
            <Button size="sm" variant="ghost" onClick={() => onOpenEdit(challenge)} leftIcon={<TbEdit size={14} />}>
              Editar
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete} leftIcon={<TbTrash size={14} />}>
              Excluir
            </Button>
          </Group>
        </Group>

        {/* Motivação "Por que comecei?" */}
        {challenge.motivation && (
          <Box
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: alpha(colors.indigo500, 0.08),
              border: `1px solid ${alpha(colors.indigo400, 0.2)}`
            }}
          >
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <ThemeIcon size="sm" radius="md" color="indigo" variant="light" mt={2}>
                <TbQuote size={14} />
              </ThemeIcon>
              <Box>
                <Text size="11px" fw={600} c="indigo.3" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
                  Por que comecei?
                </Text>
                <Text size="sm" c={tokens.textPrimary} style={{ fontStyle: "italic", lineHeight: 1.4 }}>
                  "{challenge.motivation}"
                </Text>
              </Box>
            </Group>
          </Box>
        )}

        {/* Anotações / Regras do Desafio */}
        {challenge.notes && (
          <Box
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: tokens.surfaceSubtle,
              border: `1px solid ${tokens.border}`
            }}
          >
            <Group gap="xs" align="center" mb={6}>
              <ThemeIcon size="xs" radius="sm" color="cyan" variant="light">
                <TbNotes size={13} />
              </ThemeIcon>
              <Text size="11px" fw={600} c="cyan.3" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
                Anotações & Regras do Desafio
              </Text>
            </Group>
            <Text size="sm" c="gray.2" style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {challenge.notes}
            </Text>
          </Box>
        )}

        {/* Checklist do Desafio */}
        {challenge.checklist && challenge.checklist.length > 0 && (
          <Box
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              backgroundColor: alpha(colors.emerald500, 0.04),
              border: `1px solid ${alpha(colors.emerald500, 0.2)}`
            }}
          >
            <Group justify="space-between" align="center" mb="xs">
              <Group gap="xs" align="center">
                <ThemeIcon size="xs" radius="sm" color="teal" variant="light">
                  <TbListCheck size={14} />
                </ThemeIcon>
                <Text size="11px" fw={600} c="teal.3" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
                  Checklist do Desafio
                </Text>
              </Group>
              <Badge color="teal" variant="light" size="xs">
                {challenge.checklist.filter((i) => i.completed).length} de {challenge.checklist.length} concluídos
              </Badge>
            </Group>

            <Stack gap={8}>
              {challenge.checklist.map((item) => (
                <Group
                  key={item.id}
                  gap="sm"
                  wrap="nowrap"
                  onClick={() => onToggleChecklistItem && onToggleChecklistItem(challenge.id, item.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    backgroundColor: item.completed ? alpha(colors.emerald500, 0.1) : tokens.surfaceSubtle,
                    border: item.completed
                      ? `1px solid ${alpha(colors.emerald500, 0.3)}`
                      : `1px solid ${tokens.border}`,
                    cursor: onToggleChecklistItem ? "pointer" : "default",
                    transition: "all 0.15s ease"
                  }}
                >
                  <Checkbox
                    checked={item.completed}
                    onChange={() => {}}
                    size="xs"
                    color="teal"
                    styles={{
                      input: { cursor: "pointer" }
                    }}
                  />
                  <Text
                    size="sm"
                    c={item.completed ? "dimmed" : "white"}
                    style={{
                      textDecoration: item.completed ? "line-through" : "none",
                      wordBreak: "break-word",
                      flex: 1
                    }}
                  >
                    {item.text}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>
        )}

        {/* Grid de Métricas Principais */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
          <Box
            style={{
              padding: "12px",
              borderRadius: 12,
              backgroundColor: tokens.surfaceSubtle,
              border: `1px solid ${tokens.border}`
            }}
          >
            <Text size="10px" c="dimmed" fw={600} tt="uppercase">
              Progresso
            </Text>
            <Text size="md" fw={600} c={tokens.textPrimary} mt={2}>
              {stats.completedDays} / {stats.targetDays}
            </Text>
            <Text size="xs" c="teal.4" fw={600}>
              {stats.percentage}% concluído
            </Text>
          </Box>

          <Box
            style={{
              padding: "12px",
              borderRadius: 12,
              backgroundColor: tokens.surfaceSubtle,
              border: `1px solid ${tokens.border}`
            }}
          >
            <Group justify="space-between" align="center">
              <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                Ofensiva Atual
              </Text>
              <TbFlame size={14} color={colors.orange500} />
            </Group>
            <Text size="md" fw={600} c="orange.4" mt={2}>
              {stats.streak} dias
            </Text>
            <Text size="xs" c="dimmed">
              {stats.streak > 0 ? "Sequência ativa 🔥" : "Comece hoje!"}
            </Text>
          </Box>

          <Box
            style={{
              padding: "12px",
              borderRadius: 12,
              backgroundColor: tokens.surfaceSubtle,
              border: `1px solid ${tokens.border}`
            }}
          >
            <Text size="10px" c="dimmed" fw={600} tt="uppercase">
              Faltam
            </Text>
            <Text size="md" fw={600} c={tokens.textPrimary} mt={2}>
              {Math.max(0, stats.targetDays - stats.completedDays)} dias
            </Text>
            <Text size="xs" c="dimmed">
              para a vitória final
            </Text>
          </Box>

          <Box
            style={{
              padding: "12px",
              borderRadius: 12,
              backgroundColor: tokens.surfaceSubtle,
              border: `1px solid ${tokens.border}`
            }}
          >
            <Group justify="space-between" align="center">
              <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                Previsão Final
              </Text>
              <TbCalendar size={14} color={colors.indigo400} />
            </Group>
            <Text size="sm" fw={600} c="indigo.3" mt={2}>
              {formatDisplayDate(stats.estimatedEndDate)}
            </Text>
            <Text size="xs" c="dimmed">
              data estimada
            </Text>
          </Box>
        </SimpleGrid>

        {/* Botão de Check-in em 1 clique */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Button
            size="md"
            variant="primary"
            onClick={() => onToggleCheckin(challenge.id)}
            isLoading={isLoading}
            leftIcon={stats.isCompletedToday ? <TbCheck size={18} /> : <TbTrophy size={18} />}
            style={{
              flex: 1,
              backgroundColor: stats.isCompletedToday ? colors.emerald600 : undefined,
              borderColor: stats.isCompletedToday ? colors.emerald500 : undefined
            }}
          >
            {stats.isCompletedToday ? "✓ Concluído Hoje (Clique para desmarcar)" : "Concluir Hoje / Resisti Hoje ✓"}
          </Button>

          {isStreakMode && (
            <Button
              size="md"
              variant="secondary"
              onClick={() => onOpenSlip(challenge)}
              leftIcon={<TbAlertTriangle size={18} color={colors.amber500} />}
            >
              Tive um Deslize
            </Button>
          )}

          {isStreakMode && stats.freezeDaysPerMonth > 0 && onToggleFreeze && (
            <Button
              size="md"
              variant={stats.isFrozenToday ? "primary" : "secondary"}
              onClick={() => onToggleFreeze(challenge.id)}
              isLoading={isLoading}
              style={{
                backgroundColor: stats.isFrozenToday ? colors.cyan600 : undefined,
                borderColor: stats.isFrozenToday ? colors.cyan400 : undefined
              }}
            >
              {stats.isFrozenToday
                ? "❄️ Hoje Congelado (Desfazer)"
                : `Congelar Hoje ❄️ (${stats.freezesRemainingThisMonth} livres)`}
            </Button>
          )}
        </Group>

        {/* Histórico Visual de Dias (Grade estilo GitHub) */}
        <Box>
          <Group justify="space-between" align="center" mb={6}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Grade de Constância ({stats.targetDays} Dias)
            </Text>
            <Text size="11px" c="dimmed">
              Clique em um quadrado para alternar o dia
            </Text>
          </Group>
          <ChallengeGrid
            startDate={challenge.startDate}
            targetDays={challenge.targetDays}
            checkins={challenge.checkins}
            slipDates={challenge.slipDates}
            freezeDates={challenge.freezeDates}
            onToggleDate={handleToggleSpecificDate}
          />
        </Box>
      </Stack>
    </Modal>
  );
};

export default ChallengeDetailModal;
