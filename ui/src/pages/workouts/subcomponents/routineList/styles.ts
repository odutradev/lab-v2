import type { CSSProperties } from "react";

import { tokens } from "@styles/theme";

export const routineCardStyle = (isActive: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: tokens.surface,
  border: `1px solid ${tokens.border}`,
  opacity: isActive ? 1 : 0.6
});

export const templateCardStyle: CSSProperties = {
  width: "100%",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: tokens.surfaceSubtle,
  border: `1px solid ${tokens.border}`
};
