import { SimpleGrid } from "@mantine/core";
import { TbFlame, TbTarget, TbTrophy, TbClock, TbBolt } from "react-icons/tb";

import StatCard from "@components/statCard";

import useWorkoutsPage from "../../hook";
import type { SummaryStatItem } from "./types";

export const SummaryStats = () => {
  const { summary } = useWorkoutsPage();

  const stats: SummaryStatItem[] = [
    {
      label: "Sequência",
      value: `${summary?.currentStreak ?? 0} ${summary?.currentStreak === 1 ? "dia" : "dias"}`,
      hint: "dias planejados cumpridos",
      icon: <TbTrophy size={14} />,
      color: "yellow"
    },
    {
      label: "Aderência no mês",
      value: `${summary?.adherenceRate ?? 0}%`,
      hint: `${summary?.donePlannedCount ?? 0} de ${summary?.plannedCount ?? 0} planejados`,
      icon: <TbTarget size={14} />,
      color: "indigo"
    },
    {
      label: "Treinos no mês",
      value: String(summary?.doneCount ?? 0),
      hint: `${summary?.missedCount ?? 0} faltas registradas`,
      icon: <TbBolt size={14} />,
      color: "teal"
    },
    {
      label: "Tempo ativo",
      value: `${Math.floor((summary?.totalMinutes ?? 0) / 60)}h ${(summary?.totalMinutes ?? 0) % 60}min`,
      hint: summary?.totalDistanceKm ? `${summary.totalDistanceKm} km percorridos` : undefined,
      icon: <TbClock size={14} />,
      color: "cyan"
    },
    {
      label: "Gasto estimado",
      value: `${(summary?.totalCalories ?? 0).toLocaleString("pt-BR")} kcal`,
      hint: "soma do mês",
      icon: <TbFlame size={14} />,
      color: "orange"
    }
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          hint={stat.hint}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </SimpleGrid>
  );
};

export default SummaryStats;
