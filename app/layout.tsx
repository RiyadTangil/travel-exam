import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'TravelHisab - Travel Agency Management Application',
  description: 'Manage your travel agency clients and operations efficiently',
  icons: {
    icon: [
      { url: '/main_log_bgremoved.png' },
      { url: '/main_log_bgremoved.png', sizes: '32x32', type: 'image/png' },
      { url: '/main_log_bgremoved.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/main_log_bgremoved.png',
    apple: '/main_log_bgremoved.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
