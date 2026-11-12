import { useEffect, useMemo, useState } from "react";
import { Box, Chip, Group, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { TbPlus } from "react-icons/tb";

import Modal from "@components/modal";
import Button from "@components/button";
import { muscleGroupLabels, weekDayShortLabels, toOptionalNumber } from "@utils/functions/workouts";
import { getFormErrors } from "@utils/validations";
import { routineFormSchema } from "@utils/validations/workouts";

import useWorkoutsPage from "../../hook";
import ExerciseRow from "./subcomponents/exerciseRow";
import { weekDaysHintStyle } from "./styles";
import type { RoutineExercise, LibraryExercise } from "@actions/workouts/types";
import type { RoutineFormValues } from "@utils/validations/workouts";

const emptyValues: RoutineFormValues = {
  name: "",
  modalityId: "weightTraining",
  weekDays: [],
  durationMinutes: 60,
  distanceKm: undefined,
  notes: "",
  exercises: []
};

export const RoutineFormModal = () => {
  const { catalog, routineFormTarget, closeRoutineForm, handleSaveRoutine, findModality } = useWorkoutsPage();
  const [values, setValues] = useState<RoutineFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = routineFormTarget !== null && routineFormTarget !== "new";
  const isStrength = findModality(values.modalityId)?.kind === "strength";

  useEffect(() => {
    if (!routineFormTarget) return;
    setErrors({});
    if (routineFormTarget === "new") {
      setValues(emptyValues);
      return;
    }
    setValues({
      name: routineFormTarget.name,
      modalityId: routineFormTarget.modalityId,
      weekDays: routineFormTarget.weekDays,
      durationMinutes: routineFormTarget.durationMinutes,
      distanceKm: routineFormTarget.distanceKm,
      notes: routineFormTarget.notes || "",
      exercises: routineFormTarget.exercises
    });
  }, [routineFormTarget]);

  const exerciseOptions = useMemo(() => {
    const groups = (catalog?.exercises || []).reduce<Record<string, string[]>>((result, exercise) => {
      const group = muscleGroupLabels[exercise.muscleGroup];
      return { ...result, [group]: [...(result[group] || []), exercise.name] };
    }, {});
    return Object.entries(groups).map(([group, items]) => ({ group, items }));
  }, [catalog]);

  const exercisesByName = useMemo(
    () => new Map<string, LibraryExercise>((catalog?.exercises || []).map((exercise) => [exercise.name, exercise])),
    [catalog]
  );

  const modalityOptions = (catalog?.modalities || []).map((modality) => ({ value: modality.id, label: modality.name }));

  const updateValue = <K extends keyof RoutineFormValues>(key: K, value: RoutineFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleExerciseChange = (index: number, exercise: RoutineExercise) => {
    updateValue(
      "exercises",
      values.exercises.map((item, itemIndex) => (itemIndex === index ? exercise : item))
    );
  };

  const handleAddExercise = () => {
    updateValue("exercises", [...values.exercises, { name: "", sets: 3, reps: "10-12" }]);
  };

  const handleRemoveExercise = (index: number) => {
    updateValue(
      "exercises",
      values.exercises.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSubmit = async () => {
    const formErrors = getFormErrors(routineFormSchema, values);
    const exerciseErrors = values.exercises.reduce<Record<string, string>>(
      (result, exercise, index) =>
        exercise.name.trim() ? result : { ...result, [`exercise-${index}`]: "Informe o exercício" },
      {}
    );
    const allErrors = { ...formErrors, ...exerciseErrors } as Record<string, string>;
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setIsSaving(true);
    await handleSaveRoutine({
      name: values.name.trim(),
      modalityId: values.modalityId,
      weekDays: values.weekDays,
      durationMinutes: values.durationMinutes,
      distanceKm: isStrength ? undefined : values.distanceKm,
      notes: values.notes?.trim() || undefined,
      exercises: isStrength
        ? values.exercises.map((exercise) => ({
            ...exercise,
            name: exercise.name.trim(),
            exerciseId: exercisesByName.get(exercise.name.trim())?.id
          }))
        : []
    });
    setIsSaving(false);
  };

  return (
    <Modal
      opened={routineFormTarget !== null}
      onClose={() => !isSaving && closeRoutineForm()}
      title={isEditing ? "Editar rotina" : "Nova rotina"}
      description="Escolha a modalidade, os dias da semana e, na musculação, os exercícios."
      size="lg"
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Nome"
            placeholder="Ex.: Treino A - Peito e tríceps"
            value={values.name}
            error={errors.name}
            onChange={(event) => updateValue("name", event.currentTarget.value)}
            data-autofocus
          />
          <Select
            label="Modalidade"
            data={modalityOptions}
            value={values.modalityId}
            error={errors.modalityId}
            allowDeselect={false}
            onChange={(value) => value && updateValue("modalityId", value)}
          />
        </SimpleGrid>

        <Box>
          <Text size="sm" fw={500} mb={6}>
            Dias da semana
          </Text>
          <Chip.Group
            multiple
            value={values.weekDays.map(String)}
            onChange={(selected) => updateValue("weekDays", selected.map(Number).sort())}
          >
            <Group gap={6}>
              {weekDayShortLabels.map((label, day) => (
                <Chip key={label} value={String(day)} size="sm" variant="light">
                  {label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
          <Text size="xs" c="dimmed" mt={4} style={weekDaysHintStyle}>
            Sem dias marcados, a rotina fica disponível só para registro avulso.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <NumberInput
            label="Duração (min)"
            min={1}
            max={600}
            value={values.durationMinutes ?? ""}
            error={errors.durationMinutes}
            onChange={(value) => updateValue("durationMinutes", toOptionalNumber(value))}
          />
          {!isStrength && (
            <NumberInput
              label="Distância (km)"
              min={0}
              max={500}
              decimalScale={2}
              value={values.distanceKm ?? ""}
              onChange={(value) => updateValue("distanceKm", toOptionalNumber(value))}
            />
          )}
        </SimpleGrid>

        {isStrength && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Exercícios
              </Text>
              <Button size="sm" variant="ghost" leftIcon={<TbPlus size={14} />} onClick={handleAddExercise}>
                Adicionar exercício
              </Button>
            </Group>
            {values.exercises.length === 0 && (
              <Text size="xs" c="dimmed">
                Nenhum exercício ainda. Você pode registrar só presença, se preferir.
              </Text>
            )}
            {values.exercises.map((exercise, index) => (
              <ExerciseRow
                key={index}
                index={index}
                exercise={exercise}
                exerciseOptions={exerciseOptions}
                error={errors[`exercise-${index}`]}
                onChange={handleExerciseChange}
                onRemove={handleRemoveExercise}
              />
            ))}
          </Stack>
        )}

        <Textarea
          label="Observações"
          placeholder="Aquecimento, técnica, local..."
          autosize
          minRows={2}
          value={values.notes}
          onChange={(event) => updateValue("notes", event.currentTarget.value)}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="ghost" onClick={closeRoutineForm} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            {isEditing ? "Salvar alterações" : "Criar rotina"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default RoutineFormModal;
