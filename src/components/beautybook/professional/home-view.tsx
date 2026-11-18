'use client'

import Image from 'next/image'
import { ArrowRight, CalendarDays, CheckCheck, Clock3, Eye, Heart } from 'lucide-react'
import { demoCustomers, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { Avatar } from '@/components/beautybook/dashboard-ui'

/* Muestra: insignia VIP y rango de fechas de la vista de inicio (sin backend). */
function isVipCustomer(name: string) {
  return demoCustomers.some((customer) => customer.name === name && customer.vip)
}

const WEEKDAY_SHORT: Record<string, string> = {
  lun: 'LUN',
  mar: 'MAR',
  mié: 'MIÉ',
  mie: 'MIÉ',
  jue: 'JUE',
  vie: 'VIE',
  sáb: 'SÁB',
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

export function ProfessionalHome({
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
