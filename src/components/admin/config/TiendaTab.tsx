'use client'

import { useState } from 'react'
import { IconBrandWhatsapp, IconCheck, IconMail } from '@tabler/icons-react'
import { guardarConfigTienda } from '@/lib/actions/admin'
import { useConfigTab } from '@/hooks/useConfigTab'
import { Field, SaveSection, INPUT_CLS, validarNumeroWhatsapp } from './shared'
import type { ConfigTienda } from '@/types'

interface Props {
  tienda: ConfigTienda | null
}

export function TiendaTab({ tienda }: Props) {
  const { isPending, saved, error, setError, save } = useConfigTab()

  const [tiendaNombre, setTiendaNombre] = useState(tienda?.tienda_nombre ?? '')
  const [whatsappNumero, setWhatsappNumero] = useState(tienda?.whatsapp_numero ?? '')
  const [moneda, setMoneda] = useState(tienda?.moneda ?? 'PEN')
  const [emailNotif, setEmailNotif] = useState(tienda?.email_notif ?? '')
  const [empresaRazon, setEmpresaRazon] = useState(tienda?.empresa_razon ?? '')
  const [empresaRuc, setEmpresaRuc] = useState(tienda?.empresa_ruc ?? '')
  const [empresaDir, setEmpresaDir] = useState(tienda?.empresa_dir ?? '')

  function handleSave() {
    const numero = whatsappNumero.replace(/\s/g, '')
    if (numero && !validarNumeroWhatsapp(numero)) {
      setError('El número WhatsApp debe tener entre 10 y 15 dígitos con código de país.')
      return
    }
    save(() =>
      guardarConfigTienda({
        tienda_nombre: tiendaNombre,
        whatsapp_numero: numero || '',
        moneda,
        email_notif: emailNotif.trim() || null,
        empresa_razon: empresaRazon.trim() || null,
        empresa_ruc: empresaRuc.trim() || null,
        empresa_dir: empresaDir.trim() || null,
      })
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {/* WhatsApp */}
        <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#25D366' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
              <IconBrandWhatsapp size={16} style={{ color: '#16A34A' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Número de WhatsApp</p>
              <p className="text-xs text-gray-400">Aquí llegan los pedidos de tus clientes</p>
            </div>
            {validarNumeroWhatsapp(whatsappNumero) && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                <IconCheck size={11} /> Válido
              </span>
            )}
          </div>
          <div
            className="flex items-center border-2 rounded-xl overflow-hidden"
            style={{ borderColor: validarNumeroWhatsapp(whatsappNumero) ? '#25D366' : '#E5E7EB' }}
          >
            <span className="px-3 py-2.5 text-sm text-gray-400 font-mono border-r border-gray-100 bg-gray-50">+</span>
            <input
              type="tel"
              inputMode="numeric"
              value={whatsappNumero}
              onChange={(e) => setWhatsappNumero(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none font-mono bg-white"
              placeholder="51982121991"
            />
          </div>
          <p className="text-xs text-gray-400">
            Código de país + número. Perú: <strong>51</strong>XXXXXXXXX
          </p>
        </div>

        {/* Email */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <IconMail size={16} style={{ color: 'var(--color-brand)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Email de notificaciones</p>
              <p className="text-xs text-gray-400">Te avisamos por cada pedido nuevo</p>
            </div>
          </div>
          <input
            type="email"
            value={emailNotif}
            onChange={(e) => setEmailNotif(e.target.value)}
            className={INPUT_CLS}
            placeholder="contacto@mitienda.pe"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Datos tienda */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-800">Datos de la tienda</p>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre</label>
            <input value={tiendaNombre} onChange={(e) => setTiendaNombre(e.target.value)} className={INPUT_CLS} placeholder="Mi Tienda" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Moneda</label>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={INPUT_CLS}>
              <option value="PEN">S/ — Sol peruano</option>
              <option value="USD">$ — Dólar</option>
              <option value="COP">$ — Peso colombiano</option>
            </select>
          </div>
        </div>

        {/* Empresa */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-800">
            Datos empresa{' '}
            <span className="text-xs text-gray-400 font-normal">(Libro de reclamaciones)</span>
          </p>
          <Field label="Razón social" value={empresaRazon} onChange={setEmpresaRazon} placeholder="Mi Empresa S.A.C." />
          <Field label="RUC" value={empresaRuc} onChange={setEmpresaRuc} placeholder="20123456789" />
          <Field label="Dirección" value={empresaDir} onChange={setEmpresaDir} placeholder="Av. Principal 123, Lima" />
        </div>
      </div>

      <SaveSection isPending={isPending} saved={saved} error={error} onSave={handleSave} />
    </div>
  )
}
