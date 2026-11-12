import { Group, Box, Text, Avatar, ThemeIcon, Container, Menu, UnstyledButton, Tooltip, alpha } from "@mantine/core";
import { TbLogout, TbStack2, TbUser, TbChevronDown } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import { formatDisplayName, getInitials } from "@utils/functions/string";
import { colors } from "@styles/theme";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = Boolean(user?.superAdmin);
  const avatarBorderColor = isAdmin ? colors.amber500 : colors.white;
  const roleTooltipLabel = isAdmin ? "Administrador" : "Usuário";

  return (
    <Box
      component="header"
      pos="sticky"
      top={0}
      style={{
        zIndex: 100,
        backdropFilter: "blur(16px)",
        backgroundColor: alpha(colors.night950, 0.75),
        borderBottom: `1px solid ${alpha(colors.white, 0.08)}`
      }}
    >
      <Container size="lg" h={64} display="flex" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <Group gap="xs" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <ThemeIcon size="md" radius="md" variant="gradient" gradient={{ from: "indigo", to: "cyan" }}>
            <TbStack2 size={18} />
          </ThemeIcon>
          <Text fw={700} size="md" c="white" style={{ letterSpacing: "-0.02em" }}>
            LAB Portal
          </Text>
        </Group>

        {isAuthenticated && user && (
          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <UnstyledButton
                p="xs"
                style={{
                  borderRadius: 8,
                  transition: "background-color 0.15s ease"
                }}
              >
                <Group gap="sm" align="center">
                  <Tooltip label={roleTooltipLabel} withArrow position="bottom">
                    <Avatar
                      radius="xl"
                      size="sm"
                      color="indigo"
                      style={{
                        border: `2px solid ${avatarBorderColor}`,
                        boxShadow: isAdmin ? `0 0 8px ${alpha(colors.amber500, 0.4)}` : undefined
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                  </Tooltip>
                  <Text size="sm" fw={600} c="white">
                    {formatDisplayName(user.name)}
                  </Text>
                  <TbChevronDown size={14} color={alpha(colors.white, 0.5)} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                backgroundColor: alpha(colors.gray900, 0.95),
                borderColor: alpha(colors.white, 0.1),
                backdropFilter: "blur(16px)"
              }}
            >
              <Menu.Item leftSection={<TbUser size={16} />} onClick={() => navigate("/profile")}>
                Perfil
              </Menu.Item>
              <Menu.Divider style={{ borderColor: alpha(colors.white, 0.08) }} />
              <Menu.Item color="red" leftSection={<TbLogout size={16} />} onClick={logout}>
                Sair
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Container>
    </Box>
  );
};

export default Navbar;
