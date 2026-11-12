import type { CSSProperties } from "react";
import { alpha } from "@mantine/core";

import { colors } from "@styles/theme";

export const dayCardStyle = (isToday: boolean): CSSProperties => ({
  borderRadius: "var(--mantine-radius-lg)",
  backgroundColor: alpha(colors.gray900, 0.7),
  border: `1px solid ${isToday ? alpha(colors.indigo400, 0.6) : alpha(colors.white, 0.08)}`,
  boxShadow: isToday ? `0 0 0 1px ${alpha(colors.indigo400, 0.25)}` : undefined,
  minHeight: 150
});

export const itemStyle = (status?: "done" | "missed"): CSSProperties => ({
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor:
    status === "done"
      ? alpha(colors.emerald500, 0.1)
      : status === "missed"
        ? alpha(colors.red500, 0.08)
        : alpha(colors.white, 0.03),
  border: `1px solid ${
    status === "done"
      ? alpha(colors.emerald500, 0.3)
      : status === "missed"
        ? alpha(colors.red500, 0.25)
        : alpha(colors.white, 0.06)
  }`
});
