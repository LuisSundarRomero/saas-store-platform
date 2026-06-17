'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IconAlertTriangle, IconBrandWhatsapp, IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

const DEFAULT_MESSAGE = 'Ocurrió un error inesperado al procesar tu pago. Por favor, intenta nuevamente.'

const TITLES: Record<string, string> = {
  card_error: 'Pago rechazado',
  review: 'Verificación requerida',
  order_failed: 'Pago realizado',
  generic: 'No pudimos procesar tu pago',
}

export default function CheckoutErrorPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') ?? 'generic'
  const message = searchParams.get('message') || DEFAULT_MESSAGE
  const charge = searchParams.get('charge')

  const title = TITLES[type] ?? TITLES.generic
  const isOrderFailed = type === 'order_failed'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#1F1F22]">
      <div className="w-full max-w-sm">
        <CheckoutStepper currentStep={2} />

        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#3A1014' }}
          >
            <IconAlertTriangle size={36} style={{ color: '#FF6B7A' }} />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-display text-[#F5F5F2] mb-2">{title}</h1>
          <p className="text-[#9A9A9E] text-sm leading-relaxed">{message}</p>
        </div>

        {isOrderFailed && charge && (
          <div
            className="rounded-2xl p-5 mb-5 text-center border border-[#2C2C30]"
            style={{ backgroundColor: '#161618' }}
          >
            <p className="text-xs font-semibold text-[#FF6B7A] uppercase tracking-widest mb-1">
              Código de cargo
            </p>
            <p className="text-lg font-bold break-all" style={{ color: 'var(--color-brand)' }}>
              {charge}
            </p>
            <p className="text-xs text-[#FF6B7A] mt-1">Guárdalo y compártelo con soporte</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isOrderFailed ? (
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hola! Mi pago se realizó${charge ? ` (cargo ${charge})` : ''} pero no se registró mi pedido. ¿Me ayudan?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <IconBrandWhatsapp size={20} />
              Contactar soporte
            </a>
          ) : (
            <Link
              href="/checkout/pago"
              className="w-full py-3.5 rounded-full font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <IconRefresh size={18} />
              Reintentar pago
            </Link>
          )}

          <Link
            href="/checkout"
            className="w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-1.5 border border-[#2C2C30] text-[#9A9A9E] hover:bg-[#161618] hover:text-[#F5F5F2] transition-colors"
          >
            <IconArrowLeft size={14} />
            Volver al carrito
          </Link>
        </div>
      </div>
    </main>
  )
}

