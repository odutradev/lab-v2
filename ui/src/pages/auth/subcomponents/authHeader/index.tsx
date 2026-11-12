import { Stack, ThemeIcon, Title, Text } from "@mantine/core";
import { tokens } from "@styles/theme";
import { TbStack2, TbKey } from "react-icons/tb";

import type { AuthHeaderProps } from "./types";

export const AuthHeader = ({ title, subtitle, isResetMode }: AuthHeaderProps) => {
  return (
    <Stack align="center" gap="xs" mb="xl" ta="center">
      <ThemeIcon size={56} radius="xl" variant="light" color="indigo">
        {isResetMode ? <TbKey size={28} /> : <TbStack2 size={28} />}
      </ThemeIcon>
      <Title order={1} size="h2" fw={600} c={tokens.textPrimary}>
        {title}
      </Title>
      <Text size="sm" c="dimmed">
        {subtitle}
      </Text>
    </Stack>
  );
};

export default AuthHeader;
