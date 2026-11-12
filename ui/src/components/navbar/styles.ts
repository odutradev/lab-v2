import type { CSSProperties } from "react";

import { colors, tokens } from "@styles/theme";

export const headerStyle: CSSProperties = {
  zIndex: 100,
  backgroundColor: tokens.background,
  borderBottom: `1px solid ${tokens.border}`
};

export const containerStyle: CSSProperties = {
  alignItems: "center",
  gap: 24
};

export const navStyle: CSSProperties = {
  flex: 1
};

export const accountStyle: CSSProperties = {
  marginLeft: "auto"
};

export const logoStyle: CSSProperties = {
  letterSpacing: "0.04em"
};

export const navLinkStyle = (isActive: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-md)",
  color: isActive ? tokens.textPrimary : tokens.textSecondary,
  backgroundColor: isActive ? tokens.surfaceActive : "transparent",
  transition: "background-color 0.15s ease, color 0.15s ease"
});

export const avatarStyle = (isAdmin: boolean): CSSProperties => ({
  border: `1px solid ${isAdmin ? colors.amber500 : tokens.borderStrong}`
});

export const bottomNavStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  height: 64,
  paddingBottom: "env(safe-area-inset-bottom)",
  backgroundColor: tokens.background,
  borderTop: `1px solid ${tokens.border}`
};

export const bottomNavItemStyle = (isActive: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  color: isActive ? tokens.accent : tokens.textMuted
});
