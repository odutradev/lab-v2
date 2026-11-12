import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const metricBoxStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: alpha(colors.white, 0.03),
  border: `1px solid ${alpha(colors.white, 0.06)}`
};
