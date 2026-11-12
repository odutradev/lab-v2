import { useState, useMemo } from "react";
import { Group, Stack, Progress, Box, Badge as MantineBadge, Text } from "@mantine/core";
import { TbDropletFilled, TbPencil, TbTrophy } from "react-icons/tb";

import Card from "@components/card";
import ActionIcon from "@components/actionIcon";
import useToastStore from "@stores/toast";
import { calculateDailyWaterGoal, getTodayDateString, formatDateDisplay } from "@utils/functions/health";
import { CompactBottleItem, AddBottleButton } from "./subcomponents/compactBottleItem";
import EditWaterModal from "./subcomponents/editWaterModal";

import type { CompactWaterCardProps } from "./types";
import { colors, tokens } from "@styles/theme";

export const CompactWaterCard = ({
  currentWeight,
  currentAge,
  currentHeight,
  consumedBottles,
  extraBottlesTarget,
  bottleMl = 500,
  selectedDate,
  onToggleBottle,
  onAddExtraBottle,
  onRemoveExtraBottle,
  onUpdateSettings
}: CompactWaterCardProps) => {
  const { showToast } = useToastStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const todayStr = getTodayDateString();
  const activeDate = selectedDate || todayStr;
  const isViewingToday = activeDate === todayStr;

  const { targetBottles, standardBottles } = useMemo(() => {
    return calculateDailyWaterGoal(currentWeight, extraBottlesTarget, bottleMl, undefined, currentAge, currentHeight);
  }, [currentWeight, extraBottlesTarget, bottleMl, currentAge, currentHeight]);

  const totalConsumedMl = consumedBottles * bottleMl;
  const standardMl = standardBottles * bottleMl;
  const extraTargetMl = extraBottlesTarget * bottleMl;
  const isGoalReached = totalConsumedMl >= standardMl && standardMl > 0;
  const progressPercent = Math.min(100, Math.round((totalConsumedMl / standardMl) * 100));

  const handleBottleClick = (index: number) => {
    onToggleBottle(index);
    const nextConsumed = (consumedBottles === index + 1 ? index : index + 1) * bottleMl;
    const dateLabel = isViewingToday ? "hoje" : formatDateDisplay(activeDate);
    if (nextConsumed >= standardMl && totalConsumedMl < standardMl) {
      showToast(`🎉 Parabéns! Você bateu a meta de água (${dateLabel})!`, "success");
    }
  };

  const handleAddExtra = () => {
    onAddExtraBottle();
    const dateLabel = isViewingToday ? "hoje" : formatDateDisplay(activeDate);
    showToast(`+1 garrafa (${bottleMl}ml) adicionada à meta (${dateLabel})!`, "info");
  };

  const handleRemoveExtra = () => {
    if (onRemoveExtraBottle) {
      onRemoveExtraBottle();
      const dateLabel = isViewingToday ? "hoje" : formatDateDisplay(activeDate);
      showToast(`Garrafa extra removida da meta (${dateLabel})`, "info");
    }
  };

  const handleSaveSettings = (settings: { bottleMl: number }) => {
    if (onUpdateSettings) {
      onUpdateSettings(settings);
      showToast("Tamanho da garrafa atualizado!", "success");
    }
  };

  return (
    <>
      <Card style={{ padding: "10px 14px" }}>
        <Stack gap={8}>
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap={6} align="center" wrap="wrap">
              <TbDropletFilled size={15} color={colors.purple400} />
              <Text size="xs" fw={700} c="white">
                Água
              </Text>
              <Text size="11px" c="dimmed">
                ({bottleMl}ml)
              </Text>
              <MantineBadge
                size="xs"
                variant="light"
                color={isViewingToday ? "cyan" : "gray"}
              >
                {isViewingToday ? "Hoje" : formatDateDisplay(activeDate)}
              </MantineBadge>
            </Group>

            <Group gap={6} align="center" wrap="wrap">
              {isGoalReached ? (
                <MantineBadge
                  variant="light" color="indigo"
                  size="xs"
                  leftSection={<TbTrophy size={10} />}
                  styles={{ root: { height: 18, padding: "0 6px", fontSize: 10 } }}
                >
                  Meta Atingida!
                </MantineBadge>
              ) : (
                <Text size="11px" c="dimmed" fw={600}>
                  {totalConsumedMl}ml / {standardMl}ml ({progressPercent}%)
                </Text>
              )}

              {extraBottlesTarget > 0 && (
                <Text size="11px" c={colors.purple400} fw={700}>
                  (+{extraTargetMl}ml extra)
                </Text>
              )}

              {onUpdateSettings && (
                <ActionIcon
                  aria-label="Editar configurações de água"
                  variant="subtle"
                  size="xs"
                  onClick={() => setIsEditModalOpen(true)}
                  title="Configurar tamanho da garrafa"
                  style={{ width: 20, height: 20 }}
                >
                  <TbPencil size={12} />
                </ActionIcon>
              )}
            </Group>
          </Group>

          <Progress
            value={progressPercent}
            size="xs"
            radius="xl"
            color="grape"
            animated={false}
            styles={{
              root: {
                backgroundColor: tokens.surfaceHover,
                height: 4
              },
              section: {
                background: colors.purple400,
                transition: "none"
              }
            }}
          />

          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              overflowX: "auto",
              padding: "2px 0",
              scrollbarWidth: "none"
            }}
          >
            {Array.from({ length: targetBottles }).map((_, index) => {
              const isExtra = index >= standardBottles;
              return (
                <CompactBottleItem
                  key={index}
                  index={index}
                  isFilled={index < consumedBottles}
                  isExtra={isExtra}
                  bottleMl={bottleMl}
                  onClick={() => handleBottleClick(index)}
                  onRemove={isExtra ? handleRemoveExtra : undefined}
                />
              );
            })}

            <AddBottleButton bottleMl={bottleMl} onClick={handleAddExtra} />
          </Box>
        </Stack>
      </Card>

      <EditWaterModal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentWeight={currentWeight}
        currentAge={currentAge}
        currentHeight={currentHeight}
        currentBottleMl={bottleMl}
        onSave={handleSaveSettings}
      />
    </>
  );
};

export default CompactWaterCard;
