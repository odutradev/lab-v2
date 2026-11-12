import { Box, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { TbFlame, TbTarget, TbTrophy, TbClock, TbBolt } from "react-icons/tb";

import useWorkoutsPage from "../../hook";
import { statCardStyle } from "./styles";
import type { SummaryStatItem } from "./types";

export const SummaryStats = () => {
  const { summary } = useWorkoutsPage();

  const stats: SummaryStatItem[] = [
    {
      label: "Sequência",
      value: `${summary?.currentStreak ?? 0} ${summary?.currentStreak === 1 ? "dia" : "dias"}`,
      hint: "dias planejados cumpridos",
      icon: <TbTrophy size={18} />,
      color: "yellow"
    },
    {
      label: "Aderência no mês",
      value: `${summary?.adherenceRate ?? 0}%`,
      hint: `${summary?.donePlannedCount ?? 0} de ${summary?.plannedCount ?? 0} planejados`,
      icon: <TbTarget size={18} />,
      color: "indigo"
    },
    {
      label: "Treinos no mês",
      value: String(summary?.doneCount ?? 0),
      hint: `${summary?.missedCount ?? 0} faltas registradas`,
      icon: <TbBolt size={18} />,
      color: "teal"
    },
    {
      label: "Tempo ativo",
      value: `${Math.floor((summary?.totalMinutes ?? 0) / 60)}h ${(summary?.totalMinutes ?? 0) % 60}min`,
      hint: summary?.totalDistanceKm ? `${summary.totalDistanceKm} km percorridos` : undefined,
      icon: <TbClock size={18} />,
      color: "cyan"
    },
    {
      label: "Gasto estimado",
      value: `${(summary?.totalCalories ?? 0).toLocaleString("pt-BR")} kcal`,
      hint: "soma do mês",
      icon: <TbFlame size={18} />,
      color: "orange"
    }
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
      {stats.map((stat) => (
        <Box key={stat.label} p="md" style={statCardStyle}>
          <Group gap="xs" wrap="nowrap" mb={6}>
            <ThemeIcon size="sm" radius="md" variant="light" color={stat.color}>
              {stat.icon}
            </ThemeIcon>
            <Text size="xs" c="dimmed" truncate>
              {stat.label}
            </Text>
          </Group>
          <Text fw={700} size="lg" c="white">
            {stat.value}
          </Text>
          {stat.hint && (
            <Text size="xs" c="dimmed" truncate>
              {stat.hint}
            </Text>
          )}
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default SummaryStats;
