'use client'

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { Banknote, Check, Clock3, Globe, MapPin, Phone, Sparkles, Upload } from 'lucide-react'
import { FilterDropdown } from '@/components/beautybook/dashboard-ui'
import { TimePicker } from '@/components/beautybook/admin/time-picker'
import { readImageFile } from '@/lib/image-upload'
import { isValidColombianPhone, isValidEmail } from '@/lib/validation'
import type { DaySchedule, Holiday } from '@/components/beautybook/admin/admin-shared'

const SALON_DEFAULTS = {
  name: 'BeautyMC',
  email: 'hola@beautymc.example',
  phone: '+57 300 000 0000',
  address: 'Calle Sur, 42, El Poblado, Medellín, Colombia',
  currency: 'COP ($) · Peso colombiano',
  timezone: 'Bogotá (GMT-5)',
  logo: '',
}

const CURRENCY_OPTIONS = ['COP ($) · Peso colombiano', 'EUR (€) · Euro', 'USD (US$) · Dólar estadounidense']
const TIMEZONE_OPTIONS = ['Bogotá (GMT-5)', 'Medellín (GMT-5)']

const DEFAULT_DAYS: DaySchedule[] = [
  { day: 'Lunes', open: '10:00 a.m.', close: '08:00 p.m.', enabled: true },
  { day: 'Martes', open: '10:00 a.m.', close: '08:00 p.m.', enabled: true },
  { day: 'Miércoles', open: '10:00 a.m.', close: '08:00 p.m.', enabled: true },
  { day: 'Jueves', open: '10:00 a.m.', close: '08:00 p.m.', enabled: true },
  { day: 'Viernes', open: '10:00 a.m.', close: '08:00 p.m.', enabled: true },
  { day: 'Sábado', open: '10:00 a.m.', close: '03:00 p.m.', enabled: true },
  { day: 'Domingo', open: '10:00 a.m.', close: '08:00 p.m.', enabled: false },
]

const DEFAULT_HOLIDAYS: Holiday[] = [
  { iso: '2026-12-08', reason: 'Día de las Velitas' },
  { iso: '2026-12-25', reason: 'Navidad' },
]

const HOLIDAY_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatHolidayDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return `${day} ${HOLIDAY_MONTHS[month - 1]}. ${year}`
}

function summarizeDays(days: DaySchedule[]) {
  const rows: { label: string; hours: string; open: boolean }[] = []
  days.forEach((item) => {
    const key = item.enabled ? `${item.open}|${item.close}` : 'closed'
    const last = rows[rows.length - 1] as unknown as
      { key: string; label: string; hours: string; open: boolean } | undefined
    if (last && (last as unknown as { key: string }).key === key) {
      const firstDay = last.label.split(' — ')[0]
      last.label = `${firstDay} — ${item.day}`
    } else {
      rows.push({
        label: item.day,
        hours: item.enabled ? `${item.open} — ${item.close}` : 'Cerrado',
        open: item.enabled,
        key,
      } as unknown as { label: string; hours: string; open: boolean })
    }
  })
  return rows
}

export function SettingsView({ notify }: { notify: (message: string) => void }) {
  const [section, setSection] = useState<'info' | 'horarios'>('info')
  const [infoSaved, setInfoSaved] = useState(false)
  const [hoursSaved, setHoursSaved] = useState(false)
  const [name, setName] = useState(SALON_DEFAULTS.name)
  const [contactEmail, setContactEmail] = useState(SALON_DEFAULTS.email)
  const [phone, setPhone] = useState(SALON_DEFAULTS.phone)
  const [address, setAddress] = useState(SALON_DEFAULTS.address)
  const [currency, setCurrency] = useState(SALON_DEFAULTS.currency)
  const [timezone, setTimezone] = useState(SALON_DEFAULTS.timezone)
  const [logo, setLogo] = useState(SALON_DEFAULTS.logo)
  const [days, setDays] = useState<DaySchedule[]>(DEFAULT_DAYS)
  const [holidays, setHolidays] = useState<Holiday[]>(DEFAULT_HOLIDAYS)
  const [newHolidayDate, setNewHolidayDate] = useState('2026-12-25')
  const [newHolidayReason, setNewHolidayReason] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)
  const summaryRows = useMemo(() => summarizeDays(days), [days])

  function pickLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    readImageFile(file, {
      onError: notify,
      onLoad: (dataUrl) => {
        setLogo(dataUrl)
      },
    })
  }

  function submitInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Ambos campos siguen siendo opcionales: solo se validan cuando tienen contenido.
    if (contactEmail.trim() && !isValidEmail(contactEmail.trim())) {
      notify('Escribe un correo de contacto válido.')
      return
    }
    if (phone.trim() && !isValidColombianPhone(phone)) {
      notify('Escribe un teléfono colombiano válido, por ejemplo +57 300 000 0000.')
      return
    }
    setInfoSaved(true)
    notify('Configuración guardada en esta vista de muestra.')
    window.setTimeout(() => setInfoSaved(false), 2400)
  }

  function discardInfo() {
    setName(SALON_DEFAULTS.name)
    setContactEmail(SALON_DEFAULTS.email)
    setPhone(SALON_DEFAULTS.phone)
    setAddress(SALON_DEFAULTS.address)
    setCurrency(SALON_DEFAULTS.currency)
    setTimezone(SALON_DEFAULTS.timezone)
    setLogo(SALON_DEFAULTS.logo)
    setInfoSaved(false)
    notify('Cambios descartados.')
  }

  function toggleDay(index: number) {
    setDays((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, enabled: !item.enabled } : item)),
    )
  }

  function editDayTime(index: number, field: 'open' | 'close', value: string) {
    setDays((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  function addHoliday() {
    if (!newHolidayDate) {
      notify('Selecciona la fecha del cierre.')
      return
    }
    if (!newHolidayReason.trim()) {
      notify('Indica el motivo del cierre.')
      return
    }
    if (holidays.some((item) => item.iso === newHolidayDate)) {
      notify('Ese cierre ya está registrado.')
      return
    }
    setHolidays((current) => [...current, { iso: newHolidayDate, reason: newHolidayReason.trim() }])
    setNewHolidayReason('')
    notify('Cierre especial añadido.')
  }

  function removeHoliday(iso: string) {
    setHolidays((current) => current.filter((item) => item.iso !== iso))
  }

  function submitHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHoursSaved(true)
    notify('Horarios guardados en esta vista de muestra.')
    window.setTimeout(() => setHoursSaved(false), 2400)
  }

  function discardHours() {
    setDays(DEFAULT_DAYS)
    setHolidays(DEFAULT_HOLIDAYS)
    setNewHolidayDate('2026-12-25')
    setNewHolidayReason('')
    setHoursSaved(false)
    notify('Cambios descartados.')
  }

  return (
    <div className="bb-page-stack">
      <section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-settings-title">
        <div className="bb-hello-mark" aria-hidden="true">
          b
        </div>
        <div className="bb-hello-copy">
          <span className="bb-hello-eyebrow">
            <span>AJUSTES DEL SISTEMA</span>
            <i className="bb-hello-dot" aria-hidden="true" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
            </span>
            <span>SALÓN OPERATIVO</span>
          </span>
          <h2 id="bb-settings-title">Configuración</h2>
          <p>Personaliza la identidad, horarios, reglas de reserva y notificaciones de BeautyMC.</p>
        </div>
        <div className="bb-agenda-side">
          <div className="bb-agenda-capsule" role="list" aria-label="Resumen de configuración">
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">MONEDA</span>
              <strong className="bb-agenda-value">COP ($)</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">ZONA HORARIA</span>
              <strong className="bb-agenda-value is-accent">Bogotá (GMT-5)</strong>
            </div>
          </div>
        </div>
      </section>
      <div className="bb-settings-layout">
        <div className="bb-settings-side">
          <nav className="bb-settings-nav bb-settings-menu" aria-label="Secciones de configuración">
            <button type="button" className={section === 'info' ? 'is-current' : ''} onClick={() => setSection('info')}>
              <Sparkles />
              Información del salón
            </button>
            <button
              type="button"
              className={section === 'horarios' ? 'is-current' : ''}
              onClick={() => setSection('horarios')}
            >
              <Clock3 />
              Horarios de apertura
            </button>
          </nav>
          <div className="bb-card-preview" aria-label="Vista previa de tarjeta">
            <div className="bb-card-preview-head">
              <span>VISTA PREVIA DE TARJETA</span>
              <i />
            </div>
            <div className="bb-card-preview-brand">
              <span className="bb-card-preview-logo" aria-hidden="true">
                {logo ? <Image src={logo} alt="" fill sizes="80px" unoptimized /> : 'b'}
              </span>
              <span>
                <strong>{name || SALON_DEFAULTS.name}</strong>
                <small>Medellín · Reservas online</small>
              </span>
            </div>
            <div className="bb-card-preview-contact">
              <span>
                <Phone aria-hidden="true" />
                {phone || SALON_DEFAULTS.phone}
              </span>
              <span>
                <MapPin aria-hidden="true" />
                {address || SALON_DEFAULTS.address}
              </span>
            </div>
          </div>
        </div>
        {section === 'info' ? (
          <form className="bb-panel bb-settings-form bb-salon-form" onSubmit={submitInfo}>
            <div className="bb-salon-head">
              <div>
                <h2>Información del salón</h2>
                <p>Esta información aparece en tus comunicaciones, comprobantes y portal de reservas.</p>
              </div>
              <div className="bb-salon-logo">
                <span className="bb-salon-logo-mark" aria-hidden="true">
                  {logo ? <Image src={logo} alt="" fill sizes="96px" unoptimized /> : 'b'}
                </span>
                <span className="bb-salon-logo-copy">
                  <strong>Logo del salón</strong>
                  <button type="button" onClick={() => logoRef.current?.click()}>
                    <Upload aria-hidden="true" />
                    Cambiar logo
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" onChange={pickLogo} style={{ display: 'none' }} />
                </span>
              </div>
            </div>
            <div className="bb-settings-fields">
              <label>
                Nombre del salón
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="BeautyMC"
                  autoComplete="off"
                />
              </label>
              <div className="bb-form-row">
                <label>
                  Correo de contacto
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder="hola@beautymc.example"
                    autoComplete="off"
                  />
                </label>
                <label>
                  Teléfono / WhatsApp
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+57 300 000 0000"
                    autoComplete="off"
                  />
                </label>
              </div>
              <label>
                Dirección
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Calle Sur, 42, El Poblado, Medellín, Colombia"
                  autoComplete="off"
                />
              </label>
              <div className="bb-form-row">
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Moneda</span>
                  </div>
                  <FilterDropdown
                    icon={Banknote}
                    value={currency}
                    options={CURRENCY_OPTIONS}
                    onChange={setCurrency}
                    label="Moneda"
                  />
                </div>
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Zona horaria</span>
                  </div>
                  <FilterDropdown
                    icon={Globe}
                    value={timezone}
                    options={TIMEZONE_OPTIONS}
                    onChange={setTimezone}
                    label="Zona horaria"
                  />
                </div>
              </div>
            </div>
            <div className="bb-hours-card">
              <div className="bb-hours-card-head">
                <strong>Horario habitual vigente</strong>
                <button type="button" onClick={() => setSection('horarios')}>
                  Editar horarios →
                </button>
              </div>
              {summaryRows.map((row) => (
                <div className="bb-hours-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong className={row.open ? '' : 'is-closed'}>{row.hours}</strong>
                  <span className={row.open ? 'bb-pill-open' : 'bb-pill-closed'}>
                    {row.open ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              ))}
            </div>
            <div className="bb-form-submit">
              <span>{infoSaved ? 'Cambios guardados' : 'Última actualización: 17 nov. 2026'}</span>
              <span className="bb-form-actions">
                <button type="button" className="bb-button bb-button-outline" onClick={discardInfo}>
                  Descartar
                </button>
                <button type="submit" className="bb-button bb-button-primary">
                  <Check aria-hidden="true" />
                  Guardar cambios
                </button>
              </span>
            </div>
          </form>
        ) : (
          <form className="bb-panel bb-settings-form bb-salon-form" onSubmit={submitHours}>
            <div className="bb-salon-head">
              <div>
                <h2>Horarios de apertura</h2>
                <p>Configura la disponibilidad semanal del salón y las fechas especiales de cierre.</p>
              </div>
            </div>
            <div className="bb-schedule-card">
              {days.map((item, index) => (
                <div className={`bb-schedule-row${item.enabled ? '' : ' is-off'}`} key={item.day}>
                  <button
                    type="button"
                    className={`bb-toggle${item.enabled ? ' is-on' : ''}`}
                    role="switch"
                    aria-checked={item.enabled}
                    aria-label={`${item.day} ${item.enabled ? 'abierto' : 'cerrado'}`}
                    onClick={() => toggleDay(index)}
                  >
                    <i />
                  </button>
                  <strong className="bb-schedule-day">{item.day}</strong>
                  {item.enabled ? (
                    <span className="bb-schedule-times">
                      <TimePicker
                        value={item.open}
                        onChange={(display) => editDayTime(index, 'open', display)}
                        label={`Apertura del ${item.day}`}
                      />
                      <span className="bb-schedule-dash" aria-hidden="true">
                        —
                      </span>
                      <TimePicker
                        value={item.close}
                        onChange={(display) => editDayTime(index, 'close', display)}
                        label={`Cierre del ${item.day}`}
                        align="right"
                      />
                    </span>
                  ) : (
                    <span className="bb-schedule-rest">Día de descanso del estudio</span>
                  )}
                  <span className={item.enabled ? 'bb-pill-open' : 'bb-pill-closed'}>
                    {item.enabled ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              ))}
            </div>
            <div className="bb-holidays-card">
              <div className="bb-holidays-head">
                <div>
                  <strong>Días festivos y cierres especiales</strong>
                  <p>Bloquea días puntuales para que no aparezcan disponibles en reservas online.</p>
                </div>
                <div className="bb-holidays-add">
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={(event) => setNewHolidayDate(event.target.value)}
                    aria-label="Fecha del cierre"
                  />
                  <input
                    value={newHolidayReason}
                    onChange={(event) => setNewHolidayReason(event.target.value)}
                    placeholder="Motivo (ej. Navidad)"
                    aria-label="Motivo del cierre"
                    autoComplete="off"
                  />
                  <button type="button" className="bb-button bb-button-primary" onClick={addHoliday}>
                    + Añadir
                  </button>
                </div>
              </div>
              <div className="bb-holiday-chips">
                {holidays.map((item) => (
                  <span className="bb-holiday-chip" key={item.iso}>
                    <strong>{formatHolidayDate(item.iso)}</strong>
                    <span> · {item.reason}</span>
                    <button
                      type="button"
                      onClick={() => removeHoliday(item.iso)}
                      aria-label={`Quitar cierre ${item.reason}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {holidays.length === 0 && <span className="bb-holidays-empty">Sin cierres especiales.</span>}
              </div>
            </div>
            <div className="bb-form-submit">
              <span>{hoursSaved ? 'Cambios guardados' : 'Última actualización: 17 nov. 2026'}</span>
              <span className="bb-form-actions">
                <button type="button" className="bb-button bb-button-outline" onClick={discardHours}>
                  Descartar
                </button>
                <button type="submit" className="bb-button bb-button-primary">
                  <Check aria-hidden="true" />
                  Guardar cambios
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
