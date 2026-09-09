import { z } from 'zod'
import { isValidSGPostalCode } from '@/lib/commerce'

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
export type RegisterFormData = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ─── Profile Schemas ──────────────────────────────────────────────────────────

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-().]{8,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
})
export type ProfileFormData = z.infer<typeof profileSchema>

// ─── Address Schemas ──────────────────────────────────────────────────────────

export const normalizeSGPhone = (val: unknown): string => {
  if (typeof val !== 'string') return ''
  const clean = val.trim().replace(/[\s\-\(\)\.]/g, '')
  if (/^[89][0-9]{7}$/.test(clean)) {
    return `+65${clean}`
  }
  if (/^65[89][0-9]{7}$/.test(clean)) {
    return `+${clean}`
  }
  return clean
}

export const sgAddressSchema = z.object({
  label: z.string().max(50).optional().or(z.literal('')),
  recipient_name: z.string().min(2, 'Recipient name is required').max(100),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.preprocess(
    normalizeSGPhone,
    z
      .string()
      .regex(/^\+65[89][0-9]{7}$/, 'Please enter a valid Singapore phone number (e.g. 9123 4567)')
  ),
  block_building: z.string().max(100).optional().or(z.literal('')),
  street: z.string().min(3, 'Street address is required').max(200),
  unit_number: z.string().max(20).optional().or(z.literal('')),
  postal_code: z
    .string()
    .refine(isValidSGPostalCode, 'Please enter a valid 6-digit Singapore postal code'),
  additional_info: z.string().max(500).optional().or(z.literal('')),
  is_default: z.boolean().default(false),
})
export type SGAddressFormData = z.infer<typeof sgAddressSchema>

// ─── Product Schemas (Admin) ───────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional().or(z.literal('')),
  short_description: z.string().max(300).optional().or(z.literal('')),
  category_id: z.string().uuid().optional().nullable(),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  material: z.string().max(200).optional().or(z.literal('')),
  care_instructions: z.string().max(500).optional().or(z.literal('')),
  origin: z.string().max(100).optional().or(z.literal('')),
})
export type ProductFormData = z.infer<typeof productSchema>

export const variantSchema = z.object({
  sku: z
    .string()
    .min(2, 'SKU is required')
    .max(50)
    .regex(/^[A-Z0-9\-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
  size: z.string().max(20).optional().or(z.literal('')),
  color: z.string().max(50).optional().or(z.literal('')),
  color_hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional()
    .or(z.literal('')),
  price_cents: z
    .number()
    .int()
    .positive('Price must be greater than 0'),
  compare_price_cents: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
  is_active: z.boolean().default(true),
})
export type VariantFormData = z.infer<typeof variantSchema>

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional().or(z.literal('')),
  parent_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
})
export type CategoryFormData = z.infer<typeof categorySchema>

// ─── Review Schema ────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional().or(z.literal('')),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000),
})
export type ReviewFormData = z.infer<typeof reviewSchema>

// ─── Inventory Adjustment Schema ──────────────────────────────────────────────

export const inventoryAdjustmentSchema = z.object({
  variant_id: z.string().uuid(),
  quantity_delta: z.number().int().refine((n) => n !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(3, 'Please provide a reason').max(500),
})
export type InventoryAdjustmentFormData = z.infer<typeof inventoryAdjustmentSchema>

// ─── Order Status Update Schema ───────────────────────────────────────────────

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().max(500).optional().or(z.literal('')),
  tracking_number: z.string().max(100).optional().or(z.literal('')),
  courier_name: z.string().max(100).optional().or(z.literal('')),
})
export type OrderStatusUpdateFormData = z.infer<typeof orderStatusUpdateSchema>
