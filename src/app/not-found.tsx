import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/beautybook/site-shell'

export const metadata: Metadata = {
  title: 'Página no encontrada | BeautyMC',
}

export default function NotFound() {
  return <><SiteHeader/><main className="notfound-page"><div className="notfound-card"><span className="notfound-flower" aria-hidden="true">✳</span><span className="eyebrow">ERROR 404</span><h1>Esta página se ha<br/><em>tomado un descanso.</em></h1><p>No encontramos lo que buscas, pero tu momento sigue esperándote.</p><div className="notfound-actions"><Link href="/" className="button">Volver al inicio <ArrowUpRight size={16}/></Link><Link href="/servicios" className="text-link">Ver servicios <ArrowUpRight size={15}/></Link></div></div></main><SiteFooter/></>
}
