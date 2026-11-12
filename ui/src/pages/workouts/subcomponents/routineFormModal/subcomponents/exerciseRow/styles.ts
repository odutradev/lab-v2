import type { CSSProperties } from "react";

import { tokens } from "@styles/theme";

export const exerciseRowStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: tokens.surfaceSubtle,
  border: `1px solid ${tokens.border}`
};
