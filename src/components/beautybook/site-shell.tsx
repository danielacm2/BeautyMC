import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, User } from 'lucide-react'
import { SiteNav } from '@/components/beautybook/site-nav'

export function SiteHeader() {
  return <header className="site-header"><Link href="/" className="brand" aria-label="BeautyMC, inicio"><Image src="/iconpage.jpg?v=2" alt="BeautyMC" width={44} height={44} className="brand-mark" /><span>Beauty<span className="brand-light">MC</span></span></Link><SiteNav /><div className="header-actions"><Link className="header-link header-manage-link" href="/gestionar" aria-label="Gestionar mi cita"><CalendarDays size={15}/> <span className="header-manage-label">Gestionar mi cita</span></Link><Link className="header-link" href="/login"><User size={15}/> Iniciar sesión</Link><Link className="button button-small button-rounded" href="/reservar">Reservar cita <ArrowUpRight size={15}/></Link></div></header>
}
export function SiteFooter() {
  return <footer id="contacto" className="footer"><div className="footer-top"><div><Link href="/" className="brand"><Image src="/iconpage.jpg?v=2" alt="BeautyMC" width={44} height={44} className="brand-mark" /><span>Beauty<span className="brand-light">MC</span></span></Link><p>Un espacio para sentirte bien.</p></div><div><span className="eyebrow">VISÍTANOS</span><p>Calle Sur, 42<br/>Medellín, Colombia</p></div><div><span className="eyebrow">HORARIO</span><p>Lunes – Viernes · 10:00 – 20:00<br/>Sábado · 10:00 – 15:00</p></div><div><span className="eyebrow">ESCRÍBENOS</span><a className="social-link" href="mailto:beautymc@gmail.com">beautymc@gmail.com <ArrowUpRight size={15}/></a></div></div><div className="footer-bottom"><span>© 2026 BeautyMC Salón</span><Link href="/gestionar" className="footer-manage-link">Gestionar mi cita</Link><span>Un momento solo para ti.</span><span>Datos de contacto de demostración</span></div></footer>
}
