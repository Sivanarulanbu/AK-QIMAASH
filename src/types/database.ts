/**
 * Database type definitions matching the Supabase schema.
 * Generated manually from the migration SQL.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'ORDER_MANAGER' | 'CONTENT_MANAGER'

export type PaymentMethod = 'COD' | 'STRIPE' | 'PAYNOW'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type InventoryTransactionType =
  | 'STOCK_RECEIVED'
  | 'STOCK_ADJUSTMENT'
  | 'ORDER_RESERVATION'
  | 'ORDER_CANCELLATION'
  | 'ORDER_FULFILLMENT'
  | 'RETURN'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: UserRole
          created_at?: string
        }
        Update: never
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          is_active: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          position?: number
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          category_id: string | null
          is_published: boolean
          is_archived: boolean
          tags: string[]
          material: string | null
          care_instructions: string | null
          origin: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          is_published?: boolean
          is_archived?: boolean
          tags?: string[]
          material?: string | null
          care_instructions?: string | null
          origin?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          is_published?: boolean
          is_archived?: boolean
          tags?: string[]
          material?: string | null
          care_instructions?: string | null
          origin?: string | null
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          size: string | null
          color: string | null
          color_hex: string | null
          price_cents: number
          compare_price_cents: number | null
          stock_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          size?: string | null
          color?: string | null
          color_hex?: string | null
          price_cents: number
          compare_price_cents?: number | null
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          sku?: string
          size?: string | null
          color?: string | null
          color_hex?: string | null
          price_cents?: number
          compare_price_cents?: number | null
          stock_quantity?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt: string | null
          position: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt?: string | null
          position?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          url?: string
          alt?: string | null
          position?: number
          is_primary?: boolean
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          session_id?: string | null
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          quantity?: number
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: never
      }
      wishlist_items: {
        Row: {
          id: string
          wishlist_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          wishlist_id: string
          product_id: string
          created_at?: string
        }
        Update: never
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          recipient_name: string
          phone: string
          block_building: string | null
          street: string
          unit_number: string | null
          postal_code: string
          additional_info: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          recipient_name: string
          phone: string
          block_building?: string | null
          street: string
          unit_number?: string | null
          postal_code: string
          additional_info?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          label?: string | null
          recipient_name?: string
          phone?: string
          block_building?: string | null
          street?: string
          unit_number?: string | null
          postal_code?: string
          additional_info?: string | null
          is_default?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          address_snapshot: Json
          status: OrderStatus
          payment_method: PaymentMethod
          payment_status: PaymentStatus
          payment_reference: string | null
          subtotal_cents: number
          gst_cents: number
          delivery_cents: number
          total_cents: number
          notes: string | null
          courier_name: string | null
          tracking_number: string | null
          estimated_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id: string
          address_snapshot: Json
          status?: OrderStatus
          payment_method: PaymentMethod
          payment_status?: PaymentStatus
          payment_reference?: string | null
          subtotal_cents: number
          gst_cents: number
          delivery_cents: number
          total_cents: number
          notes?: string | null
          courier_name?: string | null
          tracking_number?: string | null
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          payment_status?: PaymentStatus
          payment_reference?: string | null
          notes?: string | null
          courier_name?: string | null
          tracking_number?: string | null
          estimated_delivery?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string
          product_id: string
          product_name: string
          variant_sku: string
          variant_size: string | null
          variant_color: string | null
          quantity: number
          unit_price_cents: number
          total_price_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          variant_id: string
          product_id: string
          product_name: string
          variant_sku: string
          variant_size?: string | null
          variant_color?: string | null
          quantity: number
          unit_price_cents: number
          total_price_cents: number
          created_at?: string
        }
        Update: never
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: OrderStatus
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: OrderStatus
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: never
      }
      inventory_transactions: {
        Row: {
          id: string
          variant_id: string
          transaction_type: InventoryTransactionType
          quantity_delta: number
          quantity_before: number
          quantity_after: number
          order_id: string | null
          reference: string | null
          reason: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          transaction_type: InventoryTransactionType
          quantity_delta: number
          quantity_before: number
          quantity_after: number
          order_id?: string | null
          reference?: string | null
          reason?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: never
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          body: string | null
          is_approved: boolean
          is_flagged: boolean
          moderation_note: string | null
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          is_approved?: boolean
          is_flagged?: boolean
          moderation_note?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          title?: string | null
          body?: string | null
          is_approved?: boolean
          is_flagged?: boolean
          moderation_note?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity: string
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: UserRole | null
      }
      has_role: {
        Args: { user_id: string; role: UserRole }
        Returns: boolean
      }
    }
    Enums: {
      order_status: OrderStatus
      user_role: UserRole
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      inventory_transaction_type: InventoryTransactionType
    }
  }
}
