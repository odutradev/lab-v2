import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const statCardStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: alpha(colors.gray900, 0.7),
  border: `1px solid ${alpha(colors.white, 0.08)}`
};
