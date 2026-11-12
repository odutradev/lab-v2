import { useState } from "react";
import { ActionIcon, Badge, Box, Group, Menu, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { TbDots, TbPencil, TbTrash, TbPlayerPause, TbPlayerPlay, TbTemplate } from "react-icons/tb";

import Card from "@components/card";
import Modal from "@components/modal";
import { formatWeekDays } from "@utils/functions/workouts";

import useWorkoutsPage from "../../hook";
import ModalityIcon from "../modalityIcon";
import { routineCardStyle, templateCardStyle } from "./styles";
import type { RoutineRemovalState } from "./types";

export const RoutineList = () => {
  const {
    routines,
    catalog,
    findModality,
    openRoutineForm,
    handleRemoveRoutine,
    handleToggleRoutineActive,
    handleApplyTemplate
  } = useWorkoutsPage();
  const [removal, setRemoval] = useState<RoutineRemovalState>({ routine: null, isRemoving: false });
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null);

  const handleConfirmRemove = async () => {
    if (!removal.routine) return;
    setRemoval((current) => ({ ...current, isRemoving: true }));
    await handleRemoveRoutine(removal.routine);
    setRemoval({ routine: null, isRemoving: false });
  };

  const handleTemplateClick = async (templateId: string) => {
    setApplyingTemplateId(templateId);
    await handleApplyTemplate(templateId);
    setApplyingTemplateId(null);
  };

  return (
    <Stack gap="sm" component="section" aria-label="Rotinas de treino">
      <Title order={4} c="white">
        Minhas rotinas
      </Title>

      {routines.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {routines.map((routine) => (
            <Box key={routine.id} p="md" style={routineCardStyle(routine.isActive)}>
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <ModalityIcon modalityId={routine.modalityId} size={22} />
                  <Box miw={0}>
                    <Text fw={600} c="white" truncate>
                      {routine.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {findModality(routine.modalityId)?.name} · {formatWeekDays(routine.weekDays)}
                    </Text>
                  </Box>
                </Group>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" aria-label={`Opções da rotina ${routine.name}`}>
                      <TbDots size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<TbPencil size={16} />} onClick={() => openRoutineForm(routine)}>
                      Editar
                    </Menu.Item>
                    <Menu.Item
                      leftSection={routine.isActive ? <TbPlayerPause size={16} /> : <TbPlayerPlay size={16} />}
                      onClick={() => handleToggleRoutineActive(routine)}
                    >
                      {routine.isActive ? "Pausar" : "Reativar"}
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<TbTrash size={16} />}
                      onClick={() => setRemoval({ routine, isRemoving: false })}
                    >
                      Excluir
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <Group gap={6} mt="sm">
                {!routine.isActive && (
                  <Badge size="sm" variant="light" color="gray">
                    Pausada
                  </Badge>
                )}
                {routine.exercises.length > 0 && (
                  <Badge size="sm" variant="light" color="indigo">
                    {routine.exercises.length} exercícios
                  </Badge>
                )}
                {routine.durationMinutes && (
                  <Badge size="sm" variant="light" color="cyan">
                    {routine.durationMinutes} min
                  </Badge>
                )}
                {routine.distanceKm && (
                  <Badge size="sm" variant="light" color="teal">
                    {routine.distanceKm} km
                  </Badge>
                )}
              </Group>

              {routine.exercises.length > 0 && (
                <Text size="xs" c="dimmed" mt="xs" lineClamp={2}>
                  {routine.exercises.map((exercise) => exercise.name).join(" · ")}
                </Text>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Card p={{ base: "md", sm: "lg" }}>
        <Group gap="xs" mb="sm">
          <TbTemplate size={18} aria-hidden="true" />
          <Text fw={600} c="white">
            {routines.length > 0 ? "Adicionar um modelo pronto" : "Comece com um modelo pronto"}
          </Text>
        </Group>
        <Text size="sm" c="dimmed" mb="md">
          Os modelos criam as rotinas de musculação com dias e exercícios sugeridos. Depois é só ajustar.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {(catalog?.templates || []).map((template) => (
            <UnstyledButton
              key={template.id}
              p="sm"
              style={templateCardStyle}
              disabled={applyingTemplateId !== null}
              aria-label={`Aplicar modelo ${template.name}`}
              onClick={() => handleTemplateClick(template.id)}
            >
              <Text size="sm" fw={600} c="white">
                {applyingTemplateId === template.id ? "Aplicando..." : template.name}
              </Text>
              <Text size="xs" c="dimmed">
                {template.routines.map((routine) => routine.name).join(" · ")}
              </Text>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Card>

      <Modal
        opened={removal.routine !== null}
        onClose={() => !removal.isRemoving && setRemoval({ routine: null, isRemoving: false })}
        type="confirm"
        variant="danger"
        title="Excluir rotina"
        description={`A rotina "${removal.routine?.name}" será removida. Os treinos já feitos continuam no histórico.`}
        confirmText="Excluir"
        onConfirm={handleConfirmRemove}
        isConfirmLoading={removal.isRemoving}
      />
    </Stack>
  );
};

export default RoutineList;
