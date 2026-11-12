import { Group, Stack, Text, Title } from "@mantine/core";

import { tokens } from "@styles/theme";

import { sectionTitleStyle } from "./styles";
import type { SectionHeaderProps } from "./types";

export const SectionHeader = ({ title, description, actions }: SectionHeaderProps) => {
  return (
    <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
      <Stack gap={2} miw={0}>
        <Title order={4} c={tokens.textPrimary} style={sectionTitleStyle}>
          {title}
        </Title>
        {description && (
          <Text size="xs" c={tokens.textMuted}>
            {description}
          </Text>
        )}
      </Stack>
      {actions && (
        <Group gap={4} wrap="nowrap">
          {actions}
        </Group>
      )}
    </Group>
  );
};

export default SectionHeader;
