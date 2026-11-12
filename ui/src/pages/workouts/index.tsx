import { useEffect } from "react";
import { Box, Stack, Text } from "@mantine/core";

import WorkoutsHeader from "./subcomponents/workoutsHeader";
import SummaryStats from "./subcomponents/summaryStats";
import WeekPlanner from "./subcomponents/weekPlanner";
import RoutineList from "./subcomponents/routineList";
import RoutineFormModal from "./subcomponents/routineFormModal";
import SessionModal from "./subcomponents/sessionModal";
import WorkoutsSkeleton from "./skeleton";
import { containerStyle } from "./styles";
import useWorkoutsPage from "./hook";

export const WorkoutsPage = () => {
  const { isLoading, loadPage } = useWorkoutsPage();

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  if (isLoading) return <WorkoutsSkeleton />;

  return (
    <Box style={containerStyle}>
      <Stack gap="lg">
        <WorkoutsHeader />
        <SummaryStats />
        <WeekPlanner />
        <RoutineList />
        <Text size="xs" c="dimmed" ta="center">
          Calorias estimadas pelo método MET (Compendium of Physical Activities) com o seu último peso registrado.
        </Text>
      </Stack>
      <RoutineFormModal />
      <SessionModal />
    </Box>
  );
};

export default WorkoutsPage;
