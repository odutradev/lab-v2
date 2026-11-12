import { Group, Box, Text, Avatar, ThemeIcon, Container, Menu, UnstyledButton, Tooltip, alpha } from "@mantine/core";
import { TbLogout, TbStack2, TbUser, TbChevronDown, TbChecklist, TbBarbell, TbSalad } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import { formatDisplayName, getInitials } from "@utils/functions/string";
import { colors, tokens } from "@styles/theme";

import { navLinkStyle } from "./styles";

const navItems = [
  { path: "/", label: "Hábitos", icon: TbChecklist },
  { path: "/workouts", label: "Treinos", icon: TbBarbell },
  { path: "/nutrition", label: "Dieta", icon: TbSalad }
];

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
        backgroundColor: alpha(colors.night950, 0.75),
        borderBottom: `1px solid ${tokens.border}`
      }}
    >
      <Container size="lg" h={64} display="flex" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <Group gap="xs" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <ThemeIcon size="md" radius="md" variant="light" color="indigo">
            <TbStack2 size={18} />
          </ThemeIcon>
          <Text fw={700} size="md" c="white" style={{ letterSpacing: "-0.02em" }}>
            LAB Portal
          </Text>
        </Group>

        {isAuthenticated && user && (
          <Group component="nav" gap={4} visibleFrom="sm" aria-label="Navegação principal">
            {navItems.map((item) => (
              <UnstyledButton
                key={item.path}
                px="sm"
                py={6}
                style={navLinkStyle(pathname === item.path)}
                aria-current={pathname === item.path ? "page" : undefined}
                onClick={() => navigate(item.path)}
              >
                <Group gap={6} wrap="nowrap">
                  <item.icon size={16} aria-hidden="true" />
                  <Text size="sm" fw={600}>
                    {item.label}
                  </Text>
                </Group>
              </UnstyledButton>
            ))}
          </Group>
        )}

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
                        boxShadow: isAdmin ? "none" : undefined
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                  </Tooltip>
                  <Text size="sm" fw={600} c="white">
                    {formatDisplayName(user.name)}
                  </Text>
                  <TbChevronDown size={14} color={tokens.textMuted} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                backgroundColor: tokens.surface,
                borderColor: tokens.border,
              }}
            >
              <Box hiddenFrom="sm">
                {navItems.map((item) => (
                  <Menu.Item key={item.path} leftSection={<item.icon size={16} />} onClick={() => navigate(item.path)}>
                    {item.label}
                  </Menu.Item>
                ))}
                <Menu.Divider style={{ borderColor: tokens.border }} />
              </Box>
              <Menu.Item leftSection={<TbUser size={16} />} onClick={() => navigate("/profile")}>
                Perfil
              </Menu.Item>
              <Menu.Divider style={{ borderColor: tokens.border }} />
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
