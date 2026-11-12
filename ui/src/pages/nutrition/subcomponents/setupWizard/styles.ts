import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const optionCardStyle = (isSelected: boolean): CSSProperties => ({
  width: "100%",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: isSelected ? alpha(colors.indigo500, 0.15) : alpha(colors.white, 0.03),
  border: `1px solid ${isSelected ? alpha(colors.indigo400, 0.6) : alpha(colors.white, 0.08)}`,
  transition: "background-color 0.15s ease, border-color 0.15s ease"
});
