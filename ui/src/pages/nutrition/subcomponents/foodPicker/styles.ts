import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors, tokens } from "@styles/theme";

export const resultListStyle: CSSProperties = {
  maxHeight: 260,
  overflowY: "auto",
  borderRadius: "var(--mantine-radius-md)",
  border: `1px solid ${tokens.border}`
};

export const resultItemStyle = (isSelected: boolean): CSSProperties => ({
  width: "100%",
  backgroundColor: isSelected ? alpha(colors.indigo500, 0.15) : "transparent",
  borderBottom: `1px solid ${tokens.border}`
});

export const previewStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: tokens.surfaceSubtle,
  border: `1px solid ${tokens.border}`
};
