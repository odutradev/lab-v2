import { useState } from "react";
import { tokens } from "@styles/theme";
import { Group, NumberInput, SimpleGrid, Stack, Stepper, Text, UnstyledButton } from "@mantine/core";

import Card from "@components/card";
import Button from "@components/button";
import SegmentedControl from "@components/segmentedControl";
import { activityOptions, goalOptions } from "@utils/functions/nutrition";
import { toOptionalNumber } from "@utils/functions/number";
import { getFormErrors } from "@utils/validations";
import { bodyMetricsSchema } from "@utils/validations/nutrition";

import useNutritionPage from "../../hook";
import { optionCardStyle } from "./styles";
import type { WizardValues } from "./types";
import type { BiologicalSex } from "@actions/nutrition/types";

export const SetupWizard = () => {
  const { profileData, handleSaveBodyMetrics, handleSaveProfile } = useNutritionPage();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<WizardValues>({
    sex: undefined,
    age: profileData?.metrics.age,
    height: profileData?.metrics.height,
    weight: profileData?.metrics.weight,
    activityLevel: "moderate",
    goal: "maintenance",
    targetWeight: undefined
  });

  const updateValue = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleNextFromBody = () => {
    const formErrors = getFormErrors(bodyMetricsSchema, values) as Record<string, string>;
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) setStep(1);
  };

  const handleFinish = async () => {
    if (!values.sex) return;
    setIsSaving(true);
    await handleSaveBodyMetrics({ height: values.height, age: values.age, weight: values.weight });
    await handleSaveProfile(
      {
        sex: values.sex,
        activityLevel: values.activityLevel,
        goal: values.goal,
        targetWeight: values.goal === "maintenance" ? null : (values.targetWeight ?? null)
      },
      "Tudo pronto! Suas metas foram calculadas."
    );
    setIsSaving(false);
  };

  return (
    <Card p={{ base: "md", sm: "xl" }}>
      <Card.Header>
        <Card.Title>Vamos calcular suas metas</Card.Title>
        <Card.Description>Três passos rápidos: seus dados, sua rotina e o seu objetivo.</Card.Description>
      </Card.Header>

      <Stepper active={step} onStepClick={(index) => index < step && setStep(index)} size="sm" color="indigo">
        <Stepper.Step label="Seus dados">
          <Stack gap="md" mt="md">
            <Stack gap={6}>
              <Text size="sm" fw={500}>
                Sexo biológico (usado na fórmula do gasto basal)
              </Text>
              <SegmentedControl
                value={values.sex || ""}
                onChange={(value) => updateValue("sex", value as BiologicalSex)}
                data={[
                  { value: "male", label: "Masculino" },
                  { value: "female", label: "Feminino" }
                ]}
              />
              {errors.sex && (
                <Text size="xs" c="red.5">
                  {errors.sex}
                </Text>
              )}
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <NumberInput
                label="Idade"
                suffix=" anos"
                min={14}
                max={100}
                value={values.age ?? ""}
                error={errors.age}
                onChange={(value) => updateValue("age", toOptionalNumber(value))}
              />
              <NumberInput
                label="Altura"
                suffix=" cm"
                min={120}
                max={230}
                value={values.height ?? ""}
                error={errors.height}
                onChange={(value) => updateValue("height", toOptionalNumber(value))}
              />
              <NumberInput
                label="Peso atual"
                suffix=" kg"
                decimalScale={1}
                min={30}
                max={300}
                value={values.weight ?? ""}
                error={errors.weight}
                onChange={(value) => updateValue("weight", toOptionalNumber(value))}
              />
            </SimpleGrid>
            <Group justify="flex-end">
              <Button onClick={handleNextFromBody}>Continuar</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Sua rotina">
          <Stack gap="sm" mt="md">
            <Text size="sm" c="dimmed">
              Quanto você se movimenta numa semana normal, contando treinos e trabalho?
            </Text>
            {activityOptions.map((option) => (
              <UnstyledButton
                key={option.value}
                p="sm"
                style={optionCardStyle(values.activityLevel === option.value)}
                aria-pressed={values.activityLevel === option.value}
                onClick={() => updateValue("activityLevel", option.value)}
              >
                <Text size="sm" fw={600} c={tokens.textPrimary}>
                  {option.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {option.description}
                </Text>
              </UnstyledButton>
            ))}
            <Group justify="space-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(2)}>Continuar</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Objetivo">
          <Stack gap="sm" mt="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {goalOptions.map((option) => (
                <UnstyledButton
                  key={option.value}
                  p="sm"
                  style={optionCardStyle(values.goal === option.value)}
                  aria-pressed={values.goal === option.value}
                  onClick={() => updateValue("goal", option.value)}
                >
                  <Text size="sm" fw={600} c={tokens.textPrimary}>
                    {option.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {option.description}
                  </Text>
                </UnstyledButton>
              ))}
            </SimpleGrid>
            {values.goal !== "maintenance" && (
              <NumberInput
                label="Peso-alvo (opcional)"
                suffix=" kg"
                decimalScale={1}
                min={30}
                max={300}
                value={values.targetWeight ?? ""}
                onChange={(value) => updateValue("targetWeight", toOptionalNumber(value))}
              />
            )}
            <Group justify="space-between">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isSaving}>
                Voltar
              </Button>
              <Button onClick={handleFinish} isLoading={isSaving}>
                Calcular minhas metas
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Card>
  );
};

export default SetupWizard;
