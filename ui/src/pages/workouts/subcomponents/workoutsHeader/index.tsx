import { Group, Stack, Text, Title } from "@mantine/core";
import { TbPlus, TbBolt } from "react-icons/tb";

import Button from "@components/button";

import useWorkoutsPage from "../../hook";
import { titleStyle } from "./styles";

export const WorkoutsHeader = () => {
  const { todayKey, openRoutineForm, openSessionModal } = useWorkoutsPage();

  return (
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={2}>
        <Title order={2} c="white" style={titleStyle}>
          Treinos
        </Title>
        <Text size="sm" c="dimmed">
          Monte sua semana, marque se foi e acompanhe a constância.
        </Text>
      </Stack>
      <Group gap="sm">
        <Button
          variant="secondary"
          leftIcon={<TbBolt size={16} />}
          onClick={() => openSessionModal({ date: todayKey })}
        >
          Treino avulso
        </Button>
        <Button leftIcon={<TbPlus size={16} />} onClick={() => openRoutineForm("new")}>
          Nova rotina
        </Button>
      </Group>
    </Group>
  );
};

export default WorkoutsHeader;
