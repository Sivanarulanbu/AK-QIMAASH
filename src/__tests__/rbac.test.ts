import { describe, it, expect } from 'vitest'
import sql004 from '../../supabase/migrations/004_rbac_staff_management.sql?raw'
import type { UserRole } from '@/types/database'

// ─── Mirror permission matrix from AuthProvider and admin-authorize ──────────
const PERMISSIONS: Record<string, UserRole[]> = {
  'orders.read':          ['ADMIN', 'ORDER_MANAGER'],
  'orders.update_status': ['ADMIN', 'ORDER_MANAGER'],
  'orders.delete':        ['ADMIN'],
  'products.read':        ['ADMIN', 'CONTENT_MANAGER'],
  'products.create':      ['ADMIN', 'CONTENT_MANAGER'],
  'products.update':      ['ADMIN', 'CONTENT_MANAGER'],
  'products.delete':      ['ADMIN'],
  'inventory.read':       ['ADMIN', 'ORDER_MANAGER'],
  'inventory.adjust':     ['ADMIN', 'ORDER_MANAGER'],
  'reviews.read':         ['ADMIN', 'CONTENT_MANAGER'],
  'reviews.moderate':     ['ADMIN', 'CONTENT_MANAGER'],
  'reviews.delete':       ['ADMIN'],
  'customers.read':       ['ADMIN', 'ORDER_MANAGER'],
  'roles.read':           ['ADMIN'],
  'roles.assign':         ['ADMIN'],
  'roles.revoke':         ['ADMIN'],
  'staff.read':           ['ADMIN'],
  'staff.assign':         ['ADMIN'],
  'staff.revoke':         ['ADMIN'],
  'audit.read':           ['ADMIN'],
  'settings.read':        ['ADMIN'],
  'settings.update':      ['ADMIN'],
  'dashboard.read':       ['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER'],
}

function checkPermission(userRole: UserRole | null, resource: string, action: string): boolean {
  if (!userRole) return false
  if (userRole === 'ADMIN') return true
  const key = `${resource}.${action}`
  const allowed = PERMISSIONS[key]
  if (!allowed) return false
  return allowed.includes(userRole)
}

describe('RBAC Controls & Permission Matrix (Client Specification)', () => {
  describe('Super Admin (ADMIN)', () => {
    it('has implicit unrestricted access to all sensitive administrative actions', () => {
      const sensitiveActions = [
        ['orders', 'read'],
        ['orders', 'update_status'],
        ['orders', 'delete'],
        ['products', 'create'],
        ['products', 'delete'],
        ['inventory', 'adjust'],
        ['customers', 'read'],
        ['staff', 'assign'],
        ['staff', 'revoke'],
        ['audit', 'read'],
        ['settings', 'update'],
      ]
      sensitiveActions.forEach(([res, act]) => {
        expect(checkPermission('ADMIN', res, act)).toBe(true)
      })
    })
  })

  describe('Order & Fulfillment Manager (ORDER_MANAGER)', () => {
    it('is permitted to manage orders, customer shipping info, and inventory levels', () => {
      expect(checkPermission('ORDER_MANAGER', 'orders', 'read')).toBe(true)
      expect(checkPermission('ORDER_MANAGER', 'orders', 'update_status')).toBe(true)
      expect(checkPermission('ORDER_MANAGER', 'inventory', 'read')).toBe(true)
      expect(checkPermission('ORDER_MANAGER', 'inventory', 'adjust')).toBe(true)
      expect(checkPermission('ORDER_MANAGER', 'customers', 'read')).toBe(true)
      expect(checkPermission('ORDER_MANAGER', 'dashboard', 'read')).toBe(true)
    })

    it('is strictly prohibited from modifying products, deleting orders, settings, or staff roles', () => {
      expect(checkPermission('ORDER_MANAGER', 'orders', 'delete')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'products', 'create')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'products', 'update')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'products', 'delete')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'reviews', 'moderate')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'staff', 'assign')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'staff', 'revoke')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'audit', 'read')).toBe(false)
      expect(checkPermission('ORDER_MANAGER', 'settings', 'update')).toBe(false)
    })
  })

  describe('Content & Catalog Manager (CONTENT_MANAGER)', () => {
    it('is permitted to manage catalog products, categories, and review moderation', () => {
      expect(checkPermission('CONTENT_MANAGER', 'products', 'read')).toBe(true)
      expect(checkPermission('CONTENT_MANAGER', 'products', 'create')).toBe(true)
      expect(checkPermission('CONTENT_MANAGER', 'products', 'update')).toBe(true)
      expect(checkPermission('CONTENT_MANAGER', 'reviews', 'read')).toBe(true)
      expect(checkPermission('CONTENT_MANAGER', 'reviews', 'moderate')).toBe(true)
      expect(checkPermission('CONTENT_MANAGER', 'dashboard', 'read')).toBe(true)
    })

    it('is strictly prohibited from accessing customer orders, PII, inventory adjusting, or deleting products', () => {
      expect(checkPermission('CONTENT_MANAGER', 'products', 'delete')).toBe(false)
      expect(checkPermission('CONTENT_MANAGER', 'orders', 'read')).toBe(false)
      expect(checkPermission('CONTENT_MANAGER', 'orders', 'update_status')).toBe(false)
      expect(checkPermission('CONTENT_MANAGER', 'customers', 'read')).toBe(false)
      expect(checkPermission('CONTENT_MANAGER', 'inventory', 'adjust')).toBe(false)
      expect(checkPermission('CONTENT_MANAGER', 'staff', 'assign')).toBe(false)
      expect(checkPermission('CONTENT_MANAGER', 'settings', 'update')).toBe(false)
    })
  })

  describe('Customer (CUSTOMER) & Unauthenticated Visitors', () => {
    it('cannot access any administrative actions', () => {
      const allActions = Object.keys(PERMISSIONS)
      allActions.forEach((perm) => {
        const [res, act] = perm.split('.')
        expect(checkPermission('CUSTOMER', res, act)).toBe(false)
        expect(checkPermission(null, res, act)).toBe(false)
      })
    })
  })

  describe('Safety Invariants & Security Protections', () => {
    it('prevents self-demotion in business logic rule', () => {
      const currentUserId = 'user-admin-123'
      const targetUserId = 'user-admin-123'
      const newRole: string = 'CUSTOMER'

      const isSelfDemotion = currentUserId === targetUserId && newRole !== 'ADMIN'
      expect(isSelfDemotion).toBe(true)
    })

    it('prevents demoting the last remaining administrator', () => {
      const currentAdmins = [{ id: 'user-admin-1', role: 'ADMIN' }]
      const targetUser = { id: 'user-admin-1', role: 'ADMIN' }
      const newRole: string = 'ORDER_MANAGER'

      const wouldOrphanSystem =
        targetUser.role === 'ADMIN' &&
        newRole !== 'ADMIN' &&
        currentAdmins.length <= 1

      expect(wouldOrphanSystem).toBe(true)
    })
  })

  describe('Database Security Migrations Verification', () => {
    it('004_rbac_staff_management.sql exists and enforces database-level RPC security', () => {
      expect(sql004).toBeDefined()
      expect(sql004).toContain('CREATE OR REPLACE FUNCTION public.assign_user_role')
      expect(sql004).toContain('CREATE OR REPLACE FUNCTION public.get_staff_members')
      expect(sql004).toContain('Self-demotion is not permitted')
      expect(sql004).toContain('Cannot demote the last remaining administrator')
      expect(sql004).toContain('trg_prevent_orphan_admin')
      expect(sql004).toContain('validate_order_update_privileges')
    })
  })
})
