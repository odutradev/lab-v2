import { Stack, Text, ThemeIcon } from "@mantine/core";

import { tokens } from "@styles/theme";

import { emptyStateStyle } from "./styles";
import type { EmptyStateProps } from "./types";

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Stack align="center" gap="xs" p={{ base: "lg", sm: "xl" }} style={emptyStateStyle}>
      {icon && (
        <ThemeIcon size={40} radius="xl" color="gray">
          {icon}
        </ThemeIcon>
      )}
      <Text fw={600} c={tokens.textPrimary}>
        {title}
      </Text>
      {description && (
        <Text size="sm" c={tokens.textSecondary} maw={420}>
          {description}
        </Text>
      )}
      {action}
    </Stack>
  );
};

export default EmptyState;
