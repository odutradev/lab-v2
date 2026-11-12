import { useEffect, useState } from "react";
import { Group, NumberInput, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";

import Modal from "@components/modal";
import Button from "@components/button";
import { toOptionalNumber } from "@utils/functions/number";
import { getFormErrors } from "@utils/validations";
import { customFoodSchema } from "@utils/validations/nutrition";

import useNutritionPage from "../../hook";
import { hintStyle } from "./styles";
import type { CustomFoodFormState } from "./types";

const emptyValues: CustomFoodFormState = { name: "" };

export const CustomFoodModal = () => {
  const { isCustomFoodOpen, closeCustomFood, handleCreateFood } = useNutritionPage();
  const [values, setValues] = useState<CustomFoodFormState>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isCustomFoodOpen) return;
    setValues(emptyValues);
    setErrors({});
  }, [isCustomFoodOpen]);

  const updateValue = <K extends keyof CustomFoodFormState>(key: K, value: CustomFoodFormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    const formErrors = getFormErrors(customFoodSchema, values) as Record<string, string>;
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const parsed = customFoodSchema.parse(values);
    setIsSaving(true);
    await handleCreateFood({
      ...parsed,
      category: parsed.category || undefined,
      servingName: parsed.servingName || undefined
    });
    setIsSaving(false);
  };

  return (
    <Modal
      opened={isCustomFoodOpen}
      onClose={() => !isSaving && closeCustomFood()}
      title="Cadastrar alimento"
      description="Copie os valores da tabela nutricional do rótulo. Se o rótulo for por porção, converta para 100 g."
      zIndex={500}
    >
      <Stack gap="md">
        <TextInput
          label="Nome"
          placeholder="Ex.: Pão de queijo da padaria"
          value={values.name}
          error={errors.name}
          onChange={(event) => updateValue("name", event.currentTarget.value)}
          data-autofocus
        />
        <Text size="xs" c="dimmed" style={hintStyle}>
          Valores por 100 g
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <NumberInput
            label="Calorias"
            suffix=" kcal"
            min={0}
            value={values.caloriesPer100g ?? ""}
            error={errors.caloriesPer100g}
            onChange={(value) => updateValue("caloriesPer100g", toOptionalNumber(value))}
          />
          <NumberInput
            label="Proteína"
            suffix=" g"
            decimalScale={1}
            min={0}
            value={values.proteinPer100g ?? ""}
            error={errors.proteinPer100g}
            onChange={(value) => updateValue("proteinPer100g", toOptionalNumber(value))}
          />
          <NumberInput
            label="Carboidrato"
            suffix=" g"
            decimalScale={1}
            min={0}
            value={values.carbsPer100g ?? ""}
            error={errors.carbsPer100g}
            onChange={(value) => updateValue("carbsPer100g", toOptionalNumber(value))}
          />
          <NumberInput
            label="Gordura"
            suffix=" g"
            decimalScale={1}
            min={0}
            value={values.fatPer100g ?? ""}
            error={errors.fatPer100g}
            onChange={(value) => updateValue("fatPer100g", toOptionalNumber(value))}
          />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            label="Porção (opcional)"
            placeholder="Ex.: unidade, fatia"
            value={values.servingName || ""}
            onChange={(event) => updateValue("servingName", event.currentTarget.value)}
          />
          <NumberInput
            label="Gramas da porção"
            suffix=" g"
            min={1}
            value={values.servingGrams ?? ""}
            onChange={(value) => updateValue("servingGrams", toOptionalNumber(value))}
          />
        </SimpleGrid>
        <Group justify="flex-end" gap="sm">
          <Button variant="ghost" onClick={closeCustomFood} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            Cadastrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CustomFoodModal;
