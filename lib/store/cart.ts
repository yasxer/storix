import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  article_id: string
  size_id: string
  color_id: string
  quantity: number
  unit_price: number
  title: string
  photo_url: string | null
  size_label: string
  color_name: string
  color_hex: string
}

export interface CartStore {
  items: CartItem[]
  coupon: { id: string; code: string; type: 'percent'|'fixed'; value: number } | null
  addItem: (item: CartItem) => void
  removeItem: (article_id: string, size_id: string, color_id: string) => void
  updateQuantity: (article_id: string, size_id: string, color_id: string, qty: number) => void
  clearCart: () => void
  setCoupon: (coupon: CartStore['coupon']) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,

      addItem: (item) => set((state) => {
        const existingItem = state.items.find(
          (i) => i.article_id === item.article_id && 
                 i.size_id === item.size_id && 
                 i.color_id === item.color_id
        )

        if (existingItem) {
          // If exists, just increase quantity
          return {
            items: state.items.map((i) =>
              i.article_id === item.article_id && 
              i.size_id === item.size_id && 
              i.color_id === item.color_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }

        // Add new item
        return { items: [...state.items, item] }
      }),

      removeItem: (article_id, size_id, color_id) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.article_id === article_id && i.size_id === size_id && i.color_id === color_id)
        )
      })),

      updateQuantity: (article_id, size_id, color_id, qty) => set((state) => ({
        items: state.items.map((i) =>
          i.article_id === article_id && i.size_id === size_id && i.color_id === color_id
            ? { ...i, quantity: qty }
            : i
        )
      })),

      clearCart: () => set({ items: [], coupon: null }),
      
      setCoupon: (coupon) => set({ coupon }),
    }),
    {
      name: 'hanot-cart-storage', // name of the item in the storage (must be unique)
    }
  )
)