export default function Loading() {
  return (
    <div className="p-4 sm:p-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-36 mb-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-52 mb-6" />
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center justify-center">
        <div className="h-4 bg-gray-100 rounded w-48" />
      </div>
    </div>
  )
}
