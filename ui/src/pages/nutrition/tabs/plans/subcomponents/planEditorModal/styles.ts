import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const mealBlockStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: alpha(colors.white, 0.03),
  border: `1px solid ${alpha(colors.white, 0.06)}`
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
  borderTop: `1px solid ${alpha(colors.white, 0.05)}`
};
