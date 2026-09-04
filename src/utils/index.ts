import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Generate a URL-safe slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Truncate text to a given character limit */
export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  return text.slice(0, limit).trimEnd() + '...'
}

/** Generate initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Delay execution (for testing/demo) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Check if a value is not null or undefined */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/** Parse a numeric query param safely */
export function parseIntParam(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

/** Format a date string for display */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

/** Format a datetime string for display */
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateStr))
}

/** Format a relative time string (e.g. "2 hours ago") */
export function formatRelativeTime(dateStr: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = then - now

  const seconds = diff / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24

  if (Math.abs(days) >= 1) return rtf.format(Math.round(days), 'day')
  if (Math.abs(hours) >= 1) return rtf.format(Math.round(hours), 'hour')
  if (Math.abs(minutes) >= 1) return rtf.format(Math.round(minutes), 'minute')
  return rtf.format(Math.round(seconds), 'second')
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** Generate a random session ID */
export function generateSessionId(): string {
  return crypto.randomUUID()
}

/** Get or create a guest session ID */
export function getGuestSessionId(): string {
  const key = 'akq_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = generateSessionId()
    localStorage.setItem(key, id)
  }
  return id
}
