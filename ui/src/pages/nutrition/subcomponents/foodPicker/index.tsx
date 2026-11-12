import { useEffect, useState } from "react";
import { Anchor, Badge, Box, Group, Loader, NumberInput, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { TbSearch } from "react-icons/tb";

import Button from "@components/button";
import { calculateFoodMacros, formatMacros } from "@utils/functions/nutrition";
import { toOptionalNumber } from "@utils/functions/number";

import useNutritionPage from "../../hook";
import { previewStyle, resultItemStyle, resultListStyle } from "./styles";
import type { FoodPickerProps } from "./types";
import type { Food } from "@actions/nutrition/types";

export const FoodPicker = ({ submitLabel, onSubmit }: FoodPickerProps) => {
  const { searchFoods, openCustomFood, isCustomFoodOpen } = useNutritionPage();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [results, setResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState<number | undefined>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Refaz a busca quando o modal de alimento próprio fecha, para o novo alimento aparecer.
    if (isCustomFoodOpen) return;
    let isActive = true;
    setIsSearching(true);
    void searchFoods(debouncedSearch).then((foods) => {
      if (!isActive) return;
      setResults(foods);
      setIsSearching(false);
    });
    return () => {
      isActive = false;
    };
  }, [debouncedSearch, searchFoods, isCustomFoodOpen]);

  const handleSelect = (food: Food) => {
    setSelectedFood(food);
    setGrams(food.servingGrams || 100);
  };

  const handleSubmit = async () => {
    if (!selectedFood || !grams) return;
    setIsSubmitting(true);
    const isDone = await onSubmit(selectedFood, grams);
    setIsSubmitting(false);
    if (isDone) {
      setSelectedFood(null);
      setSearch("");
    }
  };

  const preview = selectedFood && grams ? calculateFoodMacros(selectedFood, grams) : null;

  return (
    <Stack gap="sm">
      <TextInput
        placeholder="Buscar alimento (ex.: arroz, frango, banana)"
        leftSection={<TbSearch size={16} />}
        rightSection={isSearching ? <Loader size="xs" /> : null}
        value={search}
        aria-label="Buscar alimento"
        onChange={(event) => setSearch(event.currentTarget.value)}
        data-autofocus
      />

      <Box style={resultListStyle} role="listbox" aria-label="Resultados da busca">
        {results.length === 0 && !isSearching && (
          <Text size="sm" c="dimmed" p="sm">
            Nenhum alimento encontrado.
          </Text>
        )}
        {results.map((food) => (
          <UnstyledButton
            key={food.id}
            px="sm"
            py={8}
            role="option"
            aria-selected={selectedFood?.id === food.id}
            style={resultItemStyle(selectedFood?.id === food.id)}
            onClick={() => handleSelect(food)}
          >
            <Group justify="space-between" wrap="nowrap" gap="xs">
              <Box miw={0}>
                <Text size="sm" c="white" truncate>
                  {food.name}
                </Text>
                <Text size="xs" c="dimmed">
                  100 g: {food.caloriesPer100g} kcal · P {food.proteinPer100g}g · C {food.carbsPer100g}g · G{" "}
                  {food.fatPer100g}g
                </Text>
              </Box>
              {food.source === "custom" && (
                <Badge size="xs" variant="light" color="grape">
                  Meu
                </Badge>
              )}
            </Group>
          </UnstyledButton>
        ))}
      </Box>

      <Text size="xs" c="dimmed">
        Não achou?{" "}
        <Anchor component="button" type="button" size="xs" onClick={openCustomFood}>
          Cadastre um alimento pelo rótulo
        </Anchor>
      </Text>

      {selectedFood && (
        <Stack gap="xs" p="sm" style={previewStyle}>
          <Text size="sm" fw={600} c="white">
            {selectedFood.name}
          </Text>
          <Group gap="xs" align="flex-end" wrap="nowrap">
            <NumberInput
              flex={1}
              label="Quantidade"
              suffix=" g"
              min={1}
              max={5000}
              value={grams ?? ""}
              onChange={(value) => setGrams(toOptionalNumber(value))}
            />
            {selectedFood.servingName && selectedFood.servingGrams && (
              <Button variant="ghost" size="sm" onClick={() => setGrams(selectedFood.servingGrams)}>
                1 {selectedFood.servingName} ({selectedFood.servingGrams} g)
              </Button>
            )}
          </Group>
          {preview && (
            <Text size="xs" c="dimmed">
              {formatMacros(preview)}
            </Text>
          )}
          <Group justify="flex-end">
            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!grams}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};

export default FoodPicker;
