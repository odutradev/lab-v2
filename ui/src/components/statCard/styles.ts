import type { CSSProperties } from "react";

import { tokens } from "@styles/theme";

export const statCardStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: tokens.surface,
  border: `1px solid ${tokens.border}`,
  minWidth: 0
};

export const valueStyle: CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.01em"
};
