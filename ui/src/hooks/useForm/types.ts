import type { ChangeEvent, FormEvent, FocusEvent, Dispatch, SetStateAction } from 'react'
import type { ZodType } from 'zod'

export type FormErrors<T> = Partial<Record<keyof T, string>>

export interface UseFormOptions<T> {
  initialValues: T
  schema?: ZodType<T>
  onSubmit: (values: T) => Promise<void> | void
}

export interface UseFormReturn<T> {
  values: T
  errors: FormErrors<T>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  setFieldValue: (name: keyof T, value: unknown) => void
  handleBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>
  resetForm: () => void
  setErrors: Dispatch<SetStateAction<FormErrors<T>>>
}
