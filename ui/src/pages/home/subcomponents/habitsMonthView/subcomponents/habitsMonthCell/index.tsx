import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Group, Stack, Text, Box, Popover, ScrollArea, alpha } from "@mantine/core";
import { TbCheck, TbCircle } from "react-icons/tb";

import Badge from "@components/badge";

import type { DaySummaryItem } from "@actions/habits/types";
import type { HabitsMonthCellProps } from "./types";
import { colors, tokens } from "@styles/theme";

const itemGap = 2;
const defaultItemHeight = 22;
const moreIndicatorHeight = 16;
const EMPTY_ITEMS: DaySummaryItem[] = [];

export const HabitsMonthCell = ({
  cell,
  summary,
  isSelected,
  onSelectDate,
  onToggleCheckin,
  onEditItem
}: HabitsMonthCellProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const items = summary?.items ?? EMPTY_ITEMS;
  const totalHabits = summary?.totalHabits ?? 0;
  const completionRate = summary?.completionRate ?? 0;

  const [availableHeight, setAvailableHeight] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.max(50, Math.floor((window.innerHeight - 320) / 6));
    }
    return 80;
  });

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setAvailableHeight((prev) => (Math.abs(prev - height) > 2 ? height : prev));
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { visibleItems, remainingCount } = useMemo(() => {
    if (items.length === 0) {
      return { visibleItems: [], remainingCount: 0 };
    }

    const itemHeight = typeof window !== "undefined" && window.innerWidth < 768 ? 20 : defaultItemHeight;

    // Altura necessária se renderizarmos todos os itens sem o indicador
    const heightNeededForAll = items.length * itemHeight + (items.length - 1) * itemGap;

    // Se cabem todos os itens no espaço disponível, exibe todos sem o chip
    if (heightNeededForAll <= availableHeight) {
      return { visibleItems: items, remainingCount: 0 };
    }

    // Se não cabem todos, reserva espaço para o indicador "+X mais"
    const availableForItems = availableHeight - moreIndicatorHeight - itemGap;
    const maxItems = Math.floor((availableForItems + itemGap) / (itemHeight + itemGap));
    const count = Math.max(1, Math.min(items.length - 1, maxItems));

    return {
      visibleItems: items.slice(0, count),
      remainingCount: items.length - count
    };
  }, [items, availableHeight]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsPopoverOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsPopoverOpen(false);
    }, 200);
  };

  const handleTogglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsPopoverOpen((prev) => !prev);
  };

  const hiddenItems = useMemo(() => items.slice(visibleItems.length), [items, visibleItems.length]);

  return (
    <Box
      p={{ base: "3px", sm: "5px" }}
      style={{
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
        background: isSelected
          ? alpha(colors.indigo500, 0.14)
          : cell.isToday
            ? alpha(colors.indigo500, 0.06)
            : cell.isCurrentMonth
              ? tokens.surfaceSubtle
              : alpha(colors.black, 0.25),
        border: isSelected
          ? `1px solid ${alpha(colors.indigo400, 0.6)}`
          : cell.isToday
            ? `1px solid ${alpha(colors.indigo400, 0.35)}`
            : `1px solid ${tokens.border}`,
        borderRadius: 8,
        opacity: cell.isCurrentMonth ? 1 : 0.45,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.15s ease"
      }}
      onClick={() => onSelectDate(cell.date)}
    >
      <Group
        justify="space-between"
        align="center"
        mb={{ base: "2px", sm: "4px" }}
        gap={2}
        wrap="nowrap"
        style={{ minWidth: 0, width: "100%" }}
      >
        <Box
          w={{ base: 18, sm: 22 }}
          h={{ base: 18, sm: 22 }}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: cell.isToday ? colors.indigo500 : "transparent",
            color: cell.isToday ? colors.white : cell.isCurrentMonth ? colors.gray100 : colors.gray400,
            fontWeight: cell.isToday ? 700 : 600,
            fontSize: 10
          }}
        >
          {cell.dayNumber}
        </Box>

        {totalHabits > 0 && (
          <Badge
            variant={completionRate === 100 ? "success" : completionRate >= 80 ? "primary" : "warning"}
            size="xs"
            style={{
              flexShrink: 0,
              padding: "0 3px",
              height: 15,
              fontSize: 9,
              lineHeight: "15px",
              fontWeight: 700
            }}
          >
            {completionRate}%
          </Badge>
        )}
      </Group>

      <Stack ref={containerRef} gap={itemGap} style={{ flex: 1, overflow: "hidden", minWidth: 0, width: "100%" }}>
        {visibleItems.map((item) => {
          const isReadOnly = !!item.readOnly;
          const itemColor = item.calendarColor || colors.indigo500;

          return (
            <Box
              key={item.habitId}
              px={{ base: "2px", sm: "4px" }}
              py={{ base: "2px", sm: "3px" }}
              title={`${item.title}${item.calendarName ? ` • ${item.calendarName}` : ""}${isReadOnly ? " (Somente visualização)" : ""}${item.startTime ? ` (${item.startTime}${item.endTime ? ` - ${item.endTime}` : ""})` : ""}`}
              style={{
                background: item.completed
                  ? alpha(colors.teal400, 0.14)
                  : isReadOnly
                    ? `${itemColor}22`
                    : alpha(colors.indigo500, 0.14),
                borderRadius: 4,
                border: item.completed
                  ? `1px solid ${alpha(colors.teal400, 0.25)}`
                  : isReadOnly
                    ? `1px solid ${itemColor}44`
                    : `1px solid ${alpha(colors.indigo500, 0.2)}`,
                fontSize: 10,
                lineHeight: 1.2,
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                flexShrink: 0,
                cursor: isReadOnly ? "default" : "pointer"
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isReadOnly && onEditItem) {
                  onEditItem(item.habitId, cell.date);
                }
              }}
            >
              <Group gap={3} wrap="nowrap" align="center" style={{ minWidth: 0, width: "100%", overflow: "hidden" }}>
                {isReadOnly ? (
                  <Box
                    w={6}
                    h={6}
                    style={{
                      borderRadius: "50%",
                      backgroundColor: itemColor,
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCheckin(item.habitId, cell.date);
                    }}
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    {item.completed ? (
                      <TbCheck size={11} color={colors.teal400} style={{ flexShrink: 0 }} />
                    ) : (
                      <TbCircle size={11} color={colors.indigo400} style={{ flexShrink: 0 }} />
                    )}
                  </Box>
                )}
                {item.startTime && (
                  <Box visibleFrom="sm" style={{ flexShrink: 0 }}>
                    <Text
                      size="9px"
                      fw={600}
                      c={item.completed ? "dimmed" : colors.blue300}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {item.startTime}
                    </Text>
                  </Box>
                )}
                <Text
                  size="10px"
                  fw={500}
                  c={item.completed ? "dimmed" : "white"}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textDecoration: item.completed ? "line-through" : "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {item.title}
                </Text>
              </Group>
            </Box>
          );
        })}

        {remainingCount > 0 && (
          <Popover
            opened={isPopoverOpen}
            onChange={setIsPopoverOpen}
            position="bottom-start"
            withArrow
            shadow="xl"
            withinPortal
            middlewares={{ flip: true, shift: true }}
          >
            <Popover.Target>
              <Box
                onClick={handleTogglePopover}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                px={{ base: "2px", sm: "4px" }}
                py="1px"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  width: "fit-content",
                  maxWidth: "100%",
                  cursor: "pointer",
                  borderRadius: 4,
                  backgroundColor: isPopoverOpen ? alpha(colors.indigo500, 0.25) : tokens.surfaceHover,
                  border: isPopoverOpen ? `1px solid ${alpha(colors.indigo400, 0.4)}` : "1px solid transparent",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
              >
                <Text
                  size="9px"
                  c={isPopoverOpen ? colors.indigo200 : "dimmed"}
                  fw={600}
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2
                  }}
                >
                  +{remainingCount} mais
                </Text>
              </Box>
            </Popover.Target>

            <Popover.Dropdown
              p={8}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.night800,
                border: `1px solid ${tokens.borderStrong}`,
                borderRadius: 8,
                boxShadow: tokens.shadow,
                minWidth: 210,
                maxWidth: 280
              }}
            >
              <Group
                justify="space-between"
                align="center"
                mb={6}
                pb={4}
                style={{ borderBottom: `1px solid ${tokens.border}` }}
              >
                <Text size="xs" fw={600} c={colors.indigo100}>
                  Hábitos ({hiddenItems.length})
                </Text>
                <Text size="10px" c="dimmed">
                  Dia {cell.dayNumber}
                </Text>
              </Group>

              <ScrollArea.Autosize mah={220} offsetScrollbars>
                <Stack gap={4}>
                  {hiddenItems.map((item) => {
                    const isReadOnly = !!item.readOnly;
                    const itemColor = item.calendarColor || colors.indigo500;

                    return (
                      <Box
                        key={item.habitId}
                        px={6}
                        py={4}
                        title={`${item.title}${item.calendarName ? ` • ${item.calendarName}` : ""}${isReadOnly ? " (Somente visualização)" : ""}${item.startTime ? ` (${item.startTime}${item.endTime ? ` - ${item.endTime}` : ""})` : ""}`}
                        style={{
                          background: item.completed
                            ? alpha(colors.teal400, 0.14)
                            : isReadOnly
                              ? `${itemColor}22`
                              : alpha(colors.indigo500, 0.14),
                          borderRadius: 6,
                          border: item.completed
                            ? `1px solid ${alpha(colors.teal400, 0.3)}`
                            : isReadOnly
                              ? `1px solid ${itemColor}44`
                              : `1px solid ${alpha(colors.indigo500, 0.25)}`,
                          cursor: isReadOnly ? "default" : "pointer",
                          transition: "background-color 0.15s ease"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isReadOnly && onEditItem) {
                            onEditItem(item.habitId, cell.date);
                          }
                        }}
                      >
                        <Group gap={6} wrap="nowrap" align="center">
                          {isReadOnly ? (
                            <Box
                              w={8}
                              h={8}
                              style={{
                                borderRadius: "50%",
                                backgroundColor: itemColor,
                                flexShrink: 0
                              }}
                            />
                          ) : (
                            <Box
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCheckin(item.habitId, cell.date);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                flexShrink: 0
                              }}
                            >
                              {item.completed ? (
                                <TbCheck size={13} color={colors.teal400} style={{ flexShrink: 0 }} />
                              ) : (
                                <TbCircle size={13} color={colors.indigo400} style={{ flexShrink: 0 }} />
                              )}
                            </Box>
                          )}

                          {item.startTime && (
                            <Text
                              size="10px"
                              fw={600}
                              c={item.completed ? "dimmed" : colors.blue300}
                              style={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
                            >
                              {item.startTime}
                            </Text>
                          )}

                          <Text
                            size="11px"
                            fw={500}
                            c={item.completed ? "dimmed" : "white"}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              textDecoration: item.completed ? "line-through" : "none",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {item.title}
                          </Text>
                        </Group>
                      </Box>
                    );
                  })}
                </Stack>
              </ScrollArea.Autosize>
            </Popover.Dropdown>
          </Popover>
        )}
      </Stack>
    </Box>
  );
};

export default HabitsMonthCell;
