export const isValidCpf = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '')

  if (cleanCpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false

  const digits = Array.from(cleanCpf, Number)

  const firstSum = digits.slice(0, 9).reduce((acc, curr, index) => acc + curr * (10 - index), 0)
  const firstRemainder = firstSum % 11
  const firstDigit = firstRemainder < 2 ? 0 : 11 - firstRemainder
  if (digits[9] !== firstDigit) return false

  const secondSum = digits.slice(0, 10).reduce((acc, curr, index) => acc + curr * (11 - index), 0)
  const secondRemainder = secondSum % 11
  const secondDigit = secondRemainder < 2 ? 0 : 11 - secondRemainder

  return digits[10] === secondDigit
}

export const isValidDateString = (dateStr: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const timestamp = Date.parse(dateStr)
  return !isNaN(timestamp)
}

export const isAfterDate = (startDateStr: string, endDateStr: string): boolean => {
  if (!isValidDateString(startDateStr) || !isValidDateString(endDateStr)) return false
  return new Date(endDateStr).getTime() > new Date(startDateStr).getTime()
}