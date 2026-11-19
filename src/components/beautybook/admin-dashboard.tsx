'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, Clock3, Settings2, Sparkles, Users } from 'lucide-react'
import {
  DEMO_ADMIN,
  DEMO_TODAY_LABEL,
  demoAppointments,
  demoProfessionals,
  demoServices,
  type DemoAppointment,
} from '@/lib/dashboard-demo-data'
import { DashboardShell, type DashboardNavItem } from '@/components/beautybook/dashboard-shell'
import { SettingsView } from '@/components/beautybook/admin/settings-view'
import { CustomerModal, CustomersView } from '@/components/beautybook/admin/customers-view'
import { ServiceFormModal, ServicesView } from '@/components/beautybook/admin/services-view'
import { AdminHome } from '@/components/beautybook/admin/home-view'
import {
  AppointmentModal,
  AppointmentsView,
  CreateAppointmentModal,
} from '@/components/beautybook/admin/appointments-view'
import { ProfessionalsView } from '@/components/beautybook/admin/professionals-view'
import {
  formatAgendaDate,
  initialsOf,
  type AdminModal,
  type AppointmentDraft,
  type ProfessionalForm,
  type ServiceDraft,
} from '@/components/beautybook/admin/admin-shared'

const navItems: DashboardNavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: CalendarDays },
  { id: 'citas', label: 'Citas', icon: Clock3 },
  { id: 'servicios', label: 'Servicios', icon: Sparkles },
  { id: 'profesionales', label: 'Profesionales', icon: Users },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'configuracion', label: 'Configuración', icon: Settings2 },
]

export default function AdminDashboard() {
  const [view, setView] = useState('inicio')
  const [appointments, setAppointments] = useState(demoAppointments)
  const [services, setServices] = useState(demoServices)
  const [professionals, setProfessionals] = useState(demoProfessionals)
  const [modal, setModal] = useState<AdminModal>(null)
  const [toast, setToast] = useState('')
  const title = navItems.find((item) => item.id === view)?.label ?? 'Inicio'
  const detailAppointment =
    modal?.kind === 'appointment'
      ? (appointments.find((item) => item.id === modal.appointment.id) ?? modal.appointment)
      : null

  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function notify(message: string) {
    setToast(message)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingAppointment = editingId
    ? (appointments.find((appointment) => appointment.id === editingId) ?? null)
    : null

  function requestEdit(appointment: DemoAppointment) {
    setModal(null)
    setEditingId(appointment.id)
  }

  function saveEdited(id: string, draft: AppointmentDraft) {
    const service = demoServices.find((item) => item.id === draft.serviceId)
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              customer: draft.name,
              initials: initialsOf(draft.name),
              phone: draft.phone,
              email: draft.email,
              service: service?.name ?? appointment.service,
              professional: draft.professional,
              date: draft.dateISO ? formatAgendaDate(draft.dateISO) : draft.dateLabel || appointment.date,
              time: draft.time,
              price: service?.price ?? appointment.price,
              status: draft.status,
            }
          : appointment,
      ),
    )
    setEditingId(null)
    notify('Cita actualizada correctamente.')
  }

  function cancelEdit() {
    setEditingId(null)
    notify('Se canceló la edición de la cita.')
  }

  function toDraft(appointment: DemoAppointment): AppointmentDraft {
    const catalogService = demoServices.find((item) => item.name === appointment.service)
    return {
      serviceId: catalogService?.id ?? '',
      legacyService: catalogService ? undefined : { name: appointment.service, price: appointment.price },
      professional: appointment.professional,
      dateISO: '',
      dateLabel: appointment.date,
      time: appointment.time,
      name: appointment.customer,
      email: appointment.email,
      phone: appointment.phone,
      status: appointment.status,
    }
  }

  function saveService(draft: ServiceDraft) {
    if (modal?.kind !== 'service') return
    const editing = modal.service
    if (editing) {
      setServices((current) => current.map((item) => (item.id === editing.id ? { ...item, ...draft } : item)))
      notify('Servicio actualizado.')
    } else {
      setServices((current) => [...current, { id: `demo-${Date.now()}`, active: true, ...draft }])
      notify('Servicio añadido al catálogo.')
    }
    setModal(null)
  }

  return (
    <DashboardShell
      mode="admin"
      navItems={navItems}
      activeId={view}
      onNavigate={setView}
      eyebrow={
        view === 'citas' ||
        view === 'servicios' ||
        view === 'profesionales' ||
        view === 'clientes' ||
        view === 'configuracion'
          ? ''
          : 'PANEL DE ADMINISTRACIÓN'
      }
      title={title}
      userName={DEMO_ADMIN.name}
      userInitials={DEMO_ADMIN.initials}
      dateLabel={DEMO_TODAY_LABEL}
    >
      {view === 'inicio' && (
        <AdminHome
          appointments={appointments}
          onOpen={(appointment) => setModal({ kind: 'appointment', appointment })}
          onNavigate={setView}
        />
      )}
      {view === 'citas' && (
        <AppointmentsView
          appointments={appointments}
          onOpen={(appointment) => setModal({ kind: 'appointment', appointment })}
          onAdd={(appointment) => setAppointments((current) => [...current, appointment])}
          onEditRequest={requestEdit}
          onDelete={(id) => setAppointments((current) => current.filter((item) => item.id !== id))}
          notify={notify}
        />
      )}
      {view === 'servicios' && (
        <ServicesView
          services={services}
          onAdd={() => setModal({ kind: 'service' })}
          onEdit={(service) => setModal({ kind: 'service', service })}
          onDelete={(id) => setServices((current) => current.filter((service) => service.id !== id))}
          notify={notify}
        />
      )}
      {view === 'profesionales' && (
        <ProfessionalsView
          professionals={professionals}
          appointments={appointments}
          onToggle={(id) =>
            setProfessionals((current) =>
              current.map((person) => (person.id === id ? { ...person, active: !person.active } : person)),
            )
          }
          onAdd={(draft: ProfessionalForm & { specialty: string }) =>
            setProfessionals((current) => [
              ...current,
              {
                id: `demo-${Date.now()}`,
                initials: initialsOf(draft.name),
                active: true,
                appointments: 0,
                name: draft.name,
                email: draft.email,
                password: draft.password,
                phone: draft.phone,
                bio: draft.bio,
                specialty: draft.specialty,
                schedule: draft.schedule,
                categories: draft.categories,
                image: draft.image,
              },
            ])
          }
          onEdit={(id, draft) =>
            setProfessionals((current) =>
              current.map((person) => (person.id === id ? { ...person, ...draft } : person)),
            )
          }
          onDelete={(id) => setProfessionals((current) => current.filter((person) => person.id !== id))}
          notify={notify}
        />
      )}
      {view === 'clientes' && (
        <CustomersView onOpen={(customer) => setModal({ kind: 'customer', customer })} notify={notify} />
      )}
      {view === 'configuracion' && <SettingsView notify={notify} />}
      {detailAppointment && (
        <AppointmentModal appointment={detailAppointment} onClose={() => setModal(null)} notify={notify} />
      )}
      {editingAppointment && (
        <CreateAppointmentModal
          key={editingAppointment.id}
          title="Editar cita"
          eyebrow="EDITAR RESERVA"
          submitLabel="Guardar cambios"
          initial={toDraft(editingAppointment)}
          onClose={cancelEdit}
          onSave={(draft) => saveEdited(editingAppointment.id, draft)}
        />
      )}
      {modal?.kind === 'customer' && (
        <CustomerModal
          customer={modal.customer}
          onClose={() => setModal(null)}
          appointments={appointments}
          notify={notify}
        />
      )}
      {modal?.kind === 'service' && (
        <ServiceFormModal
          services={services}
          initial={
            modal.service
              ? {
                  name: modal.service.name,
                  category: modal.service.category,
                  price: modal.service.price,
                  description: modal.service.description,
                  image: modal.service.image,
                }
              : undefined
          }
          title={modal.service ? 'Editar servicio' : 'Añadir servicio al catálogo'}
          eyebrow={modal.service ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'}
          onClose={() => {
            const wasEditing = Boolean(modal.service)
            setModal(null)
            notify(wasEditing ? 'Se canceló la edición del servicio.' : 'Se canceló la creación del servicio.')
          }}
          onSave={saveService}
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
