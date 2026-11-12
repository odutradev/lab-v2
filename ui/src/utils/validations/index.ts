import type { ZodType } from 'zod'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

// Retorna a primeira mensagem de erro de cada campo, na ordem em que o schema valida.
export const getFormErrors = <T>(schema: ZodType<T>, values: unknown): FieldErrors<T> => {
  const result = schema.safeParse(values)
  if (result.success) return {}

  return result.error.issues.reduce<FieldErrors<T>>((errors, issue) => {
    const field = issue.path[0] as keyof T | undefined
    if (field === undefined || errors[field]) return errors
    return { ...errors, [field]: issue.message }
  }, {})
}

export const getFieldError = <T>(schema: ZodType<T>, values: unknown, field: keyof T): string | undefined => {
  return getFormErrors(schema, values)[field]
}
