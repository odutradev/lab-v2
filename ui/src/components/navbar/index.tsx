import { Group, Box, Text, Avatar, ThemeIcon, Container, Menu, UnstyledButton } from "@mantine/core";
import { TbLogout, TbStack2, TbUser, TbChevronDown, TbChecklist, TbBarbell, TbSalad } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import { formatDisplayName, getInitials } from "@utils/functions/string";
import { tokens } from "@styles/theme";

import {
  headerStyle,
  containerStyle,
  navStyle,
  accountStyle,
  logoStyle,
  navLinkStyle,
  bottomNavStyle,
  bottomNavItemStyle,
  avatarStyle
} from "./styles";

const navItems = [
  { path: "/", label: "Hábitos", icon: TbChecklist },
  { path: "/workouts", label: "Treinos", icon: TbBarbell },
  { path: "/nutrition", label: "Dieta", icon: TbSalad }
];

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!isAuthenticated || !user) return null;

  const isAdmin = Boolean(user.superAdmin);

  return (
    <>
      <Box component="header" pos="sticky" top={0} style={headerStyle}>
        <Container size="xl" h={56} px="md" display="flex" style={containerStyle}>
          <UnstyledButton aria-label="Ir para o início" onClick={() => navigate("/")}>
            <Group gap={8} wrap="nowrap">
              <ThemeIcon size={28} color="indigo">
                <TbStack2 size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm" c={tokens.textPrimary} style={logoStyle}>
                LAB
              </Text>
            </Group>
          </UnstyledButton>

          <Group component="nav" gap={2} visibleFrom="sm" aria-label="Navegação principal" style={navStyle}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <UnstyledButton
                  key={item.path}
                  px="sm"
                  py={6}
                  style={navLinkStyle(isActive)}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => navigate(item.path)}
                >
                  <Text size="sm" fw={500}>
                    {item.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </Group>

          <Box style={accountStyle}>
            <Menu width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton px={6} py={4} aria-label="Abrir menu da conta" style={navLinkStyle(false)}>
                  <Group gap={8} wrap="nowrap">
                    <Avatar radius="xl" size={28} color="indigo" style={avatarStyle(isAdmin)}>
                      {getInitials(user.name)}
                    </Avatar>
                    <Text size="sm" fw={500} c={tokens.textPrimary} visibleFrom="xs">
                      {formatDisplayName(user.name)}
                    </Text>
                    <TbChevronDown size={14} color={tokens.textMuted} aria-hidden="true" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{isAdmin ? "Administrador" : "Minha conta"}</Menu.Label>
                <Menu.Item leftSection={<TbUser size={16} />} onClick={() => navigate("/profile")}>
                  Perfil
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<TbLogout size={16} />} onClick={logout}>
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Container>
      </Box>

      <Box component="nav" hiddenFrom="sm" aria-label="Navegação principal" style={bottomNavStyle}>
        {[...navItems, { path: "/profile", label: "Perfil", icon: TbUser }].map((item) => {
          const isActive = pathname === item.path;
          return (
            <UnstyledButton
              key={item.path}
              style={bottomNavItemStyle(isActive)}
              aria-current={isActive ? "page" : undefined}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} aria-hidden="true" />
              <Text size="10px" fw={500}>
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Box>
    </>
  );
};

export default Navbar;
