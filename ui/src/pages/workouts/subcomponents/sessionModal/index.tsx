import { useEffect, useState } from "react";
import { Box, Group, NumberInput, Select, SimpleGrid, Slider, Stack, Text, TextInput, Textarea } from "@mantine/core";

import Modal from "@components/modal";
import Button from "@components/button";
import SegmentedControl from "@components/segmentedControl";
import { toOptionalNumber } from "@utils/functions/number";
import { getFormErrors } from "@utils/validations";
import { sessionFormSchema } from "@utils/validations/workouts";

import useWorkoutsPage from "../../hook";
import SessionExerciseList from "./subcomponents/sessionExerciseList";
import { effortLabelStyle } from "./styles";
import type { RoutineExercise, WorkoutSessionStatus } from "@actions/workouts/types";
import type { SessionFormValues } from "@utils/validations/workouts";

const effortLabels = [
  "",
  "Muito leve",
  "Leve",
  "Leve",
  "Moderado",
  "Moderado",
  "Moderado",
  "Forte",
  "Forte",
  "Muito forte",
  "Máximo"
];

export const SessionModal = () => {
  const { catalog, sessionDraft, closeSessionModal, handleSaveSession, handleUndoSession, findModality, todayKey } =
    useWorkoutsPage();
  const [values, setValues] = useState<SessionFormValues>({ modalityId: "running", name: "", date: todayKey });
  const [status, setStatus] = useState<WorkoutSessionStatus>("done");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const routine = sessionDraft?.routine;
  const session = sessionDraft?.session;
  const isPlanned = Boolean(routine || session?.routineId);
  const modality = findModality(values.modalityId);
  const isStrength = modality?.kind === "strength";

  useEffect(() => {
    if (!sessionDraft) return;
    setErrors({});
    setStatus(sessionDraft.session?.status || "done");
    setExercises(
      sessionDraft.session?.exercises?.length ? sessionDraft.session.exercises : sessionDraft.routine?.exercises || []
    );
    setValues({
      modalityId: sessionDraft.session?.modalityId || sessionDraft.routine?.modalityId || "running",
      name: sessionDraft.session?.name || sessionDraft.routine?.name || "",
      date: sessionDraft.date,
      durationMinutes: sessionDraft.session?.durationMinutes ?? sessionDraft.routine?.durationMinutes ?? 60,
      distanceKm: sessionDraft.session?.distanceKm ?? sessionDraft.routine?.distanceKm,
      effort: sessionDraft.session?.effort ?? 5,
      notes: sessionDraft.session?.notes || ""
    });
  }, [sessionDraft]);

  const updateValue = <K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleModalityChange = (modalityId: string) => {
    const previousName = findModality(values.modalityId)?.name;
    setValues((current) => ({
      ...current,
      modalityId,
      name: !current.name || current.name === previousName ? findModality(modalityId)?.name || "" : current.name
    }));
  };

  const handleSubmit = async () => {
    const formErrors = getFormErrors(sessionFormSchema, values) as Record<string, string>;
    const hasFutureDate = values.date > todayKey;
    const allErrors = hasFutureDate ? { ...formErrors, date: "Não dá para registrar um treino no futuro" } : formErrors;
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setIsSaving(true);
    await handleSaveSession({
      routineId: routine?.id || session?.routineId,
      date: values.date,
      status,
      modalityId: values.modalityId,
      name: values.name.trim(),
      durationMinutes: status === "done" ? values.durationMinutes : undefined,
      distanceKm: status === "done" && !isStrength ? values.distanceKm : undefined,
      effort: status === "done" ? values.effort : undefined,
      exercises: isStrength ? exercises : undefined,
      notes: values.notes?.trim() || undefined
    });
    setIsSaving(false);
  };

  const handleRemove = async () => {
    if (!session) return;
    setIsSaving(true);
    await handleUndoSession(session);
    setIsSaving(false);
    closeSessionModal();
  };

  return (
    <Modal
      opened={sessionDraft !== null}
      onClose={() => !isSaving && closeSessionModal()}
      title={isPlanned ? values.name : session ? "Editar treino avulso" : "Registrar treino avulso"}
      description={
        isPlanned
          ? "Confirme como foi o treino. Os detalhes são opcionais."
          : "Corrida, futebol, forró, natação... registre qualquer atividade fora da rotina."
      }
    >
      <Stack gap="md">
        {isPlanned && (
          <SegmentedControl
            fullWidth
            value={status}
            onChange={(value) => setStatus(value as WorkoutSessionStatus)}
            data={[
              { value: "done", label: "Fui" },
              { value: "missed", label: "Não fui" }
            ]}
          />
        )}

        {!isPlanned && (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Modalidade"
              data={(catalog?.modalities || []).map((item) => ({ value: item.id, label: item.name }))}
              value={values.modalityId}
              allowDeselect={false}
              error={errors.modalityId}
              onChange={(value) => value && handleModalityChange(value)}
            />
            <TextInput
              label="Data"
              type="date"
              max={todayKey}
              value={values.date}
              error={errors.date}
              onChange={(event) => updateValue("date", event.currentTarget.value)}
            />
            <TextInput
              label="Nome"
              placeholder="Ex.: Corrida no parque"
              value={values.name}
              error={errors.name}
              onChange={(event) => updateValue("name", event.currentTarget.value)}
            />
          </SimpleGrid>
        )}

        {status === "done" && (
          <>
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

            <Box>
              <Group justify="space-between" mb={6}>
                <Text size="sm" fw={500}>
                  Esforço percebido
                </Text>
                <Text size="sm" c="dimmed" style={effortLabelStyle}>
                  {values.effort ?? 5}/10 · {effortLabels[values.effort ?? 5]}
                </Text>
              </Group>
              <Slider
                min={1}
                max={10}
                step={1}
                value={values.effort ?? 5}
                onChange={(value) => updateValue("effort", value)}
                aria-label="Esforço percebido"
                color="indigo"
              />
            </Box>

            {isStrength && exercises.length > 0 && (
              <SessionExerciseList exercises={exercises} onChange={setExercises} />
            )}
          </>
        )}

        <Textarea
          label="Observações"
          autosize
          minRows={2}
          value={values.notes}
          onChange={(event) => updateValue("notes", event.currentTarget.value)}
        />

        <Group justify="space-between" gap="sm">
          {session ? (
            <Button variant="ghost" onClick={handleRemove} disabled={isSaving}>
              Remover registro
            </Button>
          ) : (
            <Box />
          )}
          <Group gap="sm">
            <Button variant="ghost" onClick={closeSessionModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>
              Salvar
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SessionModal;
