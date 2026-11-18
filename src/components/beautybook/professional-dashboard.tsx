'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Eye,
  Heart,
  LayoutDashboard,
  List,
  Search,
  UserRound,
} from 'lucide-react'
import { demoAppointments, demoCustomers, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { Avatar, FilterDropdown } from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'
import { DashboardShell, type DashboardNavItem } from '@/components/beautybook/dashboard-shell'
import { ProfessionalAppointmentModal } from '@/components/beautybook/professional/appointment-modal'
import { MyCalendar } from '@/components/beautybook/professional/calendar-view'
import { MyProfile } from '@/components/beautybook/professional/profile-view'
import { PROFESSIONAL_NAME } from '@/components/beautybook/professional/professional-shared'

const navItems: DashboardNavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'mis-citas', label: 'Mis citas', icon: List },
  { id: 'calendario', label: 'Mi calendario', icon: CalendarDays },
  { id: 'perfil', label: 'Mi perfil', icon: UserRound },
]

/* Muestra: insignia VIP y rango de fechas de la vista de inicio (sin backend). */
function isVipCustomer(name: string) {
  return demoCustomers.some((customer) => customer.name === name && customer.vip)
}

const WEEKDAY_SHORT: Record<string, string> = {
  lun: 'LUN',
  mar: 'MAR',
  'mié': 'MIÉ',
  mie: 'MIÉ',
  jue: 'JUE',
  vie: 'VIE',
  'sáb': 'SÁB',
  sab: 'SÁB',
  dom: 'DOM',
}

function splitDemoDate(date: string) {
  const [week = '', rest = ''] = date.split(',')
  const dayMonth = (rest || week).match(/(\d{1,2})\s*([A-Za-zñÑ]+)/)
  return {
    weekday: WEEKDAY_SHORT[week.trim().toLowerCase()] ?? week.trim().toUpperCase(),
    day: dayMonth?.[1] ?? '',
    month: (dayMonth?.[2] ?? '').replace('.', '').toUpperCase(),
  }
}

function upcomingRangeLabel(list: DemoAppointment[]) {
  if (list.length === 0) return ''
  const first = splitDemoDate(list[0].date)
  if (list.length === 1) return `${first.weekday} ${first.day} ${first.month}`.trim()
  const last = splitDemoDate(list[list.length - 1].date)
  return `${first.weekday} ${first.day} – ${last.weekday} ${last.day} ${last.month}`.trim()
}

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
    >
      {view === 'inicio' && (
        <ProfessionalHome appointments={myAppointments} onOpen={setSelectedAppointment} onNavigate={setView} />
      )}
      {view === 'mis-citas' && (
        <MyAppointments appointments={myAppointments} onOpen={setSelectedAppointment} />
      )}
      {view === 'calendario' && <MyCalendar appointments={myAppointments} onOpen={setSelectedAppointment} />}
      {view === 'perfil' && <MyProfile notify={notify} />}
      {selectedAppointment && (
        <ProfessionalAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
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

function ProfessionalHome({
  appointments,
  onOpen,
  onNavigate,
}: {
  appointments: DemoAppointment[]
  onOpen: (appointment: DemoAppointment) => void
  onNavigate: (id: string) => void
}) {
  const today = appointments.filter((appointment) => appointment.date.startsWith('Hoy'))
  const upcoming = appointments.filter(
    (appointment) => !appointment.date.startsWith('Hoy') && appointment.status !== 'Completada',
  )
  const next = today.find((appointment) => appointment.status !== 'Completada') ?? appointments[0]
  const nextTodayId = today.find((appointment) => appointment.status !== 'Completada')?.id
  const upcomingToday = today.filter((appointment) => appointment.status !== 'Completada').length
  const preview = upcoming.slice(0, 2)

  return (
    <div className="bb-page-stack">
      <section className="bb-welcome-card bb-welcome-pro">
        <div className="bb-welcome-text">
          <div className="bb-welcome-eyebrow-row">
            <span className="bb-eyebrow">TU SÁBADO EN BEAUTYMC</span>
            <span className="bb-dot-sep" aria-hidden="true" />
            <span className="bb-shift-badge">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]" />
              </span>
              EN TURNO HOY
            </span>
          </div>
          <h2>
            Hola, Laura <span>✳</span>
          </h2>
          <p>Un día para crear momentos bonitos. Aquí tienes tu agenda.</p>
        </div>
        <div className="bb-welcome-side">
          <button type="button" className="bb-agenda-pill" onClick={() => onNavigate('mis-citas')}>
            <CalendarDays size={14} aria-hidden="true" />
            Ver mi agenda
          </button>
          <div className="bb-pro-avatar-ring">
            <Image src="/professional-laura.jpg" alt="Retrato de muestra de Laura Martín" fill sizes="64px" />
            <i className="bb-online-dot" aria-hidden="true" />
          </div>
        </div>
        <div className="bb-welcome-giant" aria-hidden="true">
          b
        </div>
      </section>

      <div className="bb-pro-grid">
        <div className="bb-pro-main">
          <div className="bb-stat-row">
            <article className="bb-stat-card">
              <div className="bb-stat-top">
                <span className="bb-stat-icon">
                  <CalendarDays aria-hidden="true" />
                </span>
                <span className="bb-stat-pill is-mint">{upcomingToday} por venir</span>
              </div>
              <span className="bb-stat-label">Citas de hoy</span>
              <strong className="bb-stat-value">{today.length}</strong>
            </article>
            <article className="bb-stat-card">
              <div className="bb-stat-top">
                <span className="bb-stat-icon is-sage">
                  <CheckCheck aria-hidden="true" />
                </span>
                <span className="bb-stat-pill is-mint">↗ +20%</span>
              </div>
              <span className="bb-stat-label">Esta semana</span>
              <strong className="bb-stat-value">18</strong>
            </article>
            <article className="bb-stat-card">
              <div className="bb-stat-top">
                <span className="bb-stat-icon">
                  <Clock3 aria-hidden="true" />
                </span>
                <span className="bb-stat-pill">De 32 h disp.</span>
              </div>
              <span className="bb-stat-label">Horas en agenda</span>
              <strong className="bb-stat-value">26 h</strong>
            </article>
          </div>

          <section className="bb-panel bb-day-card" aria-labelledby="bb-today-title">
            <div className="bb-day-head">
              <div>
                <div className="bb-day-title-row">
                  <h2 id="bb-today-title">Tu agenda de hoy</h2>
                  <span className="bb-date-pill">Sábado, 14 nov</span>
                </div>
                <p className="bb-day-sub">{today.length} citas · Tus reservas programadas para hoy</p>
              </div>
              <button type="button" className="bb-day-link" onClick={() => onNavigate('mis-citas')}>
                Ver todas <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="bb-day-rows">
              {today.map((appointment) => (
                <div className="bb-appt-row" key={appointment.id}>
                  <div className="bb-appt-time">
                    <strong>{appointment.time}</strong>
                    {appointment.id === nextTodayId && <span className="bb-next-tag">SIGUIENTE</span>}
                  </div>
                  <Avatar initials={appointment.initials} />
                  <div className="bb-appt-person">
                    <strong>{appointment.customer}</strong>
                    <small>{appointment.service}</small>
                  </div>
                  <button type="button" className="bb-mirar-btn" onClick={() => onOpen(appointment)}>
                    <Eye size={14} aria-hidden="true" />
                    Mirar
                  </button>
                </div>
              ))}
              {today.length === 0 && (
                <div className="bb-empty-state">
                  <CalendarDays />
                  <strong>Sin citas hoy</strong>
                  <span>Disfruta de un día tranquilo.</span>
                </div>
              )}
            </div>
          </section>

          <section className="bb-panel bb-day-card" aria-labelledby="bb-upcoming-title">
            <div className="bb-day-head">
              <div>
                <h2 id="bb-upcoming-title">Tus próximas citas</h2>
                <p className="bb-day-sub">Vista anticipada de tus primeras reservas de la próxima semana</p>
              </div>
              {preview.length > 0 && <span className="bb-range-label">{upcomingRangeLabel(preview)}</span>}
            </div>
            <div className="bb-day-rows">
              {preview.map((appointment) => {
                const { day, month } = splitDemoDate(appointment.date)
                return (
                  <div className="bb-upcoming-row" key={appointment.id}>
                    <div className="bb-date-badge">
                      <strong>{day}</strong>
                      <span>{month}</span>
                    </div>
                    <div className="bb-appt-person">
                      <strong>{appointment.customer}</strong>
                      <small>{appointment.service}</small>
                    </div>
                    <div className="bb-upcoming-actions">
                      <span className="bb-time-pill">{appointment.time}</span>
                      <button
                        type="button"
                        className="bb-eye-btn"
                        aria-label={`Ver cita de ${appointment.customer}`}
                        onClick={() => onOpen(appointment)}
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )
              })}
              {preview.length === 0 && (
                <div className="bb-empty-state">
                  <CalendarDays />
                  <strong>Sin próximas citas</strong>
                  <span>Tu semana se irá llenando poco a poco.</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="bb-pro-side">
          {next && (
            <section className="bb-panel bb-next-side" aria-labelledby="bb-next-title">
              <div className="bb-next-side-head">
                <span className="bb-eyebrow" id="bb-next-title">
                  TU PRÓXIMA CITA
                </span>
                <span className="bb-arrival-pill">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B07D6B] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B07D6B]" />
                  </span>
                  En 25 min · {next.time}
                </span>
              </div>
              <div className="bb-next-client">
                <Avatar initials={next.initials} className="bb-avatar-large" />
                <div className="bb-appt-person">
                  <strong>{next.customer}</strong>
                  <small>{next.service}</small>
                </div>
                {isVipCustomer(next.customer) && <span className="bb-vip-badge">CLIENTE VIP</span>}
              </div>
              <button type="button" className="bb-side-cta" onClick={() => onOpen(next)}>
                Ver cita <ArrowRight size={16} aria-hidden="true" />
              </button>
            </section>
          )}

          <section className="bb-panel bb-reminder-card">
            <div className="bb-reminder-icon">
              <Heart size={16} aria-hidden="true" />
            </div>
            <span className="bb-eyebrow">UN RECORDATORIO</span>
            <h2>Tu talento hace cada cita especial.</h2>
            <p>Respira, prepara tu espacio y disfruta de cada momento con tus clientas.</p>
            <button type="button" className="bb-reminder-link" onClick={() => onNavigate('calendario')}>
              Ver mi semana <span aria-hidden="true">↗</span>
            </button>
            <div className="bb-reminder-flower" aria-hidden="true">
              ✳
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function MyAppointments({
  appointments,
  onOpen,
}: {
  appointments: DemoAppointment[]
  onOpen: (appointment: DemoAppointment) => void
}) {
  const [period, setPeriod] = useState('Próximas')
  const [viewMode, setViewMode] = useState<'tabla' | 'dia'>('tabla')
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('todas')

  const upcomingCount = appointments.filter((appointment) => appointment.status !== 'Completada').length
  const completedCount = appointments.filter((appointment) => appointment.status === 'Completada').length
  const nextId = appointments.find((appointment) => appointment.status !== 'Completada')?.id
  const dates = Array.from(new Set(appointments.map((appointment) => appointment.date)))

  const filtered = appointments.filter((appointment) => {
    if (period === 'Próximas' && appointment.status === 'Completada') return false
    if (period === 'Completadas' && appointment.status !== 'Completada') return false
    if (dateFilter !== 'todas' && appointment.date !== dateFilter) return false
    const q = query.trim().toLowerCase()
    if (q && !`${appointment.customer} ${appointment.service}`.toLowerCase().includes(q)) return false
    return true
  })

  const groups: Array<[string, DemoAppointment[]]> = []
  for (const appointment of filtered) {
    const group = groups.find(([date]) => date === appointment.date)
    if (group) group[1].push(appointment)
    else groups.push([appointment.date, [appointment]])
  }

  const tabs = [
    { id: 'Próximas', count: upcomingCount },
    { id: 'Completadas', count: completedCount },
    { id: 'Todas', count: appointments.length },
  ]

  return (
    <div className="bb-page-stack">
      <section className="bb-citas-hero">
        <div className="bb-welcome-text">
          <div className="bb-welcome-eyebrow-row">
            <span className="bb-eyebrow">TU AGENDA PERSONAL</span>
            <span className="bb-dot-sep" aria-hidden="true" />
            <span className="bb-shift-badge">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]" />
              </span>
              AGENDA SINCRONIZADA
            </span>
          </div>
          <h2>Mis citas</h2>
          <p>Consulta el detalle de tus clientes, horarios asignados y notas de preparación.</p>
        </div>
        <div className="bb-citas-hero-side">
          <div className="bb-citas-capsule">
            <div className="bb-citas-metric">
              <span>CITAS ASIGNADAS</span>
              <strong>{appointments.length}</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>ESTA SEMANA</span>
              <strong>18</strong>
            </div>
          </div>
        </div>
        <div className="bb-welcome-giant" aria-hidden="true">
          b
        </div>
      </section>
      <section className="bb-panel bb-citas-card" aria-label="Listado de citas">
        <div className="bb-citas-toolbar">
          <div className="bb-citas-tabs" role="tablist" aria-label="Filtrar citas por estado">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={period === tab.id}
                className={period === tab.id ? 'is-active' : ''}
                onClick={() => setPeriod(tab.id)}
              >
                {tab.id} <span className="bb-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="bb-view-toggle" role="group" aria-label="Cambiar vista">
            <button
              type="button"
              className={viewMode === 'tabla' ? 'is-active' : ''}
              aria-pressed={viewMode === 'tabla'}
              onClick={() => setViewMode('tabla')}
            >
              <List size={14} aria-hidden="true" />
              Tabla
            </button>
            <button
              type="button"
              className={viewMode === 'dia' ? 'is-active' : ''}
              aria-pressed={viewMode === 'dia'}
              onClick={() => setViewMode('dia')}
            >
              <CalendarDays size={14} aria-hidden="true" />
              Por día
            </button>
          </div>
        </div>

        <div className="bb-citas-filters">
          <label className="bb-citas-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar clienta o servicio..."
              aria-label="Buscar clienta o servicio"
            />
          </label>
          <FilterDropdown
            icon={CalendarDays}
            value={dateFilter === 'todas' ? 'Todas las fechas' : dateFilter}
            options={['Todas las fechas', ...dates]}
            onChange={(option) => setDateFilter(option === 'Todas las fechas' ? 'todas' : option)}
            label="Filtrar por fecha"
          />
        </div>

        {viewMode === 'tabla' ? (
          <div className="bb-citas-tablewrap">
            <table className="bb-citas-table">
              <thead>
                <tr>
                  <th scope="col">CLIENTA</th>
                  <th scope="col">SERVICIO</th>
                  <th scope="col">FECHA Y HORA</th>
                  <th scope="col" className="bb-col-detail">DETALLE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      <div className="bb-citas-client">
                        <Avatar initials={appointment.initials} />
                        <div className="bb-appt-person">
                          <span className="bb-citas-name">
                            {appointment.customer}
                            {appointment.id === nextId && <span className="bb-next-tag">PRÓXIMA</span>}
                          </span>
                          <small>{appointment.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="bb-appt-person">
                        <strong>{appointment.service}</strong>
                        <small>{formatCOP(appointment.price)}</small>
                      </div>
                    </td>
                    <td>
                      <div className="bb-citas-datetime">
                        <span className="bb-citas-date">
                          {appointment.date.startsWith('Hoy') && (
                            <i className="bb-today-dot" aria-hidden="true" />
                          )}
                          {appointment.date}
                        </span>
                        <small>{appointment.time}</small>
                      </div>
                    </td>
                    <td>
                      <div className="bb-citas-detail">
                        <button
                          type="button"
                          className="bb-eye-btn"
                          aria-label={`Ver cita de ${appointment.customer}`}
                          onClick={() => onOpen(appointment)}
                        >
                          <Eye size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="bb-empty-state">
                <CalendarDays />
                <strong>No hay citas en esta lista</strong>
                <span>Prueba con otro filtro o búsqueda.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bb-day-groups">
            {groups.map(([date, items]) => (
              <div className="bb-day-group" key={date}>
                <div className="bb-day-group-head">
                  <h3>{date}</h3>
                  <span className="bb-count-pill">
                    {items.length} {items.length === 1 ? 'cita' : 'citas'}
                  </span>
                </div>
                <div className="bb-day-cards">
                  {items.map((appointment) => (
                    <article className="bb-day-appcard" key={appointment.id}>
                      <span className="bb-card-time">{appointment.time}</span>
                      <div className="bb-appt-person">
                        <span className="bb-citas-name">
                          {appointment.customer}
                          {appointment.id === nextId && <span className="bb-next-tag">PRÓXIMA</span>}
                        </span>
                        <small>
                          {appointment.service} · {formatCOP(appointment.price)}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="bb-eye-btn"
                        aria-label={`Ver cita de ${appointment.customer}`}
                        onClick={() => onOpen(appointment)}
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bb-empty-state">
                <CalendarDays />
                <strong>No hay citas en esta lista</strong>
                <span>Prueba con otro filtro o búsqueda.</span>
              </div>
            )}
          </div>
        )}

        <div className="bb-citas-foot">
          <span>Agenda personal · Actualizada hoy</span>
          <span>
            Mostrando {filtered.length} {filtered.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>
      </section>
    </div>
  )
}
