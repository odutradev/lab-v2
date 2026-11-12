import { Box, Group, Text, Badge, alpha } from "@mantine/core";
import type { ImcGaugeChartProps } from "./types";
import { colors, tokens } from "@styles/theme";

interface ClassificationBand {
  label: string;
  range: string;
  color: string;
}

const BANDS: ClassificationBand[] = [
  {
    label: "Abaixo",
    range: "< 18.5",
    color: colors.sky400
  },
  {
    label: "Normal",
    range: "18.5 – 24.9",
    color: colors.emerald500
  },
  {
    label: "Sobrepeso",
    range: "25.0 – 29.9",
    color: colors.amber500
  },
  {
    label: "Obesidade",
    range: "30.0 – 39.9",
    color: colors.orange500
  },
  {
    label: "Severa",
    range: "≥ 40.0",
    color: colors.red500
  }
];

function getActiveBandIndex(imc: number): number {
  if (imc < 18.5) return 0;
  if (imc < 25.0) return 1;
  if (imc < 30.0) return 2;
  if (imc < 40.0) return 3;
  return 4;
}

export const ImcGaugeChart = ({ imcResult, heightCm, currentWeight }: ImcGaugeChartProps) => {
  if (!heightCm) {
    return (
      <Box
        className="chart-fade-transition"
        style={{
          height: 89,
          borderRadius: 8,
          background: tokens.surfaceSubtle,
          border: `1px dashed ${tokens.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 12px"
        }}
      >
        <Text size="xs" c="dimmed">
          Cadastre sua altura no perfil para calcular seu IMC.
        </Text>
      </Box>
    );
  }

  if (!currentWeight || !imcResult) {
    return (
      <Box
        className="chart-fade-transition"
        style={{
          height: 89,
          borderRadius: 8,
          background: tokens.surfaceSubtle,
          border: `1px dashed ${tokens.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 12px"
        }}
      >
        <Text size="xs" c="dimmed">
          Faça um check-in de peso para calcular seu IMC.
        </Text>
      </Box>
    );
  }

  const { imc, classification, minIdealWeight, maxIdealWeight } = imcResult;
  const activeIndex = getActiveBandIndex(imc);
  const activeColor = BANDS[activeIndex]?.color || colors.emerald500;

  return (
    <Box className="chart-fade-transition">
      <Group justify="space-between" align="center" mb={6} wrap="wrap" gap="xs">
        <Group gap={6} align="center">
          <Text size="12px" fw={800} c={colors.white} style={{ lineHeight: 1 }}>
            {imc.toFixed(1)}{" "}
            <span style={{ fontSize: "10px", fontWeight: 600, color: tokens.textMuted }}>kg/m²</span>
          </Text>
          <Badge
            variant="light"
            size="xs"
            radius="sm"
            style={{
              backgroundColor: `${activeColor}22`,
              color: activeColor,
              border: `1px solid ${activeColor}55`,
              fontWeight: 700,
              height: 18,
              padding: "0 6px"
            }}
          >
            {classification.label}
          </Badge>
        </Group>

        <Group gap={6} align="center">
          <Text size="10px" c="dimmed">
            Peso <span style={{ color: colors.white, fontWeight: 600 }}>{currentWeight.toFixed(1)} kg</span>
          </Text>
          <Text size="10px" c="dimmed">
            •
          </Text>
          <Text size="10px" c="dimmed">
            Ideal{" "}
            <span style={{ color: colors.emerald500, fontWeight: 600 }}>
              {minIdealWeight} – {maxIdealWeight} kg
            </span>
          </Text>
        </Group>
      </Group>

      <Box
        style={{
          height: 48,
          borderRadius: 8,
          background: tokens.surfaceSubtle,
          border: `1px solid ${tokens.border}`,
          overflow: "hidden",
          display: "flex",
          padding: 3,
          gap: 4
        }}
      >
        {BANDS.map((b, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <Box
              key={b.label}
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                borderRadius: 6,
                backgroundColor: isCurrent ? `${b.color}22` : tokens.surfaceSubtle,
                border: isCurrent ? `1px solid ${b.color}99` : `1px solid ${tokens.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 1px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease"
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: isCurrent ? 3 : 2,
                  backgroundColor: b.color,
                  opacity: isCurrent ? 1 : 0.35,
                  boxShadow: isCurrent ? "none" : "none"
                }}
              />
              <Text
                size="10px"
                fw={isCurrent ? 700 : 500}
                style={{
                  color: isCurrent ? b.color : tokens.textSecondary,
                  lineHeight: 1.1,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "100%"
                }}
              >
                {b.label}
              </Text>
              <Text
                size="9px"
                fw={isCurrent ? 600 : 400}
                style={{
                  color: isCurrent ? colors.white : alpha(colors.white, 0.4),
                  lineHeight: 1.1,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "100%"
                }}
              >
                {b.range}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Group justify="space-between" align="center" px={4} mt={3}>
        <Text size="9px" c="dimmed">
          Abaixo (&lt; 18.5)
        </Text>
        <Text size="9px" style={{ color: activeColor, fontWeight: 600 }}>
          Faixa: {classification.label}
        </Text>
        <Text size="9px" c="dimmed">
          Severa (≥ 40.0)
        </Text>
      </Group>
    </Box>
  );
};

export default ImcGaugeChart;
