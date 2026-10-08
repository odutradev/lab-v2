import { useMemo } from 'react'
import { Box, Text, Group } from '@mantine/core'
import {
  TbArrowUpRight,
  TbArrowDownRight,
  TbMinus,
  TbCalendarStats
} from 'react-icons/tb'
import { getTodayDateString, calculateImc } from '@stores/health/utils'
import type { WeightHistoryChartProps } from './types'

// Gera caminho Bézier suave (Catmull-Rom para Bézier cúbico)
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6

    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return d
}

function getPast7Days(todayStr: string) {
  const [yyyy, mm, dd] = todayStr.split('-').map(Number)
  const baseDate = new Date(yyyy, mm - 1, dd, 12, 0, 0)
  const days: {
    date: string
    dayName: string
    shortDate: string
    isToday: boolean
  }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const date = `${y}-${m}-${dayNum}`

    const isToday = i === 0
    const rawName = isToday
      ? 'Hoje'
      : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    const dayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
    const shortDate = `${dayNum}/${m}`

    days.push({
      date,
      dayName,
      shortDate,
      isToday
    })
  }

  return days
}

export const WeightHistoryChart = ({
  records,
  height: heightCm,
  onStartTodayCheckin
}: WeightHistoryChartProps) => {
  const todayStr = getTodayDateString()

  const {
    daySlots,
    todaySlot,
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    weightPathD,
    weightAreaD,
    imcPathD,
    imcAreaD,
    hasAnyRecords
  } = useMemo(() => {
    const pastDays = getPast7Days(todayStr)
    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date))
    const effectiveHeight = heightCm && heightCm > 0 ? heightCm : 170

    // Calcula os 7 slots diários com Peso e IMC e suas variações
    const slots = pastDays.map((slot, index) => {
      const record = sortedRecords.find((r) => r.date === slot.date)

      let diffWeight: number | null = null
      let diffImc: number | null = null
      let imcValue: number | null = null
      let imcCategory: string | null = null

      if (record) {
        const calculated = calculateImc(record.weight, effectiveHeight)
        if (calculated) {
          imcValue = calculated.imc
          imcCategory = calculated.classification.label
        }

        const priorRecords = sortedRecords.filter((r) => r.date < slot.date)
        if (priorRecords.length > 0) {
          const prev = priorRecords[priorRecords.length - 1]
          diffWeight = Math.round((record.weight - prev.weight) * 10) / 10

          const prevImcResult = calculateImc(prev.weight, effectiveHeight)
          if (prevImcResult && imcValue !== null) {
            diffImc = Math.round((imcValue - prevImcResult.imc) * 10) / 10
          }
        }
      }

      return {
        ...slot,
        index,
        record,
        weight: record ? record.weight : null,
        imc: imcValue,
        imcCategory,
        diffWeight,
        diffImc
      }
    })

    const weightsWithValues = slots
      .map((s) => s.weight)
      .filter((w): w is number => w !== null)
    const imcsWithValues = slots
      .map((s) => s.imc)
      .filter((v): v is number => v !== null)

    const allHistoryWeights = sortedRecords.map((r) => r.weight)
    const combinedWeights = weightsWithValues.length > 0 ? weightsWithValues : allHistoryWeights

    const minW = combinedWeights.length > 0 ? Math.min(...combinedWeights) : 70
    const maxW = combinedWeights.length > 0 ? Math.max(...combinedWeights) : 70
    const padW = Math.max(0.6, (maxW - minW) * 0.25 || 1.2)
    const chartMinW = Math.floor((minW - padW) * 10) / 10
    const chartMaxW = Math.ceil((maxW + padW) * 10) / 10
    const rangeW = chartMaxW - chartMinW || 1

    const minI = imcsWithValues.length > 0 ? Math.min(...imcsWithValues) : 22
    const maxI = imcsWithValues.length > 0 ? Math.max(...imcsWithValues) : 24
    const padI = Math.max(0.3, (maxI - minI) * 0.25 || 0.6)
    const chartMinI = Math.floor((minI - padI) * 10) / 10
    const chartMaxI = Math.ceil((maxI + padI) * 10) / 10
    const rangeI = chartMaxI - chartMinI || 1

    const w = 500
    const h = 152
    const pX = 38
    const pTop = 26
    const pBottom = 26
    const innerW = w - pX * 2
    const innerH = h - pTop - pBottom

    // Zona superior para Peso (44% da altura) e inferior para IMC (44% da altura)
    const zoneH = innerH * 0.44
    const zoneSpacing = innerH * 0.12

    const slotsWithCoords = slots.map((s, i) => {
      const x = pX + (i / 6) * innerW

      // Posição Y da linha de Peso (zona superior)
      const weightY =
        s.weight !== null
          ? pTop + zoneH - ((s.weight - chartMinW) / rangeW) * zoneH
          : null

      // Posição Y da linha de IMC (zona inferior)
      const imcY =
        s.imc !== null
          ? pTop + zoneH + zoneSpacing + zoneH - ((s.imc - chartMinI) / rangeI) * zoneH
          : null

      return {
        ...s,
        x: Math.round(x * 10) / 10,
        weightY: weightY !== null ? Math.round(weightY * 10) / 10 : null,
        imcY: imcY !== null ? Math.round(imcY * 10) / 10 : null
      }
    })

    const activeWeightPoints = slotsWithCoords
      .filter((s): s is typeof s & { weightY: number } => s.weightY !== null)
      .map((s) => ({ x: s.x, y: s.weightY }))

    const activeImcPoints = slotsWithCoords
      .filter((s): s is typeof s & { imcY: number } => s.imcY !== null)
      .map((s) => ({ x: s.x, y: s.imcY }))

    const pDWeight = createSmoothPath(activeWeightPoints)
    const aDWeight =
      activeWeightPoints.length > 1
        ? `${pDWeight} L ${activeWeightPoints[activeWeightPoints.length - 1].x} ${pTop + zoneH + 4} L ${activeWeightPoints[0].x} ${pTop + zoneH + 4} Z`
        : ''

    const pDImc = createSmoothPath(activeImcPoints)
    const aDImc =
      activeImcPoints.length > 1
        ? `${pDImc} L ${activeImcPoints[activeImcPoints.length - 1].x} ${h - pBottom} L ${activeImcPoints[0].x} ${h - pBottom} Z`
        : ''

    const todayS = slotsWithCoords.find((s) => s.isToday) || slotsWithCoords[6]

    return {
      daySlots: slotsWithCoords,
      todaySlot: todayS,
      width: w,
      height: h,
      paddingX: pX,
      paddingTop: pTop,
      paddingBottom: pBottom,
      weightPathD: pDWeight,
      weightAreaD: aDWeight,
      imcPathD: pDImc,
      imcAreaD: aDImc,
      hasAnyRecords: sortedRecords.length > 0
    }
  }, [records, todayStr, heightCm])

  return (
    <Box>
      {/* Header do Gráfico com Legenda Dupla: Peso & IMC */}
      <Group justify="space-between" align="center" mb={6}>
        <Group gap="sm" align="center">
          <Group gap={6} align="center">
            <TbCalendarStats size={15} color="#818cf8" />
            <Text
              size="11px"
              fw={600}
              c="dimmed"
              style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              Gráfico Dia a Dia
            </Text>
          </Group>

          {/* Legenda visual das duas linhas */}
          <Group gap={8} align="center">
            <Group gap={4} align="center">
              <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              <Text size="10.5px" fw={600} c="#38bdf8">
                Peso (kg)
              </Text>
            </Group>

            <Group gap={4} align="center">
              <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c084fc' }} />
              <Text size="10.5px" fw={600} c="#c084fc">
                IMC (kg/m²)
              </Text>
            </Group>
          </Group>
        </Group>

        {hasAnyRecords && todaySlot.weight !== null ? (
          <Text size="11px" fw={700} c="#4ade80">
            Hoje: {todaySlot.weight.toFixed(1)} kg • {todaySlot.imc ? `${todaySlot.imc.toFixed(1)} IMC` : ''}
          </Text>
        ) : (
          <Text size="11px" fw={600} c="#fbbf24">
            Hoje: Check-in pendente
          </Text>
        )}
      </Group>

      {/* Gráfico SVG com Linha Dupla (Peso e IMC) */}
      <Box
        style={{
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '6px 2px 2px 2px',
          overflow: 'hidden'
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            {/* Gradiente da Linha de Peso */}
            <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Gradiente da Linha de IMC */}
            <linearGradient id="imcAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="imcLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <filter id="todayGlowDual" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
            <filter id="todayGlowImc" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#c084fc" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Linhas guias horizontais sutis */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="2 3"
          />
          <line
            x1={paddingX}
            y1={Math.round(height / 2)}
            x2={width - paddingX}
            y2={Math.round(height / 2)}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="1 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.06)"
          />

          {/* Colunas verticais discretas para cada dia */}
          {daySlots.map((slot) => (
            <line
              key={slot.date}
              x1={slot.x}
              y1={paddingTop}
              x2={slot.x}
              y2={height - paddingBottom}
              stroke={slot.isToday ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)'}
              strokeDasharray={slot.isToday ? '2 2' : undefined}
            />
          ))}

          {/* Áreas preenchidas */}
          {weightAreaD && <path d={weightAreaD} fill="url(#weightAreaGrad)" />}
          {imcAreaD && <path d={imcAreaD} fill="url(#imcAreaGrad)" />}

          {/* 1. LINHA DE PESO */}
          {weightPathD && (
            <path
              d={weightPathD}
              fill="none"
              stroke="url(#weightLineGrad)"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 2. LINHA DE IMC */}
          {imcPathD && (
            <path
              d={imcPathD}
              fill="none"
              stroke="url(#imcLineGrad)"
              strokeWidth="2.0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Renderização dos Pontos de Peso e IMC para cada dia */}
          {daySlots.map((slot) => {
            const weight = slot.weight
            const imc = slot.imc
            const weightY = slot.weightY
            const imcY = slot.imcY
            const isToday = slot.isToday

            return (
              <g key={slot.date}>
                {/* Linha vertical conectando Peso e IMC no mesmo dia */}
                {weightY !== null && imcY !== null && (
                  <line
                    x1={slot.x}
                    y1={weightY}
                    x2={slot.x}
                    y2={imcY}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="1 2"
                  />
                )}

                {/* PONTO DE PESO (Zona Superior) */}
                {weight !== null && weightY !== null && (
                  isToday ? (
                    <g filter="url(#todayGlowDual)">
                      <circle
                        cx={slot.x}
                        cy={weightY}
                        r="6"
                        fill="#0b1329"
                        stroke="#38bdf8"
                        strokeWidth="2.4"
                      />
                      <circle cx={slot.x} cy={weightY} r="2" fill="#ffffff" />
                      <g>
                        <rect
                          x={slot.x - 24}
                          y={weightY - 18}
                          width="48"
                          height="14"
                          rx="4"
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="0.9"
                        />
                        <text
                          x={slot.x}
                          y={weightY - 8}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="9"
                          fontWeight="700"
                        >
                          {weight.toFixed(1)} kg
                        </text>
                      </g>
                    </g>
                  ) : (
                    <g>
                      <circle
                        cx={slot.x}
                        cy={weightY}
                        r="3.2"
                        fill="#0b1329"
                        stroke="rgba(56, 189, 248, 0.7)"
                        strokeWidth="1.6"
                      />
                      <circle cx={slot.x} cy={weightY} r="1.3" fill="#ffffff" />
                      <text
                        x={slot.x}
                        y={weightY - 6}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {weight.toFixed(1)}
                      </text>
                    </g>
                  )
                )}

                {/* PONTO DE IMC (Zona Inferior) */}
                {imc !== null && imcY !== null && (
                  isToday ? (
                    <g filter="url(#todayGlowImc)">
                      <circle
                        cx={slot.x}
                        cy={imcY}
                        r="5.5"
                        fill="#0b1329"
                        stroke="#c084fc"
                        strokeWidth="2.2"
                      />
                      <circle cx={slot.x} cy={imcY} r="1.8" fill="#ffffff" />
                      <g>
                        <rect
                          x={slot.x - 22}
                          y={imcY + 6}
                          width="44"
                          height="13"
                          rx="3"
                          fill="#0f172a"
                          stroke="#c084fc"
                          strokeWidth="0.8"
                        />
                        <text
                          x={slot.x}
                          y={imcY + 16}
                          textAnchor="middle"
                          fill="#c084fc"
                          fontSize="8.5"
                          fontWeight="700"
                        >
                          {imc.toFixed(1)} IMC
                        </text>
                      </g>
                    </g>
                  ) : (
                    <g>
                      <circle
                        cx={slot.x}
                        cy={imcY}
                        r="2.8"
                        fill="#0b1329"
                        stroke="rgba(192, 132, 252, 0.7)"
                        strokeWidth="1.5"
                      />
                      <circle cx={slot.x} cy={imcY} r="1.1" fill="#ffffff" />
                      <text
                        x={slot.x}
                        y={imcY + 11}
                        textAnchor="middle"
                        fill="#c084fc"
                        fontSize="8"
                        fontWeight="500"
                      >
                        {imc.toFixed(1)}
                      </text>
                    </g>
                  )
                )}

                {/* Dia de Hoje sem peso */}
                {weight === null && isToday && (
                  <g>
                    <circle
                      cx={slot.x}
                      cy={Math.round(height / 2)}
                      r="4.5"
                      fill="#0b1329"
                      stroke="#fbbf24"
                      strokeWidth="1.8"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={slot.x}
                      y={Math.round(height / 2) - 8}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="8.5"
                      fontWeight="600"
                    >
                      Pendente
                    </text>
                  </g>
                )}

                {/* Rótulo do dia da semana no rodapé */}
                <text
                  x={slot.x}
                  y={height - 7}
                  textAnchor="middle"
                  fill={isToday ? '#38bdf8' : 'rgba(255, 255, 255, 0.45)'}
                  fontSize="8.5"
                  fontWeight={isToday ? '700' : '500'}
                >
                  {isToday ? 'Hoje' : slot.dayName}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>

      {/* Grid Minimalista com as Atualizações Dia a Dia (Peso & IMC) */}
      <Box mt={10}>
        <Group
          justify="space-between"
          gap={6}
          wrap="nowrap"
          style={{ overflowX: 'auto', paddingBottom: 2 }}
        >
          {daySlots.map((slot) => {
            const isToday = slot.isToday
            const hasWeight = slot.weight !== null

            return (
              <Box
                key={slot.date}
                style={{
                  flex: 1,
                  minWidth: 54,
                  borderRadius: 8,
                  background: isToday
                    ? hasWeight
                      ? 'rgba(56, 189, 248, 0.08)'
                      : 'rgba(251, 191, 36, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${
                    isToday
                      ? hasWeight
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'rgba(251, 191, 36, 0.25)'
                      : 'rgba(255, 255, 255, 0.05)'
                  }`,
                  padding: '6px 4px',
                  textAlign: 'center',
                  cursor: isToday && onStartTodayCheckin ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
                onClick={isToday && onStartTodayCheckin ? onStartTodayCheckin : undefined}
                title={
                  isToday
                    ? 'Clique para editar seu check-in de hoje'
                    : slot.record
                      ? `Peso: ${slot.record.weight.toFixed(1)} kg • IMC: ${slot.imc?.toFixed(1) || '--'}`
                      : `Sem registro em ${slot.shortDate}`
                }
              >
                {/* Nome do dia e data */}
                <Text
                  size="9.5px"
                  fw={isToday ? 700 : 500}
                  c={isToday ? (hasWeight ? '#38bdf8' : '#fbbf24') : 'dimmed'}
                  style={{ lineHeight: 1.2 }}
                >
                  {isToday ? 'Hoje' : slot.dayName}
                </Text>
                <Text size="8.5px" c="dimmed" style={{ opacity: 0.7, lineHeight: 1.1 }}>
                  {slot.shortDate}
                </Text>

                {/* Peso do dia */}
                <Text
                  size="11px"
                  fw={700}
                  c={hasWeight ? (isToday ? '#4ade80' : 'white') : 'dimmed'}
                  mt={4}
                  style={{ lineHeight: 1.2 }}
                >
                  {hasWeight ? `${slot.weight?.toFixed(1)}` : '--'}
                </Text>

                {/* IMC do dia */}
                <Text
                  size="9.5px"
                  fw={600}
                  c={slot.imc ? '#c084fc' : 'dimmed'}
                  style={{ lineHeight: 1.2, opacity: slot.imc ? 1 : 0.4 }}
                >
                  {slot.imc ? `${slot.imc.toFixed(1)}` : '--'}
                </Text>

                {/* Variação da atualização do peso */}
                <Box mt={2}>
                  {slot.diffWeight !== null ? (
                    <Group gap={2} justify="center" align="center" wrap="nowrap">
                      {slot.diffWeight > 0 ? (
                        <>
                          <TbArrowUpRight size={10} color="#fb923c" />
                          <Text size="8.5px" fw={600} c="#fb923c">
                            +{slot.diffWeight}
                          </Text>
                        </>
                      ) : slot.diffWeight < 0 ? (
                        <>
                          <TbArrowDownRight size={10} color="#4ade80" />
                          <Text size="8.5px" fw={600} c="#4ade80">
                            {slot.diffWeight}
                          </Text>
                        </>
                      ) : (
                        <>
                          <TbMinus size={9} color="rgba(255, 255, 255, 0.4)" />
                          <Text size="8.5px" c="dimmed">
                            0.0
                          </Text>
                        </>
                      )}
                    </Group>
                  ) : (
                    <Text size="8.5px" c="dimmed" style={{ opacity: 0.4 }}>
                      •
                    </Text>
                  )}
                </Box>
              </Box>
            )
          })}
        </Group>
      </Box>
    </Box>
  )
}

export default WeightHistoryChart
