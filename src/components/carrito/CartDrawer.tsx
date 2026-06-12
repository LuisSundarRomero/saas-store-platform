'use client'

import { useState, useTransition } from 'react'
import { IconX, IconShoppingBag, IconBrandWhatsapp, IconArrowRight } from '@tabler/icons-react'
import Link from 'next/link'
import { useCarrito } from '@/store/carrito'
import { formatPrice } from '@/lib/utils/format'
import { createOrder } from '@/lib/actions/pedidos'
import { pushEvent } from '@/lib/utils/gtm'
import { CartItemRow } from './CartItemRow'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

function validarTelefono(tel: string): string | null {
  const limpio = tel.replace(/[\s\-\+\(\)]/g, '')
  if (!limpio) return 'Ingresa tu número de WhatsApp'
  if (!/^\d+$/.test(limpio)) return 'Solo se permiten números'
  if (limpio.length < 9) return 'El número debe tener al menos 9 dígitos'
  if (limpio.length > 15) return 'El número es demasiado largo'
  return null
}

function formatearTelefono(tel: string): string {
  // Limpia y agrega código de Perú si no tiene código de país
  const limpio = tel.replace(/[\s\-\+\(\)]/g, '')
  if (limpio.length === 9) return `51${limpio}` // número peruano sin código
  return limpio
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCarrito((s) => s.items)
  const total = useCarrito((s) => s.total)
  const clearCart = useCarrito((s) => s.clearCart)
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const itemCount = items.reduce((s, i) => s + i.cantidad, 0)

  function handleCheckout() {
    if (items.length === 0) return

    const errorTel = validarTelefono(telefono)
    if (errorTel) {
      setError(errorTel)
      return
    }

    setError('')
    const telefonoFormateado = formatearTelefono(telefono)

    startTransition(async () => {
      try {
        pushEvent('begin_checkout', { total: total(), items_count: itemCount })

        const { orderId, whatsappUrl } = await createOrder({
          items,
          clienteNombre: nombre.trim() || undefined,
          clienteTelefono: telefonoFormateado,
        })

        pushEvent('whatsapp_redirect', { order_id: orderId, total: total() })
        clearCart()
        setTelefono('')
        setNombre('')
        onClose()
        const waWindow = window.open(whatsappUrl, '_blank')
        // Si el navegador bloquea el popup, la página de confirmación ofrece el botón
        if (!waWindow) sessionStorage.setItem('wa_pending', whatsappUrl)
        window.location.href = `/checkout/confirmacion?order=${orderId}`
      } catch (err) {
        console.error('[checkout]', err)
        setError('No se pudo crear el pedido. Verifica tu conexión e intenta de nuevo.')
      }
    })
  }

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

            {/* Input nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#9A9A9E]">
                Tu nombre <span className="text-[#6B6B70] font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: María"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border rounded-xl px-3 py-3 text-sm outline-none bg-[#1F1F22] text-[#F5F5F2] transition-colors"
                style={{ borderColor: '#2C2C30' }}
              />
            </div>

            {/* Input teléfono */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#9A9A9E]">
                Tu número de WhatsApp
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="987 654 321"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckout()}
                className="w-full border rounded-xl px-3 py-3 text-sm outline-none bg-[#1F1F22] text-[#F5F5F2] transition-colors font-mono"
                style={{
                  borderColor: error ? '#EF4444' : telefono.length >= 9 ? '#E11D2E' : '#2C2C30',
                }}
              />
              {error ? (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              ) : (
                <p className="text-xs text-[#6B6B70]">
                  Solo el número, sin código de país (ej: 987 654 321)
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPending}
              className="w-full text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#25D366', touchAction: 'manipulation' }}
            >
              <IconBrandWhatsapp size={20} />
              {isPending ? 'Preparando pedido...' : `Pedir por WhatsApp · ${formatPrice(total())}`}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
