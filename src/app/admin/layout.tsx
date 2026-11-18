import type { Metadata } from 'next'
import './dashboards.css'

export const metadata: Metadata = {
  title: 'Administración | BeautyMC',
  description: 'Panel de administración de BeautyMC.',
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
