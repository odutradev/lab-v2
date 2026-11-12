import { Group, Box, Title, Text, Avatar, Stack, Tooltip } from "@mantine/core";
import { TbArrowLeft } from "react-icons/tb";

import Button from "@components/button";
import Badge from "@components/badge";
import Card from "@components/card";

import type { ProfileHeaderProps } from "./types";
import { colors } from "@styles/theme";

export const ProfileHeader = ({ user, initials, onBack }: ProfileHeaderProps) => {
  const isAdmin = Boolean(user.superAdmin);
  const avatarBorderColor = isAdmin ? colors.amber500 : colors.white;
  const roleTooltipLabel = isAdmin ? "Administrador" : "Usuário";

  return (
    <Card>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group gap="lg" align="center">
          <Tooltip label={roleTooltipLabel} withArrow position="bottom">
            <Avatar
              size={72}
              radius="xl"
              color="indigo"
              variant="filled"
              style={{
                border: `3px solid ${avatarBorderColor}`,
                boxShadow: isAdmin ? "none" : undefined
              }}
            >
              <Text fw={700} size="xl">
                {initials}
              </Text>
            </Avatar>
          </Tooltip>

          <Stack gap={4}>
            <Title order={3} fw={700} c="white">
              {user.name}
            </Title>
            <Text size="sm" c="dimmed">
              {user.email}
            </Text>
            <Group gap="xs" mt={4}>
              <Badge variant={user.superAdmin ? "primary" : "info"}>
                {user.superAdmin ? "Administrador" : "Usuário"}
              </Badge>
              {user.accountStatus && (
                <Badge variant={user.accountStatus === "active" ? "success" : "warning"}>
                  {user.accountStatus === "active" ? "Conta Ativa" : "Bloqueada"}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        <Box>
          <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<TbArrowLeft size={16} />}>
            Voltar
          </Button>
        </Box>
      </Group>
    </Card>
  );
};

export default ProfileHeader;
