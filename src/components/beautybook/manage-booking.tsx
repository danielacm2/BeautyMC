'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Asterisk, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, User, X } from 'lucide-react'
import { formatCOP } from '@/lib/utils'

type BookingStatus = 'confirmed' | 'cancelled' | 'expired'
type ManageView = 'search' | 'detail' | 'reschedule' | 'cancelled'

interface ManagedBooking {
  code: string
  email: string
  service: string
  date: string
  dateKey: string
  time: string
  professional: string
  price: number
  status: BookingStatus
}

const STORAGE_KEY = 'beautymc-manage-booking'
const CANCELLED_KEY = 'beautymc-cancelled-bookings'

const weekdayShort = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const longDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const monthTitle = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })

const sampleBookings: ManagedBooking[] = [
  {
    code: 'BMC-24A7',
    email: 'demo@beautymc.test',
    service: 'Corte & peinado',
    date: 'martes 17 de noviembre',
    dateKey: '2026-11-17',
    time: '13:00',
    professional: 'Sin preferencia',
    price: 200000,
    status: 'confirmed',
  },
  {
    code: 'BMC-OLD1',
    email: 'demo@beautymc.test',
    service: 'Corte & peinado',
    date: 'martes 17 de noviembre',
    dateKey: '2026-11-17',
    time: '13:00',
    professional: 'Sin preferencia',
    price: 200000,
    status: 'expired',
  },
]

const weekdayTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
const saturdayTimes = ['10:00', '11:00', '12:00', '13:00', '14:00']
const unavailableTimesByDay: Record<number, string[]> = {
  0: [],
  1: ['12:00', '16:00'],
  2: ['11:00', '15:00', '18:00'],
  3: ['13:00', '17:00'],
  4: ['10:00', '14:00', '19:00'],
  5: ['12:00', '18:00'],
  6: ['11:00', '13:00'],
}

function buildWeek(year: number, month: number, day: number) {
  return Array.from({ length: 7 }, (_, offset) => new Date(year, month - 1, day + offset))
}

const rescheduleWeeks = [
  buildWeek(2026, 11, 16),
  buildWeek(2026, 11, 23),
  buildWeek(2026, 11, 30),
  buildWeek(2026, 12, 7),
  buildWeek(2026, 12, 14),
  buildWeek(2026, 12, 21),
]

const keyOfDate = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const formatLongDate = (date: Date) => longDate.format(date).replace(',', '')

const cancelReasons = ['Cambio de planes', 'Encontré otro horario', 'Un imprevisto', 'Otro']

export default function ManageBooking() {
  const [view, setView] = useState<ManageView>('search')
  const [booking, setBooking] = useState<ManagedBooking | null>(null)
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [weekIndex, setWeekIndex] = useState(0)
  const [newDateKey, setNewDateKey] = useState('')
  const [newTime, setNewTime] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  // Inicio del día de hoy: los días anteriores no se pueden elegir al reprogramar.
  const [today] = useState(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return start
  })
  const [cancelReason, setCancelReason] = useState('')
  const [cancelledCodes, setCancelledCodes] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = sessionStorage.getItem(CANCELLED_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelDialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as ManagedBooking
      if (parsed?.code && parsed?.service) {
        timer = setTimeout(() => {
          sessionStorage.removeItem(STORAGE_KEY)
          setBooking(parsed)
          setView('detail')
        }, 0)
      }
    } catch {
      // Sin datos guardados: se muestra la pantalla de búsqueda.
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
  }, [])

  useEffect(() => {
    if (!cancelOpen) return
    const dialog = cancelDialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const getFocusable = () => Array.from(
      dialog?.querySelectorAll<HTMLElement>('button, select, input, a[href]') ?? [],
    ).filter((element) => !element.hasAttribute('disabled'))
    getFocusable()[0]?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setCancelOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [cancelOpen])

  const currentWeek = rescheduleWeeks[weekIndex]
  const selectedDate = rescheduleWeeks.flat().find((date) => keyOfDate(date) === newDateKey) ?? null
  const selectedWeekday = selectedDate ? selectedDate.getDay() : null
  const dayTimes = selectedWeekday === 6 ? saturdayTimes : selectedWeekday === 0 || selectedWeekday === null ? [] : weekdayTimes
  const unavailableTimes = selectedWeekday !== null ? unavailableTimesByDay[selectedWeekday] ?? [] : []
  const weekLabel = capitalize(monthTitle.format(currentWeek[0]))

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!code.trim() || !email.trim() || searching) return
    setSearchError('')
    setResendMessage('')
    setSearching(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const found = sampleBookings.find(
        (item) => item.code.toLowerCase() === code.trim().toLowerCase() && item.email.toLowerCase() === email.trim().toLowerCase(),
      )
      setSearching(false)
      if (!found) {
        setSearchError('No encontramos una cita con esos datos. Revisa el código y el correo.')
        return
      }
      setBooking({ ...found, status: found.status === 'confirmed' && cancelledCodes.includes(found.code) ? 'cancelled' : found.status })
      setNotice('')
      setView('detail')
    }, 700)
  }

  function openReschedule() {
    if (!booking) return
    const dateIndex = rescheduleWeeks.findIndex((week) => week.some((date) => keyOfDate(date) === booking.dateKey))
    setWeekIndex(dateIndex === -1 ? 0 : dateIndex)
    setNewDateKey(booking.dateKey)
    setNewTime(booking.time)
    setNotice('')
    setView('reschedule')
  }

  function changeWeek(direction: -1 | 1) {
    const target = weekIndex + direction
    if (target < 0 || target >= rescheduleWeeks.length) return
    setWeekIndex(target)
  }

  function selectNewDate(date: Date) {
    const key = keyOfDate(date)
    if (key !== newDateKey) setNewTime('')
    setNewDateKey(key)
  }

  function saveReschedule() {
    if (!booking || !selectedDate || !newTime) return
    setBooking({
      ...booking,
      date: formatLongDate(selectedDate),
      dateKey: newDateKey,
      time: newTime,
    })
    setNotice('Listo, cambiamos tu cita.')
    setView('detail')
  }

  function confirmCancel() {
    setCancelOpen(false)
    if (booking) {
      const nextCodes = Array.from(new Set([...cancelledCodes, booking.code]))
      setCancelledCodes(nextCodes)
      try {
        sessionStorage.setItem(CANCELLED_KEY, JSON.stringify(nextCodes))
      } catch {
        // Si el navegador bloquea el almacenamiento, el estado sigue en memoria.
      }
    }
    setBooking((current) => current ? { ...current, status: 'cancelled' } : current)
    setNotice('')
    setView('cancelled')
  }

  return (
    <>
      {view === 'search' && (
        <section className="manage-card" aria-labelledby="manage-search-title">
          <span className="eyebrow">TU CITA</span>
          <h1 id="manage-search-title" className="manage-title">Gestiona <em>tu cita.</em></h1>
          <p className="manage-lead">Ingresa tu código de reserva y el correo con el que reservaste.</p>
          <form className="manage-form" onSubmit={submitSearch}>
            <div className="checkout-field">
              <label className="checkout-label" htmlFor="manage-code">Código de reserva</label>
              <input
                id="manage-code"
                value={code}
                onChange={(event) => { setCode(event.target.value); setSearchError('') }}
                placeholder="BMC-24A7"
                autoComplete="off"
              />
              <small className="checkout-help">Lo encuentras en el correo de confirmación.</small>
            </div>
            <div className="checkout-field">
              <label className="checkout-label" htmlFor="manage-email">Correo electrónico</label>
              <input
                id="manage-email"
                type="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setSearchError('') }}
                placeholder="hola@ejemplo.com"
                autoComplete="email"
              />
            </div>
            {searchError && <div className="manage-alert" role="alert">{searchError}</div>}
            <button
              type="submit"
              className="manage-primary"
              disabled={!code.trim() || !email.trim() || searching}
            >
              {searching ? 'Buscando...' : 'Buscar mi cita'}
            </button>
          </form>
          <div className="manage-divider" />
          <div className="manage-resend">
            <p>¿No encuentras tu código? <button type="button" className="manage-link" onClick={() => setResendMessage('Si hay una cita con ese correo, te enviamos el enlace.')}>Reenviar el enlace a mi correo</button></p>
            {resendMessage && <p className="manage-help" role="status">{resendMessage}</p>}
            <p className="manage-fineprint">También puedes entrar directo desde el botón “Gestionar mi cita” del correo de confirmación.</p>
          </div>
        </section>
      )}

      {view === 'detail' && booking && (
        <section className="manage-card" aria-labelledby="manage-detail-title">
          <span className={`manage-badge${booking.status === 'confirmed' ? '' : ` is-${booking.status}`}`}>
            {booking.status === 'confirmed' ? <Check size={15} /> : booking.status === 'cancelled' ? <X size={15} /> : <Clock3 size={15} />}
            {booking.status === 'confirmed' ? 'Cita confirmada' : booking.status === 'cancelled' ? 'Cita cancelada' : 'Ya no se puede modificar'}
          </span>
          <h1 id="manage-detail-title" className="manage-title">Tu cita, <em>a tu manera.</em></h1>
          {notice && <p className="manage-notice" role="status">{notice}</p>}
          <div className="manage-summary">
            <div className="manage-summary-head">
              <h2>TU CITA</h2>
              <span className="manage-code">Código <strong>{booking.code}</strong></span>
            </div>
            <div className="summary-rows">
              <div className="summary-row">
                <span className="summary-icon" aria-hidden="true"><Asterisk size={18} /></span>
                <span className="summary-info">
                  <span>Servicio</span>
                  <strong>{booking.service}</strong>
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-icon" aria-hidden="true"><CalendarDays size={18} /></span>
                <span className="summary-info">
                  <span>Fecha y hora</span>
                  <strong>{booking.date}, {booking.time}</strong>
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-icon" aria-hidden="true"><User size={18} /></span>
                <span className="summary-info">
                  <span>Profesional</span>
                  <strong>{booking.professional}</strong>
                </span>
              </div>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatCOP(booking.price)}</strong>
            </div>
          </div>

          {booking.status === 'confirmed' && (
            <p className="manage-note">Puedes cambiar o cancelar hasta 8 horas antes de tu cita.</p>
          )}
          {booking.status === 'expired' && (
            <p className="manage-note">El plazo para cambiar o cancelar esta cita ya pasó. <Link className="manage-link" href="/#contacto">Escríbenos</Link> y te ayudamos.</p>
          )}

          <div className="manage-actions">
            {booking.status === 'confirmed' && (
              <div className="manage-button-row">
                <button type="button" className="manage-primary" onClick={openReschedule}>Cambiar fecha u hora</button>
                <button type="button" className="manage-secondary" onClick={() => setCancelOpen(true)}>Cancelar cita</button>
              </div>
            )}
            {booking.status === 'expired' && (
              <div className="manage-button-row">
                <button type="button" className="manage-primary" disabled>Cambiar fecha u hora</button>
                <button type="button" className="manage-secondary" disabled>Cancelar cita</button>
              </div>
            )}
            {booking.status === 'cancelled' && (
              <Link href="/reservar" className="manage-primary">Reservar de nuevo</Link>
            )}
            <Link href="/" className="manage-home-link">Volver al inicio</Link>
          </div>
        </section>
      )}

      {view === 'reschedule' && booking && (
        <section className="manage-card manage-reschedule-card" aria-labelledby="manage-reschedule-title">
          <span className="eyebrow">FECHA Y HORA</span>
          <h1 id="manage-reschedule-title" className="manage-title">Elige tu <em>nuevo horario.</em></h1>
          <p className="manage-current">Tu cita actual: {booking.date}, {booking.time}</p>
          <div className="booking-datetime manage-calendar">
            <div className="calendar-toolbar">
              <h3>{weekLabel}</h3>
              <div className="calendar-arrows">
                <button type="button" aria-label="Semana anterior" onClick={() => changeWeek(-1)} disabled={weekIndex === 0}><ChevronLeft size={15} /></button>
                <button type="button" aria-label="Semana siguiente" onClick={() => changeWeek(1)} disabled={weekIndex === rescheduleWeeks.length - 1}><ChevronRight size={15} /></button>
              </div>
            </div>
            <div className="date-picker" key={weekIndex}>
              {currentWeek.map((date) => {
                const closed = date.getDay() === 0
                const unavailable = closed || date < today
                const selected = newDateKey === keyOfDate(date)
                const isMonthStart = date.getDate() === 1
                return (
                  <button
                    type="button"
                    key={keyOfDate(date)}
                    disabled={unavailable}
                    className={`date-option ${selected ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`}
                    onClick={() => selectNewDate(date)}
                    aria-pressed={selected}
                  >
                    <span className="date-weekday">{weekdayShort.format(date).replace('.', '').toUpperCase()}</span>
                    <strong>{date.getDate()}</strong>
                    {isMonthStart && <span className="date-month">{monthShort.format(date).replace('.', '')}</span>}
                    {closed && <span className="date-closed">Cerrado</span>}
                  </button>
                )
              })}
            </div>
            {selectedWeekday === 0 || selectedWeekday === null ? (
              <div className="week-empty"><p>No hay horarios este día.</p></div>
            ) : (
              <>
                <div className="available-label"><Clock3 size={14} /> HORAS DISPONIBLES</div>
                {[
                  { label: 'Mañana', items: dayTimes.slice(0, 2) },
                  { label: 'Tarde', items: dayTimes.slice(2) },
                ].map((group) => (
                  <section className="time-group" key={group.label} aria-label={`Horas de la ${group.label.toLowerCase()}`}>
                    <h3>{group.label}</h3>
                    <div className="time-grid">
                      {group.items.map((item) => {
                        const unavailable = unavailableTimes.includes(item)
                        return (
                          <button
                            type="button"
                            key={item}
                            disabled={unavailable}
                            className={`time-option ${newTime === item ? 'selected' : ''}`}
                            onClick={() => setNewTime(item)}
                            aria-pressed={newTime === item}
                          >
                            {item}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
                <div className="time-legend" aria-label="Leyenda de disponibilidad">
                  <span><i className="legend-available" />Disponible</span>
                  <span><i className="legend-selected" />Seleccionada</span>
                  <span><i className="legend-unavailable" />No disponible</span>
                </div>
              </>
            )}
          </div>
          <div className="manage-bar">
            <button type="button" className="manage-back" onClick={() => setView('detail')}><ArrowLeft size={16} /> Atrás</button>
            <button type="button" className="manage-primary" onClick={saveReschedule} disabled={!newDateKey || !newTime}>Guardar cambio</button>
          </div>
        </section>
      )}

      {view === 'cancelled' && booking && (
        <section className="manage-card manage-cancelled" aria-labelledby="manage-cancelled-title">
          <span className="manage-cancelled-icon" aria-hidden="true"><Check size={30} /></span>
          <h1 id="manage-cancelled-title" className="manage-title">Tu cita <em>fue cancelada.</em></h1>
          <p className="manage-lead">Enviamos la confirmación a {booking.email}. Cuando quieras, aquí estamos.</p>
          <div className="manage-actions">
            <Link href="/reservar" className="manage-primary">Reservar de nuevo</Link>
            <Link href="/" className="manage-home-link">Volver al inicio</Link>
          </div>
        </section>
      )}

      {cancelOpen && booking && (
        <div
          className="manage-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCancelOpen(false)
          }}
        >
          <div
            className="manage-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-cancel-title"
            ref={cancelDialogRef}
          >
            <h2 id="manage-cancel-title" className="manage-modal-title">¿Quieres <em>cancelar tu cita?</em></h2>
            <p className="manage-modal-text">Liberaremos tu horario: <strong>{booking.service}, {booking.date}, {booking.time}</strong></p>
            <div className="checkout-field">
              <label className="checkout-label" htmlFor="manage-cancel-reason">¿Nos cuentas el motivo? (opcional)</label>
              <select id="manage-cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)}>
                <option value="">Selecciona una opción</option>
                {cancelReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
              </select>
            </div>
            <div className="manage-modal-actions">
              <button type="button" className="manage-primary" onClick={() => setCancelOpen(false)}>Mantener mi cita</button>
              <button type="button" className="manage-secondary" onClick={confirmCancel}>Sí, cancelar cita</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
