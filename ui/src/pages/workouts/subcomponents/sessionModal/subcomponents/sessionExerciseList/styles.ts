import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const exerciseLineStyle: CSSProperties = {
  borderBottom: `1px solid ${alpha(colors.white, 0.06)}`
};
