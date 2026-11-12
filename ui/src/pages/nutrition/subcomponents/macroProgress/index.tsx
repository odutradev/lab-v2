import { Box, Group, Progress, Text } from "@mantine/core";

import { getProgressPercent } from "@utils/functions/nutrition";

import { valueStyle } from "./styles";
import type { MacroProgressProps } from "./types";

export const MacroProgress = ({ label, value, target, unit, color }: MacroProgressProps) => {
  const isOver = Boolean(target && value > target * 1.1);

  return (
    <Box>
      <Group justify="space-between" mb={4} gap="xs" wrap="nowrap">
        <Text size="sm" c="white" fw={500}>
          {label}
        </Text>
        <Text size="xs" c={isOver ? "orange.4" : "dimmed"} style={valueStyle}>
          {Math.round(value)}
          {target ? ` / ${Math.round(target)}` : ""} {unit}
        </Text>
      </Group>
      <Progress
        value={getProgressPercent(value, target)}
        color={isOver ? "orange" : color}
        size="md"
        radius="xl"
        aria-label={`${label}: ${Math.round(value)} de ${target ? Math.round(target) : "?"} ${unit}`}
      />
    </Box>
  );
};

export default MacroProgress;
