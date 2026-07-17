'use client'

import { useState } from 'react'
import { guardarConfigMensajes } from '@/lib/actions/admin'
import { useConfigTab } from '@/hooks/useConfigTab'
import { SaveSection, INPUT_CLS } from './shared'
import type { ConfigMensajes } from '@/types'

const VARIABLES = ['{orderId}', '{productos}', '{total}', '{trackingLink}', '{campos}']

interface Props {
  mensajes: ConfigMensajes | null
}

export function MensajesTab({ mensajes }: Props) {
  const { isPending, saved, error, save } = useConfigTab()
  const [template, setTemplate] = useState(mensajes?.whatsapp_template ?? '')

  function handleSave() {
    save(() => guardarConfigMensajes({ whatsapp_template: template }))
  }

  const preview = template
    .replace(/\\n/g, '\n')
    .replace('{orderId}', 'ORD-001')
    .replace('{productos}', '• 1x Zapato Mary Jane (Rosa)\n  Talla 37 — S/ 150')
    .replace('{total}', '150')
    .replace('{trackingLink}', 'mitienda.pe/rastrear?order=ORD-001')
    .replace('{campos}', '*DNI:* 12345678\n*Distrito:* Miraflores\n*Modo de envío:* Olva Courier')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-800">Plantilla del mensaje WhatsApp</p>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={10}
            className={`${INPUT_CLS} resize-none font-mono text-xs leading-relaxed`}
            placeholder={`Hola! Quiero hacer este pedido 🛍\n\n📦 #{orderId}\n\n{productos}\n\n💰 Total: S/ {total}\n\n🔍 Rastrear: {trackingLink}`}
          />
          <div className="flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <code
                key={v}
                onClick={() => setTemplate((t) => t + v)}
                className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                {v}
              </code>
            ))}
            <span className="text-xs text-gray-400 self-center">← toca para insertar</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            <code className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded">{'{campos}'}</code> inserta las respuestas de los campos que configuraste en <strong className="text-gray-600">Formulario</strong> (DNI, distrito, modo de envío, etc.) — solo aparecen los que el cliente completó.
          </p>
        </div>
        <SaveSection isPending={isPending} saved={saved} error={error} onSave={handleSave} />
      </div>

      {template && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</p>
          <div className="rounded-xl p-4" style={{ backgroundColor: '#ECE5DD' }}>
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm max-w-xs ml-auto">
              <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{preview}</p>
              <p className="text-[10px] text-gray-400 text-right mt-1.5">12:30 ✓✓</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
