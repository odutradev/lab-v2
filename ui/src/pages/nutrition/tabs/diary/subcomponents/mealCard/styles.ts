import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const entryRowStyle: CSSProperties = {
  borderTop: `1px solid ${alpha(colors.white, 0.06)}`
};
