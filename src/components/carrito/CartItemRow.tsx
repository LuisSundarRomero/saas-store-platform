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
  const updateQty = useCarrito((s) => s.updateQty)
  const removeItem = useCarrito((s) => s.removeItem)

  function handleRemove() {
    pushEvent('remove_from_cart', { product_id: item.productoId, product_name: item.nombre, cantidad: item.cantidad })
    removeItem(item.productoId, item.talla, item.color)
  }

  return (
    <div className="flex gap-3 px-5 py-4">
      {/* Imagen */}
      <div className="relative w-[72px] h-[90px] rounded-xl overflow-hidden bg-[#1F1F22] shrink-0">
        {item.imagen ? (
          <Image src={item.imagen} alt={item.nombre} fill sizes="72px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#1F1F22] flex items-center justify-center text-[#3A3A3E] text-xl">🖤</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-sm font-medium text-[#F5F5F2] line-clamp-2 leading-snug">{item.nombre}</p>
          {(item.talla || item.color) && (
            <p className="text-xs text-[#9A9A9E] mt-0.5 capitalize">
              {[item.talla, item.color].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty */}
          <div className="flex items-center gap-1.5 bg-[#1F1F22] rounded-full px-1 py-1">
            <button
              onClick={() => updateQty(item.productoId, item.talla, item.color, item.cantidad - 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#2C2C30] transition-colors text-[#F5F5F2]"
            >
              <IconMinus size={11} />
            </button>
            <span className="text-sm font-semibold text-[#F5F5F2] w-4 text-center">{item.cantidad}</span>
            <button
              onClick={() => updateQty(item.productoId, item.talla, item.color, item.cantidad + 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#2C2C30] transition-colors text-[#F5F5F2]"
            >
              <IconPlus size={11} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: '#E11D2E' }}>
              {formatPrice(item.precio * item.cantidad)}
            </span>
            <button onClick={handleRemove} className="p-1 text-[#6B6B70] hover:text-red-400 transition-colors">
              <IconTrash size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
