'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

export interface CheckoutInfo {
  nombre: string
  telefono: string
  email: string
  direccion: string
}

const emptyCheckoutInfo: CheckoutInfo = { nombre: '', telefono: '', email: '', direccion: '' }

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  checkoutInfo: CheckoutInfo
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (productoId: string, talla: string, color: string) => void
  updateQty: (productoId: string, talla: string, color: string, qty: number) => void
  setCheckoutInfo: (info: Partial<CheckoutInfo>) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCarrito = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      checkoutInfo: emptyCheckoutInfo,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      setCheckoutInfo: (info) =>
        set((state) => ({ checkoutInfo: { ...state.checkoutInfo, ...info } })),

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

      clearCart: () => set({ items: [], checkoutInfo: emptyCheckoutInfo }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    {
      name: 'saas-ropa-cart',
      // isOpen nunca se persiste — siempre empieza cerrado
      partialize: (state) => ({ items: state.items, checkoutInfo: state.checkoutInfo }),
      // Completa campos nuevos de checkoutInfo (ej: direccion) ausentes en estado persistido viejo
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CartStore>
        return {
          ...current,
          ...persistedState,
          checkoutInfo: { ...current.checkoutInfo, ...persistedState.checkoutInfo },
        }
      },
    }
  )
)
