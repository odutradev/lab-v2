import { Box, Group, RingProgress, SimpleGrid, Stack, Text } from "@mantine/core";
import { tokens } from "@styles/theme";
import { TbFlame } from "react-icons/tb";

import Card from "@components/card";
import { getProgressPercent } from "@utils/functions/nutrition";

import useNutritionPage from "../../../../hook";
import MacroProgress from "../../../../subcomponents/macroProgress";
import { ringLabelStyle } from "./styles";

export const DayTotals = () => {
  const { diary } = useNutritionPage();
  const totals = diary?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const calorieGoal = diary?.calorieGoal ?? null;
  const remaining = diary?.remainingCalories ?? null;
  const isOverGoal = remaining !== null && remaining < 0;

  return (
    <Card p={{ base: "md", sm: "lg" }}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Group gap="lg" wrap="nowrap" justify="center">
          <RingProgress
            size={150}
            thickness={14}
            roundCaps
            sections={[
              { value: getProgressPercent(totals.calories, calorieGoal), color: isOverGoal ? "orange" : "indigo" }
            ]}
            label={
              <Stack gap={0} align="center" style={ringLabelStyle}>
                <Text fw={600} size="xl" c={tokens.textPrimary}>
                  {totals.calories}
                </Text>
                <Text size="xs" c="dimmed">
                  de {calorieGoal ?? "?"} kcal
                </Text>
              </Stack>
            }
            aria-label={`Consumido ${totals.calories} de ${calorieGoal ?? "?"} kcal`}
          />
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {isOverGoal ? "Acima da meta" : "Restante"}
            </Text>
            <Text fw={600} size="lg" c={isOverGoal ? "orange.4" : "white"}>
              {remaining === null ? "—" : `${Math.abs(remaining)} kcal`}
            </Text>
            {(diary?.burnedCalories ?? 0) > 0 && (
              <Group gap={4} wrap="nowrap">
                <TbFlame size={14} aria-hidden="true" />
                <Text size="xs" c="dimmed">
                  {diary?.burnedCalories} kcal gastas em treinos
                </Text>
              </Group>
            )}
          </Stack>
        </Group>

        <Box>
          <Stack gap="sm">
            <MacroProgress
              label="Proteína"
              value={totals.protein}
              target={diary?.targets?.protein}
              unit="g"
              color="teal"
            />
            <MacroProgress
              label="Carboidrato"
              value={totals.carbs}
              target={diary?.targets?.carbs}
              unit="g"
              color="cyan"
            />
            <MacroProgress label="Gordura" value={totals.fat} target={diary?.targets?.fat} unit="g" color="yellow" />
          </Stack>
        </Box>
      </SimpleGrid>
    </Card>
  );
};

export default DayTotals;
