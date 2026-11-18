'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { CalendarDays, Check, ChevronDown, CircleCheck, Clock3, Eye, Heart, ImagePlus, MessageCircle, Pencil, Plus, Search, Settings2, Sparkles, Ticket, Trash2, User, Users, type LucideIcon } from 'lucide-react'
import { demoAppointments, demoProfessionals, demoServices, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { FilterDropdown, Modal, StatusBadge } from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'
import { isValidEmail } from '@/lib/validation'
import { DashboardShell, type DashboardNavItem } from '@/components/beautybook/dashboard-shell'
import { serviceProfessionals } from '@/lib/beautybook-data'
import { TimePicker, parseDisplayTime } from '@/components/beautybook/admin/time-picker'
import { SettingsView } from '@/components/beautybook/admin/settings-view'
import { CustomerModal, CustomersView } from '@/components/beautybook/admin/customers-view'
import {
  categoryLabel,
  formatAgendaDate,
  initialsOf,
  type AdminModal,
  type AppointmentDraft,
  type ProfessionalForm,
  type ProfessionalItem,
  type ServiceDraft,
  type ServiceItem,
} from '@/components/beautybook/admin/admin-shared'

const navItems: DashboardNavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: CalendarDays },
  { id: 'citas', label: 'Citas', icon: Clock3 },
  { id: 'servicios', label: 'Servicios', icon: Sparkles },
  { id: 'profesionales', label: 'Profesionales', icon: Users },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'configuracion', label: 'Configuración', icon: Settings2 },
]

const activityCurrent = [
  { day: 'Lun', full: 'Lunes', value: 18 }, { day: 'Mar', full: 'Martes', value: 26 }, { day: 'Mié', full: 'Miércoles', value: 21 },
  { day: 'Jue', full: 'Jueves', value: 33 }, { day: 'Vie', full: 'Viernes', value: 29 }, { day: 'Sáb', full: 'Sábado', value: 38 },
]
const activityMonth = [
  { day: 'Sem 1', full: 'Semana 1', value: 132 }, { day: 'Sem 2', full: 'Semana 2', value: 148 },
  { day: 'Sem 3', full: 'Semana 3', value: 140 }, { day: 'Sem 4', full: 'Semana 4', value: 162 },
]
const ACTIVITY_TODAY_INDEX = 5

const teamOnShift = [
  { initials: 'LM', name: 'Laura Martín', specialty: 'Corte & Maquillaje', status: 'En sesión · 10:00', statusBg: '#F7F0E2', statusColor: '#9C7332' },
  { initials: 'CR', name: 'Clara Ruiz', specialty: 'Manicura & Spa', status: 'En sesión · 10:30', statusBg: '#F7F0E2', statusColor: '#9C7332' },
  { initials: 'IV', name: 'Inés Vega', specialty: 'Cejas & Pestañas', status: 'Disponible', statusBg: '#EBF2ED', statusColor: '#4A7C59' },
]

const valeriaSample: DemoAppointment = {
  id: 'BB-1056', customer: 'Valeria Gómez', initials: 'VG', phone: '+34 600 123 456', email: 'valeria.g@email.com',
  service: 'Lifting de pestañas', professional: 'Inés Vega', date: 'Hoy, 14 nov.', time: '15:30', price: 180000, status: 'Confirmada',
}

export default function AdminDashboard() {
  const [view, setView] = useState('inicio')
  const [appointments, setAppointments] = useState(demoAppointments)
  const [services, setServices] = useState(demoServices)
  const [professionals, setProfessionals] = useState(demoProfessionals)
  const [modal, setModal] = useState<AdminModal>(null)
  const [toast, setToast] = useState('')
  const title = navItems.find((item) => item.id === view)?.label ?? 'Inicio'
  const detailAppointment = modal?.kind === 'appointment' ? (appointments.find((item) => item.id === modal.appointment.id) ?? modal.appointment) : null

  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function notify(message: string) {
    setToast(message)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingAppointment = editingId ? appointments.find((appointment) => appointment.id === editingId) ?? null : null

  function requestEdit(appointment: DemoAppointment) {
    setModal(null)
    setEditingId(appointment.id)
  }

  function saveEdited(id: string, draft: AppointmentDraft) {    const service = demoServices.find((item) => item.id === draft.serviceId)
    setAppointments((current) => current.map((appointment) => appointment.id === id ? { ...appointment, customer: draft.name, initials: initialsOf(draft.name), phone: draft.phone, email: draft.email, service: service?.name ?? appointment.service, professional: draft.professional, date: draft.dateISO ? formatAgendaDate(draft.dateISO) : (draft.dateLabel || appointment.date), time: draft.time, price: service?.price ?? appointment.price, status: draft.status } : appointment))
    setEditingId(null)
    notify('Cita actualizada correctamente.')
  }

  function cancelEdit() {
    setEditingId(null)
    notify('Se canceló la edición de la cita.')
  }

  function toDraft(appointment: DemoAppointment): AppointmentDraft {
    return { serviceId: demoServices.find((item) => item.name === appointment.service)?.id ?? '', professional: appointment.professional, dateISO: '', dateLabel: appointment.date, time: appointment.time, name: appointment.customer, email: appointment.email, phone: appointment.phone, status: appointment.status }
  }

  function saveService(draft: ServiceDraft) {
    if (modal?.kind !== 'service') return
    const editing = modal.service
    if (editing) {
      setServices((current) => current.map((item) => item.id === editing.id ? { ...item, ...draft } : item))
      notify('Servicio actualizado.')
    } else {
      setServices((current) => [...current, { id: `demo-${Date.now()}`, active: true, ...draft }])
      notify('Servicio añadido al catálogo.')
    }
    setModal(null)
  }

  return <DashboardShell mode="admin" navItems={navItems} activeId={view} onNavigate={setView} eyebrow={view === 'citas' || view === 'servicios' || view === 'profesionales' || view === 'clientes' || view === 'configuracion' ? '' : 'PANEL DE ADMINISTRACIÓN'} title={title}>
    {view === 'inicio' && <AdminHome appointments={appointments} onOpen={(appointment) => setModal({ kind: 'appointment', appointment })} onNavigate={setView} />}
    {view === 'citas' && <AppointmentsView appointments={appointments} onOpen={(appointment) => setModal({ kind: 'appointment', appointment })} onAdd={(appointment) => setAppointments((current) => [...current, appointment])} onEditRequest={requestEdit} onDelete={(id) => setAppointments((current) => current.filter((item) => item.id !== id))} notify={notify} />}
    {view === 'servicios' && <ServicesView services={services} onAdd={() => setModal({ kind: 'service' })} onEdit={(service) => setModal({ kind: 'service', service })} onDelete={(id) => setServices((current) => current.filter((service) => service.id !== id))} notify={notify} />}
    {view === 'profesionales' && <ProfessionalsView professionals={professionals} appointments={appointments} onToggle={(id) => setProfessionals((current) => current.map((person) => person.id === id ? { ...person, active: !person.active } : person))} onAdd={(draft: ProfessionalForm & { specialty: string }) => setProfessionals((current) => [...current, { id: `demo-${Date.now()}`, initials: initialsOf(draft.name), active: true, appointments: 0, name: draft.name, email: draft.email, password: draft.password, phone: draft.phone, bio: draft.bio, specialty: draft.specialty, schedule: draft.schedule, categories: draft.categories, image: draft.image }])} onEdit={(id, draft) => setProfessionals((current) => current.map((person) => person.id === id ? { ...person, ...draft } : person))} onDelete={(id) => setProfessionals((current) => current.filter((person) => person.id !== id))} notify={notify} />}
    {view === 'clientes' && <CustomersView onOpen={(customer) => setModal({ kind: 'customer', customer })} notify={notify} />}
    {view === 'configuracion' && <SettingsView notify={notify} />}
    {detailAppointment && <AppointmentModal appointment={detailAppointment} onClose={() => setModal(null)} notify={notify} />}
    {editingAppointment && <CreateAppointmentModal key={editingAppointment.id} title="Editar cita" eyebrow="EDITAR RESERVA" submitLabel="Guardar cambios" initial={toDraft(editingAppointment)} onClose={cancelEdit} onSave={(draft) => saveEdited(editingAppointment.id, draft)} />}
    {modal?.kind === 'customer' && <CustomerModal customer={modal.customer} onClose={() => setModal(null)} appointments={appointments} notify={notify} />}
    {modal?.kind === 'service' && <ServiceFormModal services={services} initial={modal.service ? { name: modal.service.name, category: modal.service.category, price: modal.service.price, description: modal.service.description, image: modal.service.image } : undefined} title={modal.service ? 'Editar servicio' : 'Añadir servicio al catálogo'} eyebrow={modal.service ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'} onClose={() => { const wasEditing = Boolean(modal.service); setModal(null); notify(wasEditing ? 'Se canceló la edición del servicio.' : 'Se canceló la creación del servicio.'); }} onSave={saveService} />}
    {toast && <div className="bb-toast" role="status"><Check size={16} />{toast}</div>}
  </DashboardShell>
}

const kpiCards: { icon: LucideIcon; label: string; value: string; iconBg: string; iconColor: string; badge: string; badgeBg: string; badgeColor: string }[] = [
  { icon: CalendarDays, label: 'Citas de hoy', value: '12', iconBg: '#F5ECE8', iconColor: '#B07D6B', badge: '↗ +2', badgeBg: '#EBF2ED', badgeColor: '#4A7C59' },
  { icon: CircleCheck, label: 'Citas esta semana', value: '86', iconBg: '#EBF2ED', iconColor: '#4A7C59', badge: '↗ +10,3%', badgeBg: '#EBF2ED', badgeColor: '#4A7C59' },
  { icon: Heart, label: 'Clientas registradas', value: '1.284', iconBg: '#F7F0E2', iconColor: '#8F4F3F', badge: '↗ +5,8%', badgeBg: '#EBF2ED', badgeColor: '#4A7C59' },
  { icon: Sparkles, label: 'Profesionales activas', value: '3', iconBg: '#F5ECE8', iconColor: '#B07D6B', badge: '100% activas', badgeBg: '#F4EFEA', badgeColor: '#6B5E57' },
]

function AdminHome({ appointments, onOpen, onNavigate }: { appointments: DemoAppointment[]; onOpen: (appointment: DemoAppointment) => void; onNavigate: (id: string) => void }) {
  const next = appointments.filter((item) => !item.date.startsWith('Hoy') && item.status !== 'Cancelada').slice(0, 3)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const agendaRows: DemoAppointment[] = [...appointments.filter((item) => ['BB-1048', 'BB-1049', 'BB-1050', 'BB-1051'].includes(item.id)), valeriaSample]
  const activityDays = period === 'week' ? activityCurrent : activityMonth
  const isWeek = period === 'week'
  const barHeights = isWeek ? [68, 98, 80, 124, 110, 144] : [95, 110, 102, 144]
  return <div className="bb-page-stack">
    <section className="bb-hello-panel" aria-labelledby="bb-hello-title"><div className="bb-hello-mark" aria-hidden="true">b</div><div className="bb-hello-copy"><span className="bb-hello-eyebrow"><span>SÁBADO, 14 DE NOVIEMBRE</span><i className="bb-hello-dot" aria-hidden="true" /><span className="relative flex h-2.5 w-2.5 mr-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span></span><span>ESTUDIO ABIERTO · 3 ESPECIALISTAS EN TURNO</span></span><h2 id="bb-hello-title">Buenos días, Ana <span className="bb-hello-star" aria-hidden="true">✳</span></h2><p>Tu estudio está en marcha. Aquí tienes el resumen de hoy.</p></div><div className="bb-hello-actions"><button type="button" className="bb-hello-secondary" onClick={() => onNavigate('citas')}><CalendarDays aria-hidden="true" />Ver agenda de hoy</button></div></section>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bb-kpi-grid">{kpiCards.map(({ icon: Icon, label, value, iconBg, iconColor, badge, badgeBg, badgeColor }) => <article className="bb-kpi-card" key={label}><div className="bb-kpi-top"><span className="bb-kpi-icon" style={{ background: iconBg, color: iconColor }}><Icon aria-hidden="true" strokeWidth={1.75} /></span><span className="bb-kpi-badge" style={{ background: badgeBg, color: badgeColor }}>{badge}</span></div><span className="bb-kpi-label">{label}</span><strong className="bb-kpi-value">{value}</strong></article>)}</div>
        <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6 pb-6" aria-labelledby="bb-activity-title">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 id="bb-activity-title" className="font-serif text-2xl text-[#4A4039]">Actividad de citas</h2>
                <span className="bg-[#EBF2ED] text-[#4A7C59] text-xs font-medium px-2.5 py-1 rounded-full">{isWeek ? '+12,8% vs. semana anterior' : '+18,4% vs. mes anterior'}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <strong className="font-serif text-3xl text-[#4A4039]">{isWeek ? 146 : 582}</strong>
                <span className="text-sm text-[#7A6F69]">citas completadas {isWeek ? 'esta semana' : 'este mes'}</span>
              </div>
            </div>
            <div className="bg-[#FAF8F5] border border-[#EAE3DC] p-1 rounded-xl flex gap-1" role="group" aria-label="Periodo del gráfico">
              <button type="button" onClick={() => setPeriod('week')} aria-pressed={isWeek} className={isWeek ? 'bg-white shadow-xs text-[#4A4039] font-medium px-3.5 py-1.5 rounded-lg text-sm' : 'text-[#7A6F69] px-3.5 py-1.5 text-sm'}>Esta semana</button>
              <button type="button" onClick={() => setPeriod('month')} aria-pressed={!isWeek} className={!isWeek ? 'bg-white shadow-xs text-[#4A4039] font-medium px-3.5 py-1.5 rounded-lg text-sm' : 'text-[#7A6F69] px-3.5 py-1.5 text-sm'}>Este mes</button>
            </div>
          </div>
          <div className="relative h-56 flex flex-col justify-end" role="img" aria-label={`Citas por periodo: ${activityDays.map((item) => `${item.full}, ${item.value}`).join('; ')}`}>
            <div className="absolute inset-0 bottom-9 flex flex-col justify-between pointer-events-none" aria-hidden="true">
              <div className="border-b border-dashed border-[#EAE3DC]" />
              <div className="border-b border-dashed border-[#EAE3DC]" />
              <div className="border-b border-dashed border-[#EAE3DC]" />
              <div className="border-b border-[#EAE3DC]" />
            </div>
            <div className="relative z-10 flex items-end justify-around h-full">
              {activityDays.map((item, index) => {
                const isCurrent = index === (isWeek ? ACTIVITY_TODAY_INDEX : activityDays.length - 1)
                return <div className="flex flex-col items-center justify-end h-full" key={item.day}>
                  <span className={isCurrent ? 'text-xs font-semibold mb-2 text-[#B07D6B]' : 'text-xs font-semibold mb-2 text-[#4A4039]'}>{item.value}</span>
                  <div className={isCurrent ? 'w-11 sm:w-12 rounded-t-xl transition-all duration-300 bg-[#B07D6B]' : 'w-11 sm:w-12 rounded-t-xl transition-all duration-300 bg-[#E3D5CE]'} style={{ height: `${barHeights[index]}px` }} tabIndex={0} role="img" aria-label={`${item.full}: ${item.value} citas`} title={`${item.full}: ${item.value} citas`} />
                  <div className="mt-3 h-7 flex items-center justify-center">
                    {isCurrent
                      ? <span className="bg-[#EFE5DF] text-[#8C5E4F] text-xs font-medium px-3 py-1 rounded-full">{isWeek ? 'Sáb · hoy' : `${item.day} · actual`}</span>
                      : <span className="text-xs text-[#7A6F69]">{item.day}</span>}
                  </div>
                </div>
              })}
            </div>
          </div>
        </section>
        <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6" aria-labelledby="bb-agenda-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 id="bb-agenda-title" className="font-serif text-2xl text-[#4A4039]">Citas de hoy</h2>
                <span className="bg-[#EFE5DF] text-[#7A6F69] text-xs font-medium px-3 py-1 rounded-full">Sábado, 14 nov</span>
              </div>
              <p className="text-sm text-[#7A6F69] mt-1">Gestiona el estado y seguimiento de las reservas del día.</p>
            </div>
            <button type="button" onClick={() => onNavigate('citas')} className="text-sm font-medium text-[#B07D6B] hover:underline">Ver todas →</button>
          </div>
          <div className="divide-y divide-[#EAE3DC] mt-2">
            {agendaRows.map((appointment) => {
              const isPending = appointment.status === 'Pendiente'
              const isNext = appointment.id === 'BB-1050'
              return <button type="button" key={appointment.id} onClick={() => onOpen(appointment)} aria-label={`${appointment.time}, ${appointment.customer}, ${appointment.service} con ${appointment.professional}`} className={isPending ? 'w-full flex items-center gap-4 py-3.5 px-3 rounded-xl bg-[#F9F4F1] text-left' : 'w-full flex items-center gap-4 py-3.5 text-left'}>
                <span className="w-14 shrink-0 text-left"><span className="block font-bold text-[15px] text-[#4A4039]">{appointment.time}</span>{isNext && <span className="block text-[10px] font-semibold tracking-wider text-[#B07D6B] mt-0.5">SIGUIENTE</span>}</span>
                <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-serif text-sm text-[#4A4039]" style={appointment.initials === 'ET' ? { background: '#FFFFFF', border: '1px solid #EAE3DC' } : { background: '#F5ECE8' }} aria-hidden="true">{appointment.initials}</span>
                <span className="flex-1 min-w-0 text-left"><span className="block text-sm font-bold text-[#4A4039]">{appointment.customer}</span><span className="block text-[13px] text-[#7A6F69]">{appointment.service}</span></span>
                <span className="ml-auto flex items-center gap-1.5 text-[13px] text-[#7A6F69] whitespace-nowrap"><User className="w-3.5 h-3.5" aria-hidden="true" />{appointment.professional}</span>
              </button>
            })}
          </div>
        </section>
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
      <section className="bg-[#EFE5DF] border border-[#E5D8D0] rounded-2xl p-6 flex flex-col gap-4 h-fit" aria-labelledby="bb-next-title">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-[#9A6B5B]" id="bb-next-title">SIGUIENTE CITA</span>
          <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#4A4039] flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B07D6B] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#B07D6B]"></span></span>En 25 min · 11:00</span>
        </div>
        <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-[#EAE3DC]">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-full bg-white border border-[#E5D8D0] flex items-center justify-center font-serif text-base text-[#4A4039]" aria-hidden="true">ET</span>
            <div>
              <p className="font-serif text-lg text-[#4A4039]">Elena Torres</p>
              <p className="text-sm text-[#B07D6B]">Diseño de cejas</p>
            </div>
          </div>
          <span className="text-xs text-[#7A6F69] self-start">Cliente VIP</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#EAE3DC]">
          <p className="text-[11px] font-semibold tracking-wider text-[#7A6F69] uppercase mb-1">PROFESIONAL</p>
          <p className="text-sm font-medium text-[#4A4039] flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#B07D6B]" aria-hidden="true" />Inés Vega</p>
        </div>
        <button type="button" className="w-full bg-[#B07D6B] hover:bg-[#9C6B5A] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors" onClick={() => { const found = appointments.find((item) => item.id === 'BB-1050'); if (found) onOpen(found) }}><Eye aria-hidden="true" strokeWidth={1.75} className="w-4 h-4" />Mirar</button>
      </section>
        <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6" aria-labelledby="bb-team-title">
          <div className="flex items-center justify-between">
            <h2 id="bb-team-title" className="font-serif text-xl text-[#4A4039]">Equipo en turno hoy</h2>
            <span className="text-sm text-[#7A6F69]">3 activas</span>
          </div>
          <div className="flex flex-col gap-2.5 mt-4">
            {teamOnShift.map((member) => <div key={member.initials} className="flex items-center gap-3 bg-[#FAF8F5] border border-[#EAE3DC] rounded-xl p-3">
              <span className="w-10 h-10 shrink-0 rounded-full bg-[#EFE5DF] flex items-center justify-center font-serif text-sm text-[#4A4039]" aria-hidden="true">{member.initials}</span>
              <span className="flex-1 min-w-0"><span className="block text-sm font-bold text-[#4A4039]">{member.name}</span><span className="block text-xs text-[#7A6F69]">{member.specialty}</span></span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: member.statusBg, color: member.statusColor }}>{member.status}</span>
            </div>)}
          </div>
        </section>
        <section className="bg-white border border-[#EAE3DC] rounded-2xl p-6 h-fit" aria-labelledby="bb-coming-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="bb-coming-title" className="font-serif text-2xl text-[#4A4039]">Próximas citas</h2>
              <p className="text-sm text-[#7A6F69] mt-1">Siguientes reservas agendadas</p>
            </div>
            <button type="button" onClick={() => onNavigate('citas')} className="text-sm font-medium text-[#B07D6B] hover:underline">Calendario →</button>
          </div>
          <div className="divide-y divide-[#EAE3DC] mt-2">
            {next.map((appointment) => {
              const dayNum = appointment.date.match(/\d{1,2}/)?.[0] ?? '—'
              const month = appointment.date.replace(/[0-9.,]/g, '').trim().split(' ').pop()?.toUpperCase() ?? ''
              return <button type="button" key={appointment.id} onClick={() => onOpen(appointment)} aria-label={`${appointment.customer}, ${appointment.service}, ${appointment.date} a las ${appointment.time}`} className="w-full flex items-center gap-3 py-3.5 text-left">
                <span className="w-12 h-12 shrink-0 rounded-xl bg-[#EFE5DF] flex flex-col items-center justify-center" aria-hidden="true"><strong className="font-serif text-lg leading-none text-[#4A4039]">{dayNum}</strong><small className="text-[10px] font-semibold tracking-wider text-[#B07D6B]">{month}</small></span>
                <span className="flex-1 min-w-0"><span className="block text-sm font-bold text-[#4A4039]">{appointment.customer}</span><span className="block text-[13px] text-[#7A6F69]">{appointment.service}</span></span>
                <span className="font-serif text-sm text-[#4A4039] bg-[#FAF8F5] border border-[#EAE3DC] rounded-full px-3 py-1 whitespace-nowrap">{appointment.time}</span>
              </button>
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => onNavigate('servicios')} className="flex-1 bg-white border border-[#EAE3DC] text-[#4A4039] text-sm font-medium py-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"><Sparkles className="w-4 h-4 text-[#B07D6B]" aria-hidden="true" />Añadir servicio</button>
            <button type="button" onClick={() => onNavigate('clientes')} className="flex-1 bg-white border border-[#EAE3DC] text-[#4A4039] text-sm font-medium py-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"><Users className="w-4 h-4 text-[#B07D6B]" aria-hidden="true" />Ver clientes</button>
          </div>
        </section>
      </div>
    </div>
  </div>
}

const agendaDayOptions = ['Todas las fechas', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const weekdayLabels: Record<string, string> = { Hoy: 'Sábado', Lun: 'Lunes', Mar: 'Martes', 'Mié': 'Miércoles', Jue: 'Jueves', Vie: 'Viernes', 'Sáb': 'Sábado', Dom: 'Domingo' }

function weekdayOf(date: string) {
  return weekdayLabels[date.split(',')[0].trim()] ?? date
}

const agendaTimeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

function formatHour12(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour = hours % 12 === 0 ? 12 : hours % 12
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function upcomingAgendaDays(count = 14) {
  const days: { iso: string; label: string }[] = []
  const today = new Date()
  for (let offset = 0; offset < count; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    days.push({ iso, label: formatAgendaDate(iso) })
  }
  return days
}

function CreateAppointmentModal({ onClose, onSave, initial, title = 'Agendar cita', eyebrow = 'NUEVA RESERVA', submitLabel = 'Guardar cita' }: { onClose: () => void; onSave: (draft: AppointmentDraft) => void; initial?: AppointmentDraft; title?: string; eyebrow?: string; submitLabel?: string }) {
  const [serviceId, setServiceId] = useState(initial?.serviceId ?? '')
  const [professional, setProfessional] = useState(initial?.professional ?? '')
  const [dateISO, setDateISO] = useState(initial?.dateISO ?? '')
  const [time, setTime] = useState(initial?.time ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [error, setError] = useState('')
  const days = useMemo(() => upcomingAgendaDays(14), [])
  const timeOptions = useMemo(() => initial?.time && !agendaTimeSlots.includes(initial.time) ? [...agendaTimeSlots, initial.time].sort() : agendaTimeSlots, [initial])
  const service = demoServices.find((item) => item.id === serviceId)
  const serviceValue = service ? `${service.name} · ${formatCOP(service.price)}` : 'Seleccionar servicio'
  const dateValue = days.find((day) => day.iso === dateISO)?.label ?? initial?.dateLabel ?? 'Seleccionar fecha'

  function selectService(display: string) {
    const found = demoServices.find((item) => `${item.name} · ${formatCOP(item.price)}` === display)
    if (found) setServiceId(found.id)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const hasDate = Boolean(dateISO || initial?.dateLabel)
    if (!service || !professional || !hasDate || !time) {
      setError('Selecciona el servicio, la especialista, la fecha y la hora.')
      return
    }
    if (!name.trim() || !isValidEmail(email.trim()) || !phone.trim()) {
      setError('Completa el nombre, un email válido y el teléfono del cliente.')
      return
    }
    setError('')
    onSave({ serviceId, professional, dateISO, dateLabel: initial?.dateLabel ?? '', time, name: name.trim(), email: email.trim(), phone: phone.trim(), status: initial?.status ?? 'Pendiente' })
  }

  return <div className="bb-book-modal"><Modal title={title} description={eyebrow} onClose={onClose}><form className="bb-form bb-book-form" onSubmit={submit} noValidate><div className="bb-book-grid"><div className="bb-book-col"><div className="bb-field"><div className="bb-field-head"><span>Cliente</span><button type="button" className="bb-field-link" onClick={() => { setName(''); setEmail(''); setPhone('') }}>+ Nuevo cliente</button></div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del cliente" autoComplete="off" /></div><div className="bb-field"><div className="bb-field-head"><span>Servicio</span></div><FilterDropdown icon={Sparkles} value={serviceValue} options={demoServices.map((item) => `${item.name} · ${formatCOP(item.price)}`)} onChange={selectService} label="Servicio" /></div><div className="bb-field"><div className="bb-field-head"><span>Profesional</span></div><FilterDropdown icon={User} value={professional || 'Seleccionar especialista'} options={demoProfessionals.map((person) => person.name)} onChange={setProfessional} label="Especialista" /></div></div><div className="bb-book-col"><div className="bb-field"><div className="bb-field-head"><span>Fecha de la reserva</span></div><FilterDropdown icon={CalendarDays} value={dateValue} options={days.map((day) => day.label)} onChange={(display) => setDateISO(days.find((day) => day.label === display)?.iso ?? '')} label="Fecha de la reserva" /></div><div className="bb-field"><div className="bb-field-head"><span>Horarios disponibles</span></div><div className="bb-time-chips" role="group" aria-label="Horarios disponibles">{timeOptions.map((slot) => <button key={slot} type="button" className={time === slot ? 'is-selected' : ''} aria-pressed={time === slot} onClick={() => setTime(slot)}>{slot}</button>)}</div></div></div></div><div className="bb-form-row"><label>Correo electrónico *<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="hola@ejemplo.com" autoComplete="off" /></label><label>Teléfono *<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="300 123 4567" autoComplete="off" /></label></div><div className="bb-book-summary"><div><span>RESUMEN DE RESERVA</span><strong>{service ? `${service.name} · ${time || '--:--'}` : 'Selecciona un servicio'}</strong></div><div className="bb-book-total"><span>TOTAL ESTIMADO</span><strong>{service ? formatCOP(service.price) : '—'}</strong></div></div>{error && <p className="bb-form-error" role="alert">{error}</p>}<div className="bb-book-actions"><button type="button" className="bb-button bb-button-outline" onClick={onClose}>Cancelar</button><button type="submit" className="bb-button bb-button-primary"><Check aria-hidden="true" />{submitLabel}</button></div></form></Modal></div>
}

function DeleteAppointmentModal({ appointment, onClose, onConfirm }: { appointment: DemoAppointment; onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="bb-delete-card" role="alertdialog" aria-modal="true" aria-labelledby="bb-delete-title" aria-describedby="bb-delete-description"><button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">×</button><span className="bb-delete-icon" aria-hidden="true"><Trash2 /></span><h2 id="bb-delete-title">¿Eliminar esta cita?</h2><p id="bb-delete-description">Estás a punto de eliminar permanentemente esta reserva de la agenda. Esta acción no se puede deshacer.</p><div className="bb-delete-summary"><div className="bb-delete-top"><strong>{appointment.id}</strong><span>{appointment.date} · {appointment.time} — {appointment.professional}</span></div><strong className="bb-delete-name">{appointment.customer}</strong><span className="bb-delete-service">{appointment.service} · {formatCOP(appointment.price)}</span></div><div className="bb-delete-actions"><button type="button" className="bb-delete-cancel" onClick={onClose}>Cancelar</button><button type="button" className="bb-delete-confirm" onClick={onConfirm}><Trash2 aria-hidden="true" />Sí, eliminar</button></div></section></div>
}

function AppointmentsView({ appointments, onOpen, onAdd, onEditRequest, onDelete, notify }: { appointments: DemoAppointment[]; onOpen: (appointment: DemoAppointment) => void; onAdd: (appointment: DemoAppointment) => void; onEditRequest: (appointment: DemoAppointment) => void; onDelete: (id: string) => void; notify: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [quick, setQuick] = useState<'todas' | 'hoy'>('todas')
  const [specialist, setSpecialist] = useState('Todos los especialistas')
  const [day, setDay] = useState('Todas las fechas')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const specialistOptions = useMemo(() => ['Todos los especialistas', ...demoProfessionals.map((person) => person.name)], [])
  const totalCount = appointments.length
  const todayCount = appointments.filter((item) => item.date.startsWith('Hoy')).length
  const filtered = useMemo(() => appointments.filter((item) => {
    const matchesText = `${item.customer} ${item.service} ${item.professional} ${item.id}`.toLowerCase().includes(query.toLowerCase())
    const matchesQuick = quick === 'todas' || (quick === 'hoy' && item.date.startsWith('Hoy'))
    const matchesSpecialist = specialist === 'Todos los especialistas' || item.professional === specialist
    const matchesDay = day === 'Todas las fechas' || weekdayOf(item.date) === day
    return matchesText && matchesQuick && matchesSpecialist && matchesDay
  }), [appointments, query, quick, specialist, day])

  function saveCreated(draft: AppointmentDraft) {
    const numericIds = appointments.map((item) => Number(item.id.replace('BB-', '')) || 0)
    const service = demoServices.find((item) => item.id === draft.serviceId)
    if (!service) return
    onAdd({ id: `BB-${Math.max(0, ...numericIds) + 1}`, customer: draft.name, initials: initialsOf(draft.name), phone: draft.phone, email: draft.email, service: service.name, professional: draft.professional, date: formatAgendaDate(draft.dateISO), time: draft.time, price: service.price, status: draft.status })
    setCreating(false)
    notify('Cita guardada correctamente.')
  }

  function cancelCreate() {
    setCreating(false)
    notify('Se canceló el proceso de crear una cita.')
  }

  const deletingAppointment = deletingId ? appointments.find((item) => item.id === deletingId) ?? null : null

  function confirmDelete() {
    if (!deletingAppointment) return
    onDelete(deletingAppointment.id)
    setDeletingId(null)
    notify('Cita eliminada correctamente.')
  }

  function cancelDelete() {
    setDeletingId(null)
    notify('Se canceló la eliminación de la cita.')
  }
  return <div className="bb-page-stack"><section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-agenda-title"><div className="bb-hello-mark" aria-hidden="true">b</div><div className="bb-hello-copy"><span className="bb-hello-eyebrow"><span>GESTIÓN DE RESERVAS</span><i className="bb-hello-dot" aria-hidden="true" /><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span></span><span>AGENDA SINCRONIZADA</span></span><h2 id="bb-agenda-title">Agenda de citas</h2><p>Consulta, confirma y gestiona todas las reservas del salón en un solo lugar.</p></div><div className="bb-agenda-side"><div className="bb-agenda-capsule" role="list" aria-label="Resumen de agenda"><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">CITAS HOY</span><strong className="bb-agenda-value">12</strong></div><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">ESTA SEMANA</span><strong className="bb-agenda-value">86</strong></div><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">PROYECCIÓN MUESTRA</span><strong className="bb-agenda-value is-accent">$ 1.490.000</strong></div></div></div></section>{creating && <CreateAppointmentModal onClose={cancelCreate} onSave={saveCreated} />}{deletingAppointment && <DeleteAppointmentModal appointment={deletingAppointment} onClose={cancelDelete} onConfirm={confirmDelete} />}<section className="bb-panel bb-table-panel bb-agenda-card"><div className="bb-agenda-controls"><div className="bb-agenda-tabs" role="tablist" aria-label="Filtros rápidos de citas"><button type="button" role="tab" aria-selected={quick === 'todas'} className={quick === 'todas' ? 'is-active' : ''} onClick={() => setQuick('todas')}>Todas <span className="bb-count-beige">{totalCount}</span></button><button type="button" role="tab" aria-selected={quick === 'hoy'} className={quick === 'hoy' ? 'is-active' : ''} onClick={() => setQuick('hoy')}>Hoy {todayCount}</button></div><button type="button" className="bb-hello-primary bb-agenda-new" onClick={() => setCreating(true)}><Plus aria-hidden="true" />Nueva cita</button></div><div className="bb-agenda-searchrow"><label className="bb-agenda-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por cliente, código (ej. BB-1048) o servicio..." aria-label="Buscar citas" /></label><FilterDropdown icon={User} value={specialist} options={specialistOptions} onChange={setSpecialist} label="Filtrar por especialista" /><FilterDropdown icon={CalendarDays} value={day} options={agendaDayOptions} onChange={setDay} label="Filtrar por fecha" /></div><div className="bb-table-scroll"><table className="bb-data-table bb-agenda-table bb-citas-table"><thead><tr><th>CLIENTE</th><th>SERVICIO</th><th>PROFESIONAL</th><th>FECHA Y HORA</th><th className="bb-th-right">ACCIONES</th></tr></thead><tbody>{filtered.map((appointment) => { const isToday = appointment.date.startsWith('Hoy'); const isNext = appointment.id === 'BB-1050'; return <tr key={appointment.id} className={isNext ? 'is-next' : undefined}><td><span className="bb-client-cell"><span className="bb-client-avatar" aria-hidden="true">{appointment.initials}</span><span className="bb-client-text"><strong>{appointment.customer}</strong><small>{appointment.id}</small></span></span></td><td><span className="bb-service-cell"><strong>{appointment.service}</strong><small>{formatCOP(appointment.price)}</small></span></td><td><span className="bb-pro-cell"><User aria-hidden="true" />{appointment.professional}</span></td><td><span className="bb-datetime-cell"><strong>{isToday && <i className="bb-today-dot" aria-hidden="true" />}{appointment.date}</strong><small>{appointment.time}</small></span></td><td className="bb-actions-cell"><span className="bb-ghost-actions"><button type="button" className="bb-ghost-btn bb-ghost-view" aria-label={`Ver detalle de ${appointment.customer}`} onClick={() => onOpen(appointment)}><Eye aria-hidden="true" /></button><button type="button" className="bb-ghost-btn bb-ghost-edit" aria-label={`Editar cita de ${appointment.customer}`} onClick={() => onEditRequest(appointment)}><Pencil aria-hidden="true" /></button><button type="button" className="bb-ghost-btn bb-ghost-delete" aria-label={`Eliminar cita de ${appointment.customer}`} onClick={() => setDeletingId(appointment.id)}><Trash2 aria-hidden="true" /></button></span></td></tr> })}</tbody></table>{filtered.length === 0 && <div className="bb-empty-state"><Search /><strong>No hay citas con estos filtros</strong><span>Prueba con otro especialista, día o término de búsqueda.</span></div>}</div><div className="bb-table-footer bb-agenda-footer"><span>Mostrando {filtered.length} de {appointments.length} citas de muestra</span><div className="bb-pager"><button type="button" className="bb-page-btn">Anterior</button><button type="button" className="bb-page-btn is-current" aria-current="page">1</button><button type="button" className="bb-page-btn">Siguiente</button></div></div></section></div>
}

function ServiceDetailModal({ service, onClose }: { service: ServiceItem; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="bb-service-card" role="dialog" aria-modal="true" aria-labelledby="bb-service-title"><div className="bb-service-cover"><Image src={service.image} alt={`Imagen de ${service.name}`} fill sizes="(max-width: 560px) 100vw, 480px" /><button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">×</button><span className="bb-service-chips"><span className="bb-service-chip">{categoryLabel(service.category)}</span>{!service.active && <span className="bb-service-chip is-off">INACTIVO</span>}</span></div><div className="bb-service-head"><div><h2 id="bb-service-title">{service.name}</h2><p>Servicio disponible en catálogo del salón</p></div><div className="bb-service-rate"><span>TARIFA</span><strong>{formatCOP(service.price)}</strong></div></div><div className="bb-service-desc"><span>DESCRIPCIÓN DEL SERVICIO</span><p>{service.description}</p></div><div className="bb-service-foot"><button type="button" className="bb-button bb-button-outline" onClick={onClose}>Cerrar</button></div></section></div>
}

function DeleteServiceModal({ service, onClose, onConfirm }: { service: ServiceItem; onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="bb-delete-card" role="alertdialog" aria-modal="true" aria-labelledby="bb-delete-service-title" aria-describedby="bb-delete-service-description"><button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">×</button><span className="bb-delete-icon" aria-hidden="true"><Trash2 /></span><h2 id="bb-delete-service-title">¿Eliminar este servicio?</h2><p id="bb-delete-service-description">Estás a punto de eliminar permanentemente este servicio del catálogo. Esta acción no se puede deshacer.</p><div className="bb-delete-summary"><div className="bb-delete-top"><strong>{service.category}</strong><span>{formatCOP(service.price)}</span></div><strong className="bb-delete-name">{service.name}</strong><span className="bb-delete-service">{service.description}</span></div><div className="bb-delete-actions"><button type="button" className="bb-delete-cancel" onClick={onClose}>Cancelar</button><button type="button" className="bb-delete-confirm" onClick={onConfirm}><Trash2 aria-hidden="true" />Sí, eliminar</button></div></section></div>
}

const NEW_SERVICE_CATEGORY = '__nueva__'

function ServiceFormModal({ services, initial, title, eyebrow, onClose, onSave }: { services: typeof demoServices; initial?: ServiceDraft; title: string; eyebrow: string; onClose: () => void; onSave: (draft: ServiceDraft) => void }) {
  const categories = useMemo(() => Array.from(new Set(services.map((service) => service.category))), [services])
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? 'CORTES')
  const [newCategory, setNewCategory] = useState('')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [imageData, setImageData] = useState(initial?.image ?? '')
  const [imageUrl, setImageUrl] = useState('')
  const [urlBroken, setUrlBroken] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const preview = imageData || (!urlBroken && imageUrl.trim())
  const categoryOptions = [...categories.map(categoryLabel), 'Agregar nueva categoría…']
  const categoryValue = category === NEW_SERVICE_CATEGORY ? 'Agregar nueva categoría…' : categoryLabel(category)

  function selectCategory(display: string) {
    if (display === 'Agregar nueva categoría…') {
      setCategory(NEW_SERVICE_CATEGORY)
      return
    }
    const found = categories.find((item) => categoryLabel(item) === display)
    if (found) setCategory(found)
  }

  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageData(String(reader.result ?? ''))
      setImageUrl('')
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const finalCategory = category === NEW_SERVICE_CATEGORY ? newCategory.trim().toUpperCase() : category
    const finalPrice = Number(price)
    if (!name.trim() || !finalCategory || !description.trim()) {
      setError('Completa el nombre, la categoría y la descripción del servicio.')
      return
    }
    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      setError('Ingresa un precio válido en COP.')
      return
    }
    setError('')
    onSave({ name: name.trim(), category: finalCategory, price: Math.round(finalPrice), description: description.trim(), image: preview || '/beauty-service-hair.png' })
  }

  return <div className="bb-book-modal"><Modal title={title} description={eyebrow} onClose={onClose}><form className="bb-form bb-book-form" onSubmit={submit} noValidate><div className="bb-book-grid"><div className="bb-book-col"><div className="bb-field"><div className="bb-field-head"><span>Imagen del servicio</span></div>{preview ? <><span className="bb-service-preview"><Image src={preview} alt={`Imagen de ${name || 'nuevo servicio'}`} onError={() => { if (!imageData) { setUrlBroken(true); setImageUrl('') } }} fill sizes="480px" unoptimized /></span><div className="bb-upload-row"><button type="button" className="bb-button bb-button-outline" onClick={() => fileInputRef.current?.click()}>Cambiar</button><button type="button" className="bb-button bb-button-outline" onClick={() => { setImageData(''); setImageUrl('') }}>Quitar</button><input ref={fileInputRef} type="file" accept="image/*" onChange={pickImage} /></div></> : <label className="bb-upload-box"><input type="file" accept="image/*" onChange={pickImage} /><ImagePlus aria-hidden="true" /><strong>Agregar imagen</strong><small>Desde tu computador o dispositivo</small></label>}<input value={imageUrl} onChange={(event) => { setImageUrl(event.target.value); setUrlBroken(false) }} placeholder="O pega URL de imagen..." autoComplete="off" /></div></div><div className="bb-book-col"><div className="bb-field"><div className="bb-field-head"><span>Nombre del servicio *</span></div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Corte bordado & hidratación" autoComplete="off" /></div><div className="bb-field"><div className="bb-field-head"><span>Categoría *</span></div><FilterDropdown icon={Sparkles} value={categoryValue} options={categoryOptions} onChange={selectCategory} label="Categoría" />{category === NEW_SERVICE_CATEGORY && <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Ej. Depilación" autoComplete="off" />}</div><div className="bb-field"><div className="bb-field-head"><span>Precio (COP) *</span></div><input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="95000" inputMode="numeric" autoComplete="off" /></div></div></div><div className="bb-field"><div className="bb-field-head"><span>Descripción *</span></div><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe en qué consiste el servicio, beneficios o qué incluye..." rows={3} /></div>{error && <p className="bb-form-error" role="alert">{error}</p>}<div className="bb-book-actions"><button type="button" className="bb-button bb-button-outline" onClick={onClose}>Cancelar</button><button type="submit" className="bb-button bb-button-primary"><Check aria-hidden="true" />Guardar servicio</button></div></form></Modal></div>
}

function ServicesView({ services, onAdd, onEdit, onDelete, notify }: { services: typeof demoServices; onAdd: () => void; onEdit: (service: ServiceItem) => void; onDelete: (id: string) => void; notify: (message: string) => void }) {
  const catalogTotal = services.length
  const catalogCategories = new Set(services.map((service) => service.category)).size
  const catalogAverage = catalogTotal ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / catalogTotal) : 0
  const [serviceQuery, setServiceQuery] = useState('')
  const [serviceCategory, setServiceCategory] = useState('Todas')
  const [serviceDetail, setServiceDetail] = useState<ServiceItem | null>(null)
  const [serviceDeleting, setServiceDeleting] = useState<ServiceItem | null>(null)
  const serviceCategories = useMemo(() => Array.from(new Set(services.map((service) => service.category))), [services])
  const filteredServices = useMemo(() => services.filter((service) => {
    const matchesText = `${service.name} ${service.description}`.toLowerCase().includes(serviceQuery.toLowerCase())
    return matchesText && (serviceCategory === 'Todas' || service.category === serviceCategory)
  }), [services, serviceQuery, serviceCategory])

  function confirmServiceDelete() {
    if (!serviceDeleting) return
    onDelete(serviceDeleting.id)
    setServiceDeleting(null)
    notify('Servicio eliminado correctamente.')
  }

  function cancelServiceDelete() {
    setServiceDeleting(null)
    notify('Se canceló la eliminación del servicio.')
  }
  return <div className="bb-page-stack"><section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-services-title"><div className="bb-hello-mark" aria-hidden="true">b</div><div className="bb-hello-copy"><span className="bb-hello-eyebrow"><span>GESTIÓN DE CATÁLOGO</span><i className="bb-hello-dot" aria-hidden="true" /><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span></span><span>CATÁLOGO ACTIVO · SALÓN</span></span><h2 id="bb-services-title">Catálogo de servicios</h2><p>Administra los servicios, categorías, tarifas e imágenes del salón.</p></div><div className="bb-agenda-side"><div className="bb-agenda-capsule" role="list" aria-label="Resumen del catálogo"><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">EN CATÁLOGO</span><strong className="bb-agenda-value">{catalogTotal}</strong></div><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">CATEGORÍAS</span><strong className="bb-agenda-value">{catalogCategories}</strong></div><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">TICKET PROMEDIO</span><strong className="bb-agenda-value is-accent">{formatCOP(catalogAverage)}</strong></div></div></div></section><section className="bb-panel bb-table-panel bb-agenda-card"><div className="bb-agenda-controls"><div className="bb-agenda-tabs" role="tablist" aria-label="Filtrar servicios por categoría"><button type="button" role="tab" aria-selected={serviceCategory === 'Todas'} className={serviceCategory === 'Todas' ? 'is-active' : ''} onClick={() => setServiceCategory('Todas')}>Todos <span className="bb-count-beige">{services.length}</span></button>{serviceCategories.map((item) => <button key={item} type="button" role="tab" aria-selected={serviceCategory === item} className={serviceCategory === item ? 'is-active' : ''} onClick={() => setServiceCategory(item)}>{categoryLabel(item)}</button>)}</div><button type="button" className="bb-hello-primary bb-agenda-new" onClick={onAdd}><Plus aria-hidden="true" />Añadir servicio</button></div><div className="bb-agenda-searchrow"><label className="bb-agenda-search"><Search aria-hidden="true" /><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder="Buscar servicio por nombre o descripción..." aria-label="Buscar servicios" /></label></div><div className="bb-table-scroll"><table className="bb-data-table bb-agenda-table bb-service-table"><thead><tr><th>SERVICIO</th><th>CATEGORÍA</th><th>PRECIO</th><th className="bb-th-right">ACCIONES</th></tr></thead><tbody>{filteredServices.map((service) => <tr key={service.id}><td><span className="bb-service-main"><span className="bb-service-thumb"><Image src={service.image} alt={`Imagen de ${service.name}`} fill sizes="96px" /></span><span className="bb-service-text"><strong>{service.name}</strong><small>{service.description}</small></span></span></td><td><span className="bb-category-chip">{service.category}</span></td><td><strong className="bb-service-price">{formatCOP(service.price)}</strong></td><td className="bb-actions-cell"><span className="bb-ghost-actions"><button type="button" className="bb-ghost-btn bb-ghost-view" aria-label={`Ver ${service.name}`} onClick={() => setServiceDetail(service)}><Eye aria-hidden="true" /></button><button type="button" className="bb-ghost-btn bb-ghost-edit" aria-label={`Editar ${service.name}`} onClick={() => onEdit(service)}><Pencil aria-hidden="true" /></button><button type="button" className="bb-ghost-btn bb-ghost-delete" aria-label={`Eliminar ${service.name}`} onClick={() => setServiceDeleting(service)}><Trash2 aria-hidden="true" /></button></span></td></tr>)}</tbody></table>{filteredServices.length === 0 && <div className="bb-empty-state"><Search aria-hidden="true" /><strong>No hay servicios con estos filtros</strong><span>Prueba con otra categoría o término de búsqueda.</span></div>}</div><div className="bb-table-footer bb-agenda-footer"><span>Mostrando {filteredServices.length} de {services.length} servicios</span><div className="bb-pager"><button type="button" className="bb-page-btn">Anterior</button><button type="button" className="bb-page-btn is-current" aria-current="page">1</button><button type="button" className="bb-page-btn">Siguiente</button></div></div></section>{serviceDetail && <ServiceDetailModal service={serviceDetail} onClose={() => setServiceDetail(null)} />}{serviceDeleting && <DeleteServiceModal service={serviceDeleting} onClose={cancelServiceDelete} onConfirm={confirmServiceDelete} />}</div>
}

function ProfessionalDetailModal({ professional, categories, appointments, onClose }: { professional: ProfessionalItem; categories: string[]; appointments: DemoAppointment[]; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const todayAppointments = appointments.filter((appointment) => appointment.professional === professional.name && appointment.date.startsWith('Hoy'))
  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="bb-service-card" role="dialog" aria-modal="true" aria-labelledby="bb-pro-title"><div className="bb-detail-head"><button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">×</button><span className="bb-detail-eyebrow">{professional.specialty.toUpperCase()}</span><div className="bb-detail-person">{professional.image ? <span className="bb-detail-photo" aria-hidden="true"><Image src={professional.image} alt="" fill sizes="112px" /></span> : <span className="bb-detail-avatar" aria-hidden="true">{professional.initials}</span>}<div className="bb-detail-identity"><div className="bb-service-titlerow"><h2 id="bb-pro-title">{professional.name}</h2><StatusBadge status={professional.active ? 'Activo' : 'Inactivo'} /></div><span className="bb-detail-role">{professional.specialty}</span>{professional.email && <span className="bb-detail-contact">{professional.email}</span>}</div></div></div><div className="bb-detail-body">{professional.bio && <div className="bb-service-desc"><span>PERFIL PROFESIONAL</span><p>{professional.bio}</p></div>}<div className="bb-detail-grid"><div className="bb-detail-item"><span><Clock3 aria-hidden="true" />HORARIO HABITUAL</span><strong>{professional.schedule}</strong></div><div className="bb-detail-item"><span><Sparkles aria-hidden="true" />SERVICIOS ASIGNADOS</span><span className="bb-team-tags">{categories.length ? categories.map((item) => <span key={item} className="bb-category-chip">{categoryLabel(item)}</span>) : <span className="bb-team-none">Sin categorías asignadas</span>}</span></div></div><div className="bb-agenda-today"><div className="bb-agenda-today-head"><span><CalendarDays aria-hidden="true" />AGENDA DE HOY</span><span>{professional.appointments} citas esta semana</span></div>{todayAppointments.length ? todayAppointments.map((appointment) => <div className="bb-agenda-today-row" key={appointment.id}><strong>{appointment.time}</strong><span>{appointment.customer}</span><small>{appointment.service}</small></div>) : <div className="bb-agenda-today-row"><span>Sin citas para hoy</span></div>}</div></div><div className="bb-service-foot"><button type="button" className="bb-button bb-button-outline" onClick={onClose}>Cerrar</button></div></section></div>
}

function parseSchedule(value: string) {
  const [daysPart = '', timesPart = ''] = value.split('·').map((part) => part.trim())
  const shorts = daysPart.split(',').map((part) => part.trim()).filter(Boolean)
  let days: string[]
  if (shorts.length > 1 || !(shorts[0] ?? '').includes('–')) {
    days = weekDayOptions.filter((option) => shorts.includes(option.short)).map((option) => option.value)
  } else {
    const [from = '', to = ''] = shorts[0].split('–').map((part) => part.trim())
    const order = weekDayOptions.map((option) => option.short)
    const startIndex = order.indexOf(from)
    const endIndex = order.indexOf(to)
    const inRange = startIndex === -1 || endIndex === -1 ? order : startIndex <= endIndex ? order.slice(startIndex, endIndex + 1) : [...order.slice(startIndex), ...order.slice(0, endIndex + 1)]
    days = weekDayOptions.filter((option) => inRange.includes(option.short)).map((option) => option.value)
  }
  const [start = '', end = ''] = timesPart.split('–').map((part) => part.trim())
  return { days: days.length ? days : weekDayOptions.map((option) => option.value), start, end }
}

function EditProfessionalModal({ initial, onClose, onSave }: { initial: ProfessionalItem; onClose: () => void; onSave: (draft: ProfessionalForm & { specialty: string }) => void }) {
  const parsed = useMemo(() => parseSchedule(initial.schedule), [initial.schedule])
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [password, setPassword] = useState(initial.password ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [schedDays, setSchedDays] = useState<string[]>(parsed.days)
  const [schedStart, setSchedStart] = useState(parsed.start)
  const [schedEnd, setSchedEnd] = useState(parsed.end)
  const [enabledCategories, setEnabledCategories] = useState<string[]>(initial.categories ?? [])
  const [imageData, setImageData] = useState(initial.image ?? '')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const availableCategories = useMemo(() => Array.from(new Set(demoServices.map((service) => service.category))), [])
  const preview = imageData

  function toggleCategory(value: string) {
    setEnabledCategories((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageData(String(reader.result ?? ''))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Completa el nombre y el número de contacto.')
      return
    }
    if (!isValidEmail(email.trim()) || !password) {
      setError('Completa un correo válido y la contraseña de acceso.')
      return
    }
    if (!schedDays.length || !schedStart || !schedEnd) {
      setError('Selecciona los días y el rango de horas del horario laboral.')
      return
    }
    if (isInvalidTimeRange(schedStart, schedEnd)) {
      setError('La hora de salida debe ser posterior a la hora de entrada.')
      return
    }
    if (!bio.trim()) {
      setError('Completa la descripción del perfil.')
      return
    }
    if (!enabledCategories.length) {
      setError('Habilita al menos un servicio para el profesional.')
      return
    }
    const daysShort = weekDayOptions.filter((option) => schedDays.includes(option.value)).map((option) => option.short).join(', ')
    const labels = enabledCategories.map(categoryLabel)
    setError('')
    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim(), password, bio: bio.trim(), schedule: `${daysShort} · ${schedStart}–${schedEnd}`, categories: enabledCategories, image: preview || '/beauty-service-hair.png', specialty: labels.slice(0, 2).join(' & ') || 'General' })
  }

  return <div className="bb-book-modal"><Modal title="Editar profesional" description="EDITAR EQUIPO" onClose={onClose}><form className="bb-form bb-book-form" onSubmit={submit} noValidate><div className="bb-book-grid"><div className="bb-book-col"><div className="bb-field"><div className="bb-field-head"><span>Foto de perfil</span></div>{preview ? <><span className="bb-photo-circle"><Image src={preview} alt={`Foto de ${name || 'profesional'}`} fill sizes="240px" unoptimized /></span><div className="bb-upload-row"><button type="button" className="bb-button bb-button-outline" onClick={() => fileRef.current?.click()}>Cambiar</button><button type="button" className="bb-button bb-button-outline" onClick={() => setImageData('')}>Quitar</button><input ref={fileRef} type="file" accept="image/*" onChange={pickImage} /></div></> : <label className="bb-upload-box"><input type="file" accept="image/*" onChange={pickImage} /><ImagePlus aria-hidden="true" /><strong>Agregar foto</strong><small>Desde tu computador o dispositivo</small></label>}<span className="bb-photo-hint">Visible para clientas al agendar</span></div><div className="bb-field"><div className="bb-field-head"><span>Descripción del perfil *</span></div><textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Experiencia, estilo y especialidades del profesional..." rows={3} /></div></div><div className="bb-book-col"><div className="bb-form-row"><div className="bb-field"><div className="bb-field-head"><span>Nombre completo *</span></div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Camila Duarte" autoComplete="off" /></div><div className="bb-field"><div className="bb-field-head"><span>Número de contacto *</span></div><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="300 123 4567" autoComplete="off" /></div></div><div className="bb-form-row"><div className="bb-field"><div className="bb-field-head"><span>Correo de acceso *</span></div><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="camila@beautymc.co" autoComplete="off" /></div><div className="bb-field"><div className="bb-field-head"><span>Contraseña *</span></div><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" /></div></div><div className="bb-field"><div className="bb-field-head"><span>Horario laboral *</span></div><MultiDayPicker selected={schedDays} onChange={setSchedDays} label="Días laborables" /><div className="bb-form-row bb-schedule-row"><TimePicker value={schedStart} onChange={setSchedStart} label="Hora de entrada" placeholder="Entrada" /><TimePicker value={schedEnd} onChange={setSchedEnd} label="Hora de salida" placeholder="Salida" align="right" /></div></div></div></div><div className="bb-field"><div className="bb-field-head"><span>Servicios habilitados</span></div><div className="bb-enable-chips" role="group" aria-label="Servicios habilitados">{availableCategories.map((item) => <button key={item} type="button" aria-pressed={enabledCategories.includes(item)} className={enabledCategories.includes(item) ? 'is-on' : ''} onClick={() => toggleCategory(item)}>{categoryLabel(item)}</button>)}</div></div>{error && <p className="bb-form-error" role="alert">{error}</p>}<div className="bb-book-actions"><button type="button" className="bb-button bb-button-outline" onClick={onClose}>Cancelar</button><button type="submit" className="bb-button bb-button-primary"><Check aria-hidden="true" />Guardar cambios</button></div></form></Modal></div>
}

function DeleteProfessionalModal({ professional, onClose, onConfirm }: { professional: ProfessionalItem; onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="bb-delete-card" role="alertdialog" aria-modal="true" aria-labelledby="bb-delete-pro-title" aria-describedby="bb-delete-pro-description"><button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">×</button><span className="bb-delete-icon" aria-hidden="true"><Trash2 /></span><h2 id="bb-delete-pro-title">¿Eliminar este profesional?</h2><p id="bb-delete-pro-description">Estás a punto de eliminar permanentemente este perfil del equipo. Esta acción no se puede deshacer.</p><div className="bb-delete-summary"><div className="bb-delete-top"><strong>{professional.specialty.toUpperCase()}</strong><span>{professional.schedule}</span></div><strong className="bb-delete-name">{professional.name}</strong><span className="bb-delete-service">{professional.appointments} citas esta semana</span></div><div className="bb-delete-actions"><button type="button" className="bb-delete-cancel" onClick={onClose}>Cancelar</button><button type="button" className="bb-delete-confirm" onClick={onConfirm}><Trash2 aria-hidden="true" />Sí, eliminar</button></div></section></div>
}

const weekDayOptions = [
  { value: 'Lunes', short: 'Lun' },
  { value: 'Martes', short: 'Mar' },
  { value: 'Miércoles', short: 'Mié' },
  { value: 'Jueves', short: 'Jue' },
  { value: 'Viernes', short: 'Vie' },
  { value: 'Sábado', short: 'Sáb' },
]

// Minutos desde las 00:00. Acepta "HH:MM" (24 horas, como los horarios de demostración) y
// "hh:mm a.m./p.m." (el formato que entrega TimePicker). Devuelve null si no reconoce la hora.
function timeToMinutes(value: string): number | null {
  const display = parseDisplayTime(value)
  if (display) return ((Number(display.hour) % 12) + (display.period === 'p.m.' ? 12 : 0)) * 60 + Number(display.minute)
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

// La salida debe ser posterior a la entrada. Si alguna hora no se reconoce no se bloquea el guardado.
function isInvalidTimeRange(start: string, end: string) {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  return startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes
}

function MultiDayPicker({ selected, onChange, label }: { selected: string[]; onChange: (days: string[]) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((day) => day !== value) : [...selected, value])
  }

  const display = weekDayOptions.filter((option) => selected.includes(option.value)).map((option) => option.short).join(', ') || 'Seleccionar días'
  return <div className="bb-dropdown" ref={ref}><button type="button" className="bb-dropdown-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((current) => !current)}><CalendarDays aria-hidden="true" /><span>{display}</span><ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} /></button>{open && <ul className="bb-dropdown-list" role="listbox" aria-label={label} aria-multiselectable="true">{weekDayOptions.map((option) => {
    const checked = selected.includes(option.value)
    return <li key={option.value} role="option" aria-selected={checked}><button type="button" className={checked ? 'is-selected' : ''} onClick={() => toggle(option.value)}><span>{option.value}</span><span className="bb-check" aria-hidden="true">{checked && <Check />}</span></button></li>
  })}</ul>}</div>
}

function AddProfessionalModal({ onClose, onSave }: { onClose: () => void; onSave: (draft: ProfessionalForm) => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [schedDays, setSchedDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'])
  const [schedStart, setSchedStart] = useState('')
  const [schedEnd, setSchedEnd] = useState('')
  const [imageData, setImageData] = useState('')
  const [enabledCategories, setEnabledCategories] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const availableCategories = useMemo(() => Array.from(new Set(demoServices.map((service) => service.category))), [])

  function toggleCategory(value: string) {
    setEnabledCategories((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageData(String(reader.result ?? ''))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Completa el nombre y el número de contacto.')
      return
    }
    if (!isValidEmail(email.trim()) || !password) {
      setError('Completa un correo válido y la contraseña de acceso.')
      return
    }
    if (!schedDays.length || !schedStart || !schedEnd) {
      setError('Selecciona los días y el rango de horas del horario laboral.')
      return
    }
    if (isInvalidTimeRange(schedStart, schedEnd)) {
      setError('La hora de salida debe ser posterior a la hora de entrada.')
      return
    }
    if (!bio.trim()) {
      setError('Completa la descripción del perfil.')
      return
    }
    if (!enabledCategories.length) {
      setError('Habilita al menos un servicio para el profesional.')
      return
    }
    const daysShort = weekDayOptions.filter((option) => schedDays.includes(option.value)).map((option) => option.short).join(', ')
    setError('')
    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim(), password, bio: bio.trim(), schedule: `${daysShort} · ${schedStart}–${schedEnd}`, categories: enabledCategories, image: imageData })
  }

  return <div className="bb-book-modal"><Modal title="Añadir profesional al equipo" description="NUEVO INTEGRANTE" onClose={onClose}><form className="bb-form bb-book-form" onSubmit={submit} noValidate><div className="bb-book-grid"><div className="bb-book-col"><div className="bb-field bb-photo-field"><div className="bb-field-head"><span>Foto de perfil</span></div>{imageData ? <><span className="bb-photo-circle"><Image src={imageData} alt={`Foto de ${name || 'nuevo profesional'}`} fill sizes="240px" unoptimized /></span><div className="bb-upload-row"><button type="button" className="bb-button bb-button-outline" onClick={() => fileRef.current?.click()}>Cambiar</button><button type="button" className="bb-button bb-button-outline" onClick={() => setImageData('')}>Quitar</button><input ref={fileRef} type="file" accept="image/*" onChange={pickImage} /></div></> : <label className="bb-upload-box"><input type="file" accept="image/*" onChange={pickImage} /><ImagePlus aria-hidden="true" /><strong>Agregar foto</strong><small>Desde tu computador o dispositivo</small></label>}<span className="bb-photo-hint">Visible para clientas al agendar</span></div><div className="bb-field"><div className="bb-field-head"><span>Descripción del perfil *</span></div><textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Experiencia, estilo y especialidades del profesional..." rows={3} /></div></div><div className="bb-book-col"><div className="bb-form-row"><div className="bb-field"><div className="bb-field-head"><span>Nombre completo *</span></div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Camila Duarte" autoComplete="off" /></div><div className="bb-field"><div className="bb-field-head"><span>Número de contacto *</span></div><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="300 123 4567" autoComplete="off" /></div></div><div className="bb-form-row"><div className="bb-field"><div className="bb-field-head"><span>Correo de acceso *</span></div><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="camila@beautymc.co" autoComplete="off" /></div><div className="bb-field"><div className="bb-field-head"><span>Contraseña *</span></div><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="new-password" /></div></div><div className="bb-field"><div className="bb-field-head"><span>Horario laboral *</span></div><MultiDayPicker selected={schedDays} onChange={setSchedDays} label="Días laborables" /><div className="bb-form-row bb-schedule-row"><TimePicker value={schedStart} onChange={setSchedStart} label="Hora de entrada" placeholder="Entrada" /><TimePicker value={schedEnd} onChange={setSchedEnd} label="Hora de salida" placeholder="Salida" align="right" /></div></div></div></div><div className="bb-field"><div className="bb-field-head"><span>Servicios habilitados</span></div><div className="bb-enable-chips" role="group" aria-label="Servicios habilitados">{availableCategories.map((item) => <button key={item} type="button" aria-pressed={enabledCategories.includes(item)} className={enabledCategories.includes(item) ? 'is-on' : ''} onClick={() => toggleCategory(item)}>{categoryLabel(item)}</button>)}</div></div>{error && <p className="bb-form-error" role="alert">{error}</p>}<div className="bb-book-actions"><button type="button" className="bb-button bb-button-outline" onClick={onClose}>Cancelar</button><button type="submit" className="bb-button bb-button-primary"><Plus aria-hidden="true" />Añadir profesional</button></div></form></Modal></div>
}

function ProfessionalsView({ professionals, appointments, onToggle, onAdd, onEdit, onDelete, notify }: { professionals: typeof demoProfessionals; appointments: DemoAppointment[]; onToggle: (id: string) => void; onAdd: (draft: ProfessionalForm & { specialty: string }) => void; onEdit: (id: string, draft: ProfessionalForm & { specialty: string }) => void; onDelete: (id: string) => void; notify: (message: string) => void }) {
  const activeProfessionals = professionals.filter((person) => person.active).length
  const weekAppointments = professionals.reduce((sum, person) => sum + (person.appointments ?? 0), 0)
  const [teamQuery, setTeamQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [teamDetail, setTeamDetail] = useState<ProfessionalItem | null>(null)
  const [teamEditing, setTeamEditing] = useState<ProfessionalItem | null>(null)
  const [teamDeleting, setTeamDeleting] = useState<ProfessionalItem | null>(null)
  const [addingProfessional, setAddingProfessional] = useState(false)
  const categoryFilters = useMemo(() => Array.from(new Set(demoServices.map((service) => service.category))).map((value) => ({ value, label: categoryLabel(value), count: professionals.filter((person) => demoServices.some((service) => service.category === value && serviceProfessionals[service.id]?.includes(person.id))).length })), [professionals])
  const visibleIds = useMemo(() => new Set(professionals.filter((person) => demoServices.some((service) => service.category === categoryFilter && serviceProfessionals[service.id]?.includes(person.id))).map((person) => person.id)), [professionals, categoryFilter])
  const filteredTeam = useMemo(() => professionals.filter((person) => `${person.name} ${person.specialty}`.toLowerCase().includes(teamQuery.toLowerCase()) && (categoryFilter === 'Todas' || visibleIds.has(person.id))), [professionals, teamQuery, categoryFilter, visibleIds])

  function categoriesOf(person: ProfessionalItem) {
    if (person.categories?.length) return person.categories
    const found = new Set<string>()
    demoServices.forEach((service) => {
      if (serviceProfessionals[service.id]?.includes(person.id)) found.add(service.category)
    })
    return Array.from(found)
  }

  function saveProfessionalEdit(id: string, draft: ProfessionalForm & { specialty: string }) {
    onEdit(id, draft)
    setTeamEditing(null)
    notify('Profesional actualizado.')
  }

  function cancelProfessionalEdit() {
    setTeamEditing(null)
    notify('Se canceló la edición del profesional.')
  }

  function confirmProfessionalDelete() {
    if (!teamDeleting) return
    onDelete(teamDeleting.id)
    setTeamDeleting(null)
    notify('Profesional eliminado correctamente.')
  }

  function cancelProfessionalDelete() {
    setTeamDeleting(null)
    notify('Se canceló la eliminación del profesional.')
  }

  function saveProfessional(draft: ProfessionalForm) {
    const labels = draft.categories.map(categoryLabel)
    onAdd({ ...draft, specialty: labels.slice(0, 2).join(' & ') || 'General' })
    setAddingProfessional(false)
    notify('Profesional añadido al equipo.')
  }

  function cancelProfessionalCreate() {
    setAddingProfessional(false)
    notify('Se canceló la creación del profesional.')
  }
  return <div className="bb-page-stack"><section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-team-title"><div className="bb-hello-mark" aria-hidden="true">b</div><div className="bb-hello-copy"><span className="bb-hello-eyebrow"><span>EQUIPO DEL SALÓN</span><i className="bb-hello-dot" aria-hidden="true" /><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span></span><span>{activeProfessionals} ESPECIALISTAS ACTIVOS</span></span><h2 id="bb-team-title">Profesionales</h2><p>Gestiona los perfiles, horarios, especialidades y visibilidad de tu equipo en el salón.</p></div><div className="bb-agenda-side"><div className="bb-agenda-capsule" role="list" aria-label="Resumen del equipo"><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">ACTIVOS</span><strong className="bb-agenda-value">{activeProfessionals}</strong></div><div className="bb-agenda-metric" role="listitem"><span className="bb-agenda-label">CITAS SEMANA</span><strong className="bb-agenda-value">{weekAppointments}</strong></div></div></div></section><section className="bb-panel bb-table-panel bb-agenda-card bb-team-filter-card"><div className="bb-agenda-controls bb-team-filter"><div className="bb-agenda-tabs" role="tablist" aria-label="Filtrar por categoría"><button type="button" role="tab" aria-selected={categoryFilter === 'Todas'} className={categoryFilter === 'Todas' ? 'is-active' : ''} onClick={() => setCategoryFilter('Todas')}>Todos <span className="bb-count-beige">{professionals.length}</span></button>{categoryFilters.map((item) => <button key={item.value} type="button" role="tab" aria-selected={categoryFilter === item.value} className={categoryFilter === item.value ? 'is-active' : ''} onClick={() => setCategoryFilter(item.value)}>{item.label} {item.count}</button>)}</div><div className="bb-team-actions"><label className="bb-agenda-search bb-team-search"><Search aria-hidden="true" /><input value={teamQuery} onChange={(event) => setTeamQuery(event.target.value)} placeholder="Buscar especialista o especialidad..." aria-label="Buscar especialista" /></label><button type="button" className="bb-hello-primary bb-agenda-new" onClick={() => setAddingProfessional(true)}><Plus aria-hidden="true" />Añadir profesional</button></div></div></section><div className="bb-team-grid">{filteredTeam.map((person) => <article className="bb-team-card" key={person.id}><div className="bb-team-top"><span className="bb-team-avatar" aria-hidden="true">{person.image ? <Image src={person.image} alt="" fill sizes="104px" /> : <span className="bb-team-initials">{person.initials}</span>}{person.active && <i className="bb-team-dot" />}</span><span className="bb-team-identity"><strong>{person.name}</strong><span className="bb-team-tags">{categoriesOf(person).map((item) => <span key={item} className="bb-category-chip">{categoryLabel(item)}</span>)}</span></span><span className="bb-team-side"><StatusBadge status={person.active ? 'Activo' : 'Inactivo'} /><span className="bb-ghost-actions"><button type="button" className="bb-ghost-btn bb-ghost-view" aria-label={`Ver perfil de ${person.name}`} onClick={() => setTeamDetail(person)}><Eye aria-hidden="true" /></button><button type="button" className="bb-ghost-btn bb-ghost-edit" aria-label={`Editar perfil de ${person.name}`} onClick={() => setTeamEditing(person)}><Pencil aria-hidden="true" /></button><button type="button" className="bb-ghost-btn bb-ghost-delete" aria-label={`Eliminar perfil de ${person.name}`} onClick={() => setTeamDeleting(person)}><Trash2 aria-hidden="true" /></button></span></span></div><div className="bb-team-boxes"><div className="bb-team-box"><span><Clock3 aria-hidden="true" />HORARIO</span><strong>{person.schedule}</strong></div><div className="bb-team-box"><span><CalendarDays aria-hidden="true" />ESTA SEMANA</span><strong>{person.appointments} citas programadas</strong></div></div><div className="bb-team-foot"><span className="bb-team-visibility"><span>Perfil visible en reservas</span><button className={`bb-switch ${person.active ? 'is-on' : ''}`} role="switch" aria-checked={person.active} aria-label={`${person.active ? 'Desactivar' : 'Activar'} perfil de ${person.name}`} onClick={() => onToggle(person.id)}><i /></button></span></div></article>)}{filteredTeam.length === 0 && <div className="bb-panel bb-table-panel bb-agenda-card"><div className="bb-empty-state"><Search aria-hidden="true" /><strong>No hay especialistas con estos filtros</strong><span>Prueba con otra especialidad o término de búsqueda.</span></div></div>}</div>{teamDetail && <ProfessionalDetailModal professional={teamDetail} categories={categoriesOf(teamDetail)} appointments={appointments} onClose={() => setTeamDetail(null)} />}{teamEditing && <EditProfessionalModal key={teamEditing.id} initial={teamEditing} onClose={cancelProfessionalEdit} onSave={(draft) => saveProfessionalEdit(teamEditing.id, draft)} />}{teamDeleting && <DeleteProfessionalModal professional={teamDeleting} onClose={cancelProfessionalDelete} onConfirm={confirmProfessionalDelete} />}{addingProfessional && <AddProfessionalModal onClose={cancelProfessionalCreate} onSave={saveProfessional} />}</div>
}

function AppointmentModal({ appointment, onClose, notify }: { appointment: DemoAppointment; onClose: () => void; notify: (message: string) => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const whatsappDigits = appointment.phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola ${appointment.customer}, te recordamos tu cita en BeautyMC: ${appointment.service} el ${appointment.date} a las ${appointment.time}. ¡Te esperamos!`)}`
  return <div className="bb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="bb-detail-card" role="dialog" aria-modal="true" aria-labelledby="bb-detail-title"><div className="bb-detail-head"><button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar detalle">×</button><span className="bb-detail-eyebrow">DETALLE DE RESERVA · {appointment.id}</span><div className="bb-detail-person"><span className="bb-detail-avatar" aria-hidden="true">{appointment.initials}</span><div className="bb-detail-identity"><h2 id="bb-detail-title">{appointment.customer}</h2><span className="bb-detail-contact">{appointment.phone} · {appointment.email}</span></div></div></div><div className="bb-detail-body"><div className="bb-detail-service"><div><span>SERVICIO RESERVADO</span><strong>{appointment.service}</strong></div><div className="bb-detail-price"><span>VALOR</span><strong>{formatCOP(appointment.price)}</strong></div></div><div className="bb-detail-grid"><div className="bb-detail-item"><span><CalendarDays aria-hidden="true" />FECHA</span><strong>{appointment.date}</strong></div><div className="bb-detail-item"><span><Clock3 aria-hidden="true" />HORA</span><strong>{formatHour12(appointment.time)}</strong></div><div className="bb-detail-item"><span><User aria-hidden="true" />PROFESIONAL</span><strong>{appointment.professional}</strong></div><div className="bb-detail-item"><span><Ticket aria-hidden="true" />CÓDIGO</span><strong>{appointment.id}</strong></div></div></div><div className="bb-detail-foot">{whatsappDigits ? <a className="bb-detail-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Recordar por WhatsApp</a> : <button type="button" className="bb-detail-whatsapp" onClick={() => notify('Esta cita no tiene un teléfono válido.')}><MessageCircle aria-hidden="true" />Recordar por WhatsApp</button>}</div></section></div>
}

