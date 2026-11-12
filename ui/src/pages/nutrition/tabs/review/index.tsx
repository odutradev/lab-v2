import { useState } from "react";
import { tokens } from "@styles/theme";
import { Alert, SimpleGrid, Stack, Text } from "@mantine/core";
import { TbChartLine } from "react-icons/tb";

import Card from "@components/card";
import StatCard from "@components/statCard";
import Button from "@components/button";
import { reviewStatusMessages, goalLabels } from "@utils/functions/nutrition";

import useNutritionPage from "../../hook";

const formatPercent = (value: number | null): string => {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toLocaleString("pt-BR")}%`;
};

export const ReviewTab = () => {
  const { review, profileData, handleSaveProfile } = useNutritionPage();
  const [isApplying, setIsApplying] = useState(false);

  if (!review) {
    return (
      <Card p={{ base: "md", sm: "lg" }}>
        <Text size="sm" c="dimmed">
          Não foi possível carregar a revisão semanal agora.
        </Text>
      </Card>
    );
  }

  const status = reviewStatusMessages[review.status];
  const profile = profileData?.profile;
  const tdee = profileData?.targets?.tdee;
  const hasSuggestion = review.suggestedCalorieAdjustment !== 0 && review.targetCalories !== null;

  const handleApplySuggestion = async () => {
    if (!profile || !hasSuggestion || review.targetCalories === null) return;
    const nextCalories = review.targetCalories + review.suggestedCalorieAdjustment;
    setIsApplying(true);
    // Com calorias manuais, ajustamos o valor direto; senão, convertemos em percentual sobre o gasto total.
    await handleSaveProfile(
      profile.customCalories || !tdee
        ? { customCalories: nextCalories }
        : { adjustmentPercent: Math.max(-35, Math.min(30, Math.round((nextCalories / tdee - 1) * 100))) },
      `Meta ajustada para cerca de ${nextCalories} kcal.`
    );
    setIsApplying(false);
  };

  const metrics = [
    {
      label: "Peso médio (7 dias)",
      value: review.currentWeekAverageWeight ? `${review.currentWeekAverageWeight} kg` : "—",
      hint: review.previousWeekAverageWeight
        ? `semana anterior: ${review.previousWeekAverageWeight} kg`
        : "sem dados da semana anterior"
    },
    {
      label: "Variação semanal",
      value: formatPercent(review.weeklyChangePercent),
      hint: `alvo para ${goalLabels[review.goal]}: ${formatPercent(review.targetRatePercent)}`
    },
    {
      label: "Dias registrados",
      value: `${review.loggedDays} de 7`,
      hint: `${review.adherentDays} dentro da meta (±10%)`
    },
    {
      label: "Média consumida",
      value: review.averageCalories !== null ? `${review.averageCalories} kcal` : "—",
      hint: review.targetCalories !== null ? `meta: ${review.targetCalories} kcal` : undefined
    }
  ];

  return (
    <Stack gap="md">
      <Alert variant="light" color={status.color} title={status.title} icon={<TbChartLine size={18} />}>
        {review.status === "insufficient_data" &&
          "Registre o peso algumas vezes por semana e a alimentação em pelo menos 4 dias para receber uma sugestão."}
        {review.status === "on_track" && "Seu peso está mudando no ritmo esperado para a fase. Mantenha a meta atual."}
        {hasSuggestion &&
          `Sua média de peso mudou ${formatPercent(review.weeklyChangePercent)} na semana, e o alvo é ${formatPercent(
            review.targetRatePercent
          )}. Sugestão: ${review.suggestedCalorieAdjustment > 0 ? "aumentar" : "reduzir"} ${Math.abs(
            review.suggestedCalorieAdjustment
          )} kcal por dia.`}
      </Alert>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </SimpleGrid>

      {hasSuggestion && (
        <Card p={{ base: "md", sm: "lg" }}>
          <Text size="sm" c={tokens.textPrimary} mb="sm">
            Aplicar a sugestão muda a sua meta de {review.targetCalories} para{" "}
            {(review.targetCalories ?? 0) + review.suggestedCalorieAdjustment} kcal por dia.
          </Text>
          <Button onClick={handleApplySuggestion} isLoading={isApplying}>
            Aplicar ajuste
          </Button>
        </Card>
      )}

      <Text size="xs" c="dimmed">
        A revisão compara a média de peso dos últimos 7 dias com a dos 7 anteriores, o que suaviza variações de água e
        intestino.
      </Text>
    </Stack>
  );
};

export default ReviewTab;
