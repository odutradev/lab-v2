import { Box, Text, UnstyledButton } from '@mantine/core'
import { TbCheck } from 'react-icons/tb'
import type { WaterBottleItemProps } from './types'

export const WaterBottleItem = ({
  index,
  isFilled,
  onClick
}: WaterBottleItemProps) => {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-label={`Garrafa ${index + 1} de 500ml, status: ${isFilled ? 'consumida' : 'pendente'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 10px',
        borderRadius: 14,
        background: isFilled
          ? 'linear-gradient(180deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.12) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: isFilled
          ? '1.5px solid #38bdf8'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isFilled
          ? '0 6px 20px rgba(14, 165, 233, 0.35), inset 0 1px 4px rgba(255, 255, 255, 0.3)'
          : 'none',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        minWidth: 80,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
      }}
    >
      {/* SVG da Garrafinha de 500ml */}
      <Box style={{ width: 44, height: 80, position: 'relative' }}>
        <svg
          viewBox="0 0 44 80"
          width="44"
          height="80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`waterGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id={`emptyGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
            <filter id={`bottleGlow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Tampa / Alça */}
          <rect
            x="16"
            y="2"
            width="12"
            height="6"
            rx="2"
            fill={isFilled ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
          />
          <path
            d="M20 2 C20 0 24 0 24 2"
            stroke={isFilled ? '#7dd3fc' : 'rgba(255, 255, 255, 0.3)'}
            strokeWidth="1.5"
          />

          {/* Gargalo */}
          <rect
            x="14"
            y="8"
            width="16"
            height="6"
            rx="1.5"
            fill={isFilled ? '#0284c7' : 'rgba(255, 255, 255, 0.15)'}
          />

          {/* Corpo da Garrafa */}
          <path
            d="M10 16 C10 14 14 14 14 14 H30 C30 14 34 14 34 16 L35 44 C35 48 34 50 32 52 L34 72 C34 76 31 78 28 78 H16 C13 78 10 76 10 72 L12 52 C10 50 9 48 9 44 L10 16 Z"
            fill={isFilled ? `url(#waterGrad-${index})` : `url(#emptyGrad-${index})`}
            stroke={isFilled ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth="1.5"
          />

          {/* Detalhes de reflexo / nível da água se cheia */}
          {isFilled ? (
            <g filter={`url(#bottleGlow-${index})`}>
              {/* Brilho vertical no vidro da garrafa */}
              <path
                d="M13 22 L13 68"
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Linha de onda sutil */}
              <path
                d="M13 24 Q22 28 31 24"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Bolhas sutis */}
              <circle cx="26" cy="40" r="1.5" fill="rgba(255,255,255,0.7)" />
              <circle cx="18" cy="54" r="1.2" fill="rgba(255,255,255,0.6)" />
              <circle cx="25" cy="62" r="1" fill="rgba(255,255,255,0.6)" />
            </g>
          ) : (
            <path
              d="M13 22 L13 68"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Ícone de check se preenchida */}
        {isFilled && (
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '50%',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
            }}
          >
            <TbCheck size={14} color="#38bdf8" />
          </Box>
        )}
      </Box>

      {/* Rótulo 500 ml */}
      <Text
        size="xs"
        fw={700}
        c={isFilled ? '#38bdf8' : 'dimmed'}
        mt={6}
        style={{ letterSpacing: 0.3 }}
      >
        500 ml
      </Text>

      <Text size="10px" c={isFilled ? 'cyan.2' : 'dimmed'}>
        #{index + 1}
      </Text>
    </UnstyledButton>
  )
}

export default WaterBottleItem
