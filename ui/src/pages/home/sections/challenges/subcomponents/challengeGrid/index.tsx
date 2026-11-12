import { Box, Group, Tooltip, Text, alpha } from "@mantine/core";
import { addDaysToDateString, formatDisplayDate, getTodayDateString } from "@utils/functions/challenges";
import { colors, tokens } from "@styles/theme";

interface ChallengeGridProps {
  startDate: string;
  targetDays: number;
  checkins: string[];
  slipDates?: string[];
  freezeDates?: string[];
  onToggleDate?: (date: string) => void;
}

export const ChallengeGrid = ({
  startDate,
  targetDays,
  checkins,
  slipDates = [],
  freezeDates = [],
  onToggleDate
}: ChallengeGridProps) => {
  const todayStr = getTodayDateString();
  const checkinSet = new Set(checkins);
  const slipSet = new Set(slipDates);
  const freezeSet = new Set(freezeDates);

  const daysArray = Array.from({ length: targetDays }, (_, idx) => {
    const dayNumber = idx + 1;
    const dateStr = addDaysToDateString(startDate, idx);
    const isCompleted = checkinSet.has(dateStr);
    const isFreeze = freezeSet.has(dateStr);
    const isSlip = slipSet.has(dateStr);
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;

    let statusLabel = "Pendente";
    let bgColor = alpha(colors.white, 0.05);
    let borderColor = tokens.border;
    let boxShadow = "none";

    if (isCompleted) {
      statusLabel = "Concluído ✓";
      bgColor = colors.emerald500;
      borderColor = colors.emerald400;
      boxShadow = "none";
    } else if (isFreeze) {
      statusLabel = "Dia Livre (Freeze ❄️)";
      bgColor = alpha(colors.cyan500, 0.25);
      borderColor = colors.cyan400;
      boxShadow = "none";
    } else if (isSlip) {
      statusLabel = "Deslize registrado";
      bgColor = colors.amber500;
      borderColor = colors.amber400;
    } else if (isToday) {
      statusLabel = "Hoje (Aguardando)";
      bgColor = alpha(colors.indigo500, 0.2);
      borderColor = colors.indigo400;
    } else if (isPast) {
      statusLabel = "Não preenchido";
      bgColor = alpha(colors.red500, 0.12);
      borderColor = alpha(colors.red500, 0.3);
    } else if (isFuture) {
      statusLabel = "Futuro";
      bgColor = alpha(colors.white, 0.03);
      borderColor = tokens.border;
    }

    return {
      dayNumber,
      dateStr,
      isCompleted,
      isSlip,
      isToday,
      isPast,
      isFuture,
      statusLabel,
      bgColor,
      borderColor,
      boxShadow
    };
  });

  return (
    <Box>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(20px, 1fr))",
          gap: 6,
          padding: "12px",
          backgroundColor: alpha(colors.black, 0.25),
          borderRadius: 12,
          border: `1px solid ${tokens.border}`,
          maxHeight: 240,
          overflowY: "auto"
        }}
      >
        {daysArray.map((day) => (
          <Tooltip
            key={day.dayNumber}
            label={`Dia ${day.dayNumber} • ${formatDisplayDate(day.dateStr)}: ${day.statusLabel}`}
            withArrow
            position="top"
          >
            <Box
              onClick={() => onToggleDate && onToggleDate(day.dateStr)}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 4,
                backgroundColor: day.bgColor,
                border: `1px solid ${day.borderColor}`,
                boxShadow: day.boxShadow,
                cursor: onToggleDate ? "pointer" : "default",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Legenda */}
      <Group gap="md" mt="xs" justify="center" wrap="wrap">
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: colors.emerald500 }} />
          <Text size="xs" c="dimmed">
            Concluído
          </Text>
        </Group>
        <Group gap={6}>
          <Box
            w={12}
            h={12}
            style={{
              borderRadius: 3,
              backgroundColor: alpha(colors.indigo500, 0.2),
              border: `1px solid ${colors.indigo400}`
            }}
          />
          <Text size="xs" c="dimmed">
            Hoje
          </Text>
        </Group>
        <Group gap={6}>
          <Box
            w={12}
            h={12}
            style={{
              borderRadius: 3,
              backgroundColor: alpha(colors.cyan500, 0.4),
              border: `1px solid ${colors.cyan400}`
            }}
          />
          <Text size="xs" c="dimmed">
            Dia Livre (Freeze ❄️)
          </Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: colors.amber500 }} />
          <Text size="xs" c="dimmed">
            Deslize
          </Text>
        </Group>
        <Group gap={6}>
          <Box
            w={12}
            h={12}
            style={{
              borderRadius: 3,
              backgroundColor: tokens.surfaceSubtle,
              border: `1px dashed ${tokens.borderStrong}`
            }}
          />
          <Text size="xs" c="dimmed">
            Futuro
          </Text>
        </Group>
      </Group>
    </Box>
  );
};

export default ChallengeGrid;
