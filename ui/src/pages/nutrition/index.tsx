import { useEffect } from "react";
import { Box, Stack, Text } from "@mantine/core";

import NutritionHeader from "./subcomponents/nutritionHeader";
import SetupWizard from "./subcomponents/setupWizard";
import CustomFoodModal from "./subcomponents/customFoodModal";
import DiaryTab from "./tabs/diary";
import PlansTab from "./tabs/plans";
import GoalsTab from "./tabs/goals";
import ReviewTab from "./tabs/review";
import NutritionSkeleton from "./skeleton";
import { containerStyle } from "./styles";
import useNutritionPage from "./hook";

export const NutritionPage = () => {
  const { isLoading, profileData, activeTab, loadPage } = useNutritionPage();

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  if (isLoading) return <NutritionSkeleton />;

  return (
    <Box style={containerStyle}>
      <Stack gap="lg">
        <NutritionHeader />
        {!profileData?.profile ? (
          <SetupWizard />
        ) : (
          <>
            {activeTab === "diary" && <DiaryTab />}
            {activeTab === "plans" && <PlansTab />}
            {activeTab === "goals" && <GoalsTab />}
            {activeTab === "review" && <ReviewTab />}
          </>
        )}
        <Text size="xs" c="dimmed" ta="center">
          Metas estimadas pela fórmula de Mifflin-St Jeor e valores nutricionais de referência da tabela TACO. Não
          substitui o acompanhamento de um nutricionista.
        </Text>
      </Stack>
      <CustomFoodModal />
    </Box>
  );
};

export default NutritionPage;
