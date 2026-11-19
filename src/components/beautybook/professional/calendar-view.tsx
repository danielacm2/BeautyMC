'use client'

import { Fragment, useState } from 'react'
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react'
import type { DemoAppointment } from '@/lib/dashboard-demo-data'
import {
  TODAY_INDEX as todayIndex,
  WEEK_DAYS as weekDays,
  WORK_END as workEnd,
  WORK_START as workStart,
  appointmentsInWeek,
  dayIndexInWeek,
} from '@/components/beautybook/professional/professional-shared'

export function MyCalendar({
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
  function hourOf(time: string): number {
    return parseInt(time.split(':')[0] ?? '9', 10)
  }

  const byDayHour = new Map<string, DemoAppointment>()
  const weekAppointments = appointmentsInWeek(appointments)
  for (const appointment of weekAppointments) {
    byDayHour.set(`${dayIndexInWeek(appointment.date)}-${hourOf(appointment.time)}`, appointment)
  }

  const allDays = weekDays.map((_, index) => index)
  const visibleDays = calView === 'hoy' ? [selected] : showMonSun ? allDays : allDays.filter((d) => d !== 0 && d !== 6)

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
              <strong>{String(workStart[todayIndex]).padStart(2, '0')}:00 — {String(workEnd[todayIndex]).padStart(2, '0')}:00</strong>
            </div>
            <div className="bb-citas-capsule-div" aria-hidden="true" />
            <div className="bb-citas-metric">
              <span>CITAS SEMANA</span>
              <strong>{weekAppointments.length}</strong>
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
              <input type="checkbox" checked={showMonSun} onChange={(event) => setShowMonSun(event.target.checked)} />
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
            <div key={weekDays[dayIndex].day} className={`bb-cal-dayhead ${dayIndex === todayIndex ? 'is-today' : ''}`}>
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
