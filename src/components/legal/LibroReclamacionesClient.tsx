'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { IconArrowLeft, IconBook2, IconCheck, IconBrandWhatsapp, IconPrinter } from '@tabler/icons-react'
import { TipoBien, TipoDocumento, TipoReclamacion } from '@/types'
import { crearReclamo } from '@/lib/actions/reclamaciones'

const inputCls = "w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-[#F5F5F2] bg-[#1F1F22] border-[#2C2C30] focus:border-[var(--color-brand)] transition-colors placeholder:text-[#6B6B70]"
const labelCls = "text-xs font-semibold text-[#6B6B70] uppercase tracking-wide px-1 block mb-1.5"

interface Props {
  tiendaNombre: string
  razonSocial: string
  ruc: string
  direccion: string
  whatsappNumero: string
}

export function LibroReclamacionesClient({ tiendaNombre, razonSocial, ruc, direccion, whatsappNumero }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [numero, setNumero] = useState<number | null>(null)

  // II. Consumidor
  const [nombre, setNombre] = useState('')
  const [domicilio, setDomicilio] = useState('')
  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>('DNI')
  const [numDoc, setNumDoc] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [esMenor, setEsMenor] = useState(false)
  const [tutorNombre, setTutorNombre] = useState('')

  // III. Bien contratado
  const [bienTipo, setBienTipo] = useState<TipoBien>('producto')
  const [bienDescripcion, setBienDescripcion] = useState('')
  const [montoReclamado, setMontoReclamado] = useState('')

  // IV. Detalle
  const [tipo, setTipo] = useState<TipoReclamacion>('reclamo')
  const [detalle, setDetalle] = useState('')
  const [pedido, setPedido] = useState('')

  function validar(): string | null {
    if (!nombre.trim()) return 'Ingresa tu nombre completo.'
    if (!domicilio.trim()) return 'Ingresa tu domicilio.'
    if (!numDoc.trim()) return 'Ingresa tu número de documento.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Ingresa un email válido.'
    if (esMenor && !tutorNombre.trim()) return 'Ingresa el nombre del padre, madre o tutor.'
    if (!bienDescripcion.trim()) return 'Describe el producto o servicio.'
    if (!detalle.trim()) return 'Describe el detalle de tu reclamación.'
    if (!pedido.trim()) return 'Indica qué solicitas como solución.'
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = validar()
    if (msg) { setError(msg); return }
    setError('')

    startTransition(async () => {
      const res = await crearReclamo({
        consumidorNombre: nombre.trim(),
        consumidorDomicilio: domicilio.trim(),
        consumidorTipoDoc: tipoDoc,
        consumidorNumDoc: numDoc.trim(),
        consumidorEmail: email.trim(),
        consumidorTelefono: telefono.trim(),
        tutorNombre: esMenor ? tutorNombre.trim() : '',
        bienTipo,
        bienDescripcion: bienDescripcion.trim(),
        montoReclamado: montoReclamado ? Math.round(parseFloat(montoReclamado) * 100) : null,
        tipo,
        detalle: detalle.trim(),
        pedido: pedido.trim(),
      })

      if (!res.success) {
        setError(res.error)
        return
      }
      setNumero(res.numero)
    })
  }

  // ── Constancia ──
  if (numero !== null) {
    return (
      <main className="min-h-screen bg-[#1F1F22] flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full bg-[#161618] border border-[#2C2C30] rounded-2xl p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#0F2A18' }}>
              <IconCheck size={26} style={{ color: '#22C55E' }} />
            </div>
          </div>
          <h1 className="text-xl font-display text-[#F5F5F2] mb-1">Reclamación registrada</h1>
          <p className="text-sm text-[#9A9A9E] mb-5">
            Constancia de tu {tipo === 'queja' ? 'queja' : 'reclamo'}
          </p>

          <div className="bg-[#1F1F22] border border-[#2C2C30] rounded-xl p-4 text-left flex flex-col gap-2 mb-5">
            <div className="flex justify-between">
              <span className="text-xs text-[#6B6B70]">NÂ° de reclamación</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>#{String(numero).padStart(4, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#6B6B70]">Fecha</span>
              <span className="text-sm text-[#F5F5F2]">{new Date().toLocaleDateString('es-PE')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#6B6B70]">Tipo</span>
              <span className="text-sm text-[#F5F5F2] capitalize">{tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#6B6B70]">Consumidor</span>
              <span className="text-sm text-[#F5F5F2]">{nombre}</span>
            </div>
          </div>

          <p className="text-xs text-[#9A9A9E] mb-5 leading-relaxed">
            De acuerdo a la normativa vigente, tienes derecho a recibir una respuesta en un
            plazo no mayor a 30 días calendario. Te contactaremos a <strong className="text-[#F5F5F2]">{email}</strong>.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <IconPrinter size={16} />
              Imprimir constancia
            </button>
            <Link href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium text-[#9A9A9E] hover:bg-[#1F1F22] transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Formulario ──
  return (
    <main className="min-h-screen bg-[#1F1F22]">

      {/* Header */}
      <div className="bg-[#1F1F22]/95 backdrop-blur border-b border-[#2C2C30] px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/"
          className="p-1.5 rounded-full hover:bg-[#161618] transition-colors text-[#9A9A9E]">
          <IconArrowLeft size={18} />
        </Link>
        <p className="font-bold text-[#F5F5F2] text-sm">Libro de Reclamaciones</p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Intro */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#3A1014' }}>
            <IconBook2 size={22} style={{ color: 'var(--color-brand)' }} />
          </div>
          <p className="text-sm text-[#9A9A9E] leading-relaxed">
            Conforme al Código de Protección y Defensa del Consumidor, este establecimiento
            cuenta con un Libro de Reclamaciones a tu disposición.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* I. Identificación del establecimiento */}
          <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-brand)' }}>
              I. Identificación del establecimiento
            </p>
            <div className="flex flex-col gap-1 text-sm text-[#F5F5F2]">
              <p><span className="text-[#6B6B70]">Razón social: </span>{razonSocial || tiendaNombre}</p>
              {ruc && <p><span className="text-[#6B6B70]">RUC: </span>{ruc}</p>}
              {direccion && <p><span className="text-[#6B6B70]">Dirección: </span>{direccion}</p>}
            </div>
          </div>

          {/* II. Identificación del consumidor */}
          <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-brand)' }}>
              II. Identificación del consumidor reclamante
            </p>

            <div>
              <label className={labelCls}>Nombre completo</label>
              <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellidos" />
            </div>

            <div>
              <label className={labelCls}>Domicilio</label>
              <input className={inputCls} value={domicilio} onChange={(e) => setDomicilio(e.target.value)} placeholder="Dirección actual" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Tipo de documento</label>
                <select className={inputCls} value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value as TipoDocumento)}>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Número de documento</label>
                <input className={inputCls} value={numDoc} onChange={(e) => setNumDoc(e.target.value)} placeholder="12345678" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@email.com" />
              </div>
              <div>
                <label className={labelCls}>Teléfono (opcional)</label>
                <input type="tel" inputMode="numeric" className={inputCls} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="987 654 321" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-brand)]" />
              <span className="text-sm text-[#9A9A9E]">Soy menor de edad</span>
            </label>

            {esMenor && (
              <div>
                <label className={labelCls}>Nombre del padre, madre o tutor</label>
                <input className={inputCls} value={tutorNombre} onChange={(e) => setTutorNombre(e.target.value)} placeholder="Nombre y apellidos" />
              </div>
            )}
          </div>

          {/* III. Identificación del bien contratado */}
          <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-brand)' }}>
              III. Identificación del bien contratado
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Tipo</label>
                <select className={inputCls} value={bienTipo} onChange={(e) => setBienTipo(e.target.value as TipoBien)}>
                  <option value="producto">Producto</option>
                  <option value="servicio">Servicio</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Monto reclamado (opcional)</label>
                <div className="flex items-center border-2 rounded-2xl overflow-hidden border-[#2C2C30] focus-within:border-[var(--color-brand)]">
                  <span className="px-3 text-sm text-[#6B6B70] font-mono">S/</span>
                  <input type="number" min="0" step="0.01" value={montoReclamado} onChange={(e) => setMontoReclamado(e.target.value)}
                    className="flex-1 px-2 py-3 text-sm text-[#F5F5F2] outline-none bg-[#1F1F22] placeholder:text-[#6B6B70]" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Descripción del producto o servicio</label>
              <textarea className={`${inputCls} resize-none`} rows={2} value={bienDescripcion} onChange={(e) => setBienDescripcion(e.target.value)}
                placeholder="Ej: Casaca negra talla M, pedido #ORD-001" />
            </div>
          </div>

          {/* IV. Detalle de la reclamación */}
          <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-brand)' }}>
              IV. Detalle de la reclamación
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setTipo('reclamo')}
                className="text-left rounded-xl p-3 border-2 transition-colors"
                style={tipo === 'reclamo' ? { borderColor: 'var(--color-brand)', backgroundColor: '#3A1014' } : { borderColor: '#2C2C30' }}>
                <p className="text-sm font-semibold text-[#F5F5F2]">Reclamo</p>
                <p className="text-xs text-[#9A9A9E] mt-0.5">Disconformidad relacionada al producto o servicio.</p>
              </button>
              <button type="button" onClick={() => setTipo('queja')}
                className="text-left rounded-xl p-3 border-2 transition-colors"
                style={tipo === 'queja' ? { borderColor: 'var(--color-brand)', backgroundColor: '#3A1014' } : { borderColor: '#2C2C30' }}>
                <p className="text-sm font-semibold text-[#F5F5F2]">Queja</p>
                <p className="text-xs text-[#9A9A9E] mt-0.5">Disconformidad con la atención al público.</p>
              </button>
            </div>

            <div>
              <label className={labelCls}>Detalle</label>
              <textarea className={`${inputCls} resize-none`} rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)}
                placeholder="Cuéntanos qué sucedió" />
            </div>

            <div>
              <label className={labelCls}>¿Qué solicitas como solución?</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={pedido} onChange={(e) => setPedido(e.target.value)}
                placeholder="Ej: Cambio de producto, devolución del dinero, etc." />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-center" style={{ color: '#EF4444' }}>{error}</p>
          )}

          <button type="submit" disabled={isPending}
            className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-brand)' }}>
            {isPending ? 'Enviando...' : 'Enviar reclamación'}
          </button>

          {whatsappNumero && (
            <a href={`https://wa.me/${whatsappNumero}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-[#6B6B70] hover:text-[#9A9A9E] transition-colors pb-4">
              <IconBrandWhatsapp size={14} />
              ¿Prefieres resolverlo directo? Escríbenos por WhatsApp
            </a>
          )}
        </form>
      </div>
    </main>
  )
}

