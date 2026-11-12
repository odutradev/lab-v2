import { useEffect, useState } from "react";
import {
  Anchor,
  Box,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  Timeline
} from "@mantine/core";
import { Link } from "react-router-dom";

import Card from "@components/card";
import Button from "@components/button";
import { activityOptions, goalLabels, goalOptions } from "@utils/functions/nutrition";
import { formatShortDate } from "@utils/functions/workouts";
import { toOptionalNumber } from "@utils/functions/number";
import { getFormErrors } from "@utils/validations";
import { goalsFormSchema } from "@utils/validations/nutrition";

import useNutritionPage from "../../hook";
import { metricBoxStyle } from "./styles";
import type { GoalsFormValues } from "@utils/validations/nutrition";
import type { ActivityLevel, NutritionGoal } from "@actions/nutrition/types";

const missingFieldLabels: Record<string, string> = { weight: "peso", height: "altura", age: "idade" };

export const GoalsTab = () => {
  const { profileData, handleSaveProfile } = useNutritionPage();
  const profile = profileData?.profile;
  const targets = profileData?.targets;
  const [values, setValues] = useState<GoalsFormValues | null>(null);
  const [isCustomCalories, setIsCustomCalories] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setValues({
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      adjustmentPercent: profile.adjustmentPercent,
      proteinPerKg: profile.proteinPerKg,
      fatPerKg: profile.fatPerKg,
      customCalories: profile.customCalories,
      targetWeight: profile.targetWeight,
      phaseEndDate: profile.phaseEndDate || "",
      includeWorkoutCalories: profile.includeWorkoutCalories
    });
    setIsCustomCalories(Boolean(profile.customCalories));
  }, [profile]);

  if (!profile || !values) return null;

  const updateValue = <K extends keyof GoalsFormValues>(key: K, value: GoalsFormValues[K]) => {
    setValues((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async () => {
    const payload = { ...values, customCalories: isCustomCalories ? values.customCalories : undefined };
    const formErrors = getFormErrors(goalsFormSchema, payload) as Record<string, string>;
    const allErrors =
      isCustomCalories && !values.customCalories
        ? { ...formErrors, customCalories: "Informe as calorias" }
        : formErrors;
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    const isGoalChanged = values.goal !== profile.goal;
    setIsSaving(true);
    await handleSaveProfile(
      {
        goal: values.goal,
        activityLevel: values.activityLevel,
        // Ao trocar de fase, o servidor aplica os padrões da nova fase (déficit/superávit e macros).
        adjustmentPercent: isGoalChanged ? undefined : values.adjustmentPercent,
        proteinPerKg: isGoalChanged ? undefined : values.proteinPerKg,
        fatPerKg: isGoalChanged ? undefined : values.fatPerKg,
        customCalories: isCustomCalories ? values.customCalories : null,
        includeWorkoutCalories: values.includeWorkoutCalories,
        targetWeight: values.targetWeight ?? null,
        phaseEndDate: values.phaseEndDate || null
      },
      isGoalChanged ? `Nova fase iniciada: ${goalLabels[values.goal]}.` : "Metas atualizadas!"
    );
    setIsSaving(false);
  };

  const macroCalories = targets
    ? { protein: targets.protein * 4, carbs: targets.carbs * 4, fat: targets.fat * 9 }
    : { protein: 0, carbs: 0, fat: 0 };
  const totalMacroCalories = macroCalories.protein + macroCalories.carbs + macroCalories.fat || 1;

  return (
    <Stack gap="md">
      <Card p={{ base: "md", sm: "lg" }}>
        <Card.Header>
          <Card.Title>Suas metas diárias</Card.Title>
          <Card.Description>
            Fase atual: {goalLabels[profile.goal]} desde {formatShortDate(profile.phaseStartDate)}
            {profile.phaseStartWeight ? ` (${profile.phaseStartWeight} kg)` : ""}
          </Card.Description>
        </Card.Header>

        {!targets ? (
          <Text size="sm" c="yellow.4">
            Faltam dados para calcular: {profileData.missingFields.map((field) => missingFieldLabels[field]).join(", ")}
            .{" "}
            <Anchor component={Link} to="/profile" size="sm">
              Complete no seu perfil
            </Anchor>
            .
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
            {[
              { label: "Gasto basal", value: `${targets.bmr} kcal` },
              { label: "Gasto total", value: `${targets.tdee} kcal` },
              { label: "Meta", value: `${targets.calories} kcal` },
              {
                label: "Proteína",
                value: `${targets.protein} g`,
                hint: `${Math.round((macroCalories.protein / totalMacroCalories) * 100)}%`
              },
              {
                label: "Carboidrato",
                value: `${targets.carbs} g`,
                hint: `${Math.round((macroCalories.carbs / totalMacroCalories) * 100)}%`
              },
              {
                label: "Gordura",
                value: `${targets.fat} g`,
                hint: `${Math.round((macroCalories.fat / totalMacroCalories) * 100)}%`
              }
            ].map((metric) => (
              <Box key={metric.label} p="sm" style={metricBoxStyle}>
                <Text size="xs" c="dimmed">
                  {metric.label}
                </Text>
                <Text fw={700} c="white">
                  {metric.value}
                </Text>
                {metric.hint && (
                  <Text size="xs" c="dimmed">
                    {metric.hint} das kcal
                  </Text>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Card>

      <Card p={{ base: "md", sm: "lg" }}>
        <Card.Header>
          <Card.Title>Ajustar</Card.Title>
          <Card.Description>
            Trocar de fase reinicia déficit/superávit e macros com valores recomendados.
          </Card.Description>
        </Card.Header>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Fase"
              data={goalOptions.map((option) => ({
                value: option.value,
                label: `${option.label} · ${option.description}`
              }))}
              value={values.goal}
              allowDeselect={false}
              onChange={(value) => value && updateValue("goal", value as NutritionGoal)}
            />
            <Select
              label="Nível de atividade"
              data={activityOptions.map((option) => ({
                value: option.value,
                label: `${option.label} · ${option.description}`
              }))}
              value={values.activityLevel}
              allowDeselect={false}
              onChange={(value) => value && updateValue("activityLevel", value as ActivityLevel)}
            />
          </SimpleGrid>

          {values.goal === profile.goal && (
            <>
              <Box>
                <Group justify="space-between" mb={6}>
                  <Text size="sm" fw={500}>
                    Ajuste sobre o gasto total
                  </Text>
                  <Text size="sm" c="dimmed">
                    {values.adjustmentPercent > 0 ? "+" : ""}
                    {values.adjustmentPercent}%
                  </Text>
                </Group>
                <Slider
                  min={-35}
                  max={30}
                  step={1}
                  value={values.adjustmentPercent}
                  disabled={isCustomCalories}
                  onChange={(value) => updateValue("adjustmentPercent", value)}
                  aria-label="Ajuste sobre o gasto total"
                  marks={[{ value: -20 }, { value: 0 }, { value: 10 }]}
                />
              </Box>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  label="Proteína (g por kg)"
                  min={0.8}
                  max={3.5}
                  step={0.1}
                  decimalScale={1}
                  value={values.proteinPerKg}
                  error={errors.proteinPerKg}
                  onChange={(value) => updateValue("proteinPerKg", toOptionalNumber(value) ?? 0)}
                />
                <NumberInput
                  label="Gordura (g por kg)"
                  min={0.4}
                  max={2}
                  step={0.1}
                  decimalScale={1}
                  value={values.fatPerKg}
                  error={errors.fatPerKg}
                  onChange={(value) => updateValue("fatPerKg", toOptionalNumber(value) ?? 0)}
                />
              </SimpleGrid>
            </>
          )}

          <Group gap="md" align="flex-end">
            <Switch
              label="Definir calorias manualmente"
              checked={isCustomCalories}
              onChange={(event) => setIsCustomCalories(event.currentTarget.checked)}
            />
            {isCustomCalories && (
              <NumberInput
                w={160}
                suffix=" kcal"
                min={800}
                max={8000}
                aria-label="Calorias diárias"
                value={values.customCalories ?? ""}
                error={errors.customCalories}
                onChange={(value) => updateValue("customCalories", toOptionalNumber(value))}
              />
            )}
          </Group>

          <Switch
            label="Somar à meta as calorias gastas nos treinos registrados"
            description="Desligado por padrão, porque o nível de atividade já considera seus treinos."
            checked={values.includeWorkoutCalories}
            onChange={(event) => updateValue("includeWorkoutCalories", event.currentTarget.checked)}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Peso-alvo (opcional)"
              suffix=" kg"
              decimalScale={1}
              min={30}
              max={300}
              value={values.targetWeight ?? ""}
              onChange={(value) => updateValue("targetWeight", toOptionalNumber(value))}
            />
            <TextInput
              label="Fim previsto da fase (opcional)"
              type="date"
              value={values.phaseEndDate}
              onChange={(event) => updateValue("phaseEndDate", event.currentTarget.value)}
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Salvar metas
            </Button>
          </Group>
        </Stack>
      </Card>

      {profile.phaseHistory.length > 0 && (
        <Card p={{ base: "md", sm: "lg" }}>
          <Card.Header>
            <Card.Title>Fases anteriores</Card.Title>
          </Card.Header>
          <Timeline active={profile.phaseHistory.length} bulletSize={14} lineWidth={2} color="indigo">
            {[...profile.phaseHistory].reverse().map((phase) => (
              <Timeline.Item key={`${phase.goal}-${phase.startDate}`} title={goalLabels[phase.goal]}>
                <Text size="xs" c="dimmed">
                  {formatShortDate(phase.startDate)} a {formatShortDate(phase.endDate)}
                  {phase.startWeight && phase.endWeight
                    ? ` · ${phase.startWeight} kg → ${phase.endWeight} kg (${phase.endWeight - phase.startWeight > 0 ? "+" : ""}${Math.round((phase.endWeight - phase.startWeight) * 10) / 10} kg)`
                    : ""}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
    </Stack>
  );
};

export default GoalsTab;
