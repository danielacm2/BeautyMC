import type { Metadata } from 'next'
import '../dashboard-base.css'

export const metadata: Metadata = {
  title: 'Administración | BeautyMC',
  description: 'Panel de administración de BeautyMC.',
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
