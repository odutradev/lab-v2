import { ActionIcon, Badge, Box, Group, SimpleGrid, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { tokens } from "@styles/theme";
import { TbCheck, TbX, TbArrowBackUp, TbChevronLeft, TbChevronRight } from "react-icons/tb";

import {
  weekDayLongLabels,
  getWeekDay,
  formatShortDate,
  getPlannedRoutines,
  findRoutineSession,
  getExtraSessions,
  getWeekStart
} from "@utils/functions/workouts";

import SectionHeader from "@components/sectionHeader";

import useWorkoutsPage from "../../hook";
import ModalityIcon from "../modalityIcon";
import { dayCardStyle, itemStyle } from "./styles";
import type { PlannedItem } from "./types";

export const WeekPlanner = () => {
  const {
    routines,
    sessions,
    weekDates,
    weekStart,
    todayKey,
    findModality,
    handleChangeWeek,
    handleQuickCheckin,
    handleUndoSession,
    openSessionModal
  } = useWorkoutsPage();

  const isCurrentWeek = weekStart === getWeekStart(todayKey);

  return (
    <Stack gap="sm" component="section" aria-label="Semana de treinos">
      <SectionHeader
        title={
          isCurrentWeek
            ? "Esta semana"
            : `Semana de ${formatShortDate(weekDates[0])} a ${formatShortDate(weekDates[6])}`
        }
        description="Toque em ✓ quando treinar ou em ✕ quando faltar."
        actions={
          <>
            <ActionIcon variant="subtle" color="gray" aria-label="Semana anterior" onClick={() => handleChangeWeek(-1)}>
              <TbChevronLeft size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" aria-label="Próxima semana" onClick={() => handleChangeWeek(1)}>
              <TbChevronRight size={18} />
            </ActionIcon>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4, xl: 7 }} spacing="sm">
        {weekDates.map((dateKey) => {
          const isToday = dateKey === todayKey;
          const isFuture = dateKey > todayKey;
          const plannedItems: PlannedItem[] = getPlannedRoutines(routines, dateKey).map((routine) => ({
            routine,
            session: findRoutineSession(sessions, routine.id, dateKey)
          }));
          const extraSessions = getExtraSessions(sessions, dateKey);
          const isRestDay = plannedItems.length === 0 && extraSessions.length === 0;

          return (
            <Box key={dateKey} p="sm" style={dayCardStyle(isToday)}>
              <Group justify="space-between" mb="xs" wrap="nowrap">
                <Text size="sm" fw={600} c={tokens.textPrimary}>
                  {weekDayLongLabels[getWeekDay(dateKey)]}
                </Text>
                {isToday ? (
                  <Badge size="xs" variant="light" color="indigo">
                    Hoje
                  </Badge>
                ) : (
                  <Text size="xs" c="dimmed">
                    {formatShortDate(dateKey)}
                  </Text>
                )}
              </Group>

              <Stack gap={6}>
                {plannedItems.map(({ routine, session }) => (
                  <Box key={routine.id} p="xs" style={itemStyle(session?.status)}>
                    <UnstyledButton
                      w="100%"
                      aria-label={`Detalhes do treino ${routine.name}`}
                      onClick={() => openSessionModal({ date: dateKey, routine, session })}
                      disabled={isFuture}
                    >
                      <Group gap={6} wrap="nowrap">
                        <ModalityIcon modalityId={routine.modalityId} size={16} />
                        <Text size="xs" fw={600} c={tokens.textPrimary} lineClamp={2}>
                          {routine.name}
                        </Text>
                      </Group>
                    </UnstyledButton>

                    {session ? (
                      <Group justify="space-between" mt={6} wrap="nowrap">
                        <Badge size="xs" variant="light" color={session.status === "done" ? "teal" : "red"}>
                          {session.status === "done" ? `Feito · ${session.caloriesBurned} kcal` : "Não fui"}
                        </Badge>
                        <Tooltip label="Desfazer" withArrow>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            aria-label={`Desfazer registro de ${routine.name}`}
                            onClick={() => handleUndoSession(session)}
                          >
                            <TbArrowBackUp size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    ) : (
                      !isFuture && (
                        <Group gap={6} mt={6} grow>
                          <Tooltip label="Fui" withArrow>
                            <ActionIcon
                              variant="light"
                              color="teal"
                              aria-label={`Marcar ${routine.name} como feito`}
                              onClick={() => handleQuickCheckin(routine, dateKey, "done")}
                            >
                              <TbCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Não fui" withArrow>
                            <ActionIcon
                              variant="light"
                              color="red"
                              aria-label={`Marcar ${routine.name} como não realizado`}
                              onClick={() => handleQuickCheckin(routine, dateKey, "missed")}
                            >
                              <TbX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      )
                    )}
                  </Box>
                ))}

                {extraSessions.map((session) => (
                  <UnstyledButton
                    key={session.id}
                    p="xs"
                    style={itemStyle(session.status)}
                    aria-label={`Editar treino avulso ${session.name}`}
                    onClick={() => openSessionModal({ date: dateKey, session })}
                  >
                    <Group gap={6} wrap="nowrap">
                      <ModalityIcon modalityId={session.modalityId} size={16} />
                      <Box miw={0}>
                        <Text size="xs" fw={600} c={tokens.textPrimary} truncate>
                          {session.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {findModality(session.modalityId)?.name} · {session.caloriesBurned} kcal
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                ))}

                {isRestDay && (
                  <Text size="xs" c="dimmed">
                    Descanso
                  </Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};

export default WeekPlanner;
