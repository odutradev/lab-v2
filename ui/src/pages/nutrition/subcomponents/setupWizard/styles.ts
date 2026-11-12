import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors, tokens } from "@styles/theme";

export const optionCardStyle = (isSelected: boolean): CSSProperties => ({
  width: "100%",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: isSelected ? alpha(colors.indigo500, 0.15) : tokens.surfaceSubtle,
  border: `1px solid ${isSelected ? alpha(colors.indigo400, 0.6) : tokens.border}`,
  transition: "background-color 0.15s ease, border-color 0.15s ease"
});
