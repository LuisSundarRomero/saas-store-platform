import Link from 'next/link'
import { IconBrandWhatsapp, IconMail } from '@tabler/icons-react'

interface Categoria { nombre: string; slug: string }

interface Props {
  tiendaNombre?: string
  descripcion?: string
  politica?: string
  whatsapp?: string
  categorias?: Categoria[]
  infoItems?: string[]
}

export function Footer({
  tiendaNombre = 'Kuutsu.pe',
  descripcion = 'Zapatos coquette únicos y originales. Diseñados para quienes aman los detalles.',
  politica = 'No hacemos cambios ni devoluciones 🎀',
  whatsapp = '',
  categorias = [],
  infoItems = ['Solo con cita previa', 'Envíos a todo Lima'],
}: Props) {
  const waNum = whatsapp.replace(/\s/g, '')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-100" style={{ backgroundColor: '#FAFAFA' }}>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="font-serif text-2xl font-bold" style={{ color: '#EC4899' }}>
              {tiendaNombre}
            </span>
            {descripcion && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-xs">{descripcion}</p>
            )}
            <div className="flex gap-2.5 mt-5">
              {waNum && (
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500 transition-all bg-white">
                  <IconBrandWhatsapp size={16} />
                </a>
              )}
              <a href="mailto:kuutsupe@gmail.com"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-pink-400 hover:text-pink-500 transition-all bg-white">
                <IconMail size={16} />
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Tienda</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/catalogo"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#EC4899' }} />
                Todos los productos
              </Link>
              {categorias.map((cat) => (
                <Link key={cat.slug} href={`/catalogo?cat=${cat.slug}`}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 group capitalize">
                  <span className="w-1 h-1 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: '#EC4899' }} />
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Información</p>
            <div className="flex flex-col gap-3">
              {politica && (
                <p className="text-sm text-gray-500 leading-relaxed pb-3 border-b border-gray-200">
                  {politica}
                </p>
              )}
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#EC4899' }} />
                  <p className="text-sm text-gray-500 leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Contacto</p>
            <div className="flex flex-col gap-3">
              {waNum && (
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors flex items-center gap-2">
                  <IconBrandWhatsapp size={15} className="shrink-0" /> +{waNum}
                </a>
              )}
              <a href="mailto:kuutsupe@gmail.com"
                className="text-sm text-gray-500 hover:text-pink-500 transition-colors flex items-center gap-2">
                <IconMail size={15} className="shrink-0" /> kuutsupe@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {year} {tiendaNombre} — Todos los derechos reservados</p>
          <p className="text-xs font-medium" style={{ color: '#EC4899' }}>Hecho con 🎀 en Lima, Perú</p>
        </div>
      </div>
    </footer>
  )
}
