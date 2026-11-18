import { services } from '@/lib/beautybook-data'
import { SiteHeader, SiteFooter } from '@/components/beautybook/site-shell'
import { ServicesCatalog } from '@/components/beautybook/services-catalog'

export default function ServicesPage() {
  return <><SiteHeader/><main className="catalog-page"><div className="catalog-intro"><span className="eyebrow">UN MOMENTO PARA TI</span><h1>Rituales de belleza<br/><em>a tu manera.</em></h1><p>Descubre nuestros servicios y encuentra el que mejor encaja contigo.</p></div><ServicesCatalog services={services} /><aside className="demo-notice">Los precios son orientativos y forman parte de una demostración. No se realizan reservas reales.</aside></main><SiteFooter/></>
}
