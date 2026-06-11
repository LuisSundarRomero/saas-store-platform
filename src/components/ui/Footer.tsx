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
  tiendaNombre = 'Anarchyy.pe',
  descripcion = 'Lujo oscuro / Essence of Dark Fashion. Piezas streetwear de edición limitada — hago lo que quiero vestir.',
  politica = 'No hacemos cambios ni devoluciones 🦇',
  whatsapp = '',
  categorias = [],
  infoItems = ['Preventas por tiempo limitado', 'Envíos a nivel nacional'],
}: Props) {
  const waNum = whatsapp.replace(/\s/g, '')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[#2C2C30]" style={{ backgroundColor: '#0B0B0C' }}>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="font-display text-2xl tracking-widest text-[#F5F5F2]">
              {tiendaNombre}
            </span>
            {descripcion && (
              <p className="text-sm text-[#9A9A9E] mt-3 leading-relaxed max-w-xs">{descripcion}</p>
            )}
            <div className="flex gap-2.5 mt-5">
              {waNum && (
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#2C2C30] text-[#9A9A9E] hover:border-green-500 hover:text-green-500 transition-all bg-[#161618]">
                  <IconBrandWhatsapp size={16} />
                </a>
              )}
              <a href="mailto:contacto@anarchyy.pe"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#2C2C30] text-[#9A9A9E] hover:border-[#E11D2E] hover:text-[#E11D2E] transition-all bg-[#161618]">
                <IconMail size={16} />
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A9A9E] mb-4">Tienda</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/catalogo"
                className="text-sm text-[#9A9A9E] hover:text-[#F5F5F2] transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#E11D2E' }} />
                Todos los productos
              </Link>
              {categorias.map((cat) => (
                <Link key={cat.slug} href={`/catalogo?cat=${cat.slug}`}
                  className="text-sm text-[#9A9A9E] hover:text-[#F5F5F2] transition-colors flex items-center gap-2 group capitalize">
                  <span className="w-1 h-1 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: '#E11D2E' }} />
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A9A9E] mb-4">Información</p>
            <div className="flex flex-col gap-3">
              {politica && (
                <p className="text-sm text-[#9A9A9E] leading-relaxed pb-3 border-b border-[#2C2C30]">
                  {politica}
                </p>
              )}
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#E11D2E' }} />
                  <p className="text-sm text-[#9A9A9E] leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A9A9E] mb-4">Contacto</p>
            <div className="flex flex-col gap-3">
              {waNum && (
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#9A9A9E] hover:text-green-500 transition-colors flex items-center gap-2">
                  <IconBrandWhatsapp size={15} className="shrink-0" /> +{waNum}
                </a>
              )}
              <a href="mailto:contacto@anarchyy.pe"
                className="text-sm text-[#9A9A9E] hover:text-[#E11D2E] transition-colors flex items-center gap-2">
                <IconMail size={15} className="shrink-0" /> contacto@anarchyy.pe
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2C2C30] bg-[#0B0B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#9A9A9E]">© {year} {tiendaNombre} — Todos los derechos reservados</p>
          <p className="text-xs font-medium" style={{ color: '#E11D2E' }}>Hago lo que quiero vestir 🦇</p>
        </div>
      </div>
    </footer>
  )
}
