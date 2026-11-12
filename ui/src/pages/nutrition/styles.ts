import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const containerStyle: CSSProperties = {
  maxWidth: 1080,
  width: "100%",
  margin: "0 auto"
};

export const surfaceStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: alpha(colors.white, 0.03),
  border: `1px solid ${alpha(colors.white, 0.06)}`
};
