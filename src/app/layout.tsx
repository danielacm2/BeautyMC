import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BeautyMC | Tu belleza, tu momento',
  description: 'Descubre y reserva servicios de peluquería, uñas, pestañas, cejas y maquillaje en BeautyMC, Colombia.',
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f8f5f1', userScalable: true }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
