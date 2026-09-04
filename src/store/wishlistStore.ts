import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  addProduct: (productId: string) => void
  removeProduct: (productId: string) => void
  toggleProduct: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  setProductIds: (ids: string[]) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      addProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        })),

      removeProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),

      toggleProduct: (productId) => {
        if (get().isInWishlist(productId)) {
          get().removeProduct(productId)
        } else {
          get().addProduct(productId)
        }
      },

      isInWishlist: (productId) => get().productIds.includes(productId),

      clearWishlist: () => set({ productIds: [] }),

      setProductIds: (ids) => set({ productIds: ids }),
    }),
    {
      name: 'akq-wishlist',
    }
  )
)
