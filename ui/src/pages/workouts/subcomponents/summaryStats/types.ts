import type { ReactNode } from "react";

export interface SummaryStatItem {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  color: string;
}
