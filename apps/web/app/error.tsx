'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-100">出错了</h2>
        <p className="text-gray-400 max-w-md">
          {error.message || '页面遇到了一个意外错误'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 p-4 bg-gray-800 rounded-lg text-left text-xs text-red-400 overflow-auto max-w-lg mx-auto">
            {error.stack}
          </pre>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重试
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
