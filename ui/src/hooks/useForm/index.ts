import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'

import type { UseFormOptions, UseFormReturn } from './types'

const useForm = <T extends object>({
  initialValues,
  validationRules = {},
  onSubmit
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const validator = validationRules[name]
      if (validator) {
        return validator(value, values)
      }
      return undefined
    },
    [validationRules, values]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      const fieldValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

      setValues((prev) => {
        const next = { ...prev, [name]: fieldValue }
        if (touched[name as keyof T]) {
          const error = validationRules[name as keyof T]?.(fieldValue as T[keyof T], next)
          setErrors((prevErrors) => ({ ...prevErrors, [name]: error }))
        }
        return next
      })
    },
    [touched, validationRules]
  )

  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name as keyof T, value as T[keyof T])
      setErrors((prev) => ({ ...prev, [name]: error }))
    },
    [validateField]
  )

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(validationRules).forEach((key) => {
      const fieldKey = key as keyof T
      const validator = validationRules[fieldKey]
      if (validator) {
        const error = validator(values[fieldKey], values)
        if (error) {
          newErrors[fieldKey] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validationRules, values])

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault()

      const allTouched: Partial<Record<keyof T, boolean>> = {}
      Object.keys(values).forEach((key) => {
        allTouched[key as keyof T] = true
      })
      setTouched(allTouched)

      if (!validateAll()) {
        return
      }

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
