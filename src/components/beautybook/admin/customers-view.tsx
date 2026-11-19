'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowUpDown, Check, Clock3, Eye, MessageCircle, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { demoCustomers, demoServices, type DemoAppointment } from '@/lib/dashboard-demo-data'
import {
  DeleteDialog,
  DialogBackdrop,
  FilterDropdown,
  Modal,
  Pager,
  usePagination,
} from '@/components/beautybook/dashboard-ui'
import { formatCOP } from '@/lib/utils'
import { isValidColombianPhone, isValidEmail } from '@/lib/validation'
import {
  initialsOf,
  type Customer,
  type CustomerDraft,
  type CustomerFilter,
} from '@/components/beautybook/admin/admin-shared'

export function CustomersView({
  onOpen,
  notify,
}: {
  onOpen: (customer: Customer) => void
  notify: (message: string) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CustomerFilter>('todos')
  const [sort, setSort] = useState('Más recientes')
  const [items, setItems] = useState(demoCustomers)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const sortOptions = useMemo(() => ['Más recientes', 'Más visitas', 'Nombre A-Z'], [])
  const totalCount = items.length
  const vipCount = useMemo(() => items.filter((customer) => customer.vip).length, [items])
  const newCount = totalCount - vipCount
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const byFilter = items.filter((customer) => {
      if (filter === 'vip') return customer.vip
      if (filter === 'nuevos') return !customer.vip
      return true
    })
    const byQuery = normalized
      ? byFilter.filter((customer) =>
          `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(normalized),
        )
      : byFilter
    const sorted = [...byQuery]
    if (sort === 'Más visitas') sorted.sort((a, b) => b.visits - a.visits)
    else if (sort === 'Nombre A-Z') sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    return sorted
  }, [items, query, filter, sort])

  const { page, pageCount, pageItems, rangeLabel, setPage } = usePagination(filtered, `${query}|${filter}|${sort}`)

  function saveCustomer(draft: CustomerDraft) {
    const name = draft.name.trim()
    setItems((current) => [
      {
        name,
        initials: initialsOf(name),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        visits: 0,
        lastVisit: '—',
        favoriteService: draft.favoriteService,
        vip: draft.vip,
        memberSince: new Date().getFullYear(),
      },
      ...current,
    ])
    setCreating(false)
    notify('Cliente registrado en la comunidad.')
  }

  function saveEdited(original: Customer, draft: CustomerDraft) {
    setItems((current) =>
      current.map((item) =>
        item === original
          ? {
              ...item,
              name: draft.name,
              initials: initialsOf(draft.name),
              email: draft.email,
              phone: draft.phone,
              favoriteService: draft.favoriteService,
              vip: draft.vip,
            }
          : item,
      ),
    )
    setEditing(null)
    notify('Cliente actualizado correctamente.')
  }

  function confirmDelete(target: Customer) {
    setItems((current) => current.filter((item) => item !== target))
    setDeleting(null)
    notify('Cliente eliminado correctamente.')
  }

  return (
    <div className="bb-page-stack">
      <section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-customers-title">
        <div className="bb-hello-mark" aria-hidden="true">
          b
        </div>
        <div className="bb-hello-copy">
          <span className="bb-hello-eyebrow">
            <span>COMUNIDAD BEAUTYMC</span>
            <i className="bb-hello-dot" aria-hidden="true" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
            </span>
            <span>BASE DE DATOS ACTIVA</span>
          </span>
          <h2 id="bb-customers-title">Clientes</h2>
          <p>Directorio, historial de visitas y preferencias de los clientes del salón.</p>
        </div>
        <div className="bb-agenda-side">
          <div className="bb-agenda-capsule bb-agenda-capsule--customers" role="list" aria-label="Resumen de clientes">
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">REGISTRADOS</span>
              <strong className="bb-agenda-value">1.284</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">NUEVOS ESTE MES</span>
              <strong className="bb-agenda-value is-accent">+42</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">CLIENTES VIP</span>
              <strong className="bb-agenda-value">186</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="bb-panel bb-table-panel bb-agenda-card">
        <div className="bb-agenda-controls">
          <div className="bb-agenda-tabs" role="tablist" aria-label="Filtrar clientes">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'todos'}
              className={filter === 'todos' ? 'is-active' : ''}
              onClick={() => setFilter('todos')}
            >
              Todos <span className="bb-count-beige">{totalCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'vip'}
              className={filter === 'vip' ? 'is-active' : ''}
              onClick={() => setFilter('vip')}
            >
              Frecuentes / VIP <span className="bb-count-beige">{vipCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'nuevos'}
              className={filter === 'nuevos' ? 'is-active' : ''}
              onClick={() => setFilter('nuevos')}
            >
              Nuevos <span className="bb-count-beige">{newCount}</span>
            </button>
          </div>
          <button type="button" className="bb-hello-primary bb-agenda-new" onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" />
            Nuevo cliente
          </button>
        </div>
        <div className="bb-agenda-searchrow">
          <label className="bb-agenda-search">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, correo o teléfono..."
              aria-label="Buscar clientes"
            />
          </label>
          <FilterDropdown
            icon={ArrowUpDown}
            value={sort}
            options={sortOptions}
            onChange={setSort}
            label="Ordenar clientes"
          />
        </div>
        <div className="bb-table-scroll">
          <table className="bb-data-table bb-agenda-table bb-customers-table">
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>CONTACTO</th>
                <th>VISITAS</th>
                <th>ÚLTIMA VISITA</th>
                <th>SERVICIO FAVORITO</th>
                <th className="bb-th-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((customer) => {
                const isToday = customer.lastVisit.startsWith('Hoy')
                return (
                  <tr key={`${customer.phone}|${customer.name}`}>
                    <td>
                      <span className="bb-client-cell">
                        <span className="bb-client-avatar" aria-hidden="true">
                          {customer.initials}
                        </span>
                        <span className="bb-client-text">
                          <strong className="bb-customer-name">
                            {customer.name}
                            {customer.vip && <span className="bb-vip-chip">VIP</span>}
                          </strong>
                          <small>Cliente desde {customer.memberSince}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="bb-service-cell">
                        <strong className="bb-customer-email">{customer.email || '—'}</strong>
                        <small>{customer.phone}</small>
                      </span>
                    </td>
                    <td>
                      <span className="bb-visits-cell">
                        <strong>{customer.visits}</strong>
                        <small> visitas</small>
                      </span>
                    </td>
                    <td>
                      <span className="bb-datetime-cell">
                        <strong>
                          {isToday && <i className="bb-today-dot" aria-hidden="true" />}
                          {customer.lastVisit}
                        </strong>
                      </span>
                    </td>
                    <td>
                      <span className="bb-fav-chip">
                        <Sparkles aria-hidden="true" />
                        {customer.favoriteService}
                      </span>
                    </td>
                    <td className="bb-actions-cell">
                      <span className="bb-ghost-actions">
                        <button
                          type="button"
                          className="bb-ghost-btn bb-ghost-view"
                          aria-label={`Ver historial de ${customer.name}`}
                          onClick={() => onOpen(customer)}
                        >
                          <Eye aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="bb-ghost-btn bb-ghost-edit"
                          aria-label={`Editar cliente ${customer.name}`}
                          onClick={() => setEditing(customer)}
                        >
                          <Pencil aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="bb-ghost-btn bb-ghost-delete"
                          aria-label={`Eliminar cliente ${customer.name}`}
                          onClick={() => setDeleting(customer)}
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
              <strong>No encontramos clientes</strong>
              <span>Prueba con otro nombre, correo o teléfono.</span>
            </div>
          )}
        </div>
        <div className="bb-table-footer bb-agenda-footer">
          <span>
            Mostrando {rangeLabel} de {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
          </span>
          <Pager page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      </section>
      {creating && (
        <CustomerCreateModal
          onClose={() => {
            setCreating(false)
            notify('Se canceló la creación del cliente.')
          }}
          onSave={saveCustomer}
        />
      )}
      {deleting && (
        <CustomerDeleteModal
          customer={deleting}
          onClose={() => {
            setDeleting(null)
            notify('Se canceló la eliminación del cliente.')
          }}
          onConfirm={() => confirmDelete(deleting)}
        />
      )}
      {editing && (
        <CustomerEditModal
          key={`${editing.phone}|${editing.name}`}
          customer={editing}
          onClose={() => {
            setEditing(null)
            notify('Se canceló la edición del cliente.')
          }}
          onSave={(draft) => saveEdited(editing, draft)}
        />
      )}
    </div>
  )
}

function CustomerFormModal({
  initial,
  title,
  eyebrow,
  submitLabel,
  onClose,
  onSave,
}: {
  initial?: Customer
  title: string
  eyebrow: string
  submitLabel: string
  onClose: () => void
  onSave: (draft: CustomerDraft) => void
}) {
  const serviceOptions = useMemo(() => demoServices.map((service) => service.name), [])
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [favoriteService, setFavoriteService] = useState(
    initial?.favoriteService ?? serviceOptions[0] ?? 'Corte & peinado',
  )
  const [vip, setVip] = useState(Boolean(initial?.vip))
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Completa el nombre y el teléfono del cliente.')
      return
    }
    if (!isValidColombianPhone(phone)) {
      setError('Escribe un teléfono colombiano válido, por ejemplo 300 123 4567.')
      return
    }
    if (email.trim() && !isValidEmail(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    setError('')
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), favoriteService, vip })
  }

  return (
    <div className="bb-book-modal">
      <Modal title={title} description={eyebrow} onClose={onClose}>
        <form className="bb-form bb-book-form" onSubmit={submit} noValidate>
          <div className="bb-book-grid">
            <div className="bb-book-col">
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Nombre completo *</span>
                </div>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Camila Restrepo"
                  autoComplete="off"
                />
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Correo electrónico</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cliente@example.com"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="bb-book-col">
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Teléfono / WhatsApp *</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+57 300 000 0000"
                  autoComplete="off"
                />
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Servicio preferido</span>
                </div>
                <FilterDropdown
                  icon={Sparkles}
                  value={favoriteService}
                  options={serviceOptions}
                  onChange={setFavoriteService}
                  label="Servicio preferido"
                />
              </div>
            </div>
          </div>
          {error && <p className="bb-form-error">{error}</p>}
          <div className="bb-customer-create-foot">
            <button
              type="button"
              className="bb-vip-toggle"
              role="switch"
              aria-checked={vip}
              onClick={() => setVip((value) => !value)}
            >
              <span className={`bb-vip-switch ${vip ? 'is-on' : ''}`} aria-hidden="true">
                <i />
              </span>
              Marcar como Cliente VIP
            </button>
            <div className="bb-book-actions bb-customer-create-actions">
              <button type="button" className="bb-button bb-button-outline" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="bb-button bb-button-primary">
                <Check aria-hidden="true" />
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CustomerCreateModal({ onClose, onSave }: { onClose: () => void; onSave: (draft: CustomerDraft) => void }) {
  return (
    <CustomerFormModal
      title="Registrar cliente en comunidad"
      eyebrow="NUEVO PERFIL"
      submitLabel="Guardar cliente"
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function CustomerEditModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer
  onClose: () => void
  onSave: (draft: CustomerDraft) => void
}) {
  return (
    <CustomerFormModal
      initial={customer}
      title="Editar cliente de la comunidad"
      eyebrow="EDITAR PERFIL"
      submitLabel="Guardar cambios"
      onClose={onClose}
      onSave={onSave}
    />
  )
}

function CustomerDeleteModal({
  customer,
  onClose,
  onConfirm,
}: {
  customer: Customer
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DeleteDialog
      titleId="bb-delete-customer-title"
      descriptionId="bb-delete-customer-description"
      icon={Trash2}
      title="¿Eliminar este cliente?"
      description="Estás a punto de eliminar permanentemente este perfil de la comunidad. Esta acción no se puede deshacer."
      confirmLabel="Sí, eliminar"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="bb-delete-top">
        <strong>{customer.vip ? 'CLIENTE VIP' : 'CLIENTE'}</strong>
        <span>
          {customer.visits} visitas · Cliente desde {customer.memberSince}
        </span>
      </div>
      <strong className="bb-delete-name">{customer.name}</strong>
      <span className="bb-delete-service">
        {customer.email || 'Sin correo'} · {customer.phone}
      </span>
    </DeleteDialog>
  )
}
export function CustomerModal({
  customer,
  onClose,
  appointments,
  notify,
}: {
  customer: Customer
  onClose: () => void
  appointments: DemoAppointment[]
  notify: (message: string) => void
}) {
  const customerAppointments = appointments.filter((appointment) => appointment.customer === customer.name)
  const totalSpent = customerAppointments.reduce((sum, appointment) => sum + (appointment.price || 0), 0)
  const professionalCounts = customerAppointments.reduce<Record<string, number>>((acc, appointment) => {
    acc[appointment.professional] = (acc[appointment.professional] || 0) + 1
    return acc
  }, {})
  const favoriteProfessional =
    Object.entries(professionalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    customerAppointments[0]?.professional ||
    '—'
  const digits = (customer.phone || '').replace(/\D/g, '')
  const greeting = `Hola ${customer.name}, te escribe BeautyMC. Gracias por tu confianza, quedamos atentos a tu próxima visita.`
  const whatsappUrl = `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`
  return (
    <DialogBackdrop onClose={onClose}>
      <section className="bb-client-card" role="dialog" aria-modal="true" aria-labelledby="bb-client-title">
        <div className="bb-client-head">
          <button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
          <span className="bb-client-eyebrow">FICHA DE CLIENTE · CLIENTE DESDE {customer.memberSince}</span>
          <div className="bb-client-person">
            <span className="bb-detail-avatar" aria-hidden="true">
              {customer.initials}
            </span>
            <div className="bb-client-identity">
              <h2 id="bb-client-title">
                {customer.name}
                {customer.vip && <span className="bb-client-vip">Cliente VIP</span>}
              </h2>
              <span className="bb-client-contact">
                {customer.email || 'Sin correo'} · {customer.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="bb-client-body">
          <div className="bb-client-metrics">
            <div>
              <span>VISITAS TOTALES</span>
              <strong>{customer.visits}</strong>
            </div>
            <div>
              <span>GASTO ACUMULADO</span>
              <strong className="is-accent">{formatCOP(totalSpent)}</strong>
            </div>
            <div>
              <span>ESPECIALISTA FAV.</span>
              <strong className="is-small">{favoriteProfessional}</strong>
            </div>
          </div>
          <div className="bb-client-history">
            <div className="bb-client-history-head">
              <span>
                <Clock3 aria-hidden="true" />
                HISTORIAL RECIENTE
              </span>
            </div>
            {customerAppointments.length ? (
              customerAppointments.map((appointment) => (
                <div className="bb-client-history-row" key={appointment.id}>
                  <span>
                    <strong>{appointment.service}</strong>
                    <small> · {appointment.date}</small>
                  </span>
                  <strong className="bb-client-price">{formatCOP(appointment.price)}</strong>
                </div>
              ))
            ) : (
              <p className="bb-client-empty">Sin citas recientes en esta vista de muestra.</p>
            )}
          </div>
        </div>
        <div className="bb-client-foot">
          {digits ? (
            <a className="bb-detail-whatsapp bb-client-wa" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              className="bb-detail-whatsapp bb-client-wa"
              onClick={() => notify('Este cliente no tiene un teléfono válido.')}
            >
              <MessageCircle aria-hidden="true" />
              Escribir por WhatsApp
            </button>
          )}
        </div>
      </section>
    </DialogBackdrop>
  )
}
