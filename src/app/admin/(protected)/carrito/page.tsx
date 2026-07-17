import Link from 'next/link'
import { IconBrandWhatsapp, IconArrowRight } from '@tabler/icons-react'
import { getCamposCheckout } from '@/lib/actions/campos-checkout'
import { CamposCheckoutManager } from '@/components/admin/CamposCheckoutManager'

export default async function CarritoPage() {
  const campos = await getCamposCheckout()

  return (
    <div className="p-4 sm:p-6 max-w-225 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrito</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Elige qué datos le pides al cliente cuando hace un pedido por WhatsApp desde el carrito.
        </p>
      </div>

      <CamposCheckoutManager campos={campos} />

      <Link
        href="/admin/configuracion?tab=mensajes"
        className="mt-5 flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-5 py-4 max-w-2xl hover:border-red-200 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
            <IconBrandWhatsapp size={18} style={{ color: '#16A34A' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Mensaje de WhatsApp</p>
            <p className="text-xs text-gray-400">Agrega estos campos al mensaje que recibe tu cliente con la variable <code className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded">{'{campos}'}</code></p>
          </div>
        </div>
        <IconArrowRight size={16} className="text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
      </Link>
    </div>
  )
}
