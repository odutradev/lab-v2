import { Box, Group, Text, ThemeIcon } from "@mantine/core";

import { tokens } from "@styles/theme";

import { statCardStyle, valueStyle } from "./styles";
import type { StatCardProps } from "./types";

export const StatCard = ({ label, value, hint, icon, color = "indigo" }: StatCardProps) => {
  return (
    <Box p="md" style={statCardStyle}>
      <Group gap={8} wrap="nowrap" mb={6}>
        {icon && (
          <ThemeIcon size={22} color={color}>
            {icon}
          </ThemeIcon>
        )}
        <Text size="xs" c={tokens.textSecondary} truncate>
          {label}
        </Text>
      </Group>
      <Text fw={600} size="lg" c={tokens.textPrimary} style={valueStyle}>
        {value}
      </Text>
      {hint && (
        <Text size="xs" c={tokens.textMuted} truncate>
          {hint}
        </Text>
      )}
    </Box>
  );
};

export default StatCard;
