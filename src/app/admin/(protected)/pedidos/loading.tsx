export default function Loading() {
  return (
    <div className="p-4 sm:p-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-32 mb-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-48 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-24" />
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded-full w-20" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4 border-b border-gray-50 last:border-0">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-28" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
