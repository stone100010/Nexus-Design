export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    </div>
  )
}
