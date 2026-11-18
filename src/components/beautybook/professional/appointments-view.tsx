'use client'

import { useState } from 'react'
import { CalendarDays, Eye, List, Search } from 'lucide-react'
import type { DemoAppointment } from '@/lib/dashboard-demo-data'
import { Avatar, FilterDropdown } from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'

export function MyAppointments({
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
                  <th scope="col" className="bb-col-detail">
                    DETALLE
                  </th>
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
                          {appointment.date.startsWith('Hoy') && <i className="bb-today-dot" aria-hidden="true" />}
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
