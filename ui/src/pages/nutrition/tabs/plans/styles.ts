import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors, tokens } from "@styles/theme";

export const planCardStyle = (isActive: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: tokens.surface,
  border: `1px solid ${isActive ? alpha(colors.emerald500, 0.4) : tokens.border}`
});
