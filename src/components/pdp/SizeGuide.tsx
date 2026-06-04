'use client'

import { useState } from 'react'
import { IconRuler, IconX } from '@tabler/icons-react'

const GUIA = [
  { talla: '35', cm: '22.5', eu: '35' },
  { talla: '36', cm: '23.5', eu: '36' },
  { talla: '37', cm: '24.0', eu: '37' },
  { talla: '38', cm: '24.5', eu: '38' },
  { talla: '39', cm: '25.5', eu: '39' },
  { talla: '40', cm: '26.0', eu: '40' },
  { talla: '41', cm: '26.5', eu: '41' },
  { talla: '42', cm: '27.5', eu: '42' },
]

export function SizeGuide() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 transition-colors underline underline-offset-2"
      >
        <IconRuler size={13} />
        Guía de tallas
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Guía de tallas</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <IconX size={18} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4">
                Mide tu pie desde el talón hasta el dedo más largo. Elige la talla más cercana a tu medida.
              </p>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left pb-2 font-semibold">Talla</th>
                    <th className="text-left pb-2 font-semibold">Longitud (cm)</th>
                    <th className="text-left pb-2 font-semibold">EU</th>
                  </tr>
                </thead>
                <tbody>
                  {GUIA.map((row, i) => (
                    <tr key={row.talla} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-2 font-semibold rounded-l-lg" style={{ color: '#EC4899' }}>
                        {row.talla}
                      </td>
                      <td className="py-2 px-2 text-gray-700">{row.cm} cm</td>
                      <td className="py-2 px-2 text-gray-500 rounded-r-lg">{row.eu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-xs text-gray-400 mt-4 text-center">
                ¿Dudas? Escríbenos y te ayudamos 🎀
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
