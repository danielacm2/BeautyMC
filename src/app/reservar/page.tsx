import { SiteHeader, SiteFooter } from '@/components/beautybook/site-shell'
import BookingFlow from '@/components/beautybook/booking-flow'

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ servicio?: string; profesional?: string }> }) {
  const { servicio, profesional } = await searchParams
  return <><SiteHeader/><main className="booking-page"><div className="booking-intro"><span className="eyebrow">UN MOMENTO PARA TI</span><h1>Vamos a encontrar<br/><em>tu momento.</em></h1><p>Cuéntanos qué te apetece y nosotras nos ocupamos del resto.</p></div><BookingFlow initialService={servicio} initialProfessional={profesional}/></main><SiteFooter/></>
}
