import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
})
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'BeautyMC | Tu belleza, tu momento',
  description: 'Descubre y reserva servicios de peluquería, uñas, pestañas, cejas y maquillaje en BeautyMC, Colombia.',
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f8f5f1', userScalable: true }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`}><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
