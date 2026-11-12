import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const navLinkStyle = (isActive: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-md)",
  color: isActive ? colors.white : alpha(colors.white, 0.6),
  backgroundColor: isActive ? alpha(colors.indigo500, 0.18) : "transparent",
  transition: "background-color 0.15s ease, color 0.15s ease"
});
