'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, LayoutDashboard, List, UserRound } from 'lucide-react'
import { DEMO_TODAY_LABEL, demoAppointments, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { DashboardShell, type DashboardNavItem } from '@/components/beautybook/dashboard-shell'
import { ProfessionalAppointmentModal } from '@/components/beautybook/professional/appointment-modal'
import { MyAppointments } from '@/components/beautybook/professional/appointments-view'
import { ProfessionalHome } from '@/components/beautybook/professional/home-view'
import { MyCalendar } from '@/components/beautybook/professional/calendar-view'
import { MyProfile } from '@/components/beautybook/professional/profile-view'
import { PROFESSIONAL_INITIALS, PROFESSIONAL_NAME } from '@/components/beautybook/professional/professional-shared'

const navItems: DashboardNavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'mis-citas', label: 'Mis citas', icon: List },
  { id: 'calendario', label: 'Mi calendario', icon: CalendarDays },
  { id: 'perfil', label: 'Mi perfil', icon: UserRound },
]

export default function ProfessionalDashboard() {
  const [view, setView] = useState('inicio')
  const [appointments] = useState(demoAppointments)
  const [selectedAppointment, setSelectedAppointment] = useState<DemoAppointment | null>(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | null>(null)
  const title = navItems.find((item) => item.id === view)?.label ?? 'Inicio'
  const myAppointments = appointments.filter(
    (appointment) => appointment.professional === PROFESSIONAL_NAME && appointment.status !== 'Cancelada',
  )

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function notify(message: string) {
    setToast(message)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2500)
  }

  return (
    <DashboardShell
      mode="professional"
      navItems={navItems}
      activeId={view}
      onNavigate={setView}
      title={title}
      userName={PROFESSIONAL_NAME}
      userInitials={PROFESSIONAL_INITIALS}
      dateLabel={DEMO_TODAY_LABEL}
    >
      {view === 'inicio' && (
        <ProfessionalHome appointments={myAppointments} onOpen={setSelectedAppointment} onNavigate={setView} />
      )}
      {view === 'mis-citas' && <MyAppointments appointments={myAppointments} onOpen={setSelectedAppointment} />}
      {view === 'calendario' && <MyCalendar appointments={myAppointments} onOpen={setSelectedAppointment} />}
      {view === 'perfil' && <MyProfile notify={notify} />}
      {selectedAppointment && (
        <ProfessionalAppointmentModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
      )}
      {toast && (
        <div className="bb-toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </DashboardShell>
  )
}
