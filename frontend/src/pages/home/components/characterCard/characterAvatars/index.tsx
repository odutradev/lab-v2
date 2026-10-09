import { Box } from '@mantine/core'
import type { CharacterAvatarProps } from './types'

export const CharacterAvatar = ({
  id,
  size = 110,
  interactive = true,
  onClick
}: CharacterAvatarProps) => {
  return (
    <Box
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label="Personagem do usuário"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 35%, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '2px solid rgba(129, 140, 248, 0.4)',
        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)'
          e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.9)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.45), inset 0 2px 10px rgba(255, 255, 255, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.4)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.2)'
        }
      }}
    >
      <svg
        width={size * 0.8}
        height={size * 0.8}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGradSpark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="visorGradSpark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="bodyGradAtlas" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="bodyGradLuna" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <linearGradient id="bodyGradNeo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {id === 'spark' && (
          <g>
            <circle cx="50" cy="18" r="4.5" fill="#38bdf8" filter="url(#glow)" />
            <path d="M50 22 V30" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
            <rect x="18" y="44" width="6" height="16" rx="3" fill="#6366f1" />
            <rect x="76" y="44" width="6" height="16" rx="3" fill="#6366f1" />
            <rect x="23" y="30" width="54" height="44" rx="14" fill="url(#bodyGradSpark)" />
            <rect x="30" y="40" width="40" height="22" rx="8" fill="#0f172a" />
            <circle cx="41" cy="51" r="4" fill="url(#visorGradSpark)" filter="url(#glow)" />
            <circle cx="59" cy="51" r="4" fill="url(#visorGradSpark)" filter="url(#glow)" />
            <circle cx="42.5" cy="49.5" r="1.5" fill="#ffffff" />
            <circle cx="60.5" cy="49.5" r="1.5" fill="#ffffff" />
            <path d="M47 56 Q50 59 53 56" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 76 C30 72 38 72 50 72 C62 72 70 72 70 76 C76 83 78 92 78 96 H22 C22 92 24 83 30 76 Z" fill="#312e81" />
            <circle cx="50" cy="84" r="3.5" fill="#38bdf8" filter="url(#glow)" />
          </g>
        )}

        {id === 'athlete' && (
          <g>
            <path d="M26 40 Q50 36 74 40" stroke="#34d399" strokeWidth="7" strokeLinecap="round" />
            <ellipse cx="50" cy="48" rx="24" ry="26" fill="url(#bodyGradAtlas)" />
            <ellipse cx="40" cy="47" rx="3.5" ry="4" fill="#064e3b" />
            <ellipse cx="60" cy="47" rx="3.5" ry="4" fill="#064e3b" />
            <circle cx="41" cy="45.5" r="1.2" fill="#fff" />
            <circle cx="61" cy="45.5" r="1.2" fill="#fff" />
            <path d="M44 57 Q50 63 56 57" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 75 C16 83 14 92 14 96 H86 C86 92 84 83 78 75 C70 70 60 72 50 72 C40 72 30 70 22 75 Z" fill="#047857" />
            <path d="M42 76 L50 84 L58 76" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {id === 'zen' && (
          <g>
            <ellipse cx="50" cy="22" rx="16" ry="4" stroke="#e9d5ff" strokeWidth="2" filter="url(#glow)" />
            <path d="M26 50 C24 32 36 26 50 26 C64 26 76 32 74 50 C74 58 70 66 70 66 C70 66 65 52 50 52 C35 52 30 66 30 66 C30 66 26 58 26 50 Z" fill="url(#bodyGradLuna)" />
            <circle cx="50" cy="48" r="21" fill="#fae8ff" />
            <path d="M38 48 Q43 52 46 48" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 48 Q57 52 62 48" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M46 56 Q50 59 54 56" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 76 C20 84 18 92 18 96 H82 C82 92 80 84 75 76 C68 70 58 72 50 72 C42 72 32 70 25 76 Z" fill="#6b21a8" />
            <circle cx="50" cy="80" r="3" fill="#e9d5ff" filter="url(#glow)" />
          </g>
        )}

        {id === 'cyber' && (
          <g>
            <path d="M24 38 C24 28 35 22 50 22 C65 22 76 28 76 38 V66 C76 72 65 76 50 76 C35 76 24 72 24 66 V38 Z" fill="#0f172a" />
            <path d="M20 46 V58" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
            <path d="M80 46 V58" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
            <path d="M27 42 H73 V56 H27 Z" fill="url(#bodyGradNeo)" filter="url(#glow)" />
            <path d="M33 49 H43 L46 45 L49 53 L52 47 L55 51 H67" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 78 L34 72 L50 76 L66 72 L80 78 L84 96 H16 L20 78 Z" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </Box>
  )
}

export default CharacterAvatar
