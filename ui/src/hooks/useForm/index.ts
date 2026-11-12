import { useState, useCallback, type ChangeEvent, type FormEvent, type FocusEvent } from 'react'

import { getFieldError, getFormErrors } from '@utils/validations'

import type { UseFormOptions, UseFormReturn, FormErrors } from '@hooks/useForm/types'

const useForm = <T extends object>({ initialValues, schema, onSubmit }: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

      setValues((prev) => {
        const next = { ...prev, [name]: fieldValue }
        if (schema && touched[name as keyof T]) {
          setErrors((prevErrors) => ({ ...prevErrors, [name]: getFieldError(schema, next, name as keyof T) }))
        }
        return next
      })
    },
    [touched, schema]
  )

  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))
      if (!schema) return
      setErrors((prev) => ({ ...prev, [name]: getFieldError(schema, { ...values, [name]: value }, name as keyof T) }))
    },
    [schema, values]
  )

  const validateAll = useCallback((): boolean => {
    if (!schema) return true
    const newErrors = getFormErrors(schema, values)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [schema, values])

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault()

      const allTouched = Object.fromEntries(Object.keys(values).map((key) => [key, true])) as Partial<Record<keyof T, boolean>>
      setTouched(allTouched)

      if (!validateAll()) return

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, validateAll, values]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    setFieldValue,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors
  }
}

export default useForm
