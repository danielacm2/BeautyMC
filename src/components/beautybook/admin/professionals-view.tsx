'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { demoProfessionals, demoServices, type DemoAppointment } from '@/lib/dashboard-demo-data'
import { DeleteDialog, DialogBackdrop, Modal, StatusBadge, useEscapeKey } from '@/components/beautybook/dashboard-ui'
import { isValidEmail } from '@/lib/validation'
import { serviceProfessionals } from '@/lib/beautybook-data'
import { TimePicker, parseDisplayTime } from '@/components/beautybook/admin/time-picker'
import { categoryLabel, type ProfessionalForm, type ProfessionalItem } from '@/components/beautybook/admin/admin-shared'

function ProfessionalDetailModal({
  professional,
  categories,
  appointments,
  onClose,
}: {
  professional: ProfessionalItem
  categories: string[]
  appointments: DemoAppointment[]
  onClose: () => void
}) {
  useEscapeKey(onClose)
  const todayAppointments = appointments.filter(
    (appointment) => appointment.professional === professional.name && appointment.date.startsWith('Hoy'),
  )
  return (
    <DialogBackdrop onClose={onClose}>
      <section className="bb-service-card" role="dialog" aria-modal="true" aria-labelledby="bb-pro-title">
        <div className="bb-detail-head">
          <button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
          <span className="bb-detail-eyebrow">{professional.specialty.toUpperCase()}</span>
          <div className="bb-detail-person">
            {professional.image ? (
              <span className="bb-detail-photo" aria-hidden="true">
                <Image src={professional.image} alt="" fill sizes="112px" />
              </span>
            ) : (
              <span className="bb-detail-avatar" aria-hidden="true">
                {professional.initials}
              </span>
            )}
            <div className="bb-detail-identity">
              <div className="bb-service-titlerow">
                <h2 id="bb-pro-title">{professional.name}</h2>
                <StatusBadge status={professional.active ? 'Activo' : 'Inactivo'} />
              </div>
              <span className="bb-detail-role">{professional.specialty}</span>
              {professional.email && <span className="bb-detail-contact">{professional.email}</span>}
            </div>
          </div>
        </div>
        <div className="bb-detail-body">
          {professional.bio && (
            <div className="bb-service-desc">
              <span>PERFIL PROFESIONAL</span>
              <p>{professional.bio}</p>
            </div>
          )}
          <div className="bb-detail-grid">
            <div className="bb-detail-item">
              <span>
                <Clock3 aria-hidden="true" />
                HORARIO HABITUAL
              </span>
              <strong>{professional.schedule}</strong>
            </div>
            <div className="bb-detail-item">
              <span>
                <Sparkles aria-hidden="true" />
                SERVICIOS ASIGNADOS
              </span>
              <span className="bb-team-tags">
                {categories.length ? (
                  categories.map((item) => (
                    <span key={item} className="bb-category-chip">
                      {categoryLabel(item)}
                    </span>
                  ))
                ) : (
                  <span className="bb-team-none">Sin categorías asignadas</span>
                )}
              </span>
            </div>
          </div>
          <div className="bb-agenda-today">
            <div className="bb-agenda-today-head">
              <span>
                <CalendarDays aria-hidden="true" />
                AGENDA DE HOY
              </span>
              <span>{professional.appointments} citas esta semana</span>
            </div>
            {todayAppointments.length ? (
              todayAppointments.map((appointment) => (
                <div className="bb-agenda-today-row" key={appointment.id}>
                  <strong>{appointment.time}</strong>
                  <span>{appointment.customer}</span>
                  <small>{appointment.service}</small>
                </div>
              ))
            ) : (
              <div className="bb-agenda-today-row">
                <span>Sin citas para hoy</span>
              </div>
            )}
          </div>
        </div>
        <div className="bb-service-foot">
          <button type="button" className="bb-button bb-button-outline" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </section>
    </DialogBackdrop>
  )
}

function parseSchedule(value: string) {
  const [daysPart = '', timesPart = ''] = value.split('·').map((part) => part.trim())
  const shorts = daysPart
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  let days: string[]
  if (shorts.length > 1 || !(shorts[0] ?? '').includes('–')) {
    days = weekDayOptions.filter((option) => shorts.includes(option.short)).map((option) => option.value)
  } else {
    const [from = '', to = ''] = shorts[0].split('–').map((part) => part.trim())
    const order = weekDayOptions.map((option) => option.short)
    const startIndex = order.indexOf(from)
    const endIndex = order.indexOf(to)
    const inRange =
      startIndex === -1 || endIndex === -1
        ? order
        : startIndex <= endIndex
          ? order.slice(startIndex, endIndex + 1)
          : [...order.slice(startIndex), ...order.slice(0, endIndex + 1)]
    days = weekDayOptions.filter((option) => inRange.includes(option.short)).map((option) => option.value)
  }
  const [start = '', end = ''] = timesPart.split('–').map((part) => part.trim())
  return { days: days.length ? days : weekDayOptions.map((option) => option.value), start, end }
}

function EditProfessionalModal({
  initial,
  onClose,
  onSave,
}: {
  initial: ProfessionalItem
  onClose: () => void
  onSave: (draft: ProfessionalForm & { specialty: string }) => void
}) {
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
    setEnabledCategories((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
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
    const daysShort = weekDayOptions
      .filter((option) => schedDays.includes(option.value))
      .map((option) => option.short)
      .join(', ')
    const labels = enabledCategories.map(categoryLabel)
    setError('')
    onSave({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      bio: bio.trim(),
      schedule: `${daysShort} · ${schedStart}–${schedEnd}`,
      categories: enabledCategories,
      image: preview || '/beauty-service-hair.png',
      specialty: labels.slice(0, 2).join(' & ') || 'General',
    })
  }

  return (
    <div className="bb-book-modal">
      <Modal title="Editar profesional" description="EDITAR EQUIPO" onClose={onClose}>
        <form className="bb-form bb-book-form" onSubmit={submit} noValidate>
          <div className="bb-book-grid">
            <div className="bb-book-col">
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Foto de perfil</span>
                </div>
                {preview ? (
                  <>
                    <span className="bb-photo-circle">
                      <Image src={preview} alt={`Foto de ${name || 'profesional'}`} fill sizes="240px" unoptimized />
                    </span>
                    <div className="bb-upload-row">
                      <button
                        type="button"
                        className="bb-button bb-button-outline"
                        onClick={() => fileRef.current?.click()}
                      >
                        Cambiar
                      </button>
                      <button type="button" className="bb-button bb-button-outline" onClick={() => setImageData('')}>
                        Quitar
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} />
                    </div>
                  </>
                ) : (
                  <label className="bb-upload-box">
                    <input type="file" accept="image/*" onChange={pickImage} />
                    <ImagePlus aria-hidden="true" />
                    <strong>Agregar foto</strong>
                    <small>Desde tu computador o dispositivo</small>
                  </label>
                )}
                <span className="bb-photo-hint">Visible para clientas al agendar</span>
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Descripción del perfil *</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Experiencia, estilo y especialidades del profesional..."
                  rows={3}
                />
              </div>
            </div>
            <div className="bb-book-col">
              <div className="bb-form-row">
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Nombre completo *</span>
                  </div>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Camila Duarte"
                    autoComplete="off"
                  />
                </div>
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Número de contacto *</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="300 123 4567"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="bb-form-row">
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Correo de acceso *</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="camila@beautymc.co"
                    autoComplete="off"
                  />
                </div>
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Contraseña *</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Horario laboral *</span>
                </div>
                <MultiDayPicker selected={schedDays} onChange={setSchedDays} label="Días laborables" />
                <div className="bb-form-row bb-schedule-row">
                  <TimePicker
                    value={schedStart}
                    onChange={setSchedStart}
                    label="Hora de entrada"
                    placeholder="Entrada"
                  />
                  <TimePicker
                    value={schedEnd}
                    onChange={setSchedEnd}
                    label="Hora de salida"
                    placeholder="Salida"
                    align="right"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bb-field">
            <div className="bb-field-head">
              <span>Servicios habilitados</span>
            </div>
            <div className="bb-enable-chips" role="group" aria-label="Servicios habilitados">
              {availableCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={enabledCategories.includes(item)}
                  className={enabledCategories.includes(item) ? 'is-on' : ''}
                  onClick={() => toggleCategory(item)}
                >
                  {categoryLabel(item)}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="bb-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="bb-book-actions">
            <button type="button" className="bb-button bb-button-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="bb-button bb-button-primary">
              <Check aria-hidden="true" />
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function DeleteProfessionalModal({
  professional,
  onClose,
  onConfirm,
}: {
  professional: ProfessionalItem
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DeleteDialog
      titleId="bb-delete-pro-title"
      descriptionId="bb-delete-pro-description"
      icon={Trash2}
      title="¿Eliminar este profesional?"
      description="Estás a punto de eliminar permanentemente este perfil del equipo. Esta acción no se puede deshacer."
      confirmLabel="Sí, eliminar"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="bb-delete-top">
        <strong>{professional.specialty.toUpperCase()}</strong>
        <span>{professional.schedule}</span>
      </div>
      <strong className="bb-delete-name">{professional.name}</strong>
      <span className="bb-delete-service">{professional.appointments} citas esta semana</span>
    </DeleteDialog>
  )
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

function MultiDayPicker({
  selected,
  onChange,
  label,
}: {
  selected: string[]
  onChange: (days: string[]) => void
  label: string
}) {
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

  const display =
    weekDayOptions
      .filter((option) => selected.includes(option.value))
      .map((option) => option.short)
      .join(', ') || 'Seleccionar días'
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
        <CalendarDays aria-hidden="true" />
        <span>{display}</span>
        <ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <ul className="bb-dropdown-list" role="listbox" aria-label={label} aria-multiselectable="true">
          {weekDayOptions.map((option) => {
            const checked = selected.includes(option.value)
            return (
              <li key={option.value} role="option" aria-selected={checked}>
                <button type="button" className={checked ? 'is-selected' : ''} onClick={() => toggle(option.value)}>
                  <span>{option.value}</span>
                  <span className="bb-check" aria-hidden="true">
                    {checked && <Check />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
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
    setEnabledCategories((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
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
    const daysShort = weekDayOptions
      .filter((option) => schedDays.includes(option.value))
      .map((option) => option.short)
      .join(', ')
    setError('')
    onSave({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      bio: bio.trim(),
      schedule: `${daysShort} · ${schedStart}–${schedEnd}`,
      categories: enabledCategories,
      image: imageData,
    })
  }

  return (
    <div className="bb-book-modal">
      <Modal title="Añadir profesional al equipo" description="NUEVO INTEGRANTE" onClose={onClose}>
        <form className="bb-form bb-book-form" onSubmit={submit} noValidate>
          <div className="bb-book-grid">
            <div className="bb-book-col">
              <div className="bb-field bb-photo-field">
                <div className="bb-field-head">
                  <span>Foto de perfil</span>
                </div>
                {imageData ? (
                  <>
                    <span className="bb-photo-circle">
                      <Image
                        src={imageData}
                        alt={`Foto de ${name || 'nuevo profesional'}`}
                        fill
                        sizes="240px"
                        unoptimized
                      />
                    </span>
                    <div className="bb-upload-row">
                      <button
                        type="button"
                        className="bb-button bb-button-outline"
                        onClick={() => fileRef.current?.click()}
                      >
                        Cambiar
                      </button>
                      <button type="button" className="bb-button bb-button-outline" onClick={() => setImageData('')}>
                        Quitar
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} />
                    </div>
                  </>
                ) : (
                  <label className="bb-upload-box">
                    <input type="file" accept="image/*" onChange={pickImage} />
                    <ImagePlus aria-hidden="true" />
                    <strong>Agregar foto</strong>
                    <small>Desde tu computador o dispositivo</small>
                  </label>
                )}
                <span className="bb-photo-hint">Visible para clientas al agendar</span>
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Descripción del perfil *</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Experiencia, estilo y especialidades del profesional..."
                  rows={3}
                />
              </div>
            </div>
            <div className="bb-book-col">
              <div className="bb-form-row">
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Nombre completo *</span>
                  </div>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Camila Duarte"
                    autoComplete="off"
                  />
                </div>
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Número de contacto *</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="300 123 4567"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="bb-form-row">
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Correo de acceso *</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="camila@beautymc.co"
                    autoComplete="off"
                  />
                </div>
                <div className="bb-field">
                  <div className="bb-field-head">
                    <span>Contraseña *</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Horario laboral *</span>
                </div>
                <MultiDayPicker selected={schedDays} onChange={setSchedDays} label="Días laborables" />
                <div className="bb-form-row bb-schedule-row">
                  <TimePicker
                    value={schedStart}
                    onChange={setSchedStart}
                    label="Hora de entrada"
                    placeholder="Entrada"
                  />
                  <TimePicker
                    value={schedEnd}
                    onChange={setSchedEnd}
                    label="Hora de salida"
                    placeholder="Salida"
                    align="right"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bb-field">
            <div className="bb-field-head">
              <span>Servicios habilitados</span>
            </div>
            <div className="bb-enable-chips" role="group" aria-label="Servicios habilitados">
              {availableCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={enabledCategories.includes(item)}
                  className={enabledCategories.includes(item) ? 'is-on' : ''}
                  onClick={() => toggleCategory(item)}
                >
                  {categoryLabel(item)}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="bb-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="bb-book-actions">
            <button type="button" className="bb-button bb-button-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="bb-button bb-button-primary">
              <Plus aria-hidden="true" />
              Añadir profesional
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function ProfessionalsView({
  professionals,
  appointments,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  notify,
}: {
  professionals: typeof demoProfessionals
  appointments: DemoAppointment[]
  onToggle: (id: string) => void
  onAdd: (draft: ProfessionalForm & { specialty: string }) => void
  onEdit: (id: string, draft: ProfessionalForm & { specialty: string }) => void
  onDelete: (id: string) => void
  notify: (message: string) => void
}) {
  const activeProfessionals = professionals.filter((person) => person.active).length
  const weekAppointments = professionals.reduce((sum, person) => sum + (person.appointments ?? 0), 0)
  const [teamQuery, setTeamQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [teamDetail, setTeamDetail] = useState<ProfessionalItem | null>(null)
  const [teamEditing, setTeamEditing] = useState<ProfessionalItem | null>(null)
  const [teamDeleting, setTeamDeleting] = useState<ProfessionalItem | null>(null)
  const [addingProfessional, setAddingProfessional] = useState(false)
  const categoryFilters = useMemo(
    () =>
      Array.from(new Set(demoServices.map((service) => service.category))).map((value) => ({
        value,
        label: categoryLabel(value),
        count: professionals.filter((person) =>
          demoServices.some(
            (service) => service.category === value && serviceProfessionals[service.id]?.includes(person.id),
          ),
        ).length,
      })),
    [professionals],
  )
  const visibleIds = useMemo(
    () =>
      new Set(
        professionals
          .filter((person) =>
            demoServices.some(
              (service) => service.category === categoryFilter && serviceProfessionals[service.id]?.includes(person.id),
            ),
          )
          .map((person) => person.id),
      ),
    [professionals, categoryFilter],
  )
  const filteredTeam = useMemo(
    () =>
      professionals.filter(
        (person) =>
          `${person.name} ${person.specialty}`.toLowerCase().includes(teamQuery.toLowerCase()) &&
          (categoryFilter === 'Todas' || visibleIds.has(person.id)),
      ),
    [professionals, teamQuery, categoryFilter, visibleIds],
  )

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
  return (
    <div className="bb-page-stack">
      <section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-team-title">
        <div className="bb-hello-mark" aria-hidden="true">
          b
        </div>
        <div className="bb-hello-copy">
          <span className="bb-hello-eyebrow">
            <span>EQUIPO DEL SALÓN</span>
            <i className="bb-hello-dot" aria-hidden="true" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
            </span>
            <span>{activeProfessionals} ESPECIALISTAS ACTIVOS</span>
          </span>
          <h2 id="bb-team-title">Profesionales</h2>
          <p>Gestiona los perfiles, horarios, especialidades y visibilidad de tu equipo en el salón.</p>
        </div>
        <div className="bb-agenda-side">
          <div className="bb-agenda-capsule" role="list" aria-label="Resumen del equipo">
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">ACTIVOS</span>
              <strong className="bb-agenda-value">{activeProfessionals}</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">CITAS SEMANA</span>
              <strong className="bb-agenda-value">{weekAppointments}</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="bb-panel bb-table-panel bb-agenda-card bb-team-filter-card">
        <div className="bb-agenda-controls bb-team-filter">
          <div className="bb-agenda-tabs" role="tablist" aria-label="Filtrar por categoría">
            <button
              type="button"
              role="tab"
              aria-selected={categoryFilter === 'Todas'}
              className={categoryFilter === 'Todas' ? 'is-active' : ''}
              onClick={() => setCategoryFilter('Todas')}
            >
              Todos <span className="bb-count-beige">{professionals.length}</span>
            </button>
            {categoryFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={categoryFilter === item.value}
                className={categoryFilter === item.value ? 'is-active' : ''}
                onClick={() => setCategoryFilter(item.value)}
              >
                {item.label} {item.count}
              </button>
            ))}
          </div>
          <div className="bb-team-actions">
            <label className="bb-agenda-search bb-team-search">
              <Search aria-hidden="true" />
              <input
                value={teamQuery}
                onChange={(event) => setTeamQuery(event.target.value)}
                placeholder="Buscar especialista o especialidad..."
                aria-label="Buscar especialista"
              />
            </label>
            <button
              type="button"
              className="bb-hello-primary bb-agenda-new"
              onClick={() => setAddingProfessional(true)}
            >
              <Plus aria-hidden="true" />
              Añadir profesional
            </button>
          </div>
        </div>
      </section>
      <div className="bb-team-grid">
        {filteredTeam.map((person) => (
          <article className="bb-team-card" key={person.id}>
            <div className="bb-team-top">
              <span className="bb-team-avatar" aria-hidden="true">
                {person.image ? (
                  <Image src={person.image} alt="" fill sizes="104px" />
                ) : (
                  <span className="bb-team-initials">{person.initials}</span>
                )}
                {person.active && <i className="bb-team-dot" />}
              </span>
              <span className="bb-team-identity">
                <strong>{person.name}</strong>
                <span className="bb-team-tags">
                  {categoriesOf(person).map((item) => (
                    <span key={item} className="bb-category-chip">
                      {categoryLabel(item)}
                    </span>
                  ))}
                </span>
              </span>
              <span className="bb-team-side">
                <StatusBadge status={person.active ? 'Activo' : 'Inactivo'} />
                <span className="bb-ghost-actions">
                  <button
                    type="button"
                    className="bb-ghost-btn bb-ghost-view"
                    aria-label={`Ver perfil de ${person.name}`}
                    onClick={() => setTeamDetail(person)}
                  >
                    <Eye aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="bb-ghost-btn bb-ghost-edit"
                    aria-label={`Editar perfil de ${person.name}`}
                    onClick={() => setTeamEditing(person)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="bb-ghost-btn bb-ghost-delete"
                    aria-label={`Eliminar perfil de ${person.name}`}
                    onClick={() => setTeamDeleting(person)}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </span>
              </span>
            </div>
            <div className="bb-team-boxes">
              <div className="bb-team-box">
                <span>
                  <Clock3 aria-hidden="true" />
                  HORARIO
                </span>
                <strong>{person.schedule}</strong>
              </div>
              <div className="bb-team-box">
                <span>
                  <CalendarDays aria-hidden="true" />
                  ESTA SEMANA
                </span>
                <strong>{person.appointments} citas programadas</strong>
              </div>
            </div>
            <div className="bb-team-foot">
              <span className="bb-team-visibility">
                <span>Perfil visible en reservas</span>
                <button
                  className={`bb-switch ${person.active ? 'is-on' : ''}`}
                  role="switch"
                  aria-checked={person.active}
                  aria-label={`${person.active ? 'Desactivar' : 'Activar'} perfil de ${person.name}`}
                  onClick={() => onToggle(person.id)}
                >
                  <i />
                </button>
              </span>
            </div>
          </article>
        ))}
        {filteredTeam.length === 0 && (
          <div className="bb-panel bb-table-panel bb-agenda-card">
            <div className="bb-empty-state">
              <Search aria-hidden="true" />
              <strong>No hay especialistas con estos filtros</strong>
              <span>Prueba con otra especialidad o término de búsqueda.</span>
            </div>
          </div>
        )}
      </div>
      {teamDetail && (
        <ProfessionalDetailModal
          professional={teamDetail}
          categories={categoriesOf(teamDetail)}
          appointments={appointments}
          onClose={() => setTeamDetail(null)}
        />
      )}
      {teamEditing && (
        <EditProfessionalModal
          key={teamEditing.id}
          initial={teamEditing}
          onClose={cancelProfessionalEdit}
          onSave={(draft) => saveProfessionalEdit(teamEditing.id, draft)}
        />
      )}
      {teamDeleting && (
        <DeleteProfessionalModal
          professional={teamDeleting}
          onClose={cancelProfessionalDelete}
          onConfirm={confirmProfessionalDelete}
        />
      )}
      {addingProfessional && <AddProfessionalModal onClose={cancelProfessionalCreate} onSave={saveProfessional} />}
    </div>
  )
}
