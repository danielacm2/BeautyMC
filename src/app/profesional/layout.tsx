import type { Metadata } from 'next'
import './profesional.css'

export const metadata: Metadata = {
  title: 'Mi espacio | BeautyMC',
  description: 'Espacio de trabajo para profesionales de BeautyMC.',
}

export default function ProfessionalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
