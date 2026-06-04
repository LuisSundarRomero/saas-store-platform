import { getCategorias } from '@/lib/actions/admin'
import { CategoriasManager } from '@/components/admin/CategoriasManager'

export default async function CategoriasPage() {
  const categorias = await getCategorias()
  const activas = categorias.filter((c: any) => c.activa).length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {categorias.length} categorías · {activas} activas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Lista de categorías */}
        <CategoriasManager categorias={categorias} />

        {/* Panel de ayuda */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">¿Cómo funcionan?</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-500">
              <div className="flex gap-3">
                <span className="text-lg shrink-0">🔢</span>
                <p><strong className="text-gray-700">Número de orden</strong> — define la posición en los chips del catálogo. Menor número = aparece primero.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">🔀</span>
                <p><strong className="text-gray-700">Toggle</strong> — activa o desactiva la categoría sin eliminarla. Las inactivas no aparecen en el catálogo.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">✏️</span>
                <p><strong className="text-gray-700">Editar</strong> — cambia el nombre. El slug se regenera automáticamente.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg shrink-0">⚠️</span>
                <p><strong className="text-gray-700">Eliminar</strong> — los productos de esa categoría quedarán sin categoría asignada.</p>
              </div>
            </div>
          </div>

          {/* Vista previa de chips */}
          {categorias.filter((c: any) => c.activa).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Vista previa en catálogo</h3>
              <p className="text-xs text-gray-400 mb-3">Así verán los chips tus clientes:</p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: '#1A1A1A', color: '#fff' }}>
                  Todo
                </span>
                {categorias
                  .filter((c: any) => c.activa)
                  .sort((a: any, b: any) => a.orden - b.orden)
                  .map((cat: any) => (
                    <span key={cat.id} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600">
                      {cat.nombre}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
