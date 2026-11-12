import { Box, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";

import { containerStyle } from "./styles";

export const WorkoutsSkeleton = () => {
  return (
    <Box style={containerStyle} aria-busy="true" aria-label="Carregando treinos">
      <Stack gap="lg">
        <Group justify="space-between">
          <Skeleton height={32} width={180} radius="md" />
          <Skeleton height={36} width={220} radius="md" />
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} height={84} radius="lg" />
          ))}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4, xl: 7 }} spacing="sm">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} height={160} radius="lg" />
          ))}
        </SimpleGrid>
        <Skeleton height={220} radius="lg" />
      </Stack>
    </Box>
  );
};

export default WorkoutsSkeleton;
