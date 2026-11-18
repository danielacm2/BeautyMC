'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Inicio', href: '/', path: '/' },
  { label: 'Servicios', href: '/servicios', path: '/servicios' },
  { label: 'Nosotros', href: '/#nosotras' },
  { label: 'Contacto', href: '/#contacto' },
]

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal">
      {navItems.map(({ label, href, path }) => {
        const isActive = Boolean(path) && (pathname === path || pathname.startsWith(`${path}/`))

        return (
          <Link key={href} href={href} className={isActive ? 'is-active' : undefined} aria-current={isActive ? 'page' : undefined}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
