import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const routineCardStyle = (isActive: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: alpha(colors.gray900, 0.7),
  border: `1px solid ${alpha(colors.white, 0.08)}`,
  opacity: isActive ? 1 : 0.6
});

export const templateCardStyle: CSSProperties = {
  width: "100%",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: alpha(colors.white, 0.03),
  border: `1px solid ${alpha(colors.white, 0.08)}`
};
