import { Paper, Title, Text, Box } from "@mantine/core";

import type { CardProps } from "./types";
import { tokens } from "@styles/theme";

export const CardHeader = ({ children, className, ...props }: CardProps) => {
  return (
    <Box mb="md" pb="xs" className={className} style={{ borderBottom: `1px solid ${tokens.border}` }} {...props}>
      {children}
    </Box>
  );
};

export const CardTitle = ({ children, className, ...props }: CardProps) => {
  return (
    <Title order={4} fw={600} c={tokens.textPrimary} className={className} {...props}>
      {children}
    </Title>
  );
};

export const CardDescription = ({ children, className, ...props }: CardProps) => {
  return (
    <Text size="sm" c="dimmed" mt={4} className={className} {...props}>
      {children}
    </Text>
  );
};

export const CardContent = ({ children, className, ...props }: CardProps) => {
  return (
    <Box className={className} {...props}>
      {children}
    </Box>
  );
};

export const CardFooter = ({ children, className, ...props }: CardProps) => {
  return (
    <Box mt="md" pt="xs" className={className} style={{ borderTop: `1px solid ${tokens.border}` }} {...props}>
      {children}
    </Box>
  );
};

export const Card = ({ children, className, p = { base: "md", sm: "lg" }, ...props }: CardProps) => {
  return (
    <Paper
      p={p}
      radius="lg"
      withBorder
      bg={tokens.surface}
      className={className}
      style={{ borderColor: tokens.border }}
      {...props}
    >
      {children}
    </Paper>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
