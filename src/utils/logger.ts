/**
 * AK QIMAASH — Structured Client Telemetry & Error Logger
 * Captures unhandled client errors, checkout warnings, and network retry telemetry.
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    }

    const formattedPrefix = `[AKQ ${level.toUpperCase()}] ${entry.timestamp}:`

    if (level === 'error') {
      console.error(formattedPrefix, message, context || '')
    } else if (level === 'warn') {
      console.warn(formattedPrefix, message, context || '')
    } else {
      console.info(formattedPrefix, message, context || '')
    }

    // Hook point for external logging services (e.g. Sentry, Datadog)
    if (typeof window !== 'undefined' && (window as any).__AK_ERROR_HOOK__) {
      try {
        ;(window as any).__AK_ERROR_HOOK__(entry)
      } catch {
        // Silently swallow logger hook failure
      }
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context)
  }
}

export const logger = new Logger()
