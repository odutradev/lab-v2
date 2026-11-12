import { useState } from "react";
import { tokens } from "@styles/theme";
import { ActionIcon, Badge, Box, Group, Stack, Text } from "@mantine/core";
import { TbCheck, TbPlus, TbTrash } from "react-icons/tb";

import Card from "@components/card";
import Button from "@components/button";
import { sumMacros, formatMacros } from "@utils/functions/nutrition";

import useNutritionPage from "../../../../hook";
import { entryRowStyle } from "./styles";
import type { MealCardProps } from "./types";

export const MealCard = ({ section }: MealCardProps) => {
  const { openAddFood, handleLogPlanMeal, handleRemoveEntry } = useNutritionPage();
  const [isLogging, setIsLogging] = useState(false);
  const totals = sumMacros(section.entries);
  const isPlanLogged = Boolean(
    section.planMeal && section.entries.some((entry) => entry.planMealId === section.planMeal?.id)
  );

  const handleLogPlan = async () => {
    if (!section.planMeal) return;
    setIsLogging(true);
    await handleLogPlanMeal(section.planMeal);
    setIsLogging(false);
  };

  return (
    <Card p="md">
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <Box miw={0}>
          <Group gap="xs">
            <Text fw={600} c={tokens.textPrimary}>
              {section.name}
            </Text>
            {section.time && (
              <Text size="xs" c="dimmed">
                {section.time}
              </Text>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {section.entries.length > 0
              ? formatMacros(totals)
              : section.planMeal
                ? `Plano: ${section.planMeal.totals.calories} kcal`
                : "Nada registrado"}
          </Text>
        </Box>
        <ActionIcon
          variant="light"
          color="indigo"
          aria-label={`Adicionar alimento em ${section.name}`}
          onClick={() => openAddFood(section.name)}
        >
          <TbPlus size={16} />
        </ActionIcon>
      </Group>

      {section.entries.length > 0 && (
        <Stack gap={0} mb={section.planMeal ? "xs" : 0}>
          {section.entries.map((entry) => (
            <Group key={entry.id} justify="space-between" wrap="nowrap" py={6} style={entryRowStyle}>
              <Box miw={0}>
                <Text size="sm" c={tokens.textPrimary} truncate>
                  {entry.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {entry.grams ? `${entry.grams} g · ` : ""}
                  {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · G {entry.fat}g
                </Text>
              </Box>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                aria-label={`Remover ${entry.name}`}
                onClick={() => handleRemoveEntry(entry)}
              >
                <TbTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      {section.planMeal && section.planMeal.items.length > 0 && (
        <Group justify="space-between" mt="xs" gap="xs">
          {isPlanLogged ? (
            <Badge variant="light" color="teal" leftSection={<TbCheck size={12} />}>
              Conforme o plano
            </Badge>
          ) : (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {section.planMeal.items.map((item) => item.foodName).join(", ")}
            </Text>
          )}
          <Button
            size="sm"
            variant={isPlanLogged ? "ghost" : "secondary"}
            isLoading={isLogging}
            onClick={handleLogPlan}
          >
            {isPlanLogged ? "Registrar de novo" : "Comi conforme o plano"}
          </Button>
        </Group>
      )}
    </Card>
  );
};

export default MealCard;
