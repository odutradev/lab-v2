import type { HTMLAttributes, ReactNode } from "react";
import type { MantineSpacing, StyleProp } from "@mantine/core";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  p?: StyleProp<MantineSpacing>;
}
