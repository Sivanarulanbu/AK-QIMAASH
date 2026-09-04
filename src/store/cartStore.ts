import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'
import { formatPrice } from '@/lib/commerce'

type Variant = Database['public']['Tables']['product_variants']['Row']

export interface CartItem {
  id: string // cart item ID (local UUID for guests)
  variantId: string
  productId: string
  productName: string
  productSlug: string
  variantSku: string
  variantSize: string | null
  variantColor: string | null
  imageUrl: string | null
  priceCents: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  setItems: (items: CartItem[]) => void

  // Computed
  totalItems: () => number
  subtotalCents: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === newItem.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [
              ...state.items,
              { ...newItem, id: crypto.randomUUID() },
            ],
            isOpen: true,
          }
        })
      },

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      setItems: (items) => set({ items }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    }),
    {
      name: 'akq-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
