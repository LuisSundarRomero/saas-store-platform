import Image from 'next/image'
import { useCarrito } from '@/store/carrito'
import { formatPrice } from '@/lib/utils/format'

export function OrderSummary() {
  const items = useCarrito((s) => s.items)
  const total = useCarrito((s) => s.total)

  const descuentoTotal = items.reduce((sum, item) => {
    if (item.precioAntes && item.precioAntes > item.precio) {
      return sum + (item.precioAntes - item.precio) * item.cantidad
    }
    return sum
  }, 0)

  return (
    <div className="rounded-2xl border border-[#2C2C30] bg-[#161618] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2C2C30]">
        <h2 className="text-sm font-semibold text-[#F5F5F2]">Resumen del pedido</h2>
      </div>

      <div className="divide-y divide-[#2C2C30] max-h-[320px] overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.productoId}-${item.talla}-${item.color}`} className="flex gap-3 px-5 py-3">
            <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#1F1F22] shrink-0">
              {item.imagen ? (
                <Image src={item.imagen} alt={item.nombre} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#3A3A3E]">🖤</div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-[#F5F5F2] line-clamp-2 leading-snug">{item.nombre}</p>
              <p className="text-xs text-[#9A9A9E] mt-0.5 capitalize">
                {[item.talla, item.color].filter(Boolean).join(' · ')}
                {item.cantidad > 1 ? ` · x${item.cantidad}` : ''}
              </p>
            </div>

            <div className="text-sm font-semibold text-[#F5F5F2] shrink-0 text-right">
              {item.precioAntes && item.precioAntes > item.precio && (
                <p className="text-xs text-[#6B6B70] line-through">
                  {formatPrice(item.precioAntes * item.cantidad)}
                </p>
              )}
              {formatPrice(item.precio * item.cantidad)}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-[#2C2C30] flex flex-col gap-1.5">
        {descuentoTotal > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#9A9A9E]">Descuento</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>
              -{formatPrice(descuentoTotal)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#9A9A9E]">Total</span>
          <span className="font-bold text-xl text-[#F5F5F2]">{formatPrice(total())}</span>
        </div>
      </div>
    </div>
  )
}

