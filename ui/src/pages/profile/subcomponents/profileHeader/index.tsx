import { Group, Avatar, Stack, Text } from "@mantine/core";

import Badge from "@components/badge";
import Card from "@components/card";
import PageHeader from "@components/pageHeader";
import { tokens } from "@styles/theme";

import { avatarStyle } from "./styles";
import type { ProfileHeaderProps } from "./types";

export const ProfileHeader = ({ user, initials }: ProfileHeaderProps) => {
  const isAdmin = Boolean(user.superAdmin);

  return (
    <Stack gap="md">
      <PageHeader title="Perfil" description="Sua conta, dados físicos e integrações." />
      <Card>
        <Group gap="md" wrap="nowrap">
          <Avatar size={56} radius="xl" color="indigo" style={avatarStyle(isAdmin)}>
            <Text fw={600} size="lg">
              {initials}
            </Text>
          </Avatar>
          <Stack gap={2} miw={0}>
            <Text fw={600} size="lg" c={tokens.textPrimary} truncate>
              {user.name}
            </Text>
            <Text size="sm" c={tokens.textSecondary} truncate>
              {user.email}
            </Text>
            <Group gap={6} mt={4}>
              <Badge variant={isAdmin ? "primary" : "info"}>{isAdmin ? "Administrador" : "Usuário"}</Badge>
              {user.accountStatus && (
                <Badge variant={user.accountStatus === "active" ? "success" : "warning"}>
                  {user.accountStatus === "active" ? "Conta ativa" : "Bloqueada"}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>
      </Card>
    </Stack>
  );
};

export default ProfileHeader;
