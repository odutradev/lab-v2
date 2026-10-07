import type {
  CharacterInfo,
  ImcClassification,
  ImcResult,
  WeightRecord
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
    color: '#38bdf8', // ciano
    badgeVariant: 'primary',
    description: 'Abaixo da faixa saudável de referência da OMS.'
  },
  normal: {
    key: 'normal',
    label: 'Peso saudável',
    rangeLabel: '18.5 - 24.9',
    color: '#10b981', // verde/teal
    badgeVariant: 'success',
    description: 'Peso ideal e saudável para sua altura.'
  },
  overweight: {
    key: 'overweight',
    label: 'Sobrepeso',
    rangeLabel: '25.0 - 29.9',
    color: '#f59e0b', // âmbar
    badgeVariant: 'warning',
    description: 'Levemente acima da faixa ideal de referência.'
  },
  obesity1: {
    key: 'obesity1',
    label: 'Obesidade Grau I',
    rangeLabel: '30.0 - 34.9',
    color: '#f97316', // laranja
    badgeVariant: 'danger',
    description: 'Classificação de obesidade moderada pela OMS.'
  },
  obesity2: {
    key: 'obesity2',
    label: 'Obesidade Grau II / III',
    rangeLabel: '≥ 35.0',
    color: '#ef4444', // vermelho
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

  // Faixa de peso ideal (IMC 18.5 a 24.9)
  const minIdealWeight = Math.round(18.5 * heightM * heightM * 10) / 10
  const maxIdealWeight = Math.round(24.9 * heightM * heightM * 10) / 10

  // Medidor visual: mapear IMC de 15 a 40 para 0% a 100%
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

/**
 * Cálculo de meta de hidratação diária:
 * Padrão nutricional: 35 ml por kg de peso corporal.
 * Garrafa padrão: 500 ml.
 */
export const calculateDailyWaterGoal = (
  weightKg?: number,
  extraBottles = 0
): { targetMl: number; targetBottles: number } => {
  const baseMl = weightKg && weightKg > 0 ? Math.round(weightKg * 35) : 2000
  const standardBottles = Math.max(2, Math.ceil(baseMl / 500))
  const targetBottles = standardBottles + extraBottles
  const targetMl = targetBottles * 500

  return {
    targetMl,
    targetBottles
  }
}

export const sortWeightRecords = (records: WeightRecord[]): WeightRecord[] => {
  return [...records].sort((a, b) => a.date.localeCompare(b.date))
}
