import { getConfigTienda, getConfigAnuncio, getConfigBanner, getConfigFooter, getConfigMensajes } from '@/lib/actions/admin'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const [tienda, anuncio, banner, footer, mensajes] = await Promise.all([
    getConfigTienda(),
    getConfigAnuncio(),
    getConfigBanner(),
    getConfigFooter(),
    getConfigMensajes(),
  ])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-400 mt-0.5">Ajustes generales de la tienda</p>
      </div>
      <ConfigForm
        tienda={tienda}
        anuncio={anuncio}
        banner={banner}
        footer={footer}
        mensajes={mensajes}
      />
    </div>
  )
}
