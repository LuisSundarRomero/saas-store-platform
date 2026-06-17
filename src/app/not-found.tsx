import Link from 'next/link'
import { IconArrowLeft, IconShoppingBag } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 bg-[#1F1F22]"
    >
      <div className="text-center max-w-sm w-full">

        {/* Código */}
        <p className="text-8xl font-display mb-2" style={{ color: 'var(--color-brand)' }}>404</p>

        {/* Mensaje */}
        <h1 className="text-xl font-bold text-[#F5F5F2] mb-2">
          Esta página no existe
        </h1>
        <p className="text-sm text-[#9A9A9E] mb-8 leading-relaxed">
          Parece que el link no es válido o el producto ya no está disponible.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 text-white font-semibold py-3.5 px-6 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <IconShoppingBag size={18} />
            Ver catálogo
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-[#9A9A9E] font-medium py-3 px-6 rounded-full border border-[#2C2C30] hover:bg-[#161618] hover:text-[#F5F5F2] transition-colors text-sm"
          >
            <IconArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  )
}

