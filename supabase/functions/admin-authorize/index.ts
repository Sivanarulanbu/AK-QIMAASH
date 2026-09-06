// Supabase Edge Function: admin-authorize
// Server-side authorization middleware for admin operations.
// Validates JWT, checks RBAC role, enforces permission matrix, and verifies MFA when required.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MFA_REQUIRED = Deno.env.get('MFA_REQUIRED') === 'true'

// ─── Permission Matrix ──────────────────────────────────────────
// Maps resource.action → list of roles allowed

type UserRole = 'ADMIN' | 'ORDER_MANAGER' | 'CONTENT_MANAGER' | 'CUSTOMER'

const PERMISSIONS: Record<string, UserRole[]> = {
  // Orders
  'orders.read':          ['ADMIN', 'ORDER_MANAGER'],
  'orders.update_status': ['ADMIN', 'ORDER_MANAGER'],
  'orders.delete':        ['ADMIN'],

  // Products
  'products.read':        ['ADMIN', 'CONTENT_MANAGER'],
  'products.create':      ['ADMIN', 'CONTENT_MANAGER'],
  'products.update':      ['ADMIN', 'CONTENT_MANAGER'],
  'products.delete':      ['ADMIN'],

  // Inventory
  'inventory.read':       ['ADMIN', 'ORDER_MANAGER'],
  'inventory.adjust':     ['ADMIN', 'ORDER_MANAGER'],

  // Reviews
  'reviews.read':         ['ADMIN', 'CONTENT_MANAGER'],
  'reviews.moderate':     ['ADMIN', 'CONTENT_MANAGER'],
  'reviews.delete':       ['ADMIN'],

  // Customers
  'customers.read':       ['ADMIN', 'ORDER_MANAGER'],

  // User roles & staff management
  'roles.read':           ['ADMIN'],
  'roles.assign':         ['ADMIN'],
  'roles.revoke':         ['ADMIN'],
  'staff.read':           ['ADMIN'],
  'staff.assign':         ['ADMIN'],
  'staff.revoke':         ['ADMIN'],

  // Audit logs
  'audit.read':           ['ADMIN'],

  // Settings
  'settings.read':        ['ADMIN'],
  'settings.update':      ['ADMIN'],

  // Dashboard
  'dashboard.read':       ['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER'],
}

interface AuthorizeRequest {
  resource: string  // e.g. 'orders'
  action: string    // e.g. 'update_status'
}

interface AuthResult {
  authorized: boolean
  user_id: string | null
  role: UserRole | null
  mfa_verified: boolean
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
      },
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ authorized: false, error: 'Method not allowed' }, 405)
  }

  try {
    // ─── 1. Extract and validate JWT ──────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ authorized: false, error: 'Missing or invalid Authorization header' }, 401)
    }

    const jwt = authHeader.replace('Bearer ', '')

    // Create a client with the user's JWT (not service role)
    // This respects RLS and validates the token
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return jsonResponse({
        authorized: false,
        error: 'Invalid or expired session',
        user_id: null,
        role: null,
        mfa_verified: false,
      }, 401)
    }

    // ─── 2. Fetch user role via service role (bypasses RLS) ───
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !roleData) {
      return jsonResponse({
        authorized: false,
        error: 'User role not found',
        user_id: user.id,
        role: null,
        mfa_verified: false,
      }, 403)
    }

    const userRole = roleData.role as UserRole

    // ─── 3. Check if the role is an admin role ────────────────
    const adminRoles: UserRole[] = ['ADMIN', 'ORDER_MANAGER', 'CONTENT_MANAGER']
    if (!adminRoles.includes(userRole)) {
      return jsonResponse({
        authorized: false,
        error: 'Insufficient privileges. Admin role required.',
        user_id: user.id,
        role: userRole,
        mfa_verified: false,
      }, 403)
    }

    // ─── 4. Check MFA (AAL2) if required ──────────────────────
    const aal = user.factors?.length ? 'aal2' : 'aal1'
    // Check the amr claims in the JWT for actual MFA verification
    const amrClaims = (user as any).amr || []
    const mfaVerified = amrClaims.some((claim: any) => claim.method === 'totp')

    if (MFA_REQUIRED && !mfaVerified) {
      return jsonResponse({
        authorized: false,
        error: 'MFA verification required for admin access',
        user_id: user.id,
        role: userRole,
        mfa_verified: false,
      }, 403)
    }

    // ─── 5. Parse request and check permission ────────────────
    let body: AuthorizeRequest
    try {
      body = await req.json()
    } catch {
      // If no body, just validate that the user is an admin
      return jsonResponse({
        authorized: true,
        user_id: user.id,
        role: userRole,
        mfa_verified: mfaVerified,
      }, 200)
    }

    const permissionKey = `${body.resource}.${body.action}`
    const allowedRoles = PERMISSIONS[permissionKey]

    if (!allowedRoles) {
      return jsonResponse({
        authorized: false,
        error: `Unknown permission: ${permissionKey}`,
        user_id: user.id,
        role: userRole,
        mfa_verified: mfaVerified,
      }, 400)
    }

    // ADMIN role has implicit access to everything
    const hasPermission = userRole === 'ADMIN' || allowedRoles.includes(userRole)

    if (!hasPermission) {
      // Log the unauthorized attempt
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: user.id,
        action: 'UNAUTHORIZED_ATTEMPT',
        entity: body.resource,
        entity_id: null,
        metadata: {
          attempted_action: body.action,
          user_role: userRole,
          required_roles: allowedRoles,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
          user_agent: req.headers.get('user-agent'),
        },
      })

      return jsonResponse({
        authorized: false,
        error: `Role '${userRole}' does not have permission for '${permissionKey}'`,
        user_id: user.id,
        role: userRole,
        mfa_verified: mfaVerified,
      }, 403)
    }

    // ─── 6. Authorized ───────────────────────────────────────
    return jsonResponse({
      authorized: true,
      user_id: user.id,
      role: userRole,
      mfa_verified: mfaVerified,
    }, 200)

  } catch (error: any) {
    console.error('Authorization error:', error)
    return jsonResponse({
      authorized: false,
      error: 'Internal authorization error',
      user_id: null,
      role: null,
      mfa_verified: false,
    }, 500)
  }
})

function jsonResponse(data: AuthResult | Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
