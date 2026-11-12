import { useEffect, useState } from "react";
import { Group, NumberInput, SimpleGrid, Stack, TextInput } from "@mantine/core";

import Modal from "@components/modal";
import Button from "@components/button";
import SegmentedControl from "@components/segmentedControl";
import { toOptionalNumber } from "@utils/functions/number";
import { getFormErrors } from "@utils/validations";
import { quickEntrySchema } from "@utils/validations/nutrition";

import useNutritionPage from "../../../../hook";
import FoodPicker from "../../../../subcomponents/foodPicker";
import { modeSwitchStyle } from "./styles";
import type { AddFoodMode, QuickEntryFormState } from "./types";
import type { Food } from "@actions/nutrition/types";

const emptyQuickEntry: QuickEntryFormState = { name: "" };

export const AddFoodModal = () => {
  const { addFoodMealName, closeAddFood, handleAddEntry } = useNutritionPage();
  const [mode, setMode] = useState<AddFoodMode>("food");
  const [quickEntry, setQuickEntry] = useState<QuickEntryFormState>(emptyQuickEntry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!addFoodMealName) return;
    setMode("food");
    setQuickEntry(emptyQuickEntry);
    setErrors({});
  }, [addFoodMealName]);

  const updateQuickEntry = <K extends keyof QuickEntryFormState>(key: K, value: QuickEntryFormState[K]) => {
    setQuickEntry((current) => ({ ...current, [key]: value }));
  };

  const handleAddFood = async (food: Food, grams: number) => {
    if (!addFoodMealName) return false;
    return handleAddEntry({ mealName: addFoodMealName, foodId: food.id, grams });
  };

  const handleAddQuickEntry = async () => {
    if (!addFoodMealName) return;
    const formErrors = getFormErrors(quickEntrySchema, quickEntry) as Record<string, string>;
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsSaving(true);
    const isSaved = await handleAddEntry({
      mealName: addFoodMealName,
      name: quickEntry.name?.trim() || undefined,
      calories: quickEntry.calories,
      protein: quickEntry.protein,
      carbs: quickEntry.carbs,
      fat: quickEntry.fat
    });
    setIsSaving(false);
    if (isSaved) setQuickEntry(emptyQuickEntry);
  };

  return (
    <Modal
      opened={addFoodMealName !== null}
      onClose={closeAddFood}
      title={`Adicionar em ${addFoodMealName ?? ""}`}
      description="Busque na tabela TACO ou registre só as calorias quando não der para detalhar."
      size="lg"
    >
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={(value) => setMode(value as AddFoodMode)}
          data={[
            { value: "food", label: "Buscar alimento" },
            { value: "quick", label: "Só calorias" }
          ]}
        />

        <Stack gap="md" style={modeSwitchStyle}>
          {mode === "food" ? (
            <FoodPicker submitLabel="Adicionar ao diário" onSubmit={handleAddFood} />
          ) : (
            <>
              <TextInput
                label="Descrição (opcional)"
                placeholder="Ex.: Pizza no aniversário"
                value={quickEntry.name}
                onChange={(event) => updateQuickEntry("name", event.currentTarget.value)}
              />
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                <NumberInput
                  label="Calorias"
                  suffix=" kcal"
                  min={0}
                  value={quickEntry.calories ?? ""}
                  error={errors.calories}
                  onChange={(value) => updateQuickEntry("calories", toOptionalNumber(value))}
                />
                <NumberInput
                  label="Proteína"
                  suffix=" g"
                  min={0}
                  value={quickEntry.protein ?? ""}
                  onChange={(value) => updateQuickEntry("protein", toOptionalNumber(value))}
                />
                <NumberInput
                  label="Carboidrato"
                  suffix=" g"
                  min={0}
                  value={quickEntry.carbs ?? ""}
                  onChange={(value) => updateQuickEntry("carbs", toOptionalNumber(value))}
                />
                <NumberInput
                  label="Gordura"
                  suffix=" g"
                  min={0}
                  value={quickEntry.fat ?? ""}
                  onChange={(value) => updateQuickEntry("fat", toOptionalNumber(value))}
                />
              </SimpleGrid>
              <Group justify="flex-end">
                <Button onClick={handleAddQuickEntry} isLoading={isSaving}>
                  Registrar
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
};

export default AddFoodModal;
