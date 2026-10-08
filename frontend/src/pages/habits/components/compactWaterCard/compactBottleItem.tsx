import React from 'react'
import { Box, Text, UnstyledButton } from '@mantine/core'
import { TbCheck, TbPlus, TbX } from 'react-icons/tb'

interface CompactBottleItemProps {
  index: number
  isFilled: boolean
  isExtra?: boolean
  bottleMl?: number
  onClick: () => void
  onRemove?: () => void
}

export const CompactBottleItem: React.FC<CompactBottleItemProps> = ({
  index,
  isFilled,
  isExtra,
  bottleMl = 500,
  onClick,
  onRemove
}) => {
  return (
    <Box style={{ position: 'relative', display: 'inline-block' }}>
      <UnstyledButton
        onClick={onClick}
        title={`Garrafa #${index + 1} (${bottleMl}ml) - ${isFilled ? 'Consumida' : 'Pendente'}${isExtra ? ' (Extra)' : ''}`}
        aria-label={`Garrafa ${index + 1}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 54,
          padding: '4px 2px',
          borderRadius: 8,
          background: isFilled
            ? 'rgba(56, 189, 248, 0.12)'
            : 'rgba(255, 255, 255, 0.02)',
          border: isFilled
            ? '1px solid rgba(56, 189, 248, 0.5)'
            : isExtra
            ? '1px dashed rgba(168, 85, 247, 0.35)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <Box style={{ width: 18, height: 32, position: 'relative' }}>
          <svg
            viewBox="0 0 20 36"
            width="18"
            height="32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`compactWater-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            <rect
              x="7"
              y="1"
              width="6"
              height="3"
              rx="1"
              fill={isFilled ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            />

            <rect
              x="6"
              y="4"
              width="8"
              height="3"
              rx="1"
              fill={isFilled ? '#0284c7' : 'rgba(255, 255, 255, 0.15)'}
            />

            <path
              d="M4 8 C4 7 6 7 6 7 H14 C14 7 16 7 16 8 L16.5 20 C16.5 22 15.5 23 15 24 L15.5 32 C15.5 34 14 35 12.5 35 H7.5 C6 35 4.5 34 4.5 32 L5 24 C4.5 23 3.5 22 3.5 20 L4 8 Z"
              fill={isFilled ? `url(#compactWater-${index})` : 'rgba(255, 255, 255, 0.03)'}
              stroke={isFilled ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth="1.2"
            />
          </svg>

          {isFilled && (
            <Box
              style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '50%',
                width: 13,
                height: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}
            >
              <TbCheck size={9} color="#38bdf8" />
            </Box>
          )}
        </Box>

        <Text
          size="9px"
          fw={600}
          c={isFilled ? '#38bdf8' : 'dimmed'}
          style={{ lineHeight: 1, marginTop: 3 }}
        >
          #{index + 1}
        </Text>
      </UnstyledButton>

      {isExtra && onRemove && (
        <UnstyledButton
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          title="Remover garrafa extra da meta"
          aria-label="Remover garrafa extra"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 15,
            height: 15,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.85)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            zIndex: 2,
            transition: 'transform 0.15s ease'
          }}
        >
          <TbX size={9} strokeWidth={3} />
        </UnstyledButton>
      )}
    </Box>
  )
}

interface AddBottleButtonProps {
  bottleMl?: number
  onClick: () => void
}

export const AddBottleButton: React.FC<AddBottleButtonProps> = ({ bottleMl = 500, onClick }) => {
  return (
    <UnstyledButton
      onClick={onClick}
      title={`Adicionar mais uma garrafa (+${bottleMl}ml)`}
      aria-label={`Adicionar garrafa extra de ${bottleMl}ml`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 54,
        padding: '4px 2px',
        borderRadius: 8,
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.7)'
        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
      }}
    >
      <Box style={{ width: 18, height: 32, position: 'relative' }}>
        <svg
          viewBox="0 0 20 36"
          width="18"
          height="32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="7"
            y="1"
            width="6"
            height="3"
            rx="1"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <rect
            x="6"
            y="4"
            width="8"
            height="3"
            rx="1"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <path
            d="M4 8 C4 7 6 7 6 7 H14 C14 7 16 7 16 8 L16.5 20 C16.5 22 15.5 23 15 24 L15.5 32 C15.5 34 14 35 12.5 35 H7.5 C6 35 4.5 34 4.5 32 L5 24 C4.5 23 3.5 22 3.5 20 L4 8 Z"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeDasharray="3 2"
            strokeWidth="1.2"
          />
        </svg>

        <Box
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(168, 85, 247, 0.25)',
            borderRadius: '50%',
            width: 15,
            height: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc'
          }}
        >
          <TbPlus size={10} strokeWidth={2.5} />
        </Box>
      </Box>

      <Text
        size="9px"
        fw={600}
        c="dimmed"
        style={{ lineHeight: 1, marginTop: 3 }}
      >
        +1
      </Text>
    </UnstyledButton>
  )
}
