import { Box, Group, NumberInput, Stack, Text, TextInput } from "@mantine/core";

import { toOptionalNumber } from "@utils/functions/number";

import { exerciseLineStyle } from "./styles";
import type { SessionExerciseListProps } from "./types";

export const SessionExerciseList = ({ exercises, onChange }: SessionExerciseListProps) => {
  const handleChange = (index: number, field: "reps" | "load", value: string | number) => {
    onChange(
      exercises.map((exercise, itemIndex) => {
        if (itemIndex !== index) return exercise;
        return field === "reps" ? { ...exercise, reps: String(value) } : { ...exercise, load: toOptionalNumber(value) };
      })
    );
  };

  return (
    <Stack gap={0}>
      <Text size="sm" fw={500} mb={4}>
        Cargas de hoje
      </Text>
      {exercises.map((exercise, index) => (
        <Group key={`${exercise.name}-${index}`} gap="xs" py={6} wrap="nowrap" style={exerciseLineStyle}>
          <Box flex={1} miw={0}>
            <Text size="sm" c="white" truncate>
              {exercise.name}
            </Text>
            <Text size="xs" c="dimmed">
              {exercise.sets} séries
            </Text>
          </Box>
          <TextInput
            w={80}
            size="xs"
            aria-label={`Repetições de ${exercise.name}`}
            value={exercise.reps}
            onChange={(event) => handleChange(index, "reps", event.currentTarget.value)}
          />
          <NumberInput
            w={90}
            size="xs"
            min={0}
            max={1000}
            decimalScale={1}
            suffix=" kg"
            aria-label={`Carga de ${exercise.name}`}
            value={exercise.load ?? ""}
            onChange={(value) => handleChange(index, "load", value)}
          />
        </Group>
      ))}
    </Stack>
  );
};

export default SessionExerciseList;
