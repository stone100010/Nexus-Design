export default function WorkspaceLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-card to-dark p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 w-32 bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-700 rounded"></div>
              <div className="h-10 w-full bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
