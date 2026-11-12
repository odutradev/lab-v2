import { Box, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";

import { containerStyle } from "./styles";

export const NutritionSkeleton = () => {
  return (
    <Box style={containerStyle} aria-busy="true" aria-label="Carregando dieta">
      <Stack gap="lg">
        <Group justify="space-between">
          <Skeleton height={32} width={160} radius="md" />
          <Skeleton height={36} width={320} radius="md" />
        </Group>
        <Skeleton height={180} radius="lg" />
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={140} radius="lg" />
          ))}
        </SimpleGrid>
      </Stack>
    </Box>
  );
};

export default NutritionSkeleton;
