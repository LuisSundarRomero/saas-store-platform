'use client'

import Image from 'next/image'
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react'
import { CartItem } from '@/types'
import { formatPrice } from '@/lib/utils/format'
import { useCarrito } from '@/store/carrito'
import { pushEvent } from '@/lib/utils/gtm'

interface Props {
  item: CartItem
}

export function CartItemRow({ item }: Props) {
  const updateQty  = useCarrito((s) => s.updateQty)
  const removeItem = useCarrito((s) => s.removeItem)

  function handleRemove() {
    pushEvent('remove_from_cart', { product_id: item.productoId, product_name: item.nombre, cantidad: item.cantidad })
    removeItem(item.productoId, item.talla, item.color)
  }

  return (
    <div className="flex gap-3 px-5 py-4">
      {/* Imagen */}
      <div className="relative w-[72px] h-[90px] rounded-xl overflow-hidden shrink-0"
        style={{ backgroundColor: 'var(--color-surface)' }}>
        {item.imagen ? (
          <Image src={item.imagen} alt={item.nombre} fill sizes="72px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-border)' }}>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: 'var(--color-ink)' }}>
            {item.nombre}
          </p>
          {(item.talla || item.color) && (
            <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--color-muted)' }}>
              {[item.talla, item.color].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty */}
          <div className="flex items-center gap-1.5 rounded-full px-1 py-1"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <button
              onClick={() => updateQty(item.productoId, item.talla, item.color, item.cantidad - 1)}
              aria-label={`Reducir cantidad de ${item.nombre}`}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-ink)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <IconMinus size={11} aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold w-4 text-center" style={{ color: 'var(--color-ink)' }}
              aria-label={`Cantidad: ${item.cantidad}`}>
              {item.cantidad}
            </span>
            <button
              onClick={() => updateQty(item.productoId, item.talla, item.color, item.cantidad + 1)}
              aria-label={`Aumentar cantidad de ${item.nombre}`}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-ink)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <IconPlus size={11} aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>
              {formatPrice(item.precio * item.cantidad)}
            </span>
            <button onClick={handleRemove} aria-label={`Eliminar ${item.nombre} del carrito`}
              className="p-1 transition-colors hover:text-red-400"
              style={{ color: 'var(--color-muted)' }}>
              <IconTrash size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
