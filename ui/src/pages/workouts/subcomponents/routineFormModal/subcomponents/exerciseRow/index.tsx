import { ActionIcon, Autocomplete, Box, Group, NumberInput, SimpleGrid, TextInput } from "@mantine/core";
import { TbTrash } from "react-icons/tb";

import { toOptionalNumber } from "@utils/functions/workouts";

import { exerciseRowStyle } from "./styles";
import type { ExerciseRowProps } from "./types";

export const ExerciseRow = ({ exercise, index, exerciseOptions, error, onChange, onRemove }: ExerciseRowProps) => (
  <Box p="sm" style={exerciseRowStyle}>
    <Group gap="xs" align="flex-start" wrap="nowrap">
      <Autocomplete
        flex={1}
        label={`Exercício ${index + 1}`}
        placeholder="Busque ou digite um exercício"
        data={exerciseOptions}
        value={exercise.name}
        error={error}
        limit={30}
        onChange={(name) => onChange(index, { ...exercise, name, exerciseId: undefined })}
      />
      <ActionIcon
        mt={26}
        variant="subtle"
        color="red"
        aria-label={`Remover exercício ${index + 1}`}
        onClick={() => onRemove(index)}
      >
        <TbTrash size={16} />
      </ActionIcon>
    </Group>
    <SimpleGrid cols={3} spacing="xs" mt="xs">
      <NumberInput
        label="Séries"
        min={1}
        max={20}
        value={exercise.sets}
        onChange={(value) => onChange(index, { ...exercise, sets: toOptionalNumber(value) ?? 1 })}
      />
      <TextInput
        label="Repetições"
        placeholder="8-12"
        value={exercise.reps}
        onChange={(event) => onChange(index, { ...exercise, reps: event.currentTarget.value })}
      />
      <NumberInput
        label="Carga (kg)"
        min={0}
        max={1000}
        decimalScale={1}
        value={exercise.load ?? ""}
        onChange={(value) => onChange(index, { ...exercise, load: toOptionalNumber(value) })}
      />
    </SimpleGrid>
  </Box>
);

export default ExerciseRow;
