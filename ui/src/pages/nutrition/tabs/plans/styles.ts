import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const planCardStyle = (isActive: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: alpha(colors.gray900, 0.7),
  border: `1px solid ${isActive ? alpha(colors.emerald500, 0.4) : alpha(colors.white, 0.08)}`
});
