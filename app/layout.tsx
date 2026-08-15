import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Nunito, Baloo_2 } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ne Pişirsem? — Elindekilerle Yemek Öner',
  description:
    'Elindeki malzemeleri gir, yapay zeka sana öğününe uygun yemek tarifleri önersin. Kahvaltı, öğle, akşam, ara öğün ve tatlı.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ne Pişirsem?',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf6ec' },
    { media: '(prefers-color-scheme: dark)', color: '#2a2320' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="bg-background">
      <body className={`${nunito.variable} ${baloo.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
