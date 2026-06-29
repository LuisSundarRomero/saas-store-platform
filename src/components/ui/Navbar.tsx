'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconShoppingBag, IconPackage } from '@tabler/icons-react'
import { useCarrito } from '@/store/carrito'
import { CartDrawer } from '@/components/carrito/CartDrawer'

interface NavbarProps {
  tiendaNombre?: string
  logoUrl?: string
  planBasico?: boolean
  whatsappNumero?: string
  whatsappTemplate?: string
}

function subscribeNoop() {
  return () => {}
}

function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

export function Navbar({ tiendaNombre = 'Mi Tienda', logoUrl, planBasico, whatsappNumero, whatsappTemplate }: NavbarProps) {
  const mounted = useMounted()
  const itemCount = useCarrito((s) => s.itemCount())
  const isOpen   = useCarrito((s) => s.isOpen)
  const openCart  = useCarrito((s) => s.openCart)
  const closeCart = useCarrito((s) => s.closeCart)

  const count = mounted ? itemCount : 0

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur border-b"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, transparent)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

          <Link href="/" className="shrink-0 flex items-center" aria-label={tiendaNombre}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={tiendaNombre}
                width={140}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            ) : (
              <span className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
                {tiendaNombre}
              </span>
            )}
          </Link>

          <nav className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-4 mr-3">
              <Link href="/catalogo" className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                Catálogo
              </Link>
              <Link href="/rastrear" className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                Rastrear pedido
              </Link>
            </div>

            <Link href="/rastrear" aria-label="Rastrear pedido" className="sm:hidden p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-muted)' }}>
              <IconPackage size={22} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={count > 0 ? `Carrito (${count} productos)` : 'Carrito de compras'}
              className="relative p-2 rounded-full transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <IconShoppingBag size={22} aria-hidden="true" />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                >
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {mounted && (
        <CartDrawer
          open={isOpen}
          onClose={closeCart}
          planBasico={planBasico}
          whatsappNumero={whatsappNumero}
          whatsappTemplate={whatsappTemplate}
        />
      )}
    </>
  )
}
