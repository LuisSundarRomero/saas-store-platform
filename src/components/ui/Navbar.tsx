'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconShoppingBag } from '@tabler/icons-react'
import { useCarrito } from '@/store/carrito'
import { CartDrawer } from '@/components/carrito/CartDrawer'

interface NavbarProps {
  tiendaNombre?: string
}

export function Navbar({ tiendaNombre = 'Kuutsu.pe' }: NavbarProps) {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCarrito((s) => s.itemCount)
  const isOpen   = useCarrito((s) => s.isOpen)
  const openCart  = useCarrito((s) => s.openCart)
  const closeCart = useCarrito((s) => s.closeCart)

  useEffect(() => { setMounted(true) }, [])

  const count = mounted ? itemCount() : 0

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

          <Link href="/" className="font-serif text-xl font-bold shrink-0" style={{ color: '#EC4899' }}>
            {tiendaNombre}
          </Link>

          <nav className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-4 mr-3">
              <Link href="/catalogo" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                Catálogo
              </Link>
            </div>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            >
              <IconShoppingBag size={22} />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1"
                  style={{ backgroundColor: '#EC4899' }}
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
