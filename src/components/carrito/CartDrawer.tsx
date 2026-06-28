'use client'

import { useState } from 'react'
import { IconX, IconShoppingBag, IconArrowRight, IconCreditCard, IconBrandWhatsapp } from '@tabler/icons-react'
import Link from 'next/link'
import { useCarrito } from '@/store/carrito'
import { formatPrice } from '@/lib/utils/format'
import { CartItemRow } from './CartItemRow'

const DEFAULT_TEMPLATE =
  'Hola! Quiero hacer un pedido 🛍️\n\n' +
  '*Nombre:* {nombre}\n' +
  '*Celular:* {celular}\n\n' +
  '*Productos:*\n{items}\n\n' +
  '*Total:* {total}'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  planBasico?: boolean
  whatsappNumero?: string
  whatsappTemplate?: string
}

export function CartDrawer({
  open,
  onClose,
  planBasico = false,
  whatsappNumero = '',
  whatsappTemplate = '',
}: CartDrawerProps) {
  const items     = useCarrito((s) => s.items)
  const total     = useCarrito((s) => s.total)
  const clearCart = useCarrito((s) => s.clearCart)

  const itemCount = items.reduce((s, i) => s + i.cantidad, 0)

  const [nombre, setNombre]   = useState('')
  const [celular, setCelular] = useState('')

  function handleWhatsApp() {
    const template  = whatsappTemplate || DEFAULT_TEMPLATE
    const totalSoles = (total() / 100).toFixed(2)

    const lineas = items
      .map((i) => {
        const extras = [i.talla, i.color].filter(Boolean).join(', ')
        return `• ${i.nombre}${extras ? ` (${extras})` : ''} x${i.cantidad} — S/${(i.precio * i.cantidad / 100).toFixed(2)}`
      })
      .join('\n')

    const mensaje = template
      .replace(/{nombre}/g, nombre.trim())
      .replace(/{celular}/g, celular.trim())
      .replace(/{items}/g, lineas)
      .replace(/{total}/g, `S/${totalSoles}`)

    const numero = whatsappNumero.replace(/\D/g, '')
    const url = numero
      ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`

    clearCart()
    onClose()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const canSubmit = nombre.trim() && celular.trim().length >= 7

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}

      <div
        className="fixed top-0 right-0 h-full w-full max-w-[380px] z-50 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: open ? 'auto' : 'none',
          visibility: open ? 'visible' : 'hidden',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <IconShoppingBag size={20} style={{ color: 'var(--color-ink)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>Mi carrito</span>
            {itemCount > 0 && (
              <span className="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand)' }}>
                {itemCount}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
                <IconShoppingBag size={36} strokeWidth={1} style={{ color: 'var(--color-border)' }} />
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>Tu carrito está vacío</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Agrega productos para comenzar</p>
              </div>
              <Link href="/catalogo" onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}>
                Explorar catálogo <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ borderColor: 'var(--color-border)' }} className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <CartItemRow key={`${item.productoId}-${item.talla}-${item.color}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>

            {/* Total */}
            <div className="px-5 pt-4 pb-3 flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Total del pedido</span>
              <span className="font-bold text-xl" style={{ color: 'var(--color-ink)' }}>{formatPrice(total())}</span>
            </div>

            {planBasico ? (
              /* ── Plan Básico: mini form WhatsApp ── */
              <div className="px-5 pb-5 flex flex-col gap-2.5">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-ink)',
                  }}
                />
                <input
                  type="tel"
                  placeholder="Número de celular"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-ink)',
                  }}
                />
                <button
                  onClick={handleWhatsApp}
                  disabled={!canSubmit}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-white text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <IconBrandWhatsapp size={18} />
                  Pedir por WhatsApp
                </button>
              </div>
            ) : (
              /* ── Plan Pro: ir al checkout ── */
              <div className="px-5 pb-5">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-opacity"
                  style={{ backgroundColor: 'var(--color-brand)', touchAction: 'manipulation' }}
                >
                  <IconCreditCard size={20} />
                  Ir a pagar · {formatPrice(total())}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
