/**
 * Commerce configuration — single source of truth for all business rules.
 * Values come from environment variables to allow per-environment overrides.
 */

export const COMMERCE_CONFIG = {
  /** GST rate as a decimal (0.09 = 9%) */
  GST_RATE: parseFloat(import.meta.env.VITE_GST_RATE || '0.09'),

  /** Flat delivery fee in SGD cents */
  DELIVERY_FEE_CENTS: parseInt(import.meta.env.VITE_DELIVERY_FEE_CENTS || '500', 10),

  /** Subtotal threshold above which delivery is free, in SGD cents */
  FREE_DELIVERY_THRESHOLD_CENTS: parseInt(
    import.meta.env.VITE_FREE_DELIVERY_THRESHOLD_CENTS || '10000',
    10
  ),

  /** Currency code */
  CURRENCY: 'SGD',

  /** Locale for number formatting */
  LOCALE: 'en-SG',

  /** Singapore-specific postal code regex (6 digits) */
  POSTAL_CODE_REGEX: /^\d{6}$/,

  /** Country */
  COUNTRY: 'Singapore',

  /** Order statuses in lifecycle order */
  ORDER_STATUSES: [
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ] as const,

  /** Valid status transitions: key → allowed next states */
  STATUS_TRANSITIONS: {
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  } as const,

  /** Cash on Delivery (COD) Risk Controls & Anti-Abuse Thresholds */
  COD_RULES: {
    /** Maximum active unfulfilled COD orders allowed per customer */
    MAX_ACTIVE_PENDING_ORDERS: 3,
    /** Maximum single COD order total in SGD cents ($1,500) */
    MAX_ORDER_TOTAL_CENTS: 150000,
    /** Maximum cancelled orders in past 30 days before pausing COD */
    MAX_30DAY_CANCELLATIONS: 2,
  },
} as const

export type OrderStatus = (typeof COMMERCE_CONFIG.ORDER_STATUSES)[number] | 'CANCELLED'

/**
 * Validates whether transitioning from currentStatus to nextStatus is permitted by the state machine.
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (currentStatus === nextStatus) return false
  const allowed = COMMERCE_CONFIG.STATUS_TRANSITIONS[currentStatus]
  return allowed ? (allowed as readonly string[]).includes(nextStatus) : false
}

/**
 * Validates whether a customer meets Cash on Delivery (COD) order eligibility rules.
 */
export function validateCodEligibility(params: {
  pendingCodOrdersCount: number
  recentCancelledCount: number
  orderSubtotalCents: number
}): { eligible: boolean; reason?: string; code?: string } {
  if (params.pendingCodOrdersCount >= COMMERCE_CONFIG.COD_RULES.MAX_ACTIVE_PENDING_ORDERS) {
    return {
      eligible: false,
      code: 'COD_LIMIT_EXCEEDED',
      reason: `You have ${params.pendingCodOrdersCount} active Cash on Delivery orders in transit. Please settle existing orders before placing new ones.`,
    }
  }

  if (params.recentCancelledCount >= COMMERCE_CONFIG.COD_RULES.MAX_30DAY_CANCELLATIONS) {
    return {
      eligible: false,
      code: 'COD_RESTRICTED',
      reason: 'Cash on Delivery is temporarily paused due to previous order cancellations. Please contact atelier support at orders@akqimaash.sg.',
    }
  }

  if (params.orderSubtotalCents > COMMERCE_CONFIG.COD_RULES.MAX_ORDER_TOTAL_CENTS) {
    return {
      eligible: false,
      code: 'COD_MAX_AMOUNT_EXCEEDED',
      reason: `Cash on Delivery orders cannot exceed ${formatPrice(COMMERCE_CONFIG.COD_RULES.MAX_ORDER_TOTAL_CENTS)}. For bespoke orders, contact atelier support.`,
    }
  }

  return { eligible: true }
}

/**
 * Format a SGD amount from cents to a display string.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat(COMMERCE_CONFIG.LOCALE, {
    style: 'currency',
    currency: COMMERCE_CONFIG.CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Calculate GST amount (rounded to nearest cent).
 */
export function calculateGST(subtotalCents: number): number {
  return Math.round(subtotalCents * COMMERCE_CONFIG.GST_RATE)
}

/**
 * Determine delivery fee based on subtotal.
 */
export function calculateDeliveryFee(subtotalCents: number): number {
  return subtotalCents >= COMMERCE_CONFIG.FREE_DELIVERY_THRESHOLD_CENTS
    ? 0
    : COMMERCE_CONFIG.DELIVERY_FEE_CENTS
}

/**
 * Calculate the full order total breakdown.
 */
export function calculateOrderTotals(subtotalCents: number) {
  const gst = calculateGST(subtotalCents)
  const delivery = calculateDeliveryFee(subtotalCents)
  const total = subtotalCents + gst + delivery
  return { subtotal: subtotalCents, gst, delivery, total }
}

/**
 * Validate a Singapore postal code string.
 */
export function isValidSGPostalCode(code: string): boolean {
  return COMMERCE_CONFIG.POSTAL_CODE_REGEX.test(code)
}

