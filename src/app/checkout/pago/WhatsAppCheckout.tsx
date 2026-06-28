'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconArrowLeft, IconBrandWhatsapp, IconCheck } from '@tabler/icons-react'
import { useCarrito } from '@/store/carrito'
import { crearPedidoWhatsApp } from '@/lib/actions/pedidos'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'
import { OrderSummary } from '@/components/checkout/OrderSummary'

export function WhatsAppCheckout({ tiendaNombre = 'Mi Tienda' }: { tiendaNombre?: string }) {
  const router = useRouter()
  const items = useCarrito((s) => s.items)
  const total = useCarrito((s) => s.total)
  const clearCart = useCarrito((s) => s.clearCart)
  const checkoutInfo = useCarrito((s) => s.checkoutInfo)

  const [terminosChecked, setTerminosChecked] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const orderCompletedRef = useRef(false)

  useEffect(() => {
    if (orderCompletedRef.current) return
    if (items.length === 0 || !checkoutInfo.email) router.replace('/checkout')
  }, [items.length, checkoutInfo.email, router])

  if (items.length === 0 || !checkoutInfo.email) return null

  function handleConfirmar() {
    setError('')
    startTransition(async () => {
      const result = await crearPedidoWhatsApp({
        items,
        clienteNombre: checkoutInfo.nombre,
        clienteTelefono: checkoutInfo.telefono,
        clienteEmail: checkoutInfo.email,
        clienteDireccion: checkoutInfo.direccion,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      orderCompletedRef.current = true
      clearCart()

      // Abrir WhatsApp en nueva pestaña y redirigir a confirmación
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer')
      router.push(`/checkout/confirmacion?order=${result.orderId}`)
    })
  }

  const totalSoles = (total() / 100).toFixed(2)

  return (
    <main className="min-h-screen px-4 py-10 bg-[#1F1F22]">
      <div className="max-w-5xl mx-auto">
        <CheckoutStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="w-full">
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              disabled={isPending}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#9A9A9E] hover:text-[#F5F5F2] transition-colors disabled:opacity-60"
            >
              <IconArrowLeft size={16} />
              Volver
            </button>

            <h1 className="text-2xl font-display text-[#F5F5F2] mb-1">Método de pago</h1>
            <p className="text-sm text-[#9A9A9E] mb-6">
              Coordina el pago directamente con {tiendaNombre} por WhatsApp.
            </p>

            {/* Resumen del pedido a confirmar */}
            <div className="bg-[#2A2A2D] border border-[#2C2C30] rounded-2xl p-5 mb-5">
              <h2 className="text-sm font-semibold text-[#F5F5F2] mb-3">Resumen de tu pedido</h2>
              <ul className="space-y-2">
                {items.map((item, i) => {
                  const extras = [item.talla, item.color].filter(Boolean).join(', ')
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[#C9C9CD]">
                        {item.nombre}
                        {extras && <span className="text-[#9A9A9E] ml-1">({extras})</span>}
                        {' '}×{item.cantidad}
                      </span>
                      <span className="text-[#F5F5F2] font-medium shrink-0">
                        S/{(item.precio * item.cantidad / 100).toFixed(2)}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-[#2C2C30] mt-3 pt-3 flex justify-between text-sm font-bold">
                <span className="text-[#9A9A9E]">Total</span>
                <span className="text-[#F5F5F2]">S/{totalSoles}</span>
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="bg-[#2A2A2D] border border-[#2C2C30] rounded-2xl p-5 mb-5">
              <h2 className="text-sm font-semibold text-[#F5F5F2] mb-3">Tus datos</h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="text-[#9A9A9E] w-24 shrink-0">Nombre</dt>
                  <dd className="text-[#F5F5F2]">{checkoutInfo.nombre}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[#9A9A9E] w-24 shrink-0">Teléfono</dt>
                  <dd className="text-[#F5F5F2]">{checkoutInfo.telefono}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[#9A9A9E] w-24 shrink-0">Dirección</dt>
                  <dd className="text-[#F5F5F2]">{checkoutInfo.direccion}</dd>
                </div>
              </dl>
            </div>

            {/* Términos */}
            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={terminosChecked}
                onChange={(e) => setTerminosChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[var(--color-brand)] shrink-0"
              />
              <span className="text-sm text-[#9A9A9E] leading-relaxed">
                He leído y acepto los{' '}
                <Link href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer"
                  className="underline text-[#F5F5F2]">
                  Términos y condiciones
                </Link>
                {' '}de compra.
              </span>
            </label>

            {/* Cómo funciona */}
            <div className="bg-[#1a2e1a] border border-[#254725] rounded-2xl p-4 mb-5">
              <p className="text-xs font-semibold text-[#4ade80] mb-2">¿Cómo funciona?</p>
              <ol className="space-y-1.5">
                {[
                  'Haz clic en "Confirmar pedido" para registrarlo.',
                  'Se abrirá WhatsApp con tu pedido listo para enviar.',
                  'Coordina el pago y entrega con la tienda.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#86efac]">
                    <span className="w-4 h-4 bg-[#166534] text-[#4ade80] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-400 mb-4">{error}</p>
            )}

            <button
              onClick={handleConfirmar}
              disabled={!terminosChecked || isPending}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#25D366' }}
            >
              <IconBrandWhatsapp size={20} />
              {isPending ? 'Registrando pedido...' : 'Confirmar pedido y pagar por WhatsApp'}
            </button>

            {terminosChecked && !isPending && (
              <p className="text-xs text-[#9A9A9E] text-center mt-3 flex items-center justify-center gap-1.5">
                <IconCheck size={12} className="text-[#4ade80]" />
                Tu pedido se registrará y se abrirá WhatsApp automáticamente
              </p>
            )}
          </div>

          <div className="order-first lg:order-2">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  )
}
