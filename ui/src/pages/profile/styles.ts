import type { CSSProperties } from "react";
import { tokens } from "@styles/theme";

export const containerStyle: CSSProperties = {
  maxWidth: 780,
  width: "100%",
  margin: "0 auto"
};

export const infoCardItemStyle: CSSProperties = {
  padding: "16px",
  borderRadius: "8px",
  backgroundColor: tokens.surfaceSubtle,
  border: `1px solid ${tokens.border}`
};
