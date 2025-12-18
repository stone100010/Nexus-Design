import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nexus Design - 统一设计平台',
  description: 'AI驱动的设计即代码平台，连接设计与开发',
  keywords: ['设计平台', 'AI设计', '代码生成', 'Next.js', 'React'],
  authors: [{ name: 'Nexus Design Team' }],
  creator: 'Nexus Design',
  metadataBase: new URL('https://nexusdesign.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    title: 'Nexus Design - 统一设计平台',
    description: 'AI驱动的设计即代码平台，连接设计与开发',
    siteName: 'Nexus Design',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nexus Design',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus Design - 统一设计平台',
    description: 'AI驱动的设计即代码平台，连接设计与开发',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
