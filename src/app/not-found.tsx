import Link from 'next/link'
import { IconArrowLeft, IconShoppingBag } from '@tabler/icons-react'


export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #fff5f9 0%, #fce7f3 40%, #ffffff 100%)' }}
    >
      <div className="text-center max-w-sm w-full">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/web-app-manifest-192x192.png"
            alt="Kuutsu"
            className="w-24 h-24 rounded-3xl"
          />
        </div>

        {/* Código */}
        <p className="text-8xl font-bold mb-2" style={{ color: '#F9A8D4' }}>404</p>

        {/* Mensaje */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Esta página no existe
        </h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Parece que el link no es válido o el producto ya no está disponible.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 text-white font-semibold py-3.5 px-6 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#EC4899' }}
          >
            <IconShoppingBag size={18} />
            Ver catálogo
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-gray-500 font-medium py-3 px-6 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
          >
            <IconArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  )
}
