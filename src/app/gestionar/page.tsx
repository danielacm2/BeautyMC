import { SiteHeader, SiteFooter } from '@/components/beautybook/site-shell'
import ManageBooking from '@/components/beautybook/manage-booking'

export default function ManageBookingPage() {
  return (
    <>
      <SiteHeader />
      <main className="manage-page">
        <ManageBooking />
      </main>
      <SiteFooter />
    </>
  )
}
