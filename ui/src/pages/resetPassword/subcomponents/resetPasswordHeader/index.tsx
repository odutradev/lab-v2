import { Stack, ThemeIcon, Title, Text } from "@mantine/core";
import { tokens } from "@styles/theme";
import { TbKey } from "react-icons/tb";

import type { ResetPasswordHeaderProps } from "./types";

export const ResetPasswordHeader = ({ subtitle }: ResetPasswordHeaderProps) => {
  return (
    <Stack align="center" gap="xs" mb="xl" ta="center">
      <ThemeIcon size={56} radius="xl" variant="light" color="indigo">
        <TbKey size={28} />
      </ThemeIcon>
      <Title order={1} size="h2" fw={600} c={tokens.textPrimary}>
        Redefinição de Senha
      </Title>
      <Text size="sm" c="dimmed">
        {subtitle}
      </Text>
    </Stack>
  );
};

export default ResetPasswordHeader;
