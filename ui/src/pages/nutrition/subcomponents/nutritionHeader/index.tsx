import { Badge } from "@mantine/core";

import PageHeader from "@components/pageHeader";
import SegmentedControl from "@components/segmentedControl";
import { goalLabels } from "@utils/functions/nutrition";

import useNutritionPage from "../../hook";
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
    <PageHeader
      title="Dieta"
      badge={profile && <Badge color="indigo">{goalLabels[profile.goal]}</Badge>}
      description={
        profileData?.targets
          ? `Meta diária de ${profileData.targets.calories.toLocaleString("pt-BR")} kcal`
          : "Configure suas metas para começar."
      }
      actions={
        profile && (
          <SegmentedControl
            value={activeTab}
            onChange={(value) => setActiveTab(value as NutritionTab)}
            data={tabOptions}
          />
        )
      }
    />
  );
};

export default NutritionHeader;
