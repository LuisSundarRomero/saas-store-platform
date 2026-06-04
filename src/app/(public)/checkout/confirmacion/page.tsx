import Link from 'next/link'
import { IconBrandWhatsapp, IconPackage, IconArrowRight } from '@tabler/icons-react'

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function ConfirmacionPage({ searchParams }: Props) {
  const { order } = await searchParams
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(180deg, #fdf0f6 0%, #ffffff 50%)' }}>
      <div className="w-full max-w-sm">

        {/* Icono animado */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: '#FCE7F3' }}>
            🎀
          </div>
        </div>

        {/* Mensaje */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            ¡Pedido enviado!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tu pedido fue enviado por WhatsApp. Guarda tu código para rastrear el estado.
          </p>
        </div>

        {/* Order ID */}
        {order && (
          <div className="rounded-2xl p-5 mb-5 text-center"
            style={{ backgroundColor: '#FCE7F3' }}>
            <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-1">
              Tu código de pedido
            </p>
            <p className="text-3xl font-bold" style={{ color: '#EC4899' }}>
              #{order}
            </p>
            <p className="text-xs text-pink-400 mt-1">Guárdalo para rastrear tu pedido</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {order && (
            <Link href={`/pedido/${order}`}
              className="w-full py-3.5 rounded-full font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#EC4899' }}>
              <IconPackage size={18} />
              Rastrear mi pedido
            </Link>
          )}

          <a href={`https://wa.me/${whatsapp.replace(/\s/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}>
            <IconBrandWhatsapp size={18} />
            Hablar con nosotras
          </a>

          <Link href="/catalogo"
            className="w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Seguir viendo productos
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  )
}
