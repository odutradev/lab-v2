import { Badge, Group, Stack, Text, Title } from "@mantine/core";

import SegmentedControl from "@components/segmentedControl";
import { goalLabels } from "@utils/functions/nutrition";

import useNutritionPage from "../../hook";
import { titleStyle } from "./styles";
import type { NutritionTab } from "@stores/nutrition/types";

const tabOptions: Array<{ value: NutritionTab; label: string }> = [
  { value: "diary", label: "Diário" },
  { value: "plans", label: "Plano" },
  { value: "goals", label: "Metas" },
  { value: "review", label: "Revisão" }
];

export const NutritionHeader = () => {
  const { profileData, activeTab, setActiveTab } = useNutritionPage();
  const profile = profileData?.profile;

  return (
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={2}>
        <Group gap="xs">
          <Title order={2} c="white" style={titleStyle}>
            Dieta
          </Title>
          {profile && (
            <Badge variant="light" color="indigo">
              {goalLabels[profile.goal]}
            </Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed">
          {profileData?.targets
            ? `Meta diária: ${profileData.targets.calories.toLocaleString("pt-BR")} kcal`
            : "Configure suas metas para começar."}
        </Text>
      </Stack>
      {profile && (
        <SegmentedControl
          value={activeTab}
          onChange={(value) => setActiveTab(value as NutritionTab)}
          data={tabOptions}
        />
      )}
    </Group>
  );
};

export default NutritionHeader;
