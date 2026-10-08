import type {
  CharacterInfo,
  ImcClassification,
  ImcResult,
  WeightRecord,
  SleepRecord,
  SleepQualityOption
} from './types'

export const CHARACTERS: CharacterInfo[] = [
  {
    id: 'spark',
    name: 'Spark',
    title: 'Energia & Vitalidade',
    gradient: { from: 'indigo', to: 'cyan' }
  },
  {
    id: 'athlete',
    name: 'Atlas',
    title: 'Força & Resistência',
    gradient: { from: 'teal', to: 'lime' }
  },
  {
    id: 'zen',
    name: 'Luna',
    title: 'Equilíbrio & Mente',
    gradient: { from: 'grape', to: 'violet' }
  },
  {
    id: 'cyber',
    name: 'Neo',
    title: 'Foco & Performance',
    gradient: { from: 'cyan', to: 'blue' }
  }
]

export const getTodayDateString = (): string => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const formatDateDisplay = (dateStr: string): string => {
  const [yyyy, mm, dd] = dateStr.split('-').map(Number)
  if (!yyyy || !mm || !dd) return dateStr
  const date = new Date(yyyy, mm - 1, dd)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export const IMC_TABLE: Record<string, ImcClassification> = {
  underweight: {
    key: 'underweight',
    label: 'Abaixo do peso',
    rangeLabel: '< 18.5',
    color: '#38bdf8',
    badgeVariant: 'primary',
    description: 'Abaixo da faixa saudável de referência da OMS.'
  },
  normal: {
    key: 'normal',
    label: 'Peso saudável',
    rangeLabel: '18.5 - 24.9',
    color: '#10b981',
    badgeVariant: 'success',
    description: 'Peso ideal e saudável para sua altura.'
  },
  overweight: {
    key: 'overweight',
    label: 'Sobrepeso',
    rangeLabel: '25.0 - 29.9',
    color: '#f59e0b',
    badgeVariant: 'warning',
    description: 'Levemente acima da faixa ideal de referência.'
  },
  obesity1: {
    key: 'obesity1',
    label: 'Obesidade Grau I',
    rangeLabel: '30.0 - 34.9',
    color: '#f97316',
    badgeVariant: 'danger',
    description: 'Classificação de obesidade moderada pela OMS.'
  },
  obesity2: {
    key: 'obesity2',
    label: 'Obesidade Grau II / III',
    rangeLabel: '≥ 35.0',
    color: '#ef4444',
    badgeVariant: 'danger',
    description: 'Classificação de obesidade severa pela OMS.'
  }
}

export const calculateImc = (weightKg?: number, heightCm?: number): ImcResult | null => {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return null
  }

  const heightM = heightCm / 100
  const imcRaw = weightKg / (heightM * heightM)
  const imc = Math.round(imcRaw * 10) / 10

  let classification: ImcClassification = IMC_TABLE.normal
  if (imc < 18.5) {
    classification = IMC_TABLE.underweight
  } else if (imc < 25) {
    classification = IMC_TABLE.normal
  } else if (imc < 30) {
    classification = IMC_TABLE.overweight
  } else if (imc < 35) {
    classification = IMC_TABLE.obesity1
  } else {
    classification = IMC_TABLE.obesity2
  }

  const minIdealWeight = Math.round(18.5 * heightM * heightM * 10) / 10
  const maxIdealWeight = Math.round(24.9 * heightM * heightM * 10) / 10

  const minRange = 15
  const maxRange = 40
  const positionPercent = Math.min(100, Math.max(0, ((imc - minRange) / (maxRange - minRange)) * 100))

  return {
    imc,
    classification,
    minIdealWeight,
    maxIdealWeight,
    positionPercent
  }
}

export const calculateIdealWaterMl = (
  weightKg?: number,
  age?: number,
  heightCm?: number
): number => {
  const effectiveHeight = heightCm && heightCm > 0 ? heightCm : 170
  const effectiveWeight =
    weightKg && weightKg > 0
      ? weightKg
      : Math.round(22 * Math.pow(effectiveHeight / 100, 2))
  const effectiveAge = age && age > 0 ? age : 25

  let mlPerKg = 35
  if (effectiveAge <= 17) {
    mlPerKg = 40
  } else if (effectiveAge <= 30) {
    mlPerKg = 38
  } else if (effectiveAge <= 55) {
    mlPerKg = 35
  } else if (effectiveAge <= 65) {
    mlPerKg = 30
  } else {
    mlPerKg = 28
  }

  const baseMl = effectiveWeight * mlPerKg
  const heightAdjustment = (effectiveHeight - 170) * 8
  const idealMl = Math.max(1500, Math.round((baseMl + heightAdjustment) / 50) * 50)
  return idealMl
}

export const calculateDailyWaterGoal = (
  weightKg?: number,
  extraBottles = 0,
  customBottleMl = 500,
  customTargetBottles?: number,
  age?: number,
  heightCm?: number
): {
  targetMl: number
  targetBottles: number
  standardBottles: number
  bottleMl: number
  idealDailyMl: number
} => {
  const bottleMl = customBottleMl > 0 ? customBottleMl : 500
  const idealDailyMl = calculateIdealWaterMl(weightKg, age, heightCm)
  const calculatedStandard = Math.max(1, Math.ceil(idealDailyMl / bottleMl))
  const standardBottles =
    customTargetBottles && customTargetBottles > 0
      ? customTargetBottles
      : calculatedStandard
  const targetBottles = standardBottles + extraBottles
  const targetMl = targetBottles * bottleMl

  return {
    targetMl,
    targetBottles,
    standardBottles,
    bottleMl,
    idealDailyMl
  }
}

export const sortWeightRecords = (records: WeightRecord[]): WeightRecord[] => {
  return [...records].sort((a, b) => a.date.localeCompare(b.date))
}

export const SLEEP_QUALITY_OPTIONS: SleepQualityOption[] = [
  { value: 1, emoji: '😫', label: 'Muito ruim', color: '#f87171' },
  { value: 2, emoji: '🙁', label: 'Ruim', color: '#fb923c' },
  { value: 3, emoji: '😐', label: 'Regular', color: '#facc15' },
  { value: 4, emoji: '🙂', label: 'Bom', color: '#38bdf8' },
  { value: 5, emoji: '😴', label: 'Muito bom', color: '#c084fc' }
]

export const getSleepQualityOption = (quality?: number): SleepQualityOption => {
  const rounded = Math.min(5, Math.max(1, Math.round(quality || 3)))
  return (
    SLEEP_QUALITY_OPTIONS.find((opt) => opt.value === rounded) ||
    SLEEP_QUALITY_OPTIONS[2]
  )
}

export const sortSleepRecords = (records: SleepRecord[]): SleepRecord[] => {
  return [...records].sort((a, b) => a.date.localeCompare(b.date))
}

export const getSleepStatus = (hours: number): {
  label: string
  color: string
  description: string
} => {
  if (hours < 6) {
    return {
      label: 'Pouco sono',
      color: '#f87171',
      description: 'Abaixo da faixa recomendada de descanso (7h a 9h).'
    }
  }
  if (hours < 7) {
    return {
      label: 'Sono moderado',
      color: '#fb923c',
      description: 'Próximo da meta recomendada (7h a 9h).'
    }
  }
  if (hours <= 9) {
    return {
      label: 'Sono ideal',
      color: '#4ade80',
      description: 'Dentro da faixa recomendada pela OMS (7h a 9h).'
    }
  }
  return {
    label: 'Sono prolongado',
    color: '#38bdf8',
    description: 'Descanso acima de 9 horas.'
  }
}
