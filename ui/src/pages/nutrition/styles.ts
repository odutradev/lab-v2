import type { CSSProperties } from "react";

import { tokens } from "@styles/theme";

export const containerStyle: CSSProperties = {
  maxWidth: 1320,
  width: "100%",
  margin: "0 auto"
};

export const surfaceStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: tokens.surfaceSubtle,
  border: `1px solid ${tokens.border}`
};
