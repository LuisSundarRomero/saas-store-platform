'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IconArrowLeft, IconUpload, IconGripVertical } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'
import { deleteProducto } from '@/lib/actions/admin'
import { Switch } from '@/components/ui/Switch'

const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const TALLAS_ZAPATOS = ['35', '36', '37', '38', '39', '40', '41', '42']

interface Props {
  producto?: any
  categorias: { id: string; nombre: string }[]
}

export function ProductoForm({ producto, categorias }: Props) {
  const router = useRouter()
  const isNew = !producto

  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [precio, setPrecio] = useState(producto ? (producto.precio / 100).toString() : '')
  const [precioAntes, setPrecioAntes] = useState(
    producto?.precio_antes ? (producto.precio_antes / 100).toString() : ''
  )
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ?? '')
  const [tallas, setTallas] = useState<string[]>(producto?.tallas ?? [])
  const [colores, setColores] = useState(producto?.colores?.join(', ') ?? '')
  const [stockActivo, setStockActivo] = useState(producto?.stock !== null)
  const [stock, setStock] = useState(producto?.stock?.toString() ?? '0')
  const [visible, setVisible] = useState(producto?.visible ?? true)
  const [imagenes, setImagenes] = useState<string[]>(producto?.imagenes ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function toggleTalla(t: string) {
    setTallas((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    setImagenes((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDragIndex(null)
    setOverIndex(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploadError('')
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    const disponibles = 5 - imagenes.length
    const aSubir = Array.from(files).slice(0, disponibles)

    for (let i = 0; i < aSubir.length; i++) {
      const file = aSubir[i]
      setUploadProgress(`Subiendo ${i + 1} de ${aSubir.length}...`)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" supera los 5MB`)
        continue
      }
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('productos').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) {
        setUploadError(`Error subiendo "${file.name}"`)
      } else {
        const { data } = supabase.storage.from('productos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImagenes((prev) => [...prev, ...urls])
    setUploading(false)
    setUploadProgress('')
    e.target.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const supabase = createClient()
      const data = {
        nombre,
        descripcion: descripcion || null,
        precio: Math.round(parseFloat(precio) * 100),
        precio_antes: precioAntes ? Math.round(parseFloat(precioAntes) * 100) : null,
        categoria_id: categoriaId || null,
        imagenes,
        tallas,
        colores: colores.split(',').map((c: string) => c.trim()).filter(Boolean),
        stock: stockActivo ? parseInt(stock) : null,
        visible,
        slug: nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }
      if (isNew) {
        const { error } = await supabase.from('productos').insert(data)
        if (error) { setError(error.message); return }
      } else {
        const { error } = await supabase.from('productos').update(data).eq('id', producto.id)
        if (error) { setError(error.message); return }
      }
      router.push('/admin/catalogo')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este producto?')) return
    startTransition(async () => {
      await deleteProducto(producto.id)
      router.push('/admin/catalogo')
      router.refresh()
    })
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white"

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/admin/catalogo"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700 shrink-0">
              <IconArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium">Catálogo</p>
              <h1 className="text-base font-bold text-gray-900 truncate">
                {isNew ? 'Nuevo producto' : producto.nombre}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isNew && (
              <button onClick={handleDelete} disabled={isPending}
                className="px-3 py-2 text-sm font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                Eliminar
              </button>
            )}
            <button form="producto-form" type="submit" disabled={isPending}
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#E11D2E' }}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <form id="producto-form" onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-[1200px] mx-auto">

          {/* ── Col izquierda (2/5) ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Imágenes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Fotos</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {imagenes.length}/5
                </span>
              </div>

              {/* Foto principal grande */}
              {imagenes.length > 0 ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <Image src={imagenes[0]} alt="" fill sizes="300px" className="object-cover" />
                  <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#E11D2E' }}>
                    PRINCIPAL
                  </span>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed transition-colors mb-3 ${imagenes.length >= 5 ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-gray-200 cursor-pointer hover:border-red-300 hover:bg-red-50'}`}>
                  <IconUpload size={28} className="text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400 font-medium">
                    {uploading ? uploadProgress : 'Subir fotos'}
                  </span>
                  <span className="text-xs text-gray-300 mt-1">JPG · PNG · WEBP · Máx 5MB</span>
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={handleImageUpload} disabled={uploading || imagenes.length >= 5} />
                </label>
              )}

              {/* Miniaturas */}
              {imagenes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imagenes.map((url, i) => (
                    <div key={url} className="relative group"
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
                      onDragLeave={() => setOverIndex((prev) => (prev === i ? null : prev))}
                      onDrop={(e) => { e.preventDefault(); handleDrop(i) }}
                      onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
                      style={{
                        opacity: dragIndex === i ? 0.4 : 1,
                        transform: overIndex === i && dragIndex !== null && dragIndex !== i ? 'scale(1.06)' : 'scale(1)',
                        transition: 'transform 0.1s, opacity 0.1s',
                      }}>
                      <button type="button"
                        onClick={() => setImagenes((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])}
                        className="relative w-14 h-14 rounded-xl overflow-hidden block cursor-grab active:cursor-grabbing"
                        style={{ border: i === 0 ? '2px solid #E11D2E' : '2px solid #E5E7EB' }}
                        title={i === 0 ? 'Foto principal' : 'Hacer principal'}>
                        <Image src={url} alt="" fill sizes="56px" className="object-cover pointer-events-none" />
                        <span className="absolute bottom-0 right-0 bg-black/40 text-white rounded-tl-md p-0.5 leading-none">
                          <IconGripVertical size={10} />
                        </span>
                      </button>
                      <button type="button"
                        onClick={() => setImagenes((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                  {imagenes.length < 5 && (
                    <label className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-red-300 transition-colors">
                      <IconUpload size={16} className="text-gray-300" />
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              )}
              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
              {imagenes.length > 0 && <p className="text-[11px] text-gray-400 mt-2">Arrastra para ordenar · la primera es la foto principal</p>}
            </div>

            {/* Publicación */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-gray-800">Publicación</h2>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-700">Visible en catálogo</p>
                  <p className="text-xs text-gray-400">Los clientes pueden verlo</p>
                </div>
                <Switch checked={visible} onChange={setVisible} />
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-700">Control de stock</p>
                  <p className="text-xs text-gray-400">Seguimiento de inventario</p>
                </div>
                <Switch checked={stockActivo} onChange={setStockActivo} />
              </div>
              {stockActivo && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500 shrink-0">Cantidad:</label>
                  <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)}
                    className={`${inputCls} text-center font-mono`} placeholder="0" />
                </div>
              )}
            </div>
          </div>

          {/* ── Col derecha (3/5) ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Info básica */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-gray-800">Información</h2>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre *</label>
                <input required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className={inputCls} placeholder="Ej: Botas peluche negro" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Precio (S/) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">S/</span>
                    <input required type="number" step="0.01" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)}
                      className={`${inputCls} pl-9`} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Precio antes
                    <span className="normal-case font-normal ml-1 text-gray-400">(descuento)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">S/</span>
                    <input type="number" step="0.01" min="0" value={precioAntes} onChange={(e) => setPrecioAntes(e.target.value)}
                      className={`${inputCls} pl-9`} placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Categoría</label>
                <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputCls}>
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Material, estilo, detalles del producto..." />
              </div>
            </div>

            {/* Variantes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-gray-800">Variantes</h2>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Tallas — Ropa
                </label>
                <div className="flex flex-wrap gap-2">
                  {TALLAS_ROPA.map((t) => {
                    const sel = tallas.includes(t)
                    return (
                      <button key={t} type="button" onClick={() => toggleTalla(t)}
                        className="min-w-[44px] h-10 px-3 rounded-xl text-sm font-semibold transition-all border-2"
                        style={sel
                          ? { backgroundColor: '#E11D2E', color: '#fff', borderColor: '#E11D2E' }
                          : { backgroundColor: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Tallas — Zapatos
                </label>
                <div className="flex flex-wrap gap-2">
                  {TALLAS_ZAPATOS.map((t) => {
                    const sel = tallas.includes(t)
                    return (
                      <button key={t} type="button" onClick={() => toggleTalla(t)}
                        className="min-w-[44px] h-10 px-3 rounded-xl text-sm font-semibold transition-all border-2"
                        style={sel
                          ? { backgroundColor: '#E11D2E', color: '#fff', borderColor: '#E11D2E' }
                          : { backgroundColor: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Colores
                  <span className="normal-case font-normal ml-1 text-gray-400">(separados por coma)</span>
                </label>
                <input value={colores} onChange={(e) => setColores(e.target.value)}
                  className={inputCls} placeholder="negro, hueso, camel, marron" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
