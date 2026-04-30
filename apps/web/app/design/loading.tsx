export default function DesignLoading() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left sidebar skeleton */}
      <div className="w-64 border-r border-gray-700 bg-gray-800 p-4 space-y-4">
        <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Canvas skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 text-sm">加载编辑器...</p>
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="w-72 border-l border-gray-700 bg-gray-800 p-4 space-y-4">
        <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-full bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
