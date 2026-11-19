'use client'

import { useMemo, useState, type FormEvent } from 'react'
import {
  CalendarDays,
  Check,
  Clock3,
  Eye,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  User,
} from 'lucide-react'
import { demoProfessionals, demoServices, type DemoAppointment } from '@/lib/dashboard-demo-data'
import {
  DeleteDialog,
  DialogBackdrop,
  FilterDropdown,
  Modal,
} from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'
import { isValidColombianPhone, isValidEmail } from '@/lib/validation'
import { formatAgendaDate, initialsOf, type AppointmentDraft } from '@/components/beautybook/admin/admin-shared'

const agendaDayOptions = ['Todas las fechas', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const weekdayLabels: Record<string, string> = {
  Hoy: 'Sábado',
  Lun: 'Lunes',
  Mar: 'Martes',
  Mié: 'Miércoles',
  Jue: 'Jueves',
  Vie: 'Viernes',
  Sáb: 'Sábado',
  Dom: 'Domingo',
}

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

export function CreateAppointmentModal({
  onClose,
  onSave,
  initial,
  title = 'Agendar cita',
  eyebrow = 'NUEVA RESERVA',
  submitLabel = 'Guardar cita',
}: {
  onClose: () => void
  onSave: (draft: AppointmentDraft) => void
  initial?: AppointmentDraft
  title?: string
  eyebrow?: string
  submitLabel?: string
}) {
  const [serviceId, setServiceId] = useState(initial?.serviceId ?? '')
  const [professional, setProfessional] = useState(initial?.professional ?? '')
  const [dateISO, setDateISO] = useState(initial?.dateISO ?? '')
  const [time, setTime] = useState(initial?.time ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [error, setError] = useState('')
  const days = useMemo(() => upcomingAgendaDays(14), [])
  const timeOptions = useMemo(
    () =>
      initial?.time && !agendaTimeSlots.includes(initial.time)
        ? [...agendaTimeSlots, initial.time].sort()
        : agendaTimeSlots,
    [initial],
  )
  const legacyService = initial?.legacyService
  const catalogService = demoServices.find((item) => item.id === serviceId)
  // Una cita puede conservar un servicio que ya no está en el catálogo mientras no se elija otro.
  const service = catalogService ?? (serviceId === '' ? legacyService : undefined)
  const serviceValue = service ? `${service.name} · ${formatCOP(service.price)}` : 'Seleccionar servicio'
  const serviceOptions = [
    ...(legacyService ? [`${legacyService.name} · ${formatCOP(legacyService.price)}`] : []),
    ...demoServices.map((item) => `${item.name} · ${formatCOP(item.price)}`),
  ]
  const dateValue = days.find((day) => day.iso === dateISO)?.label ?? initial?.dateLabel ?? 'Seleccionar fecha'

  function selectService(display: string) {
    const found = demoServices.find((item) => `${item.name} · ${formatCOP(item.price)}` === display)
    if (found) setServiceId(found.id)
    else if (legacyService) setServiceId('')
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
    if (!isValidColombianPhone(phone)) {
      setError('Escribe un teléfono colombiano válido, por ejemplo 300 123 4567.')
      return
    }
    setError('')
    onSave({
      serviceId,
      professional,
      dateISO,
      dateLabel: initial?.dateLabel ?? '',
      time,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status: initial?.status ?? 'Pendiente',
    })
  }

  return (
    <div className="bb-book-modal">
      <Modal title={title} description={eyebrow} onClose={onClose}>
        <form className="bb-form bb-book-form" onSubmit={submit} noValidate>
          <div className="bb-book-grid">
            <div className="bb-book-col">
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Cliente</span>
                  <button
                    type="button"
                    className="bb-field-link"
                    onClick={() => {
                      setName('')
                      setEmail('')
                      setPhone('')
                    }}
                  >
                    + Nuevo cliente
                  </button>
                </div>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre del cliente"
                  autoComplete="off"
                />
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Servicio</span>
                </div>
                <FilterDropdown
                  icon={Sparkles}
                  value={serviceValue}
                  options={serviceOptions}
                  onChange={selectService}
                  label="Servicio"
                />
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Profesional</span>
                </div>
                <FilterDropdown
                  icon={User}
                  value={professional || 'Seleccionar especialista'}
                  options={demoProfessionals.map((person) => person.name)}
                  onChange={setProfessional}
                  label="Especialista"
                />
              </div>
            </div>
            <div className="bb-book-col">
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Fecha de la reserva</span>
                </div>
                <FilterDropdown
                  icon={CalendarDays}
                  value={dateValue}
                  options={days.map((day) => day.label)}
                  onChange={(display) => setDateISO(days.find((day) => day.label === display)?.iso ?? '')}
                  label="Fecha de la reserva"
                />
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Horarios disponibles</span>
                </div>
                <div className="bb-time-chips" role="group" aria-label="Horarios disponibles">
                  {timeOptions.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={time === slot ? 'is-selected' : ''}
                      aria-pressed={time === slot}
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bb-form-row">
            <label>
              Correo electrónico *
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hola@ejemplo.com"
                autoComplete="off"
              />
            </label>
            <label>
              Teléfono *
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="300 123 4567"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="bb-book-summary">
            <div>
              <span>RESUMEN DE RESERVA</span>
              <strong>{service ? `${service.name} · ${time || '--:--'}` : 'Selecciona un servicio'}</strong>
            </div>
            <div className="bb-book-total">
              <span>TOTAL ESTIMADO</span>
              <strong>{service ? formatCOP(service.price) : '—'}</strong>
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
              {submitLabel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function DeleteAppointmentModal({
  appointment,
  onClose,
  onConfirm,
}: {
  appointment: DemoAppointment
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DeleteDialog
      titleId="bb-delete-title"
      descriptionId="bb-delete-description"
      icon={Trash2}
      title="¿Eliminar esta cita?"
      description="Estás a punto de eliminar permanentemente esta reserva de la agenda. Esta acción no se puede deshacer."
      confirmLabel="Sí, eliminar"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="bb-delete-top">
        <strong>{appointment.id}</strong>
        <span>
          {appointment.date} · {appointment.time} — {appointment.professional}
        </span>
      </div>
      <strong className="bb-delete-name">{appointment.customer}</strong>
      <span className="bb-delete-service">
        {appointment.service} · {formatCOP(appointment.price)}
      </span>
    </DeleteDialog>
  )
}
export function AppointmentsView({
  appointments,
  onOpen,
  onAdd,
  onEditRequest,
  onDelete,
  notify,
}: {
  appointments: DemoAppointment[]
  onOpen: (appointment: DemoAppointment) => void
  onAdd: (appointment: DemoAppointment) => void
  onEditRequest: (appointment: DemoAppointment) => void
  onDelete: (id: string) => void
  notify: (message: string) => void
}) {
  const [query, setQuery] = useState('')
  const [quick, setQuick] = useState<'todas' | 'hoy'>('todas')
  const [specialist, setSpecialist] = useState('Todos los especialistas')
  const [day, setDay] = useState('Todas las fechas')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const specialistOptions = useMemo(
    () => ['Todos los especialistas', ...demoProfessionals.map((person) => person.name)],
    [],
  )
  const totalCount = appointments.length
  const todayCount = appointments.filter((item) => item.date.startsWith('Hoy')).length
  const filtered = useMemo(
    () =>
      appointments.filter((item) => {
        const matchesText = `${item.customer} ${item.service} ${item.professional} ${item.id}`
          .toLowerCase()
          .includes(query.toLowerCase())
        const matchesQuick = quick === 'todas' || (quick === 'hoy' && item.date.startsWith('Hoy'))
        const matchesSpecialist = specialist === 'Todos los especialistas' || item.professional === specialist
        const matchesDay = day === 'Todas las fechas' || weekdayOf(item.date) === day
        return matchesText && matchesQuick && matchesSpecialist && matchesDay
      }),
    [appointments, query, quick, specialist, day],
  )

  function saveCreated(draft: AppointmentDraft) {
    const numericIds = appointments.map((item) => Number(item.id.replace('BB-', '')) || 0)
    const service = demoServices.find((item) => item.id === draft.serviceId)
    if (!service) return
    onAdd({
      id: `BB-${Math.max(0, ...numericIds) + 1}`,
      customer: draft.name,
      initials: initialsOf(draft.name),
      phone: draft.phone,
      email: draft.email,
      service: service.name,
      professional: draft.professional,
      date: formatAgendaDate(draft.dateISO),
      time: draft.time,
      price: service.price,
      status: draft.status,
    })
    setCreating(false)
    notify('Cita guardada correctamente.')
  }

  function cancelCreate() {
    setCreating(false)
    notify('Se canceló el proceso de crear una cita.')
  }

  const deletingAppointment = deletingId ? (appointments.find((item) => item.id === deletingId) ?? null) : null

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
  return (
    <div className="bb-page-stack">
      <section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-agenda-title">
        <div className="bb-hello-mark" aria-hidden="true">
          b
        </div>
        <div className="bb-hello-copy">
          <span className="bb-hello-eyebrow">
            <span>GESTIÓN DE RESERVAS</span>
            <i className="bb-hello-dot" aria-hidden="true" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
            </span>
            <span>AGENDA SINCRONIZADA</span>
          </span>
          <h2 id="bb-agenda-title">Agenda de citas</h2>
          <p>Consulta, confirma y gestiona todas las reservas del salón en un solo lugar.</p>
        </div>
        <div className="bb-agenda-side">
          <div className="bb-agenda-capsule" role="list" aria-label="Resumen de agenda">
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">CITAS HOY</span>
              <strong className="bb-agenda-value">12</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">ESTA SEMANA</span>
              <strong className="bb-agenda-value">86</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">PROYECCIÓN MUESTRA</span>
              <strong className="bb-agenda-value is-accent">$ 1.490.000</strong>
            </div>
          </div>
        </div>
      </section>
      {creating && <CreateAppointmentModal onClose={cancelCreate} onSave={saveCreated} />}
      {deletingAppointment && (
        <DeleteAppointmentModal appointment={deletingAppointment} onClose={cancelDelete} onConfirm={confirmDelete} />
      )}
      <section className="bb-panel bb-table-panel bb-agenda-card">
        <div className="bb-agenda-controls">
          <div className="bb-agenda-tabs" role="tablist" aria-label="Filtros rápidos de citas">
            <button
              type="button"
              role="tab"
              aria-selected={quick === 'todas'}
              className={quick === 'todas' ? 'is-active' : ''}
              onClick={() => setQuick('todas')}
            >
              Todas <span className="bb-count-beige">{totalCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={quick === 'hoy'}
              className={quick === 'hoy' ? 'is-active' : ''}
              onClick={() => setQuick('hoy')}
            >
              Hoy {todayCount}
            </button>
          </div>
          <button type="button" className="bb-hello-primary bb-agenda-new" onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" />
            Nueva cita
          </button>
        </div>
        <div className="bb-agenda-searchrow">
          <label className="bb-agenda-search">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por cliente, código (ej. BB-1048) o servicio..."
              aria-label="Buscar citas"
            />
          </label>
          <FilterDropdown
            icon={User}
            value={specialist}
            options={specialistOptions}
            onChange={setSpecialist}
            label="Filtrar por especialista"
          />
          <FilterDropdown
            icon={CalendarDays}
            value={day}
            options={agendaDayOptions}
            onChange={setDay}
            label="Filtrar por fecha"
          />
        </div>
        <div className="bb-table-scroll">
          <table className="bb-data-table bb-agenda-table bb-citas-table">
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>SERVICIO</th>
                <th>PROFESIONAL</th>
                <th>FECHA Y HORA</th>
                <th className="bb-th-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appointment) => {
                const isToday = appointment.date.startsWith('Hoy')
                const isNext = appointment.id === 'BB-1050'
                return (
                  <tr key={appointment.id} className={isNext ? 'is-next' : undefined}>
                    <td>
                      <span className="bb-client-cell">
                        <span className="bb-client-avatar" aria-hidden="true">
                          {appointment.initials}
                        </span>
                        <span className="bb-client-text">
                          <strong>{appointment.customer}</strong>
                          <small>{appointment.id}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="bb-service-cell">
                        <strong>{appointment.service}</strong>
                        <small>{formatCOP(appointment.price)}</small>
                      </span>
                    </td>
                    <td>
                      <span className="bb-pro-cell">
                        <User aria-hidden="true" />
                        {appointment.professional}
                      </span>
                    </td>
                    <td>
                      <span className="bb-datetime-cell">
                        <strong>
                          {isToday && <i className="bb-today-dot" aria-hidden="true" />}
                          {appointment.date}
                        </strong>
                        <small>{appointment.time}</small>
                      </span>
                    </td>
                    <td className="bb-actions-cell">
                      <span className="bb-ghost-actions">
                        <button
                          type="button"
                          className="bb-ghost-btn bb-ghost-view"
                          aria-label={`Ver detalle de ${appointment.customer}`}
                          onClick={() => onOpen(appointment)}
                        >
                          <Eye aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="bb-ghost-btn bb-ghost-edit"
                          aria-label={`Editar cita de ${appointment.customer}`}
                          onClick={() => onEditRequest(appointment)}
                        >
                          <Pencil aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="bb-ghost-btn bb-ghost-delete"
                          aria-label={`Eliminar cita de ${appointment.customer}`}
                          onClick={() => setDeletingId(appointment.id)}
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="bb-empty-state">
              <Search />
              <strong>No hay citas con estos filtros</strong>
              <span>Prueba con otro especialista, día o término de búsqueda.</span>
            </div>
          )}
        </div>
        <div className="bb-table-footer bb-agenda-footer">
          <span>
            Mostrando {filtered.length} de {appointments.length} citas de muestra
          </span>
          <div className="bb-pager">
            <button type="button" className="bb-page-btn">
              Anterior
            </button>
            <button type="button" className="bb-page-btn is-current" aria-current="page">
              1
            </button>
            <button type="button" className="bb-page-btn">
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export function AppointmentModal({
  appointment,
  onClose,
  notify,
}: {
  appointment: DemoAppointment
  onClose: () => void
  notify: (message: string) => void
}) {
  const whatsappDigits = appointment.phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola ${appointment.customer}, te recordamos tu cita en BeautyMC: ${appointment.service} el ${appointment.date} a las ${appointment.time}. ¡Te esperamos!`)}`
  return (
    <DialogBackdrop onClose={onClose}>
      <section className="bb-detail-card" role="dialog" aria-modal="true" aria-labelledby="bb-detail-title">
        <div className="bb-detail-head">
          <button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar detalle">
            ×
          </button>
          <span className="bb-detail-eyebrow">DETALLE DE RESERVA · {appointment.id}</span>
          <div className="bb-detail-person">
            <span className="bb-detail-avatar" aria-hidden="true">
              {appointment.initials}
            </span>
            <div className="bb-detail-identity">
              <h2 id="bb-detail-title">{appointment.customer}</h2>
              <span className="bb-detail-contact">
                {appointment.phone} · {appointment.email}
              </span>
            </div>
          </div>
        </div>
        <div className="bb-detail-body">
          <div className="bb-detail-service">
            <div>
              <span>SERVICIO RESERVADO</span>
              <strong>{appointment.service}</strong>
            </div>
            <div className="bb-detail-price">
              <span>VALOR</span>
              <strong>{formatCOP(appointment.price)}</strong>
            </div>
          </div>
          <div className="bb-detail-grid">
            <div className="bb-detail-item">
              <span>
                <CalendarDays aria-hidden="true" />
                FECHA
              </span>
              <strong>{appointment.date}</strong>
            </div>
            <div className="bb-detail-item">
              <span>
                <Clock3 aria-hidden="true" />
                HORA
              </span>
              <strong>{formatHour12(appointment.time)}</strong>
            </div>
            <div className="bb-detail-item">
              <span>
                <User aria-hidden="true" />
                PROFESIONAL
              </span>
              <strong>{appointment.professional}</strong>
            </div>
            <div className="bb-detail-item">
              <span>
                <Ticket aria-hidden="true" />
                CÓDIGO
              </span>
              <strong>{appointment.id}</strong>
            </div>
          </div>
        </div>
        <div className="bb-detail-foot">
          {whatsappDigits ? (
            <a className="bb-detail-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" />
              Recordar por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              className="bb-detail-whatsapp"
              onClick={() => notify('Esta cita no tiene un teléfono válido.')}
            >
              <MessageCircle aria-hidden="true" />
              Recordar por WhatsApp
            </button>
          )}
        </div>
      </section>
    </DialogBackdrop>
  )
}
