import { Group, Text, Box, Tooltip } from "@mantine/core";
import { TbChevronLeft, TbChevronRight, TbPlus, TbSettings, TbMaximize, TbMinimize } from "react-icons/tb";

import Button from "@components/button";
import ActionIcon from "@components/actionIcon";
import SegmentedControl from "@components/segmentedControl";

import type { HabitsCalendarToolbarProps } from "./types";
import type { CalendarViewMode } from "../../types";
import { tokens } from "@styles/theme";

const toolbarControlHeight = 34;

const viewModeOptions = [
  { label: "Diário", value: "day" },
  { label: "Semanal", value: "week" },
  { label: "Mensal", value: "month" }
];

export const HabitsCalendarToolbar = ({
  headerTitle,
  viewMode,
  isToday,
  isMaximized = false,
  onToggleMaximize,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  onOpenNewHabitModal,
  onOpenSettingsModal
}: HabitsCalendarToolbarProps) => {
  return (
    <Box
      pb="md"
      style={{
        borderBottom: `1px solid ${tokens.border}`,
        width: "100%",
        minWidth: 0,
        rowGap: 8
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xs" style={{ width: "100%", minWidth: 0 }}>
        <Group gap="xs" align="center" wrap="nowrap" style={{ minWidth: 0, flexShrink: 1, overflow: "hidden" }}>
          <Button
            variant={isToday ? "outline" : "secondary"}
            size="sm"
            h={toolbarControlHeight}
            onClick={onToday}
            style={{ flexShrink: 0 }}
          >
            Hoje
          </Button>

          <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
            <ActionIcon
              variant="subtle"
              size="md"
              h={toolbarControlHeight}
              w={toolbarControlHeight}
              radius="md"
              onClick={onPrevious}
              aria-label="Período anterior"
            >
              <TbChevronLeft size={18} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              size="md"
              h={toolbarControlHeight}
              w={toolbarControlHeight}
              radius="md"
              onClick={onNext}
              aria-label="Próximo período"
            >
              <TbChevronRight size={18} />
            </ActionIcon>
          </Group>

          <Text
            fw={600}
            size="md"
            c={tokens.textPrimary}
            ml={4}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0
            }}
          >
            {headerTitle}
          </Text>
        </Group>

        <Group gap="xs" align="center" wrap="wrap" style={{ flexShrink: 1, minWidth: 0 }}>
          <Box style={{ flexShrink: 0 }}>
            <SegmentedControl
              value={viewMode}
              onChange={(val) => onViewModeChange(val as CalendarViewMode)}
              data={viewModeOptions}
              size="sm"
              height={toolbarControlHeight}
              radius="md"
            />
          </Box>

          <Tooltip label="Configurar agendas" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              size="md"
              h={toolbarControlHeight}
              w={toolbarControlHeight}
              radius="md"
              onClick={onOpenSettingsModal}
              aria-label="Configurar agendas"
              style={{ flexShrink: 0 }}
            >
              <TbSettings size={18} />
            </ActionIcon>
          </Tooltip>

          {onToggleMaximize && (
            <Tooltip
              label={isMaximized ? "Restaurar visualização (Esc)" : "Maximizar calendário (Modo foco)"}
              withArrow
              position="bottom"
            >
              <ActionIcon
                variant={isMaximized ? "secondary" : "subtle"}
                size="md"
                h={toolbarControlHeight}
                w={toolbarControlHeight}
                radius="md"
                onClick={onToggleMaximize}
                aria-label={isMaximized ? "Restaurar visualização" : "Maximizar calendário"}
                style={{ flexShrink: 0 }}
              >
                {isMaximized ? <TbMinimize size={18} /> : <TbMaximize size={18} />}
              </ActionIcon>
            </Tooltip>
          )}

          <Button
            variant="primary"
            size="sm"
            h={toolbarControlHeight}
            leftIcon={<TbPlus size={16} />}
            onClick={onOpenNewHabitModal}
            style={{ flexShrink: 0 }}
          >
            Novo item
          </Button>
        </Group>
      </Group>
    </Box>
  );
};

export default HabitsCalendarToolbar;
