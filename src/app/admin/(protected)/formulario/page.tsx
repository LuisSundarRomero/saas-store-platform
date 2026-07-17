import { getCamposCheckout } from '@/lib/actions/campos-checkout'
import { CamposCheckoutManager } from '@/components/admin/CamposCheckoutManager'

export default async function FormularioPage() {
  const campos = await getCamposCheckout()

  return (
    <div className="p-4 sm:p-6 max-w-225 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Formulario de pedido</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Elige qué datos le pides al cliente cuando hace un pedido por WhatsApp desde el carrito.
        </p>
      </div>

      <CamposCheckoutManager campos={campos} />
    </div>
  )
}
