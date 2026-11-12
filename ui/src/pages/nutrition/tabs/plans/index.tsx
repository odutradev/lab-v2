import { useState } from "react";
import { ActionIcon, Badge, Box, Group, Menu, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { TbDots, TbPencil, TbPlus, TbStar, TbTrash } from "react-icons/tb";

import Card from "@components/card";
import Modal from "@components/modal";
import Button from "@components/button";
import { formatMacros } from "@utils/functions/nutrition";

import useNutritionPage from "../../hook";
import PlanEditorModal from "./subcomponents/planEditorModal";
import { planCardStyle } from "./styles";
import type { MealPlan } from "@actions/nutrition/types";

export const PlansTab = () => {
  const { mealPlans, profileData, openPlanEditor, handleActivatePlan, handleRemovePlan } = useNutritionPage();
  const [planToRemove, setPlanToRemove] = useState<MealPlan | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const targetCalories = profileData?.targets?.calories;

  const handleConfirmRemove = async () => {
    if (!planToRemove) return;
    setIsRemoving(true);
    await handleRemovePlan(planToRemove);
    setIsRemoving(false);
    setPlanToRemove(null);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Box>
          <Title order={4} c="white">
            Planos alimentares
          </Title>
          <Text size="sm" c="dimmed">
            O plano ativo aparece no diário para você marcar as refeições com um toque.
          </Text>
        </Box>
        <Button leftIcon={<TbPlus size={16} />} onClick={() => openPlanEditor("new")}>
          Novo plano
        </Button>
      </Group>

      {mealPlans.length === 0 && (
        <Card p={{ base: "md", sm: "lg" }}>
          <Text c="white" fw={600}>
            Você ainda não montou um plano.
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Monte as refeições do seu dia com os alimentos e quantidades. O app soma calorias e macros e compara com a
            sua meta{targetCalories ? ` de ${targetCalories} kcal` : ""}.
          </Text>
        </Card>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {mealPlans.map((plan) => {
          const difference = targetCalories ? plan.totals.calories - targetCalories : null;
          return (
            <Box key={plan.id} p="md" style={planCardStyle(plan.isActive)}>
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Box miw={0}>
                  <Group gap="xs">
                    <Text fw={600} c="white" truncate>
                      {plan.name}
                    </Text>
                    {plan.isActive && (
                      <Badge size="sm" variant="light" color="teal">
                        Ativo
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {formatMacros(plan.totals)}
                  </Text>
                  {difference !== null && (
                    <Text size="xs" c={Math.abs(difference) <= (targetCalories ?? 0) * 0.05 ? "teal.4" : "yellow.4"}>
                      {difference === 0
                        ? "Exatamente na meta"
                        : `${Math.abs(difference)} kcal ${difference > 0 ? "acima" : "abaixo"} da meta`}
                    </Text>
                  )}
                </Box>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" aria-label={`Opções do plano ${plan.name}`}>
                      <TbDots size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<TbPencil size={16} />} onClick={() => openPlanEditor(plan)}>
                      Editar
                    </Menu.Item>
                    {!plan.isActive && (
                      <Menu.Item leftSection={<TbStar size={16} />} onClick={() => handleActivatePlan(plan)}>
                        Usar como plano ativo
                      </Menu.Item>
                    )}
                    <Menu.Item color="red" leftSection={<TbTrash size={16} />} onClick={() => setPlanToRemove(plan)}>
                      Excluir
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
              <Stack gap={4} mt="sm">
                {plan.meals.map((meal) => (
                  <Group key={meal.id} justify="space-between" wrap="nowrap" gap="xs">
                    <Text size="sm" c="white" truncate>
                      {meal.time ? `${meal.time} · ` : ""}
                      {meal.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {meal.totals.calories} kcal
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>

      <PlanEditorModal />

      <Modal
        opened={planToRemove !== null}
        onClose={() => !isRemoving && setPlanToRemove(null)}
        type="confirm"
        variant="danger"
        title="Excluir plano"
        description={`O plano "${planToRemove?.name}" será removido. O que já foi registrado no diário continua lá.`}
        confirmText="Excluir"
        onConfirm={handleConfirmRemove}
        isConfirmLoading={isRemoving}
      />
    </Stack>
  );
};

export default PlansTab;
