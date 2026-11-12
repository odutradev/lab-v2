import type { CSSProperties } from "react";
import { colors } from "@styles/theme";
import { alpha } from "@mantine/core";

export const containerStyle: CSSProperties = {
  maxWidth: 780,
  width: "100%",
  margin: "0 auto"
};

export const infoCardItemStyle: CSSProperties = {
  padding: "16px",
  borderRadius: "8px",
  backgroundColor: alpha(colors.white, 0.03),
  border: `1px solid ${alpha(colors.white, 0.05)}`
};
