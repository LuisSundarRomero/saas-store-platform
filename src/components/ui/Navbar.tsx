'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { IconShoppingBag, IconPackage } from '@tabler/icons-react'
import { useCarrito } from '@/store/carrito'
import { CartDrawer } from '@/components/carrito/CartDrawer'

interface NavbarProps {
  tiendaNombre?: string
}

function subscribeNoop() {
  return () => {}
}

function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

export function Navbar({ tiendaNombre = 'Anarchyy.pe' }: NavbarProps) {
  const mounted = useMounted()
  const itemCount = useCarrito((s) => s.itemCount())
  const isOpen   = useCarrito((s) => s.isOpen)
  const openCart  = useCarrito((s) => s.openCart)
  const closeCart = useCarrito((s) => s.closeCart)

  const count = mounted ? itemCount : 0

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#1F1F22]/95 backdrop-blur border-b border-[#2C2C30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

          <Link href="/" className="font-display text-xl tracking-widest shrink-0 text-[#F5F5F2]">
            {tiendaNombre}
          </Link>

          <nav className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-4 mr-3">
              <Link href="/catalogo" className="text-sm text-[#9A9A9E] hover:text-[#F5F5F2] font-medium transition-colors">
                Catálogo
              </Link>
              <Link href="/rastrear" className="text-sm text-[#9A9A9E] hover:text-[#F5F5F2] font-medium transition-colors">
                Rastrear pedido
              </Link>
            </div>

            <Link
              href="/rastrear"
              className="sm:hidden p-2 rounded-full hover:bg-[#1F1F22] transition-colors text-[#9A9A9E] hover:text-[#F5F5F2]"
            >
              <IconPackage size={22} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-[#1F1F22] transition-colors text-[#9A9A9E] hover:text-[#F5F5F2]"
            >
              <IconShoppingBag size={22} />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1"
                  style={{ backgroundColor: '#E11D2E' }}
                >
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {mounted && <CartDrawer open={isOpen} onClose={closeCart} />}
    </>
  )
}
