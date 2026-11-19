'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { DialogBackdrop, useDismissable } from '@/components/beautybook/dashboard-ui'

export type DashboardNavItem = { id: string; label: string; icon: LucideIcon }

type DashboardShellProps = {
  mode: 'admin' | 'professional'
  navItems: DashboardNavItem[]
  activeId: string
  onNavigate: (id: string) => void
  eyebrow?: string
  title: string
  /** Nombre y iniciales de la persona con la sesión abierta. */
  userName: string
  userInitials: string
  /** Fecha que se muestra en la barra superior, ya formateada. */
  dateLabel: string
  children: React.ReactNode
}

export function DashboardShell({ mode, navItems, activeId, onNavigate, eyebrow, title, userName, userInitials, dateLabel, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const roleLabel = mode === 'admin' ? 'Administración' : 'Espacio profesional'


  useDismissable(userMenuOpen, userRef, () => setUserMenuOpen(false))

  function navigate(id: string) {
    onNavigate(id)
    setMobileOpen(false)
  }

  return (
    <div className={`bb-app bb-app-${mode} ${collapsed ? 'bb-app-collapsed' : ''}`}>
      {mobileOpen && <button className="bb-sidebar-scrim" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
      <aside className={`bb-sidebar ${mobileOpen ? 'bb-sidebar-open' : ''}`}>
        <Link href="/" className="bb-brand brand" aria-label="BeautyMC, inicio"><Image src="/iconpage.jpg?v=2" alt="BeautyMC" width={44} height={44} className="brand-mark" /><span className="bb-brand-word">Beauty<span className="brand-light">MC</span></span></Link>
        <div className="bb-workspace-label">{roleLabel}</div>
        <nav className="bb-side-nav" aria-label="Navegación del panel">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`bb-nav-item ${activeId === id ? 'is-active' : ''}`} title={label} aria-label={label} onClick={() => navigate(id)} aria-current={activeId === id ? 'page' : undefined}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="bb-sidebar-bottom">
          <div className="bb-user-menu" ref={userRef}>
            <button className="bb-user-switch" aria-label={`${userName}, ${roleLabel}`} aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen((value) => !value)}><span className="bb-avatar bb-avatar-clay">{userInitials}</span><span className="bb-user-copy"><strong>{userName}</strong><small>{roleLabel}</small></span><ChevronDown size={15} className={userMenuOpen ? 'is-open' : ''} /></button>
            {userMenuOpen && <div className="bb-user-popover" role="menu"><button type="button" role="menuitem" className="bb-user-logout" onClick={() => { setUserMenuOpen(false); setLogoutOpen(true); }}><LogOut aria-hidden="true" />Cerrar sesión</button></div>}
          </div>
        </div>
        <button className="bb-mobile-close" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}><X /></button>
      </aside>
      {logoutOpen && <DialogBackdrop onClose={() => setLogoutOpen(false)}><section className="bb-delete-card" role="alertdialog" aria-modal="true" aria-labelledby="bb-logout-title" aria-describedby="bb-logout-description"><button type="button" className="bb-detail-close" onClick={() => setLogoutOpen(false)} aria-label="Cerrar">×</button><span className="bb-delete-icon" aria-hidden="true"><LogOut /></span><h2 id="bb-logout-title">¿Cerrar sesión?</h2><p id="bb-logout-description">Tendrás que iniciar sesión de nuevo para volver al panel.</p><div className="bb-delete-actions"><button type="button" className="bb-delete-cancel" onClick={() => setLogoutOpen(false)}>Cancelar</button><button type="button" className="bb-delete-confirm" onClick={() => router.push('/')}><LogOut aria-hidden="true" />Sí, cerrar sesión</button></div></section></DialogBackdrop>}
      <main className="bb-main">
        <header className="bb-topbar">
          <button className="bb-mobile-menu" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><Menu /></button><button className="bb-desktop-toggle" aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'} aria-pressed={collapsed} onClick={() => setCollapsed((value) => !value)}><Menu /></button>
          <div className="bb-breadcrumb"><span>BeautyMC</span><span className="bb-breadcrumb-slash">/</span><strong>{title}</strong></div>
          <div className="bb-topbar-actions"><span className="bb-date-label">{dateLabel}</span><span className="bb-avatar bb-avatar-clay bb-top-avatar">{userInitials}</span></div>
        </header>
        <div className="bb-content">{eyebrow ? <div className="bb-page-intro"><div><span className="bb-eyebrow">{eyebrow}</span><h1>{title}</h1></div><div className="bb-intro-date">BeautyMC <span>·</span> Colombia</div></div> : null}{children}</div>
      </main>
    </div>
  )
}
