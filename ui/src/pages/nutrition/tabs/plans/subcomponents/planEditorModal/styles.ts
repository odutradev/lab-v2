import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors, tokens } from "@styles/theme";

export const mealBlockStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: tokens.surfaceSubtle,
  border: `1px solid ${tokens.border}`
};

export const totalsBarStyle: CSSProperties = {
  position: "sticky",
  bottom: 0,
  zIndex: 1,
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: alpha(colors.night800, 0.96),
  border: `1px solid ${alpha(colors.indigo400, 0.3)}`
};

export const itemRowStyle: CSSProperties = {
  borderTop: `1px solid ${tokens.border}`
};
