'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Asterisk, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, MapPin, User, X } from 'lucide-react'
import { professionals, serviceProfessionals, services } from '@/lib/beautybook-data'
import { isPastTimeSlot, isSameDay, startOfToday, toDateKey } from '@/lib/date-utils'
import { getDemoBusyTimes, getDemoDayTimes, getDemoWeeks } from '@/lib/demo-availability'
import { getServiceIcon } from '@/lib/service-icons'
import { capitalize, formatCOP } from '@/lib/utils'
import { isValidEmail } from '@/lib/validation'

const steps = ['Servicio', 'Profesional', 'Fecha y hora', 'Tus datos', 'Confirmación']
const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short' })

// Semanas de ejemplo (sin backend). En reserva la semana del 7 de diciembre no tiene horarios.
const sampleWeeks = getDemoWeeks({ emptyWeekStarts: ['2026-12-07'] })

// Texto de ejemplo de la política de privacidad (sin backend).
const privacyUpdated = '16 de noviembre de 2026'
const privacySections = [
  {
    title: 'Qué datos recopilamos',
    body: 'Recopilamos los datos que nos facilitas al reservar: nombre y apellidos, correo electrónico, teléfono y el servicio, la fecha y la profesional que elijas. Si nos contactas por otro medio, también podemos guardar el contenido de tus mensajes.',
  },
  {
    title: 'Para qué los usamos',
    body: 'Usamos tus datos para gestionar tu cita, confirmarla, recordártela y avisarte de cualquier cambio. También podemos utilizarlos para atender tus consultas y, si nos das tu consentimiento, para enviarte novedades y promociones.',
  },
  {
    title: 'Cuánto tiempo los conservamos',
    body: 'Conservamos tus datos mientras sean necesarios para gestionar tu cita y durante el plazo que exija la normativa aplicable. En concreto, los conservamos durante 3 años desde la última cita. Después los eliminamos o los anonimizamos de forma segura.',
  },
  {
    title: 'Tus derechos',
    body: 'Puedes solicitar el acceso, la rectificación o la supresión de tus datos, oponerte a su tratamiento y solicitar su limitación o portabilidad. Para ejercer tus derechos, escríbenos a beautymc@gmail.com indicando el derecho que deseas ejercer. También puedes reclamar ante la autoridad de protección de datos de tu país.',
  },
  {
    title: 'Cómo contactarnos',
    body: 'Si tienes cualquier duda sobre esta política o sobre el tratamiento de tus datos, puedes escribirnos a beautymc@gmail.com o dirigirte a BeautyMC, Calle Sur, 42 123, Medellín-Colombia.',
  },
]

export default function BookingFlow({ initialService, initialProfessional }: { initialService?: string; initialProfessional?: string }) {
  const validInitial = services.some((service) => service.id === initialService) ? initialService! : ''
  const validProfessional = professionals.some((person) => person.id === initialProfessional) ? initialProfessional! : 'none'
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState(validInitial)
  const [professionalId, setProfessionalId] = useState(validProfessional)
  const [weekIndex, setWeekIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'none' | 'prev' | 'next'>('none')
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [time, setTime] = useState('')
  const [now, setNow] = useState<Date | null>(null)
  // Inicio del día de hoy: los días anteriores no se pueden reservar.
  const [today] = useState(startOfToday)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacyError, setPrivacyError] = useState('')
  const [error, setError] = useState('')
  const privacyLinkRef = useRef<HTMLButtonElement>(null)
  const privacyCloseRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!privacyOpen) return
    const previousOverflow = document.body.style.overflow
    const linkElement = privacyLinkRef.current
    document.body.style.overflow = 'hidden'
    privacyCloseRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setPrivacyOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      linkElement?.focus()
    }
  }, [privacyOpen])
  const service = services.find((item) => item.id === serviceId)
  const currentWeek = sampleWeeks[weekIndex]
  const availableProfessionals = useMemo(() => {
    const allowed = serviceId ? serviceProfessionals[serviceId] : undefined
    if (!allowed) return professionals
    return professionals.filter((person) => allowed.includes(person.id))
  }, [serviceId])
  const professional = availableProfessionals.find((item) => item.id === professionalId)
  const selectedDate = useMemo(() => {
    if (!selectedDateKey) return null
    for (const week of sampleWeeks) {
      const match = week.days.find((date) => toDateKey(date) === selectedDateKey)
      if (match) return match
    }
    return null
  }, [selectedDateKey])
  const summaryDate = useMemo(() => selectedDate ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate) : '', [selectedDate])
  const monthLabel = useMemo(() => {
    const first = currentWeek.days[0]
    const last = currentWeek.days[currentWeek.days.length - 1]
    const firstMonth = first.getMonth()
    const lastMonth = last.getMonth()
    if (firstMonth === lastMonth) {
      const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(first)
      return capitalize(label)
    }
    const shortMonth = (date: Date) => {
      const label = monthShort.format(date).replace(/\./g, '')
      return capitalize(label)
    }
    if (first.getFullYear() !== last.getFullYear()) {
      return `${shortMonth(first)} ${first.getFullYear()} – ${shortMonth(last)} ${last.getFullYear()}`
    }
    return `${shortMonth(first)} – ${shortMonth(last)} ${last.getFullYear()}`
  }, [currentWeek])
  const compactDate = useMemo(() => {
    if (!selectedDate) return ''
    const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(selectedDate).replace(/\./g, '')
    return capitalize(label)
  }, [selectedDate])
  const selectedWeekday = selectedDate ? selectedDate.getDay() : 1
  const selectedInCurrentWeek = selectedDate ? currentWeek.days.some((date) => isSameDay(date, selectedDate)) : false
  const dayTimes = getDemoDayTimes(selectedWeekday)
  const unavailableTimes = getDemoBusyTimes(selectedWeekday)
  const confirmationDate = summaryDate ? `${summaryDate.replace(',', '')}${time ? `, ${time}` : ''}` : 'Sin seleccionar'
  const detailsComplete = Boolean(name.trim() && email.trim() && phone.trim())
  const confirmBlocked = detailsComplete && !acceptedPrivacy

  function changeWeek(direction: -1 | 1) {
    const target = weekIndex + direction
    if (target < 0 || target >= sampleWeeks.length) return
    setSlideDirection(direction === 1 ? 'next' : 'prev')
    setWeekIndex(target)
  }

  function goToNextAvailableWeek() {
    const target = sampleWeeks.findIndex((week, index) => index > weekIndex && week.hasSchedule)
    if (target === -1) return
    setSlideDirection('next')
    setWeekIndex(target)
  }

  function selectDate(date: Date) {
    const key = toDateKey(date)
    const current = new Date()
    setNow(current)
    setError('')
    if (selectedDateKey !== key || (time && isPastTimeSlot(date, time, current))) setTime('')
    setSelectedDateKey(key)
  }

  function next() {
    setError('')
    if (step === 0 && !serviceId) return setError('Elige un servicio para continuar.')
    if (step === 2 && (!selectedDateKey || !time)) return setError('Selecciona una fecha y una hora.')
    if (step === 3) {
      if (!name.trim() || !isValidEmail(email) || !phone.trim()) return setError('Completa tu nombre, un email válido y tu teléfono.')
      if (!acceptedPrivacy) return setPrivacyError('Para continuar, acepta la política de privacidad.')
    }
    setStep((current) => Math.min(current + 1, 4))
  }
  function back() { setError(''); setStep((current) => Math.max(current - 1, 0)) }
  function goToStep(target: number) { setError(''); setStep(target) }
  function togglePrivacy(checked: boolean) {
    setAcceptedPrivacy(checked)
    if (checked) setPrivacyError('')
  }

  return (
    <section className={`booking-card${step === 2 ? ' booking-datetime-card' : ''}${step === 3 ? ' booking-checkout-card' : ''}${step === 4 ? ' booking-confirmation-card' : ''}`} aria-label="Reserva de cita">
      <div className="stepper" aria-label={`Paso ${Math.min(step + 1, 5)} de 5`}>
        {steps.map((label, index) => (
          <div className="step-group" key={label}>
            <div className={`step-item ${index === step ? 'active' : ''} ${index < step ? 'complete' : ''}`}>
              <span className="step-dot">{index < step || step === 4 ? <Check size={16} /> : `0${index + 1}`}</span>
              <span>{label}</span>
            </div>
            {index < steps.length - 1 && (
              <span className={`step-connector ${index < step ? 'complete' : ''}`} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="booking-content">
          <h2>¿Qué te apetece hoy?</h2>
          <p className="booking-lead">Elige el ritual que mejor va contigo.</p>
          <div className="choice-list" role="radiogroup" aria-label="Servicios disponibles">
            {services.map((item) => {
              const Icon = getServiceIcon(item.id)
              const isSelected = serviceId === item.id
              return (
                <label key={item.id} className={`choice-row ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="service"
                    value={item.id}
                    checked={isSelected}
                    onChange={() => {
                      setServiceId(item.id)
                      const allowed = serviceProfessionals[item.id] ?? []
                      if (professionalId !== 'none' && !allowed.includes(professionalId)) {
                        setProfessionalId('none')
                      }
                      setError('')
                    }}
                    className="choice-radio-input"
                  />
                  <span className="choice-icon"><Icon size={22} /></span>
                  <span className="choice-name">
                    <strong>{item.name}</strong>
                    <small>
                      <span className="choice-category">{item.category}</span>
                    </small>
                  </span>
                  <strong className="choice-price">{formatCOP(item.price)}</strong>
                  <span className="radio-mark" aria-hidden="true" />
                </label>
              )
            })}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="booking-content">
          <h2>¿Con quién te gustaría?</h2>
          <p className="booking-lead">Puedes elegir a alguien o dejarte sorprender.</p>
          {service && (
            <div className="professional-filter-pill">
              Mostrando quienes realizan: <strong>{service.name}</strong>
            </div>
          )}
          <div className="professional-list" role="radiogroup" aria-label="Profesionales disponibles">
            <label className={`professional-option ${professionalId === 'none' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="professional"
                value="none"
                checked={professionalId === 'none'}
                onChange={() => setProfessionalId('none')}
                className="choice-radio-input"
              />
              <span className="professional-avatar avatar-neutral" aria-hidden="true">✳</span>
              <span className="professional-info">
                <strong>Sin preferencia</strong>
                <small>Te asignaremos a quien mejor encaje</small>
              </span>
              <span className="radio-mark" aria-hidden="true" />
            </label>
            {availableProfessionals.map((person) => {
              const isSelected = professionalId === person.id
              return (
                <label key={person.id} className={`professional-option ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="professional"
                    value={person.id}
                    checked={isSelected}
                    onChange={() => setProfessionalId(person.id)}
                    className="choice-radio-input"
                  />
                  <span className="professional-avatar">
                    <Image src={person.image} alt={`Retrato de ${person.name}`} fill sizes="64px" />
                  </span>
                  <span className="professional-info">
                    <strong>{person.name}</strong>
                    <small>{person.specialty}</small>
                  </span>
                  <span className="radio-mark" aria-hidden="true" />
                </label>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="booking-content booking-datetime">
          <h2>Elige cuándo venir.</h2>
          <p className="booking-lead">Próximos días disponibles en nuestro estudio.</p>
          <div className="calendar-toolbar">
            <h3>{monthLabel}</h3>
            <div className="calendar-arrows">
              <button type="button" aria-label="Semana anterior" onClick={() => changeWeek(-1)} disabled={weekIndex === 0}><ChevronLeft size={15} /></button>
              <button type="button" aria-label="Semana siguiente" onClick={() => changeWeek(1)} disabled={weekIndex === sampleWeeks.length - 1}><ChevronRight size={15} /></button>
            </div>
          </div>
          <div key={weekIndex} className={`date-picker week-slide-${slideDirection}`}>
            {currentWeek.days.map((date) => {
              const closed = date.getDay() === 0
              const unavailable = closed || date < today
              const selected = selectedDateKey === toDateKey(date)
              const isMonthStart = date.getDate() === 1
              return (
                <button
                  type="button"
                  key={toDateKey(date)}
                  disabled={unavailable}
                  className={`date-option ${selected ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`}
                  onClick={() => selectDate(date)}
                  aria-pressed={selected}
                >
                  <span className="date-weekday">{weekday.format(date).replace('.', '').toUpperCase()}</span>
                  <strong>{date.getDate()}</strong>
                  {isMonthStart && <span className="date-month">{monthShort.format(date).replace('.', '')}</span>}
                  {closed && <span className="date-closed">Cerrado</span>}
                </button>
              )
            })}
          </div>
          {currentWeek.hasSchedule && !selectedInCurrentWeek ? (
            <div className="week-empty">
              <p>Elige un día para ver las horas disponibles.</p>
            </div>
          ) : currentWeek.hasSchedule ? (
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
                      const unavailable = unavailableTimes.includes(item) || isPastTimeSlot(selectedDate, item, now)
                      return (
                        <button
                          type="button"
                          key={item}
                          disabled={unavailable}
                          className={`time-option ${time === item ? 'selected' : ''}`}
                          onClick={() => setTime(item)}
                          aria-pressed={time === item}
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
          ) : (
            <div className="week-empty">
              <p>Esta semana no hay horarios</p>
              <button type="button" className="week-empty-link" onClick={goToNextAvailableWeek}>Ir al próximo día disponible</button>
            </div>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="booking-content booking-checkout-content">
          <div className="booking-checkout-heading">
            <h2>¿Cómo te llamas?</h2>
            <p className="booking-checkout-lead">Te enviaremos los detalles de tu cita.</p>
          </div>
          <div className="booking-checkout-grid">
            <div className="booking-checkout-form-column">
              <div className="booking-checkout-form">
                <div className="checkout-field">
                  <label className="checkout-label" htmlFor="booking-name">Nombre completo <span className="required-mark" aria-hidden="true">*</span></label>
                  <input id="booking-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" required />
                </div>
                <div className="checkout-field">
                  <label className="checkout-label" htmlFor="booking-email">Correo electrónico <span className="required-mark" aria-hidden="true">*</span></label>
                  <input id="booking-email" type="email" autoComplete="email" aria-describedby="booking-email-help" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="hola@ejemplo.com" required />
                  <small id="booking-email-help" className="checkout-help">Aquí llegará la confirmación de tu cita.</small>
                </div>
                <div className="checkout-field">
                  <label className="checkout-label" htmlFor="booking-phone">Teléfono <span className="required-mark" aria-hidden="true">*</span></label>
                  <div className="checkout-phone">
                    <select id="booking-prefix" aria-label="Prefijo telefónico" defaultValue="+57">
                      <option value="+57">+57</option>
                    </select>
                    <input id="booking-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="300 123 4567" required />
                  </div>
                </div>
              </div>
              <div className="privacy-consent">
                <label className="privacy-consent-label">
                  <span className="privacy-checkbox">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(event) => togglePrivacy(event.target.checked)}
                      aria-describedby={privacyError ? 'privacy-consent-error' : undefined}
                    />
                    <span className="privacy-checkbox-box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                  </span>
                  <span className="privacy-consent-text">
                    Acepto la{' '}
                    <button
                      type="button"
                      className="privacy-link"
                      ref={privacyLinkRef}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setPrivacyOpen(true)
                      }}
                    >
                      política de privacidad
                    </button>{' '}
                    y el tratamiento de mis datos personales para gestionar mi cita.
                    <span className="required-mark" aria-hidden="true"> *</span>
                  </span>
                </label>
                {privacyError && <p id="privacy-consent-error" className="privacy-consent-error" role="alert">{privacyError}</p>}
              </div>
            </div>
            <aside className="booking-checkout-summary" aria-label="Resumen de tu cita">
              <h3>RESUMEN DE TU CITA</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-icon" aria-hidden="true"><Asterisk size={18} /></span>
                  <span className="summary-info">
                    <span>Servicio</span>
                    <strong>{service?.name ?? 'Sin seleccionar'}</strong>
                  </span>
                  <button type="button" className="summary-change" onClick={() => goToStep(0)} aria-label="Cambiar servicio">Cambiar</button>
                </div>
                <div className="summary-row">
                  <span className="summary-icon" aria-hidden="true"><CalendarDays size={18} /></span>
                  <span className="summary-info">
                    <span>Fecha y hora</span>
                    <strong>{summaryDate ? `${summaryDate}${time ? ` · ${time}` : ''}` : 'Sin seleccionar'}</strong>
                  </span>
                  <button type="button" className="summary-change" onClick={() => goToStep(2)} aria-label="Cambiar fecha y hora">Cambiar</button>
                </div>
                <div className="summary-row">
                  <span className="summary-icon" aria-hidden="true"><User size={18} /></span>
                  <span className="summary-info">
                    <span>Profesional</span>
                    <strong>{professional?.name ?? 'Sin preferencia'}</strong>
                  </span>
                  <button type="button" className="summary-change" onClick={() => goToStep(1)} aria-label="Cambiar profesional">Cambiar</button>
                </div>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong className="summary-total-price">
                  {service ? (
                    <>
                      <span className="currency-sign">$</span> {formatCOP(service.price).replace(/^\$\s*/, '')}
                    </>
                  ) : '—'}
                </strong>
              </div>
            </aside>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="booking-content confirmation booking-confirmation">
          <span className="success-icon" aria-hidden="true"><Check size={32} /></span>
          <span className="eyebrow">TODO LISTO, {name.split(' ')[0].toUpperCase()}</span>
          <h2 className="confirmation-heading">Tu momento ya<br /><em>está reservado.</em></h2>
          <p className="confirmation-message">Enviamos los detalles de tu cita a <strong>{email}</strong>.</p>
          <div className="confirmation-columns">
            <aside className="confirmation-summary" aria-label="Resumen de tu cita">
              <div className="confirmation-summary-head">
                <h3>TU CITA</h3>
                <span className="confirmation-code">Código <strong>BMC-24A7</strong></span>
              </div>
              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-icon" aria-hidden="true"><Asterisk size={18} /></span>
                  <span className="summary-info">
                    <span>Servicio</span>
                    <strong>{service?.name ?? 'Sin seleccionar'}</strong>
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-icon" aria-hidden="true"><CalendarDays size={18} /></span>
                  <span className="summary-info">
                    <span>Fecha y hora</span>
                    <strong>{confirmationDate}</strong>
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-icon" aria-hidden="true"><User size={18} /></span>
                  <span className="summary-info">
                    <span>Profesional</span>
                    <strong>{professional?.name ?? 'Sin preferencia'}</strong>
                  </span>
                </div>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{service ? formatCOP(service.price) : '—'}</strong>
              </div>
            </aside>
            <article className="confirmation-location">
              <div className="confirmation-map" aria-hidden="true"><MapPin size={46} /></div>
              <div className="confirmation-location-body">
                <span className="confirmation-location-title">DÓNDE TE ESPERAMOS</span>
                <strong className="confirmation-address">Calle Sur, 42, 123 Medellín, Colombia</strong>
                <a className="confirmation-map-link" href="https://www.google.com/maps/search/?api=1&query=Calle+Sur+42+123+Medellin+Colombia" target="_blank" rel="noreferrer">Ver en el mapa ↗</a>
              </div>
            </article>
          </div>
          <div className="confirmation-actions">
            <div className="confirmation-buttons">
              <Link
                href="/gestionar"
                className="confirmation-action-secondary"
                onClick={() => {
                  try {
                    sessionStorage.setItem('beautymc-manage-booking', JSON.stringify({
                      code: 'BMC-24A7',
                      email: email.trim(),
                      service: service?.name ?? 'Corte & peinado',
                      date: summaryDate ? summaryDate.replace(',', '') : 'martes 17 de noviembre',
                      dateKey: selectedDateKey ?? '2026-11-17',
                      time: time || '13:00',
                      professional: professional?.name ?? 'Sin preferencia',
                      price: service?.price ?? 200000,
                      status: 'confirmed',
                    }))
                  } catch {
                    // Si el navegador bloquea el almacenamiento, la gestión abre en modo búsqueda.
                  }
                }}
              >
                Cambiar o cancelar cita
              </Link>
            </div>
            <Link href="/" className="confirmation-home-link">Volver al inicio</Link>
          </div>
        </div>
      )}
      {privacyOpen && (
        <div
          className="privacy-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPrivacyOpen(false)
          }}
        >
          <div className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
            <header className="privacy-modal-header">
              <div>
                <h2 id="privacy-modal-title">Política de <em>privacidad</em></h2>
                <p className="privacy-modal-updated">Última actualización: {privacyUpdated}</p>
              </div>
              <button
                type="button"
                className="privacy-modal-close"
                ref={privacyCloseRef}
                onClick={() => setPrivacyOpen(false)}
                aria-label="Cerrar la política de privacidad"
              >
                <X size={20} />
              </button>
            </header>
            <div className="privacy-modal-body">
              <p className="privacy-modal-intro">En BeautyMC nos importa tu privacidad. Esta política explica qué datos personales recopilamos cuando reservas una cita, cómo los usamos y qué derechos tienes sobre ellos.</p>
              {privacySections.map((section, index) => (
                <section key={section.title} className="privacy-modal-section">
                  <h3>{index + 1}. {section.title}</h3>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
            <div className="privacy-modal-footer">
              <button type="button" className="privacy-modal-accept" onClick={() => setPrivacyOpen(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}

      {step < 4 && (
        <div className={`booking-actions${step === 3 ? ' booking-checkout-actions' : ''}`}>
          {step > 0 ? (
            <button className="back-button" onClick={back} type="button">
              <ArrowLeft size={16} /> Atrás
            </button>
          ) : (
            <Link href="/" className="back-button">
              <ArrowLeft size={16} /> Volver al inicio
            </Link>
          )}
          <div className="booking-actions-right">
            {step === 3 ? (
              <div className="booking-checkout-total">
                <span>Total</span>
                <strong>{service ? formatCOP(service.price) : '—'}</strong>
              </div>
            ) : service && (
              <div className="booking-selected-summary">
                <span className={step === 2 ? 'booking-date-summary' : undefined}>
                  {service.name}{step === 2 && compactDate ? ` · ${compactDate}${time ? `, ${time}` : ''}` : ''}
                </span>
                <strong>{formatCOP(service.price)}</strong>
              </div>
            )}
            <button
              className={`booking-continue-button${step === 3 && (!detailsComplete || !acceptedPrivacy) ? ' is-disabled' : ''}`}
              type="button"
              onClick={next}
              aria-disabled={step === 3 && confirmBlocked ? true : undefined}
              disabled={(step === 0 && !serviceId) || (step === 2 && (!selectedDateKey || !time)) || (step === 3 && !detailsComplete)}
            >
              {step === 3 ? 'Confirmar cita' : 'Continuar'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
      {step === 4 && <p className="demo-notice inline-notice">Prototipo BeautyMC · Tu información no se envía ni se guarda.</p>}
    </section>
  )
}
