import { formatTimestamp } from '@utils/date'

export type LocalLogger = {
  success: (message: unknown, ...args: unknown[]) => void
  error: (message: unknown, ...args: unknown[]) => void
  debug: (message: unknown, ...args: unknown[]) => void
  info: (message: unknown, ...args: unknown[]) => void
  warn: (message: unknown, ...args: unknown[]) => void
  clean: (message: unknown, ...args: unknown[]) => void
}

const Colors = {
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
} as const

const buildLogPrefix = (prefix: string, level: string, color: string): string => {
  return `${Colors.gray}[${formatTimestamp()}]${Colors.reset} ${color}[${prefix}] [${level}]${Colors.reset}`
}

const createLocalLogger = (prefix: string): LocalLogger => ({
  success: (message: unknown, ...args: unknown[]) => {
    console.log(`${buildLogPrefix(prefix, 'SUCCESS', Colors.green)}`, message, ...args)
  },
  error: (message: unknown, ...args: unknown[]) => {
    console.error(`${buildLogPrefix(prefix, 'ERROR', Colors.red)}`, message, ...args)
  },
  debug: (message: unknown, ...args: unknown[]) => {
    console.debug(`${buildLogPrefix(prefix, 'DEBUG', Colors.magenta)}`, message, ...args)
  },
  info: (message: unknown, ...args: unknown[]) => {
    console.info(`${buildLogPrefix(prefix, 'INFO', Colors.blue)}`, message, ...args)
  },
  warn: (message: unknown, ...args: unknown[]) => {
    console.warn(`${buildLogPrefix(prefix, 'WARN', Colors.yellow)}`, message, ...args)
  },
  clean: (message: unknown, ...args: unknown[]) => {
    console.log(message, ...args)
  }
})

export default createLocalLogger
