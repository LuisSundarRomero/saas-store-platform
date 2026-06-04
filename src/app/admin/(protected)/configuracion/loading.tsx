export default function Loading() {
  return (
    <div className="p-4 sm:p-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-36 mb-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-52 mb-5" />
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-9 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-40" />
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-32" />
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-36" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 h-80" />
      </div>
    </div>
  )
}
