import { useEffect, useMemo, useState } from "react";
import { tokens } from "@styles/theme";
import { ActionIcon, Box, Group, NumberInput, Stack, Switch, Text, TextInput } from "@mantine/core";
import { TbPlus, TbTrash, TbX } from "react-icons/tb";

import Modal from "@components/modal";
import Button from "@components/button";
import { defaultMealNames, formatMacros, sumMacros } from "@utils/functions/nutrition";
import { toOptionalNumber } from "@utils/functions/number";

import useNutritionPage from "../../../../hook";
import FoodPicker from "../../../../subcomponents/foodPicker";
import { itemRowStyle, mealBlockStyle, totalsBarStyle } from "./styles";
import type { EditorItem, EditorMeal } from "./types";
import type { Food, Macros, MealPlan } from "@actions/nutrition/types";

const createKey = (): string => Math.random().toString(36).slice(2, 10);

const scaleMacros = (per100g: Macros, grams: number): Macros => ({
  calories: Math.round((per100g.calories * grams) / 100),
  protein: Math.round((per100g.protein * grams) / 10) / 10,
  carbs: Math.round((per100g.carbs * grams) / 10) / 10,
  fat: Math.round((per100g.fat * grams) / 10) / 10
});

const toEditorMeals = (plan: MealPlan | "new" | null): EditorMeal[] => {
  if (!plan || plan === "new") {
    return ["Café da manhã", "Almoço", "Lanche da tarde", "Jantar"].map((name) => ({
      key: createKey(),
      name,
      time: "",
      items: []
    }));
  }
  return plan.meals.map((meal) => ({
    key: createKey(),
    id: meal.id,
    name: meal.name,
    time: meal.time || "",
    items: meal.items.map((item) => ({
      key: createKey(),
      foodId: item.foodId,
      foodName: item.foodName,
      grams: item.grams,
      per100g: {
        calories: item.grams ? (item.calories / item.grams) * 100 : 0,
        protein: item.grams ? (item.protein / item.grams) * 100 : 0,
        carbs: item.grams ? (item.carbs / item.grams) * 100 : 0,
        fat: item.grams ? (item.fat / item.grams) * 100 : 0
      }
    }))
  }));
};

export const PlanEditorModal = () => {
  const { editingPlan, closePlanEditor, handleSavePlan, profileData } = useNutritionPage();
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [meals, setMeals] = useState<EditorMeal[]>([]);
  const [pickerMealKey, setPickerMealKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editingPlan) return;
    setName(editingPlan === "new" ? "Meu plano" : editingPlan.name);
    setIsActive(editingPlan === "new" ? true : editingPlan.isActive);
    setMeals(toEditorMeals(editingPlan));
    setPickerMealKey(null);
    setError(null);
  }, [editingPlan]);

  const planTotals = useMemo(
    () => sumMacros(meals.flatMap((meal) => meal.items.map((item) => scaleMacros(item.per100g, item.grams)))),
    [meals]
  );

  const targets = profileData?.targets;

  const updateMeal = (key: string, changes: Partial<EditorMeal>) => {
    setMeals((current) => current.map((meal) => (meal.key === key ? { ...meal, ...changes } : meal)));
  };

  const updateItemGrams = (mealKey: string, itemKey: string, grams: number) => {
    setMeals((current) =>
      current.map((meal) =>
        meal.key === mealKey
          ? { ...meal, items: meal.items.map((item) => (item.key === itemKey ? { ...item, grams } : item)) }
          : meal
      )
    );
  };

  const removeItem = (mealKey: string, itemKey: string) => {
    setMeals((current) =>
      current.map((meal) =>
        meal.key === mealKey ? { ...meal, items: meal.items.filter((item) => item.key !== itemKey) } : meal
      )
    );
  };

  const addFoodToMeal = (mealKey: string, food: Food, grams: number) => {
    const newItem: EditorItem = {
      key: createKey(),
      foodId: food.id,
      foodName: food.name,
      grams,
      per100g: {
        calories: food.caloriesPer100g,
        protein: food.proteinPer100g,
        carbs: food.carbsPer100g,
        fat: food.fatPer100g
      }
    };
    setMeals((current) =>
      current.map((meal) => (meal.key === mealKey ? { ...meal, items: [...meal.items, newItem] } : meal))
    );
    setPickerMealKey(null);
    return true;
  };

  const addMeal = () => {
    const usedNames = new Set(meals.map((meal) => meal.name));
    const suggestion = defaultMealNames.find((mealName) => !usedNames.has(mealName)) || "Nova refeição";
    setMeals((current) => [...current, { key: createKey(), name: suggestion, time: "", items: [] }]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Dê um nome para o plano.");
    if (meals.some((meal) => !meal.name.trim())) return setError("Todas as refeições precisam de um nome.");
    if (meals.some((meal) => meal.time && !/^\d{2}:\d{2}$/.test(meal.time)))
      return setError("Use o formato HH:mm nos horários.");
    if (meals.some((meal) => meal.items.some((item) => !item.grams)))
      return setError("Informe a quantidade de todos os alimentos.");

    setError(null);
    setIsSaving(true);
    await handleSavePlan({
      name: name.trim(),
      isActive,
      meals: meals.map((meal) => ({
        id: meal.id,
        name: meal.name.trim(),
        time: meal.time || undefined,
        items: meal.items.map((item) => ({ foodId: item.foodId, grams: item.grams }))
      }))
    });
    setIsSaving(false);
  };

  return (
    <Modal
      opened={editingPlan !== null}
      onClose={() => !isSaving && closePlanEditor()}
      title={editingPlan === "new" ? "Novo plano alimentar" : "Editar plano alimentar"}
      description="Adicione os alimentos de cada refeição. Os totais são comparados com a sua meta."
      size="xl"
    >
      <Stack gap="md">
        <Group align="flex-end" gap="md">
          <TextInput
            flex={1}
            label="Nome do plano"
            placeholder="Ex.: Dia de treino"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <Switch
            label="Plano ativo"
            checked={isActive}
            onChange={(event) => setIsActive(event.currentTarget.checked)}
          />
        </Group>

        {meals.map((meal) => {
          const mealTotals = sumMacros(meal.items.map((item) => scaleMacros(item.per100g, item.grams)));
          return (
            <Box key={meal.key} p="sm" style={mealBlockStyle}>
              <Group gap="xs" align="flex-end" wrap="nowrap">
                <TextInput
                  flex={1}
                  label="Refeição"
                  value={meal.name}
                  onChange={(event) => updateMeal(meal.key, { name: event.currentTarget.value })}
                />
                <TextInput
                  w={96}
                  label="Horário"
                  placeholder="12:00"
                  type="time"
                  value={meal.time}
                  onChange={(event) => updateMeal(meal.key, { time: event.currentTarget.value })}
                />
                <ActionIcon
                  mb={4}
                  variant="subtle"
                  color="red"
                  aria-label={`Remover refeição ${meal.name}`}
                  onClick={() => setMeals((current) => current.filter((item) => item.key !== meal.key))}
                >
                  <TbTrash size={16} />
                </ActionIcon>
              </Group>

              <Stack gap={0} mt="xs">
                {meal.items.map((item) => {
                  const itemMacros = scaleMacros(item.per100g, item.grams);
                  return (
                    <Group key={item.key} gap="xs" py={6} wrap="nowrap" style={itemRowStyle}>
                      <Box flex={1} miw={0}>
                        <Text size="sm" c={tokens.textPrimary} truncate>
                          {item.foodName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatMacros(itemMacros)}
                        </Text>
                      </Box>
                      <NumberInput
                        w={96}
                        size="xs"
                        min={1}
                        max={5000}
                        suffix=" g"
                        aria-label={`Quantidade de ${item.foodName}`}
                        value={item.grams || ""}
                        onChange={(value) => updateItemGrams(meal.key, item.key, toOptionalNumber(value) ?? 0)}
                      />
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        aria-label={`Remover ${item.foodName}`}
                        onClick={() => removeItem(meal.key, item.key)}
                      >
                        <TbX size={14} />
                      </ActionIcon>
                    </Group>
                  );
                })}
              </Stack>

              <Group justify="space-between" mt="xs">
                <Text size="xs" c="dimmed">
                  {meal.items.length > 0 ? formatMacros(mealTotals) : "Sem alimentos"}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={pickerMealKey === meal.key ? <TbX size={14} /> : <TbPlus size={14} />}
                  onClick={() => setPickerMealKey(pickerMealKey === meal.key ? null : meal.key)}
                >
                  {pickerMealKey === meal.key ? "Fechar busca" : "Adicionar alimento"}
                </Button>
              </Group>

              {pickerMealKey === meal.key && (
                <Box mt="xs">
                  <FoodPicker
                    submitLabel="Adicionar à refeição"
                    onSubmit={(food, grams) => addFoodToMeal(meal.key, food, grams)}
                  />
                </Box>
              )}
            </Box>
          );
        })}

        <Button variant="secondary" leftIcon={<TbPlus size={16} />} onClick={addMeal}>
          Adicionar refeição
        </Button>

        <Box p="sm" style={totalsBarStyle}>
          <Group justify="space-between" gap="xs">
            <Text size="sm" fw={600} c={tokens.textPrimary}>
              Total: {planTotals.calories} kcal
              {targets ? ` / meta ${targets.calories} kcal` : ""}
            </Text>
            <Text size="xs" c="dimmed">
              P {planTotals.protein}g{targets ? `/${targets.protein}` : ""} · C {planTotals.carbs}g
              {targets ? `/${targets.carbs}` : ""} · G {planTotals.fat}g{targets ? `/${targets.fat}` : ""}
            </Text>
          </Group>
        </Box>

        {error && (
          <Text size="sm" c="red.5" role="alert">
            {error}
          </Text>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="ghost" onClick={closePlanEditor} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            Salvar plano
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default PlanEditorModal;
