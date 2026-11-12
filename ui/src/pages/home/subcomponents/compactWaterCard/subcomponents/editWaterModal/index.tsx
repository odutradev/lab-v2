import { useState } from "react";
import { Box, Group, Stack, Text, UnstyledButton, alpha } from "@mantine/core";
import { TbBottle, TbSparkles } from "react-icons/tb";

import Modal from "@components/modal";
import Input from "@components/input";
import Button from "@components/button";
import { calculateIdealWaterMl } from "@utils/functions/health";

import type { EditWaterModalProps } from "./types";
import { colors, tokens } from "@styles/theme";

const presetBottleSizes = [500, 600, 750, 1000];

interface EditWaterFormProps {
  currentWeight?: number;
  currentAge?: number;
  currentHeight?: number;
  currentBottleMl: number;
  onClose: () => void;
  onSave: (settings: { bottleMl: number }) => void;
}

const EditWaterForm = ({
  currentWeight,
  currentAge,
  currentHeight,
  currentBottleMl,
  onClose,
  onSave
}: EditWaterFormProps) => {
  const [bottleMl, setBottleMl] = useState<number>(currentBottleMl || 500);

  const idealDailyMl = calculateIdealWaterMl(currentWeight, currentAge, currentHeight);
  const automaticBottles = Math.max(1, Math.ceil(idealDailyMl / (bottleMl || 500)));

  const totalDailyMl = bottleMl * automaticBottles;
  const totalLiters = (totalDailyMl / 1000).toFixed(1);

  const handleSelectSize = (size: number) => {
    setBottleMl(size);
  };

  const handleSave = () => {
    const validMl = Math.max(50, Math.min(3000, Number(bottleMl) || 500));
    onSave({ bottleMl: validMl });
    onClose();
  };

  return (
    <Stack gap="md">
      <Box
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: alpha(colors.sky400, 0.08),
          border: `1px solid ${alpha(colors.sky400, 0.2)}`
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} align="center">
            <TbSparkles size={14} color={colors.sky400} />
            <Text size="11px" fw={600} c={colors.sky400}>
              Cálculo Automático por Perfil
            </Text>
          </Group>
          <Text size="10px" c="dimmed">
            {currentWeight ? `${currentWeight}kg` : "--"} • {currentAge ? `${currentAge} anos` : "--"} •{" "}
            {currentHeight ? `${currentHeight}cm` : "--"}
          </Text>
        </Group>

        <Group justify="space-between" align="baseline" mt={4}>
          <Text size="xs" c="dimmed">
            Necessidade ideal:
          </Text>
          <Text size="xs" fw={600} c={tokens.textPrimary}>
            {idealDailyMl.toLocaleString()}ml / dia
          </Text>
        </Group>
      </Box>

      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Volume por garrafa (ml)
        </Text>
        <Input
          type="number"
          value={bottleMl}
          onChange={(e) => {
            const val = Math.max(1, Number(e.target.value));
            setBottleMl(val);
          }}
          min={50}
          max={3000}
          step={50}
          leftIcon={<TbBottle size={16} />}
        />

        <Group gap={6} mt={8}>
          {presetBottleSizes.map((size) => {
            const isSelected = bottleMl === size;
            return (
              <UnstyledButton
                key={size}
                onClick={() => handleSelectSize(size)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  background: isSelected ? alpha(colors.purple500, 0.25) : tokens.surfaceHover,
                  color: isSelected ? colors.purple400 : colors.gray400,
                  border: isSelected ? `1px solid ${alpha(colors.purple500, 0.6)}` : `1px solid ${tokens.border}`,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {size}ml
              </UnstyledButton>
            );
          })}
        </Group>
      </Box>

      <Box
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: alpha(colors.purple500, 0.08),
          border: `1px solid ${alpha(colors.purple500, 0.2)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Text size="xs" c="dimmed">
          Meta calculada:
        </Text>
        <Text size="xs" fw={600} c={colors.purple400}>
          {automaticBottles} garrafas × {bottleMl}ml = {totalDailyMl.toLocaleString()}ml ({totalLiters}L)
        </Text>
      </Box>

      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          Salvar
        </Button>
      </Group>
    </Stack>
  );
};

export const EditWaterModal = ({
  opened,
  onClose,
  currentWeight,
  currentAge,
  currentHeight,
  currentBottleMl,
  onSave
}: EditWaterModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Configurar Garrafa"
      description="Informe o tamanho da sua garrafa. A meta de garrafas diárias é calculada automaticamente para o seu corpo."
      variant="indigo"
      size="sm"
    >
      {opened && (
        <EditWaterForm
          currentWeight={currentWeight}
          currentAge={currentAge}
          currentHeight={currentHeight}
          currentBottleMl={currentBottleMl}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
};

export default EditWaterModal;
