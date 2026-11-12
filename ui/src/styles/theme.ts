import { alpha, createTheme } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

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

// Tokens semânticos do design minimalista: componentes usam estes nomes em vez de
// escolher opacidades soltas, para que superfícies, bordas e textos fiquem iguais em todo o app.
export const tokens = {
  background: "#0b0d12",
  surface: "#12151c",
  surfaceRaised: "#171b24",
  surfaceSubtle: alpha(colors.white, 0.025),
  surfaceHover: alpha(colors.white, 0.05),
  surfaceActive: alpha(colors.white, 0.08),
  border: alpha(colors.white, 0.07),
  borderStrong: alpha(colors.white, 0.12),
  textPrimary: "#e8eaf0",
  textSecondary: alpha(colors.white, 0.6),
  textMuted: alpha(colors.white, 0.4),
  accent: colors.indigo400,
  accentSoft: alpha(colors.indigo500, 0.14),
  accentBorder: alpha(colors.indigo400, 0.45),
  success: colors.emerald400,
  successSoft: alpha(colors.emerald500, 0.12),
  successBorder: alpha(colors.emerald500, 0.35),
  danger: colors.red400,
  dangerSoft: alpha(colors.red500, 0.1),
  dangerBorder: alpha(colors.red500, 0.3),
  overlay: alpha(colors.black, 0.6),
  shadow: `0 8px 24px ${alpha(colors.black, 0.35)}`
} as const;

export type DesignToken = keyof typeof tokens;

const darkPalette: MantineColorsTuple = [
  "#e8eaf0",
  "#b8bcc8",
  "#8b90a0",
  "#5f6474",
  "#2a2e39",
  "#20242e",
  "#181b23",
  "#12151c",
  "#0e1016",
  "#0b0d12"
];

export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: "md",
  fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, monospace",
  cursorType: "pointer",
  colors: { dark: darkPalette },
  radius: { xs: "4px", sm: "6px", md: "8px", lg: "12px", xl: "16px" },
  headings: {
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.75rem", lineHeight: "1.25" },
      h2: { fontSize: "1.375rem", lineHeight: "1.3" },
      h3: { fontSize: "1.125rem", lineHeight: "1.35" },
      h4: { fontSize: "1rem", lineHeight: "1.4" }
    }
  },
  components: {
    Button: { defaultProps: { radius: "md" } },
    ActionIcon: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "sm", variant: "light" }, styles: { root: { textTransform: "none", fontWeight: 600 } } },
    Paper: { defaultProps: { radius: "lg" } },
    ThemeIcon: { defaultProps: { radius: "md", variant: "light" } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 200 } },
    Menu: {
      defaultProps: { radius: "md", shadow: "sm" },
      styles: { dropdown: { backgroundColor: tokens.surfaceRaised, borderColor: tokens.border } }
    },
    Popover: { styles: { dropdown: { backgroundColor: tokens.surfaceRaised, borderColor: tokens.border } } },
    Modal: {
      defaultProps: { radius: "lg", centered: true, overlayProps: { backgroundOpacity: 0.6, blur: 0 } },
      styles: { content: { backgroundColor: tokens.surface, border: `1px solid ${tokens.border}` }, header: { backgroundColor: tokens.surface } }
    },
    Input: {
      styles: { input: { backgroundColor: tokens.surfaceSubtle, borderColor: tokens.border } }
    },
    SegmentedControl: {
      defaultProps: { radius: "md" },
      styles: { root: { backgroundColor: tokens.surfaceSubtle, border: `1px solid ${tokens.border}` } }
    },
    Progress: { defaultProps: { radius: "xl" } },
    Skeleton: { styles: { root: { "--skeleton-color": tokens.surfaceActive } } }
  },
  other: { colors, tokens }
});

export default theme;
