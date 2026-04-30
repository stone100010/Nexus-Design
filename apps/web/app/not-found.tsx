import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center space-y-6 p-8">
        <div className="text-8xl font-bold text-gray-700">404</div>
        <h2 className="text-2xl font-bold text-gray-100">页面不存在</h2>
        <p className="text-gray-400">您访问的页面不存在或已被移除</p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
