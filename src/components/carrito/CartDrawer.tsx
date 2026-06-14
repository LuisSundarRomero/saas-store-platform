'use client'

import { IconX, IconShoppingBag, IconArrowRight, IconCreditCard } from '@tabler/icons-react'
import Link from 'next/link'
import { useCarrito } from '@/store/carrito'
import { formatPrice } from '@/lib/utils/format'
import { CartItemRow } from './CartItemRow'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCarrito((s) => s.items)
  const total = useCarrito((s) => s.total)

  const itemCount = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}

      <div
        className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-[#1F1F22] z-50 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: open ? 'auto' : 'none',
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2C30]">
          <div className="flex items-center gap-2.5">
            <IconShoppingBag size={20} className="text-[#F5F5F2]" />
            <span className="font-semibold text-[#F5F5F2]">Mi carrito</span>
            {itemCount > 0 && (
              <span className="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E11D2E' }}>
                {itemCount}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 hover:bg-[#1F1F22] rounded-full transition-colors text-[#9A9A9E] hover:text-[#F5F5F2]">
            <IconX size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[#161618] flex items-center justify-center">
                <IconShoppingBag size={36} strokeWidth={1} className="text-[#3A3A3E]" />
              </div>
              <div>
                <p className="font-semibold text-[#F5F5F2] mb-1">Tu carrito está vacío</p>
                <p className="text-sm text-[#9A9A9E]">Agrega productos para comenzar</p>
              </div>
              <Link href="/catalogo" onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full text-white"
                style={{ backgroundColor: '#E11D2E' }}>
                Explorar catálogo <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#2C2C30]">
              {items.map((item) => (
                <CartItemRow key={`${item.productoId}-${item.talla}-${item.color}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#2C2C30] p-5 flex flex-col gap-3 bg-[#161618]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#9A9A9E]">Total del pedido</span>
              <span className="font-bold text-xl text-[#F5F5F2]">{formatPrice(total())}</span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-opacity"
              style={{ backgroundColor: '#E11D2E', touchAction: 'manipulation' }}
            >
              <IconCreditCard size={20} />
              Ir a pagar · {formatPrice(total())}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
