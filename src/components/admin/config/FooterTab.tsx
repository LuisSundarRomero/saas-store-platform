'use client'

import { useState } from 'react'
import {
  IconBrandWhatsapp, IconMail, IconShare,
  IconBrandInstagram, IconBrandTiktok,
} from '@tabler/icons-react'
import { guardarConfigFooter } from '@/lib/actions/admin'
import { useConfigTab } from '@/hooks/useConfigTab'
import { Field, FieldArea, SaveSection, INPUT_CLS } from './shared'
import type { ConfigFooter } from '@/types'

interface Props {
  footer: ConfigFooter | null
  /** Valores guardados de la tab Tienda — solo para la vista previa */
  tiendaNombre?: string
  whatsappNumero?: string
}

export function FooterTab({ footer, tiendaNombre = '', whatsappNumero = '' }: Props) {
  const { isPending, saved, error, save } = useConfigTab()

  const [desc, setDesc] = useState(footer?.descripcion ?? '')
  const [politica, setPolitica] = useState(footer?.politica ?? '')
  const [info1, setInfo1] = useState(footer?.info1 ?? '')
  const [info2, setInfo2] = useState(footer?.info2 ?? '')
  const [info3, setInfo3] = useState(footer?.info3 ?? '')
  const [info4, setInfo4] = useState(footer?.info4 ?? '')
  const [email, setEmail] = useState(footer?.email ?? '')
  const [tagline, setTagline] = useState(footer?.tagline ?? '')
  const [instagram, setInstagram] = useState(footer?.instagram ?? '')
  const [tiktok, setTiktok] = useState(footer?.tiktok ?? '')

  function handleSave() {
    save(() =>
      guardarConfigFooter({
        descripcion: desc,
        politica,
        info1,
        info2,
        info3,
        info4,
        email: email.trim() || null,
        tagline,
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
      })
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-800">Pie de página</p>
          <FieldArea label="Descripción de la tienda" value={desc} onChange={setDesc} placeholder="Breve descripción de tu tienda..." />
          <Field label="Política (texto pequeño)" value={politica} onChange={setPolitica} placeholder="Opcional" />
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Items de información
            </label>
            <div className="flex flex-col gap-2">
              {(
                [
                  [info1, setInfo1, 'Ej: Preventas por tiempo limitado'],
                  [info2, setInfo2, 'Ej: Envíos a Lima y provincias'],
                  [info3, setInfo3, 'Ej: Piezas de edición limitada'],
                  [info4, setInfo4, 'Ej: Paga por WhatsApp'],
                ] as [string, (v: string) => void, string][]
              ).map(([val, setter, ph], i) => (
                <input key={i} value={val} onChange={(e) => setter(e.target.value)} className={INPUT_CLS} placeholder={ph} />
              ))}
            </div>
          </div>
          <Field label="Email de contacto" value={email} onChange={setEmail} placeholder="contacto@mitienda.pe" />
          <Field label="Frase final" value={tagline} onChange={setTagline} placeholder="Déjalo vacío para no mostrar" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <IconShare size={16} style={{ color: 'var(--color-brand)' }} />
            <p className="text-sm font-semibold text-gray-800">Redes sociales</p>
          </div>
          <div
            className="flex items-center gap-2.5 border-2 rounded-xl px-3.5 py-2.5"
            style={{ borderColor: instagram ? 'var(--color-brand)' : '#E5E7EB' }}
          >
            <IconBrandInstagram size={18} className="shrink-0" style={{ color: instagram ? 'var(--color-brand)' : '#9CA3AF' }} />
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-white"
              placeholder="https://instagram.com/mitienda"
            />
          </div>
          <div
            className="flex items-center gap-2.5 border-2 rounded-xl px-3.5 py-2.5"
            style={{ borderColor: tiktok ? 'var(--color-brand)' : '#E5E7EB' }}
          >
            <IconBrandTiktok size={18} className="shrink-0" style={{ color: tiktok ? 'var(--color-brand)' : '#9CA3AF' }} />
            <input
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-white"
              placeholder="https://tiktok.com/@mitienda"
            />
          </div>
        </div>

        <SaveSection isPending={isPending} saved={saved} error={error} onSave={handleSave} />
      </div>

      {/* Preview footer */}
      <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-5 flex-col gap-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <p className="font-display text-base mb-1.5" style={{ color: 'var(--color-ink)' }}>
              {tiendaNombre || 'Mi Tienda'}
            </p>
            <p className="text-[10px] leading-relaxed mb-2.5 max-w-[220px]" style={{ color: 'var(--color-muted)' }}>
              {desc ? desc.slice(0, 70) + (desc.length > 70 ? '…' : '') : 'Descripción de la tienda'}
            </p>
            <div className="flex items-center gap-1.5 mb-2">
              {whatsappNumero && (
                <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                  <IconBrandWhatsapp size={12} />
                </span>
              )}
              {email && (
                <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                  <IconMail size={12} />
                </span>
              )}
              {instagram && (
                <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                  <IconBrandInstagram size={12} />
                </span>
              )}
              {tiktok && (
                <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                  <IconBrandTiktok size={12} />
                </span>
              )}
            </div>
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                © {new Date().getFullYear()} {tiendaNombre || 'Mi Tienda'}
              </p>
              {tagline && (
                <p className="text-[9px] font-medium" style={{ color: 'var(--color-brand)' }}>
                  {tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
