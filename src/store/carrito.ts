'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (productoId: string, talla: string, color: string) => void
  updateQty: (productoId: string, talla: string, color: string, qty: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCarrito = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productoId === item.productoId &&
              i.talla === item.talla &&
              i.color === item.color
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productoId === item.productoId &&
                i.talla === item.talla &&
                i.color === item.color
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productoId, talla, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productoId === productoId && i.talla === talla && i.color === color)
          ),
        }))
      },

      updateQty: (productoId, talla, color, qty) => {
        if (qty <= 0) {
          get().removeItem(productoId, talla, color)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productoId === productoId && i.talla === talla && i.color === color
              ? { ...i, cantidad: qty }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    {
      name: 'saas-ropa-cart',
      // isOpen nunca se persiste — siempre empieza cerrado
      partialize: (state) => ({ items: state.items }),
    }
  )
)
