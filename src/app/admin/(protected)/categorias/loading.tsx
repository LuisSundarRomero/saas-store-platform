export default function Loading() {
  return (
    <div className="p-4 sm:p-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-36 mb-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-44 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-gray-200 rounded w-12" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-5 h-5 bg-gray-100 rounded" />
              <div className="flex-1 h-4 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded w-8" />
              <div className="h-6 bg-gray-100 rounded-full w-10" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-48" />
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-32" />
        </div>
      </div>
    </div>
  )
}
