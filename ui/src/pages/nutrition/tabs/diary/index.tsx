import { ActionIcon, Button as MantineButton, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

import { formatDisplayDate } from "@utils/functions/challenges";

import useNutritionPage from "../../hook";
import DayTotals from "./subcomponents/dayTotals";
import MealCard from "./subcomponents/mealCard";
import AddFoodModal from "./subcomponents/addFoodModal";
import { dateLabelStyle } from "./styles";

export const DiaryTab = () => {
  const { selectedDate, todayKey, mealSections, handleChangeDate } = useNutritionPage();
  const isToday = selectedDate === todayKey;

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <ActionIcon variant="subtle" color="gray" aria-label="Dia anterior" onClick={() => handleChangeDate(-1)}>
          <TbChevronLeft size={18} />
        </ActionIcon>
        <Stack gap={0} align="center">
          <Text fw={700} c="white" style={dateLabelStyle}>
            {isToday ? "Hoje" : formatDisplayDate(selectedDate)}
          </Text>
          {!isToday && (
            <MantineButton variant="subtle" size="compact-xs" onClick={() => handleChangeDate(0)}>
              Voltar para hoje
            </MantineButton>
          )}
        </Stack>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Próximo dia"
          disabled={isToday}
          onClick={() => handleChangeDate(1)}
        >
          <TbChevronRight size={18} />
        </ActionIcon>
      </Group>

      <DayTotals />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {mealSections.map((section) => (
          <MealCard key={section.key} section={section} />
        ))}
      </SimpleGrid>

      <AddFoodModal />
    </Stack>
  );
};

export default DiaryTab;
