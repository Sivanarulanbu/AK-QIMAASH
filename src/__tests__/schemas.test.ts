import { describe, it, expect } from 'vitest'
import {
  sgAddressSchema,
  productSchema,
  variantSchema,
  categorySchema,
  reviewSchema,
  inventoryAdjustmentSchema,
  orderStatusUpdateSchema,
  loginSchema,
  registerSchema,
} from '@/schemas'

describe('Backend Data Contracts & Validation Schemas', () => {
  describe('sgAddressSchema', () => {
    const validAddress = {
      recipient_name: 'Aisyah bte Mohamed',
      phone: '+6591234567',
      street: '391 Orchard Road',
      unit_number: '#04-12',
      postal_code: '238872',
      block_building: 'Ngee Ann City',
      additional_info: 'Leave at front door if not home',
      is_default: true,
    }

    it('accepts valid Singapore address with +65 phone number', () => {
      const result = sgAddressSchema.safeParse(validAddress)
      expect(result.success).toBe(true)
    })

    it('accepts valid 8-digit Singapore phone numbers starting with 8 or 9', () => {
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '81234567' }).success).toBe(true)
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '98765432' }).success).toBe(true)
    })

    it('gracefully normalizes formatted numbers with spaces, hyphens, and prefixes (Postel\'s Law)', () => {
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '9123 4567' }).success).toBe(true)
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '+65 9123-4567' }).success).toBe(true)
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '(65) 9123 4567' }).success).toBe(true)
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '8123-4567' }).success).toBe(true)
    })

    it('rejects invalid Singapore phone numbers', () => {
      // Starting with invalid prefixes or wrong length
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '71234567' }).success).toBe(false)
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '123456' }).success).toBe(false)
      expect(sgAddressSchema.safeParse({ ...validAddress, phone: '+14155552671' }).success).toBe(false)
    })

    it('rejects invalid postal code', () => {
      expect(sgAddressSchema.safeParse({ ...validAddress, postal_code: '12345' }).success).toBe(false)
      expect(sgAddressSchema.safeParse({ ...validAddress, postal_code: 'ABCD12' }).success).toBe(false)
    })

    it('rejects missing recipient name or short street address', () => {
      expect(sgAddressSchema.safeParse({ ...validAddress, recipient_name: 'A' }).success).toBe(false)
      expect(sgAddressSchema.safeParse({ ...validAddress, street: 'St' }).success).toBe(false)
    })
  })

  describe('orderStatusUpdateSchema', () => {
    it('accepts valid order statuses and optional tracking', () => {
      const validPayloads = [
        { status: 'PLACED' },
        { status: 'CONFIRMED', note: 'Customer verified order' },
        { status: 'PROCESSING' },
        {
          status: 'SHIPPED',
          courier_name: 'Ninja Van',
          tracking_number: 'NVSG123456789',
          note: 'Handed to driver',
        },
        { status: 'OUT_FOR_DELIVERY' },
        { status: 'DELIVERED' },
        { status: 'CANCELLED', note: 'Customer requested cancellation' },
      ]

      for (const payload of validPayloads) {
        const result = orderStatusUpdateSchema.safeParse(payload)
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid status values', () => {
      expect(orderStatusUpdateSchema.safeParse({ status: 'INVALID_STATUS' }).success).toBe(false)
      expect(orderStatusUpdateSchema.safeParse({ status: 'shipped' }).success).toBe(false) // case-sensitive enum
      expect(orderStatusUpdateSchema.safeParse({ status: '' }).success).toBe(false)
    })
  })

  describe('productSchema', () => {
    const validProduct = {
      name: 'Luxe Silk Abaya',
      slug: 'luxe-silk-abaya',
      description: 'Handcrafted luxury silk abaya featuring delicate gold embroidery.',
      short_description: 'Luxury silk abaya.',
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      is_published: true,
      tags: ['silk', 'luxury', 'abaya'],
      material: '100% Japanese Silk',
      care_instructions: 'Dry clean only',
      origin: 'United Arab Emirates',
    }

    it('validates a complete product specification', () => {
      const result = productSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('enforces lowercase kebab-case slug constraint', () => {
      expect(productSchema.safeParse({ ...validProduct, slug: 'Valid-Slug-123' }).success).toBe(false) // uppercase not allowed
      expect(productSchema.safeParse({ ...validProduct, slug: 'slug with spaces' }).success).toBe(false)
      expect(productSchema.safeParse({ ...validProduct, slug: 'valid-slug-2026' }).success).toBe(true)
    })

    it('validates UUID for category_id or allows null/undefined', () => {
      expect(productSchema.safeParse({ ...validProduct, category_id: null }).success).toBe(true)
      expect(productSchema.safeParse({ ...validProduct, category_id: 'not-a-uuid' }).success).toBe(false)
    })
  })

  describe('variantSchema', () => {
    const validVariant = {
      sku: 'AKQ-ABY-BLK-S',
      size: 'S',
      color: 'Midnight Black',
      color_hex: '#111111',
      price_cents: 18900, // S$189.00
      compare_price_cents: 21900,
      stock_quantity: 15,
      is_active: true,
    }

    it('accepts valid variant definition', () => {
      expect(variantSchema.safeParse(validVariant).success).toBe(true)
    })

    it('enforces SKU uppercase, numbers, hyphens, and underscores', () => {
      expect(variantSchema.safeParse({ ...validVariant, sku: 'akq-aby-blk' }).success).toBe(false) // lowercase
      expect(variantSchema.safeParse({ ...validVariant, sku: 'SKU WITH SPACES' }).success).toBe(false)
      expect(variantSchema.safeParse({ ...validVariant, sku: 'SKU_123-A' }).success).toBe(true)
    })

    it('validates hex color format (#RRGGBB)', () => {
      expect(variantSchema.safeParse({ ...validVariant, color_hex: '#FFFFFF' }).success).toBe(true)
      expect(variantSchema.safeParse({ ...validVariant, color_hex: '#123456' }).success).toBe(true)
      expect(variantSchema.safeParse({ ...validVariant, color_hex: 'red' }).success).toBe(false)
      expect(variantSchema.safeParse({ ...validVariant, color_hex: '#FFF' }).success).toBe(false) // requires 6-digit hex
    })

    it('enforces positive price and non-negative stock', () => {
      expect(variantSchema.safeParse({ ...validVariant, price_cents: 0 }).success).toBe(false)
      expect(variantSchema.safeParse({ ...validVariant, price_cents: -500 }).success).toBe(false)
      expect(variantSchema.safeParse({ ...validVariant, stock_quantity: -1 }).success).toBe(false)
      expect(variantSchema.safeParse({ ...validVariant, stock_quantity: 0 }).success).toBe(true) // Out of stock is valid
    })
  })

  describe('inventoryAdjustmentSchema', () => {
    it('validates correct inventory adjustment payloads', () => {
      const payload = {
        variant_id: '550e8400-e29b-41d4-a716-446655440000',
        quantity_delta: 25,
        reason: 'Restock from workshop shipment',
      }
      expect(inventoryAdjustmentSchema.safeParse(payload).success).toBe(true)
    })

    it('rejects a delta of 0', () => {
      const payload = {
        variant_id: '550e8400-e29b-41d4-a716-446655440000',
        quantity_delta: 0,
        reason: 'No change',
      }
      const result = inventoryAdjustmentSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    it('rejects negative delta without a valid reason', () => {
      const payload = {
        variant_id: '550e8400-e29b-41d4-a716-446655440000',
        quantity_delta: -5,
        reason: 'No', // Too short (< 3 chars)
      }
      expect(inventoryAdjustmentSchema.safeParse(payload).success).toBe(false)
    })
  })

  describe('reviewSchema', () => {
    it('accepts ratings between 1 and 5', () => {
      for (let r = 1; r <= 5; r++) {
        expect(
          reviewSchema.safeParse({
            rating: r,
            title: 'Great purchase',
            body: 'Fabric quality is outstanding, highly recommend!',
          }).success
        ).toBe(true)
      }
    })

    it('rejects ratings outside 1-5', () => {
      expect(
        reviewSchema.safeParse({
          rating: 0,
          body: 'Not satisfactory at all',
        }).success
      ).toBe(false)

      expect(
        reviewSchema.safeParse({
          rating: 6,
          body: 'Beyond excellent quality',
        }).success
      ).toBe(false)
    })

    it('requires body of at least 10 characters', () => {
      expect(
        reviewSchema.safeParse({
          rating: 5,
          body: 'Too short', // 9 characters
        }).success
      ).toBe(false)
    })
  })

  describe('Auth Schemas', () => {
    it('validates strong password rules in registerSchema', () => {
      // Must contain at least 8 chars, 1 uppercase, 1 number, matching confirm
      expect(
        registerSchema.safeParse({
          full_name: 'Fatima Al-Sayed',
          email: 'fatima@example.com',
          password: 'Password123',
          confirm_password: 'Password123',
        }).success
      ).toBe(true)

      // Missing uppercase
      expect(
        registerSchema.safeParse({
          full_name: 'Fatima Al-Sayed',
          email: 'fatima@example.com',
          password: 'password123',
          confirm_password: 'password123',
        }).success
      ).toBe(false)

      // Missing number
      expect(
        registerSchema.safeParse({
          full_name: 'Fatima Al-Sayed',
          email: 'fatima@example.com',
          password: 'PasswordOnly',
          confirm_password: 'PasswordOnly',
        }).success
      ).toBe(false)

      // Passwords do not match
      expect(
        registerSchema.safeParse({
          full_name: 'Fatima Al-Sayed',
          email: 'fatima@example.com',
          password: 'Password123',
          confirm_password: 'MismatchPassword123',
        }).success
      ).toBe(false)
    })
  })
})
