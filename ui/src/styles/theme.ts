import { createTheme } from "@mantine/core";

// Paleta de cores do app. Componentes usam estes tokens (ou `alpha(colors.x, opacidade)`)
// em vez de valores hexadecimais ou rgba fixos.
export const colors = {
  white: "#ffffff",
  black: "#000000",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray900: "#111827",
  slate400: "#94a3b8",
  slate900: "#0f172a",
  indigo100: "#e0e7ff",
  indigo200: "#c7d2fe",
  indigo300: "#a5b4fc",
  indigo400: "#818cf8",
  indigo500: "#6366f1",
  purple300: "#d8b4fe",
  purple400: "#c084fc",
  purple500: "#a855f7",
  purple600: "#9333ea",
  violet600: "#7c3aed",
  fuchsia400: "#e879f9",
  sky400: "#38bdf8",
  sky600: "#0284c7",
  blue300: "#93c5fd",
  cyan100: "#cffafe",
  cyan300: "#67e8f9",
  cyan400: "#22d3ee",
  cyan500: "#06b6d4",
  cyan600: "#0891b2",
  teal400: "#2dd4bf",
  emerald400: "#34d399",
  emerald500: "#10b981",
  emerald600: "#059669",
  green400: "#4ade80",
  green500: "#22c55e",
  lime400: "#a3e635",
  yellow400: "#facc15",
  amber400: "#fbbf24",
  amber500: "#f59e0b",
  orange400: "#fb923c",
  orange500: "#f97316",
  red400: "#f87171",
  red500: "#ef4444",
  mist200: "#e3e3e3",
  mist300: "#c4c7c5",
  mist500: "#75777a",
  graphite700: "#2b2c2f",
  graphite800: "#1e1f20",
  graphite900: "#1f1f1f",
  periwinkle200: "#a8c7fa",
  navy900: "#041e49",
  navy950: "#0b1329",
  night600: "#1a1c2b",
  night700: "#1c1f26",
  night800: "#161922",
  night850: "#10111a",
  night900: "#0c101c",
  night950: "#090d16"
} as const;

export type ColorToken = keyof typeof colors;

export const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, monospace",
  cursorType: "pointer",
  other: { colors }
});

export default theme;
