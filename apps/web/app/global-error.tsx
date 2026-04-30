'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="text-6xl">💥</div>
          <h2 className="text-2xl font-bold text-gray-100">应用错误</h2>
          <p className="text-gray-400">应用遇到了严重错误，请刷新页面重试</p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </body>
    </html>
  )
}
