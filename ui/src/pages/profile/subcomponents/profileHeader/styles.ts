import type { CSSProperties } from "react";

import { colors, tokens } from "@styles/theme";

export const avatarStyle = (isAdmin: boolean): CSSProperties => ({
  border: `2px solid ${isAdmin ? colors.amber500 : tokens.borderStrong}`
});
