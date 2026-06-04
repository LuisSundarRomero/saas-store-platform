export default function Loading() {
  return (
    <div className="p-4 sm:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-100 rounded-xl w-28 mb-2" />
          <div className="h-4 bg-gray-100 rounded-lg w-40" />
        </div>
        <div className="h-10 bg-gray-100 rounded-full w-36" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex gap-8">
          {['Producto','Categoría','Precio','Stock','Visible'].map((h) => (
            <div key={h} className="h-3 bg-gray-200 rounded w-16" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0">
            <div className="w-11 h-11 bg-gray-100 rounded-lg shrink-0" />
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-14" />
            <div className="h-4 bg-gray-100 rounded w-10" />
            <div className="h-6 bg-gray-100 rounded-full w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}
