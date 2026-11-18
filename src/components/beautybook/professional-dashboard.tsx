'use client'

import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Eye,
  Heart,
  LayoutDashboard,
  List,
  MessageCircle,
  Search,
  UserRound,
} from 'lucide-react'
import { demoAppointments, demoCustomers, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { Avatar } from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { DashboardShell, type DashboardNavItem } from '@/components/beautybook/dashboard-shell'

const PROFESSIONAL_NAME = 'Laura Martín'

const navItems: DashboardNavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'mis-citas', label: 'Mis citas', icon: List },
  { id: 'calendario', label: 'Mi calendario', icon: CalendarDays },
  { id: 'perfil', label: 'Mi perfil', icon: UserRound },
]

const weekDays = [
  { day: 'Lun', date: '9' },
  { day: 'Mar', date: '10' },
  { day: 'Mié', date: '11' },
  { day: 'Jue', date: '12' },
  { day: 'Vie', date: '13' },
  { day: 'Sáb', date: '14' },
  { day: 'Dom', date: '15' },
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

function FilterDropdown({
  icon: Icon,
  value,
  options,
  onChange,
  label,
}: {
  icon: LucideIcon
  value: string
  options: string[]
  onChange: (value: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="bb-dropdown" ref={ref}>
      <button
        type="button"
        className="bb-dropdown-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon aria-hidden="true" />
        <span>{value}</span>
        <ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <ul className="bb-dropdown-list" role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = option === value
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={selected ? 'is-selected' : ''}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  <span>{option}</span>
                  {selected && <Check aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
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

function MyCalendar({
  appointments,
  onOpen,
}: {
  appointments: DemoAppointment[]
  onOpen: (appointment: DemoAppointment) => void
}) {
  const [selected, setSelected] = useState(5)
  const [showMonSun, setShowMonSun] = useState(false)
  const [calView, setCalView] = useState<'semana' | 'hoy'>('semana')
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
  // Día "Hoy" en los datos de muestra: Sáb 14
  const todayIndex = 5
  const workStart: Record<number, number> = { 0: 9, 1: 9, 2: 9, 3: 9, 4: 9, 5: 10, 6: -1 }
  const workEnd: Record<number, number> = { 0: 17, 1: 17, 2: 17, 3: 17, 4: 17, 5: 15, 6: -1 }

  function dayIndexOf(date: string): number {
    const dayNumber = date.match(/(\d{1,2})\s*[A-Za-zñÑ]+/)
    if (dayNumber) {
      const found = weekDays.findIndex((day) => day.date === dayNumber[1])
      if (found >= 0) return found
    }
    const names: Record<string, number> = {
      lun: 0,
      mar: 1,
      'mié': 2,
      mie: 2,
      jue: 3,
      vie: 4,
      'sáb': 5,
      sab: 5,
      dom: 6,
      hoy: todayIndex,
    }
    return names[date.split(',')[0]?.trim().toLowerCase()] ?? todayIndex
  }

  function hourOf(time: string): number {
    return parseInt(time.split(':')[0] ?? '9', 10)
  }

  const byDayHour = new Map<string, DemoAppointment>()
  for (const appointment of appointments) {
    if (appointment.status === 'Cancelada') continue
    byDayHour.set(`${dayIndexOf(appointment.date)}-${hourOf(appointment.time)}`, appointment)
  }

  const allDays = weekDays.map((_, index) => index)
  const visibleDays =
    calView === 'hoy' ? [selected] : showMonSun ? allDays : allDays.filter((d) => d !== 0 && d !== 6)

  function cellFor(dayIndex: number, hour: string) {
    const key = `${dayIndex}-${hourOf(hour)}`
    const appointment = byDayHour.get(key)
    if (appointment) {
      return (
        <button
          key={key}
          type="button"
          className="bb-cal-event"
          onClick={() => onOpen(appointment)}
          aria-label={`Ver cita de ${appointment.customer}, ${appointment.time}`}
        >
          <strong>{appointment.service}</strong>
          <span>{appointment.customer}</span>
          <small>{appointment.time}</small>
        </button>
      )
    }
    const start = workStart[dayIndex] ?? 9
    const end = workEnd[dayIndex] ?? 17
    const h = hourOf(hour)
    if (h === 13 && start >= 0) {
      return (
        <div key={key} className="bb-cal-pause">
          <Coffee size={13} aria-hidden="true" />
          <span>Pausa</span>
        </div>
      )
    }
    if (start < 0 || h < start || h >= end) {
      return (
        <div key={key} className="bb-cal-rest">
          {dayIndex === 5 && h === 15 && <span>Fin de turno sáb.</span>}
        </div>
      )
    }
    return <div key={key} className="bb-cal-free" />
  }

  return (
    <div className="bb-page-stack">
      <section className="bb-citas-hero">
        <div className="bb-welcome-text">
          <div className="bb-welcome-eyebrow-row">
            <span className="bb-eyebrow">TU CALENDARIO PERSONAL</span>
            <span className="bb-dot-sep" aria-hidden="true" />
            <span className="bb-shift-badge">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]" />
              </span>
              AGENDA SINCRONIZADA
            </span>
          </div>
          <h2>Mi semana</h2>
          <p>9 — 15 de noviembre de 2026 · Vista semanal de turnos y reservas</p>
        </div>
        <div className="bb-citas-hero-side">
          <div className="bb-citas-capsule">
            <div className="bb-citas-metric">
              <span>TURNO HOY</span>
              <strong>10:00 — 15:00</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>CITAS SEMANA</span>
              <strong>10</strong>
            </div>
          </div>
          <div className="bb-cal-nav" role="group" aria-label="Navegar semanas">
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => setSelected((day) => Math.max(0, day - 1))}
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button type="button" className="bb-cal-today" onClick={() => setSelected(5)}>
              Hoy
            </button>
            <button
              type="button"
              aria-label="Semana siguiente"
              onClick={() => setSelected((day) => Math.min(6, day + 1))}
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="bb-welcome-giant" aria-hidden="true">
          b
        </div>
      </section>

      <section className="bb-panel bb-cal-card" aria-label="Calendario semanal">
        <div className="bb-cal-topbar">
          <div className="bb-cal-legend" aria-label="Leyenda">
            <span className="bb-legend-item">
              <i className="bb-sw-event" aria-hidden="true" /> Cita agendada
            </span>
            <span className="bb-legend-item">
              <i className="bb-sw-pause" aria-hidden="true" /> Pausa / Almuerzo
            </span>
            <span className="bb-legend-item">
              <i className="bb-sw-free" aria-hidden="true" /> Espacio libre
            </span>
            <span className="bb-legend-item">
              <i className="bb-sw-rest" aria-hidden="true" /> Descanso / Bloqueo
            </span>
          </div>
          <div className="bb-cal-options">
            <label className="bb-cal-check">
              <input
                type="checkbox"
                checked={showMonSun}
                onChange={(event) => setShowMonSun(event.target.checked)}
              />
              <span className="bb-check-box" aria-hidden="true" />
              Mostrar Lun / Dom
            </label>
            <div className="bb-view-toggle" role="group" aria-label="Alcance del calendario">
              <button
                type="button"
                className={calView === 'semana' ? 'is-active' : ''}
                aria-pressed={calView === 'semana'}
                onClick={() => setCalView('semana')}
              >
                Semana completa
              </button>
              <button
                type="button"
                className={calView === 'hoy' ? 'is-active' : ''}
                aria-pressed={calView === 'hoy'}
                onClick={() => setCalView('hoy')}
              >
                Solo hoy ({weekDays[selected].day} {weekDays[selected].date})
              </button>
            </div>
          </div>
        </div>

        <div
          className="bb-cal-grid"
          style={{ gridTemplateColumns: `64px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
        >
          <div className="bb-cal-corner">HORA</div>
          {visibleDays.map((dayIndex) => (
            <div
              key={weekDays[dayIndex].day}
              className={`bb-cal-dayhead ${dayIndex === todayIndex ? 'is-today' : ''}`}
            >
              <span>{weekDays[dayIndex].day}</span>
              <strong>{weekDays[dayIndex].date}</strong>
              {dayIndex === todayIndex && <span className="bb-today-pill">HOY</span>}
            </div>
          ))}
          {hours.map((hour) => (
            <Fragment key={hour}>
              <div key={`h-${hour}`} className="bb-cal-hour">
                {hour}
              </div>
              {visibleDays.map((dayIndex) => (
                <div
                  key={`${weekDays[dayIndex].day}-${hour}`}
                  className={`bb-cal-cell ${dayIndex === todayIndex ? 'is-today' : ''}`}
                >
                  {cellFor(dayIndex, hour)}
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <div className="bb-cal-foot">
          <span>
            <Coffee size={13} aria-hidden="true" /> Tu pausa habitual: <strong>13:00 — 14:00</strong>
          </span>
          <span>Horario habitual: Mar–Vie 09:00–17:00 · Sáb 10:00–15:00</span>
        </div>
      </section>
    </div>
  )
}

function MyProfile({ notify }: { notify: (message: string) => void }) {
  const [saved, setSaved] = useState(false)
  const [bio, setBio] = useState(
    'Me encanta crear looks naturales y encontrar el estilo que mejor encaja contigo. Especialista en corte, color y cuidado capilar.',
  )
  const savedTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (savedTimer.current !== null) window.clearTimeout(savedTimer.current)
    }
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    notify('Tu perfil se ha actualizado en esta vista de muestra.')
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setSaved(false), 2400)
  }

  return (
    <div className="bb-page-stack">
      <section className="bb-citas-hero">
        <div className="bb-welcome-text">
          <div className="bb-welcome-eyebrow-row">
            <span className="bb-eyebrow">PERFIL PROFESIONAL</span>
            <span className="bb-dot-sep" aria-hidden="true" />
            <span className="bb-shift-badge">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7C59]" />
              </span>
              VISIBLE EN RESERVAS
            </span>
          </div>
          <h2>Mi perfil</h2>
          <p>Mantén tu información profesional, especialidades y presentación al día.</p>
        </div>
        <div className="bb-citas-hero-side">
          <div className="bb-citas-capsule">
            <div className="bb-citas-metric">
              <span>ESPECIALIDAD</span>
              <strong className="bb-capsule-serif">Peluquería & color</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>EN EL EQUIPO</span>
              <strong className="bb-capsule-serif">Desde Mar 2021</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>SERVICIOS ACTIVOS</span>
              <strong>4</strong>
            </div>
          </div>
        </div>
        <div className="bb-welcome-giant" aria-hidden="true">
          b
        </div>
      </section>
    <div className="bb-profile-layout">
      <form className="bb-panel bb-profile-form" onSubmit={submit}>
        <div className="bb-profile-top">
          <div className="bb-profile-photo">
            <Image src="/professional-laura.jpg" alt="Retrato de muestra de Laura Martín" fill sizes="96px" />
            <span className="bb-avatar-camera" aria-hidden="true">
              <Camera size={12} />
            </span>
          </div>
          <div className="bb-profile-heading">
            <div className="bb-profile-name-row">
              <strong>{PROFESSIONAL_NAME}</strong>
              <span className="bb-verified-pill">
                <BadgeCheck size={13} aria-hidden="true" />
                Perfil verificado
              </span>
            </div>
            <small>Profesional senior · BeautyMC Studio Medellín</small>
          </div>
        </div>

        <div className="bb-settings-fields">
          <div className="bb-form-row">
            <label>
              Nombre
              <input defaultValue="Laura" />
            </label>
            <label>
              Apellidos
              <input defaultValue="Martín" />
            </label>
          </div>
          <div className="bb-form-row">
            <label>
              Correo electrónico
              <input type="email" defaultValue="laura.martin@email.com" />
            </label>
            <label>
              Teléfono / WhatsApp
              <input type="tel" defaultValue="+34 612 345 870" />
            </label>
          </div>
          
          <div className="bb-services-block">
            <div className="bb-services-head">
              <span>Sobre mí</span>
              <small>{bio.length} / 280 caracteres</small>
            </div>
            <textarea
              rows={4}
              maxLength={280}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </div>
        </div>

        <div className="bb-profile-foot">
          <span>
            <Clock3 size={13} aria-hidden="true" /> Última actualización:{' '}
            {saved ? 'ahora mismo' : 'hoy, 18:30'}
          </span>
          <button type="submit" className="bb-button bb-button-primary">
            <Check size={15} aria-hidden="true" />
            Guardar cambios
          </button>
        </div>
      </form>

      <aside className="bb-panel bb-profile-side">
        <div className="bb-profile-side-icon">
          <Heart />
        </div>
        <span className="bb-eyebrow">TU PERFIL EN BEAUTYMC</span>
        <h2>
          Tu experiencia,
          <br />
          <em>tu sello personal.</em>
        </h2>
        <p>Comparte con tus clientas qué te inspira y qué pueden esperar de su cita contigo.</p>
        <div className="bb-side-stats">
          <div>
            <span>TRAYECTORIA</span>
            <strong>5 años en el estudio</strong>
          </div>
          <div>
            <span>TURNO HABITUAL</span>
            <strong>Lun — Sáb</strong>
          </div>
        </div>
      </aside>
    </div>
    </div>
  )
}

function ProfessionalAppointmentModal({
  appointment,
  onClose,
}: {
  appointment: DemoAppointment
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const customer = demoCustomers.find((item) => item.name === appointment.customer)
  const visitsSuffix = customer ? ` · ${customer.visits} visitas previas` : ''
  const whatsappHref = `https://wa.me/${appointment.phone.replace(/\D/g, '')}`

  return (
    <div
      className="bb-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="bb-ficha" role="dialog" aria-modal="true" aria-labelledby="bb-ficha-title">
        <div className="bb-ficha-head">
          <div className="bb-ficha-client">
            <Avatar initials={appointment.initials} className="bb-avatar-large" />
            <div>
              <div className="bb-ficha-name-row">
                <strong id="bb-ficha-title" className="bb-ficha-name">
                  {appointment.customer}
                </strong>
                {appointment.status !== 'Completada' && <span className="bb-next-tag">PRÓXIMA</span>}
              </div>
              <p className="bb-ficha-phone">
                {appointment.phone}
                {visitsSuffix}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="bb-ficha-close"
            onClick={onClose}
            aria-label="Cerrar ficha"
          >
            ×
          </button>
        </div>

        <div className="bb-ficha-service">
          <div>
            <span className="bb-ficha-label">SERVICIO PROGRAMADO</span>
            <strong className="bb-ficha-service-name">{appointment.service}</strong>
          </div>
          <div className="bb-ficha-tarifa">
            <span className="bb-ficha-label">TARIFA</span>
            <strong>{formatCOP(appointment.price)}</strong>
          </div>
        </div>

        <div className="bb-ficha-grid">
          <div className="bb-ficha-box">
            <span className="bb-ficha-label">
              <CalendarDays size={12} aria-hidden="true" /> FECHA
            </span>
            <strong>{appointment.date}</strong>
          </div>
          <div className="bb-ficha-box">
            <span className="bb-ficha-label">
              <Clock3 size={12} aria-hidden="true" /> HORA
            </span>
            <strong>{appointment.time}</strong>
          </div>
        </div>

        <div className="bb-ficha-foot">
          <a
            className="bb-ficha-wa"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar por WhatsApp a ${appointment.customer}`}
          >
            <MessageCircle size={16} aria-hidden="true" />
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
