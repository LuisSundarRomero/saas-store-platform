'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { IconArrowLeft } from '@tabler/icons-react'
import { useCarrito } from '@/store/carrito'
import { crearPedidoConCulqi } from '@/lib/actions/pedidos'
import { pushEvent } from '@/lib/utils/gtm'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import styles from './pago.module.css'
interface CulqiCheckoutConfig {
  settings: { title: string; currency: string; amount: number }
  client?: { email?: string }
  options?: {
    lang?: string
    installments?: boolean
    modal?: boolean
    container?: string
    paymentMethods?: Record<string, boolean>
    paymentMethodsSort?: string[]
  }
  appearance?: {
    hiddenCulqiLogo?: boolean
    hiddenBannerContent?: boolean
    hiddenBanner?: boolean
    hiddenToolBarAmount?: boolean
    hiddenEmail?: boolean
    menuType?: 'sidebar' | 'sliderTop' | 'select'
    buttonCardPayText?: string
    defaultStyle?: {
      bannerColor?: string
      buttonBackground?: string
      menuColor?: string
      linksColor?: string
      buttonTextColor?: string
      priceColor?: string
    }
    variables?: Record<string, string>
    rules?: Record<string, Record<string, string>>
  }
}

interface CulqiCheckoutInstance {
  open: () => void
  close: () => void
  culqi?: () => void
  token?: { id: string; email: string }
  error?: { user_message?: string; merchant_message?: string }
}

declare global {
  interface Window {
    CulqiCheckout?: new (publicKey: string, config: CulqiCheckoutConfig) => CulqiCheckoutInstance
  }
}

const CULQI_NATURAL_WIDTH = 440

export function PagoCheckout({ tiendaNombre = 'Mi Tienda', culqiPublicKey }: { tiendaNombre?: string; culqiPublicKey?: string }) {
  const router = useRouter()
  const items = useCarrito((s) => s.items)
  const total = useCarrito((s) => s.total)
  const itemCount = useCarrito((s) => s.itemCount)
  const clearCart = useCarrito((s) => s.clearCart)
  const checkoutInfo = useCarrito((s) => s.checkoutInfo)

  const [error, setError] = useState('')
  const [culqiReady, setCulqiReady] = useState(
    () => typeof window !== 'undefined' && !!window.CulqiCheckout
  )
  const [isPending, startTransition] = useTransition()
  const culqiRef = useRef<CulqiCheckoutInstance | null>(null)
  const culqiWrapperRef = useRef<HTMLDivElement>(null)
  const [culqiScale, setCulqiScale] = useState(1)
  const [formVisible, setFormVisible] = useState(false)
  const [terminosChecked, setTerminosChecked] = useState(false)
  const orderCompletedRef = useRef(false)

  useEffect(() => {
    if (orderCompletedRef.current) return
    if (items.length === 0 || !checkoutInfo.email) router.replace('/checkout')
  }, [items.length, checkoutInfo.email, router])

  useEffect(() => {
    const wrapper = culqiWrapperRef.current
    if (!wrapper) return

    const updateScale = () => {
      const width = wrapper.clientWidth

      const scale = width / CULQI_NATURAL_WIDTH

      setCulqiScale(Math.min(1, scale))
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [])

  function procesarPago(token: string, email: string) {
    pushEvent('add_payment_info', { total: total(), items_count: itemCount() })

    startTransition(async () => {
      try {
        const result = await crearPedidoConCulqi({
          items,
          clienteNombre: checkoutInfo.nombre,
          clienteTelefono: checkoutInfo.telefono,
          clienteDireccion: checkoutInfo.direccion,
          clienteEmail: email,
          culqiToken: token,
        })

        if (!result.success) {
          const params = new URLSearchParams({ type: result.errorType, message: result.error })
          if (result.chargeId) params.set('charge', result.chargeId)

          if (result.errorType === 'order_failed') {
            orderCompletedRef.current = true
            clearCart()
          }

          router.push(`/checkout/error?${params.toString()}`)
          return
        }

        pushEvent('purchase', { order_id: result.orderId, total: total(), items_count: itemCount() })
        orderCompletedRef.current = true
        clearCart()
        router.push(`/checkout/confirmacion?order=${result.orderId}`)
      } catch (err) {
        console.error('[checkout]', err)
        const params = new URLSearchParams({
          type: 'generic',
          message: 'Hubo un problema al registrar tu pedido. Si el cargo se realizó, contáctanos.',
        })
        router.push(`/checkout/error?${params.toString()}`)
      }
    })
  }

  useEffect(() => {
    if (items.length === 0 || !checkoutInfo.email || !culqiReady || !window.CulqiCheckout) return

    const checkout = new window.CulqiCheckout(culqiPublicKey ?? process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? '', {
      settings: {
        title: tiendaNombre,
        currency: 'PEN',
        amount: total(),
      },
      client: {
        email: checkoutInfo.email,
      },
      options: {
        lang: 'auto',
        installments: false,
        modal: false,
        container: '#culqi-checkout-container',
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: false,
          bancaMovil: false,
          agente: false,
          cuotealo: false,
        },
        paymentMethodsSort: ['tarjeta', 'yape'],
      },
      appearance: {
        hiddenCulqiLogo: true,
        hiddenBannerContent: true,
        hiddenBanner: true,
        hiddenToolBarAmount: true,
        hiddenEmail: false,
        menuType: 'select',
        buttonCardPayText: 'Pagar ahora',
        defaultStyle: {
          bannerColor: '#1F1F22',
          buttonBackground: '#1d5ee1',
          menuColor: '#1d5ee1',
          linksColor: '#1d5ee1',
          buttonTextColor: '#FFFFFF',
          priceColor: '#F5F5F2',
        },
        variables: {
          fontFamily: 'Inter, sans-serif',
          borderRadius: '12px',
          colorBackground: '#161618',
          colorPrimary: '#1d5ee1',
          colorPrimaryText: '#FFFFFF',
          colorText: '#F5F5F2',
          colorTextSecondary: '#9A9A9E',
          colorTextPlaceholder: '#6B6B70',
          colorIconTab: '#1d5ee1',
        },
        rules: {
          '.Culqi-Main-Container': {
            background: '#1F1F22',
            fontFamily: 'var(--fontFamily)',
            padding: '16px 12px 4px 12px',
            position: 'fixed',
            inset: '0',
            width: '100vw',
            minHeight: '100vh',
            boxSizing: 'border-box',
          },
          '.Culqi-ToolBanner': {
            background: '#1F1F22',
            color: '#F5F5F2',
          },
          '.Culqi-Toolbar-Price': {
            background: '#1F1F22',
            color: '#F5F5F2',
          },
          '.Culqi-ToolBar': {
            background: '#1F1F22',
            color: '#F5F5F2',
          },
          '.Culqi-Main-Method': {
            background: '#1F1F22',
            width: '100%',
            minWidth: '0',
            boxSizing: 'border-box',
          },
          '.Culqi-Label': {
            color: '#9A9A9E',
          },
          '.Culqi-Input': {
            background: '#1F1F22',
            border: '1px solid #2C2C30',
            color: '#F5F5F2',
            width: '100%',
            minWidth: '0',
            boxSizing: 'border-box',
          },
          '.Culqi-Input:focus': {
            border: '1px solid #1d5ee1',
          },
          '.Culqi-Input-Select': {
            background: '#1F1F22',
            border: '1px solid #2C2C30',
            color: '#F5F5F2',
            width: '100%',
            minWidth: '0',
            boxSizing: 'border-box',
          },
          '.Culqi-Input-Select-Options': {
            background: '#1F1F22',
          },
          '.Culqi-Input-Select-Options-Hover': {
            background: '#2C2C30',
            color: '#F5F5F2',
          },
          '.Culqi-Button': {
            background: '#1d5ee1',
          },
          '.Culqi-Menu': {
            color: '#9A9A9E',
            background: '#1F1F22',
          },
          '.Culqi-Menu-Selected': {
            color: '#F5F5F2',
          },
          '.Culqi-Menu-Selected .Culqi-Icon': {
            color: '#F5F5F2',
          },
          '.Culqi-Menu-Options': {
            background: '#1F1F22',
          },
          '.Culqi-Menu-Options-Hover': {
            background: '#2C2C30',
            color: '#F5F5F2',
          },
          '.Culqi-Text-Link': {
            color: '#1d5ee1',
          },
          '.Culqi-Yape-Title': {
            color: '#F5F5F2',
          },
          '.Culqi-Yape-Description': {
            color: '#C9C9CD',
          },
          '.Culqi-Yape-Steps': {
            color: '#C9C9CD',
          },
          '.Culqi-Yape-Step': {
            color: '#C9C9CD',
          },
          '.Culqi-Description': {
            color: '#C9C9CD',
          },
          '.Culqi-SubTitle': {
            color: '#F5F5F2',
          },
          '.Culqi-Text': {
            color: '#C9C9CD',
          },
          '.Culqi-Steps': {
            color: '#C9C9CD',
          },
          '.Culqi-Step': {
            color: '#C9C9CD',
          },
          '.Culqi-Footer': {
            color: '#C9C9CD',
          },
          '.Culqi-Footer-Text': {
            color: '#C9C9CD',
          },
          '.Culqi-PoweredBy': {
            color: '#C9C9CD',
          },
          '.Culqi-PoweredBy-Text': {
            color: '#C9C9CD',
          },
          '.Culqi-Security-Text': {
            color: '#C9C9CD',
          },
        },
      },
    })

    culqiRef.current = checkout
    checkout.culqi = function () {
      if (checkout.token) {
        const { id, email } = checkout.token
        checkout.close()
        procesarPago(id, email)
      } else {
        setError(checkout.error?.user_message ?? 'No se pudo procesar el pago.')
      }
    }

    const container = document.getElementById('culqi-checkout-container')
    const formObserver = container
      ? new MutationObserver(() => {
          if (container.childElementCount > 0) {
            setFormVisible(true)
            formObserver?.disconnect()
          }
        })
      : null
    formObserver?.observe(container as HTMLElement, { childList: true })

    setTimeout(() => {
      checkout.open()
    }, 100)

    return () => {
      culqiRef.current = null
      formObserver?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, checkoutInfo.email, culqiReady])

  if (items.length === 0 || !checkoutInfo.email) return null

  return (
    <main className="min-h-screen px-4 py-10 bg-[#1F1F22]">
      <div className="max-w-5xl mx-auto">
        <CheckoutStepper currentStep={2} />

        <div className=" grid
 grid-cols-1
 lg:grid-cols-[1fr_360px]
 gap-8
 items-start
">
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
              Tus datos de pago son procesados de forma segura por Culqi.
            </p>

            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={terminosChecked}
                onChange={(e) => setTerminosChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[var(--color-brand)] shrink-0"
              />
              <span className="text-sm text-[#9A9A9E] leading-relaxed">
                He leído y acepto los{' '}
                <Link href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer"
                  className="underline" style={{ color: '#F5F5F2' }}>
                  Términos y condiciones
                </Link>
                {' '}de compra, incluyendo la política de pagos, tiempos de entrega y devoluciones.
              </span>
            </label>

            <div className="relative">
              <div
                ref={culqiWrapperRef}
                className={styles.culqiWrapper}
                style={{
                  opacity: terminosChecked ? 1 : 0.35,
                  pointerEvents: terminosChecked ? 'auto' : 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                {!formVisible && (
                  <div className={styles.skeleton}>
                    <div className={styles.skeletonBar} style={{ width: '40%' }} />
                    <div className={styles.skeletonTabs}>
                      <div className={styles.skeletonTab} />
                      <div className={styles.skeletonTab} />
                    </div>
                    <div className={styles.skeletonBar} style={{ width: '30%', height: 10 }} />
                    <div className={styles.skeletonField} />
                    <div className={styles.skeletonBar} style={{ width: '30%', height: 10 }} />
                    <div className={styles.skeletonField} />
                    <div className={styles.skeletonRow}>
                      <div className={styles.skeletonField} style={{ flex: 1 }} />
                      <div className={styles.skeletonField} style={{ flex: 1 }} />
                    </div>
                    <div className={styles.skeletonBar} style={{ width: '30%', height: 10 }} />
                    <div className={styles.skeletonField} />
                    <div className={styles.skeletonButton} />
                  </div>
                )}

                <div
                  id="culqi-checkout-container"
                  className={styles.culqiContainer}
                  style={{
                    transform: `scale(${culqiScale})`,
                    opacity: formVisible ? 1 : 0,
                  }}
                />
              </div>

              {!terminosChecked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-xs font-medium text-[#F5F5F2] bg-[#1F1F22]/90 px-3 py-1.5 rounded-full border border-[#2C2C30]">
                    Acepta los términos para continuar
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs font-medium mt-3" style={{ color: '#EF4444' }}>
                {error}
              </p>
            )}

            {isPending && (
              <p className="text-xs text-[#9A9A9E] text-center mt-3">Procesando pago...</p>
            )}
          </div>

          <div className="order-first lg:order-2">
            <OrderSummary />
          </div>
        </div>
      </div>

      <Script
        src="https://js.culqi.com/checkout-js"
        strategy="afterInteractive"
        onLoad={() => setCulqiReady(true)}
      />
    </main>
  )
}
