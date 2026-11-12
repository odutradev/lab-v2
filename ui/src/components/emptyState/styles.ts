import type { CSSProperties } from "react";

import { tokens } from "@styles/theme";

export const emptyStateStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-lg)",
  border: `1px dashed ${tokens.borderStrong}`,
  textAlign: "center"
};
