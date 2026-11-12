// Inputs numéricos do Mantine devolvem string vazia quando o campo é limpo.
export const toOptionalNumber = (value: string | number): number | undefined =>
  typeof value === "number" ? value : undefined;
