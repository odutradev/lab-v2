import { Group, Stack, Text, Title } from "@mantine/core";

import { tokens } from "@styles/theme";

import { titleStyle } from "./styles";
import type { PageHeaderProps } from "./types";

// Cabeçalho único das páginas: título, descrição curta e ações à direita.
export const PageHeader = ({ title, description, badge, actions }: PageHeaderProps) => {
  return (
    <Group component="header" justify="space-between" align="flex-end" gap="md" wrap="wrap">
      <Stack gap={4} miw={0}>
        <Group gap="xs" wrap="nowrap">
          <Title order={2} c={tokens.textPrimary} style={titleStyle}>
            {title}
          </Title>
          {badge}
        </Group>
        {description && (
          <Text size="sm" c={tokens.textSecondary}>
            {description}
          </Text>
        )}
      </Stack>
      {actions && (
        <Group gap="xs" wrap="wrap">
          {actions}
        </Group>
      )}
    </Group>
  );
};

export default PageHeader;
