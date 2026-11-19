'use client'

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { Check, Eye, ImagePlus, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import { demoServices } from '@/lib/dashboard-demo-data'
import {
  DeleteDialog,
  DialogBackdrop,
  FilterDropdown,
  Modal,
} from '@/components/beautybook/dashboard-ui'
import { readImageFile } from '@/lib/image-upload'
import { formatCOP } from '@/lib/utils'
import { categoryLabel, type ServiceDraft, type ServiceItem } from '@/components/beautybook/admin/admin-shared'

function ServiceDetailModal({ service, onClose }: { service: ServiceItem; onClose: () => void }) {
  return (
    <DialogBackdrop onClose={onClose}>
      <section className="bb-service-card" role="dialog" aria-modal="true" aria-labelledby="bb-service-title">
        <div className="bb-service-cover">
          <Image src={service.image} alt={`Imagen de ${service.name}`} fill sizes="(max-width: 560px) 100vw, 480px" />
          <button type="button" className="bb-detail-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
          <span className="bb-service-chips">
            <span className="bb-service-chip">{categoryLabel(service.category)}</span>
            {!service.active && <span className="bb-service-chip is-off">INACTIVO</span>}
          </span>
        </div>
        <div className="bb-service-head">
          <div>
            <h2 id="bb-service-title">{service.name}</h2>
            <p>Servicio disponible en catálogo del salón</p>
          </div>
          <div className="bb-service-rate">
            <span>TARIFA</span>
            <strong>{formatCOP(service.price)}</strong>
          </div>
        </div>
        <div className="bb-service-desc">
          <span>DESCRIPCIÓN DEL SERVICIO</span>
          <p>{service.description}</p>
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

function DeleteServiceModal({
  service,
  onClose,
  onConfirm,
}: {
  service: ServiceItem
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DeleteDialog
      titleId="bb-delete-service-title"
      descriptionId="bb-delete-service-description"
      icon={Trash2}
      title="¿Eliminar este servicio?"
      description="Estás a punto de eliminar permanentemente este servicio del catálogo. Esta acción no se puede deshacer."
      confirmLabel="Sí, eliminar"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="bb-delete-top">
        <strong>{service.category}</strong>
        <span>{formatCOP(service.price)}</span>
      </div>
      <strong className="bb-delete-name">{service.name}</strong>
      <span className="bb-delete-service">{service.description}</span>
    </DeleteDialog>
  )
}
const NEW_SERVICE_CATEGORY = '__nueva__'

export function ServiceFormModal({
  services,
  initial,
  title,
  eyebrow,
  onClose,
  onSave,
}: {
  services: typeof demoServices
  initial?: ServiceDraft
  title: string
  eyebrow: string
  onClose: () => void
  onSave: (draft: ServiceDraft) => void
}) {
  const categories = useMemo(() => Array.from(new Set(services.map((service) => service.category))), [services])
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? 'CORTES')
  const [newCategory, setNewCategory] = useState('')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [imageData, setImageData] = useState(initial?.image ?? '')
  const [imageUrl, setImageUrl] = useState('')
  const [urlBroken, setUrlBroken] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const preview = imageData || (!urlBroken && imageUrl.trim())
  const categoryOptions = [...categories.map(categoryLabel), 'Agregar nueva categoría…']
  const categoryValue = category === NEW_SERVICE_CATEGORY ? 'Agregar nueva categoría…' : categoryLabel(category)

  function selectCategory(display: string) {
    if (display === 'Agregar nueva categoría…') {
      setCategory(NEW_SERVICE_CATEGORY)
      return
    }
    const found = categories.find((item) => categoryLabel(item) === display)
    if (found) setCategory(found)
  }

  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    readImageFile(file, {
      onError: setError,
      onLoad: (dataUrl) => {
        setImageData(dataUrl)
        setImageUrl('')
        setError('')
      },
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const finalCategory = category === NEW_SERVICE_CATEGORY ? newCategory.trim().toUpperCase() : category
    const finalPrice = Number(price)
    if (!name.trim() || !finalCategory || !description.trim()) {
      setError('Completa el nombre, la categoría y la descripción del servicio.')
      return
    }
    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      setError('Ingresa un precio válido en COP.')
      return
    }
    setError('')
    onSave({
      name: name.trim(),
      category: finalCategory,
      price: Math.round(finalPrice),
      description: description.trim(),
      image: preview || '/beauty-service-hair.jpg',
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
                  <span>Imagen del servicio</span>
                </div>
                {preview ? (
                  <>
                    <span className="bb-service-preview">
                      <Image
                        src={preview}
                        alt={`Imagen de ${name || 'nuevo servicio'}`}
                        onError={() => {
                          if (!imageData) {
                            setUrlBroken(true)
                            setImageUrl('')
                          }
                        }}
                        fill
                        sizes="480px"
                        unoptimized
                      />
                    </span>
                    <div className="bb-upload-row">
                      <button
                        type="button"
                        className="bb-button bb-button-outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        className="bb-button bb-button-outline"
                        onClick={() => {
                          setImageData('')
                          setImageUrl('')
                        }}
                      >
                        Quitar
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={pickImage} />
                    </div>
                  </>
                ) : (
                  <label className="bb-upload-box">
                    <input type="file" accept="image/*" onChange={pickImage} />
                    <ImagePlus aria-hidden="true" />
                    <strong>Agregar imagen</strong>
                    <small>Desde tu computador o dispositivo</small>
                  </label>
                )}
                <input
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value)
                    setUrlBroken(false)
                  }}
                  placeholder="O pega URL de imagen..."
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="bb-book-col">
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Nombre del servicio *</span>
                </div>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Corte bordado & hidratación"
                  autoComplete="off"
                />
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Categoría *</span>
                </div>
                <FilterDropdown
                  icon={Sparkles}
                  value={categoryValue}
                  options={categoryOptions}
                  onChange={selectCategory}
                  label="Categoría"
                />
                {category === NEW_SERVICE_CATEGORY && (
                  <input
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder="Ej. Depilación"
                    autoComplete="off"
                  />
                )}
              </div>
              <div className="bb-field">
                <div className="bb-field-head">
                  <span>Precio (COP) *</span>
                </div>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="95000"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          <div className="bb-field">
            <div className="bb-field-head">
              <span>Descripción *</span>
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe en qué consiste el servicio, beneficios o qué incluye..."
              rows={3}
            />
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
              Guardar servicio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function ServicesView({
  services,
  onAdd,
  onEdit,
  onDelete,
  notify,
}: {
  services: typeof demoServices
  onAdd: () => void
  onEdit: (service: ServiceItem) => void
  onDelete: (id: string) => void
  notify: (message: string) => void
}) {
  const catalogTotal = services.length
  const catalogCategories = new Set(services.map((service) => service.category)).size
  const catalogAverage = catalogTotal
    ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / catalogTotal)
    : 0
  const [serviceQuery, setServiceQuery] = useState('')
  const [serviceCategory, setServiceCategory] = useState('Todas')
  const [serviceDetail, setServiceDetail] = useState<ServiceItem | null>(null)
  const [serviceDeleting, setServiceDeleting] = useState<ServiceItem | null>(null)
  const serviceCategories = useMemo(() => Array.from(new Set(services.map((service) => service.category))), [services])
  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const matchesText = `${service.name} ${service.description}`.toLowerCase().includes(serviceQuery.toLowerCase())
        return matchesText && (serviceCategory === 'Todas' || service.category === serviceCategory)
      }),
    [services, serviceQuery, serviceCategory],
  )

  function confirmServiceDelete() {
    if (!serviceDeleting) return
    onDelete(serviceDeleting.id)
    setServiceDeleting(null)
    notify('Servicio eliminado correctamente.')
  }

  function cancelServiceDelete() {
    setServiceDeleting(null)
    notify('Se canceló la eliminación del servicio.')
  }
  return (
    <div className="bb-page-stack">
      <section className="bb-hello-panel bb-agenda-panel" aria-labelledby="bb-services-title">
        <div className="bb-hello-mark" aria-hidden="true">
          b
        </div>
        <div className="bb-hello-copy">
          <span className="bb-hello-eyebrow">
            <span>GESTIÓN DE CATÁLOGO</span>
            <i className="bb-hello-dot" aria-hidden="true" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7C59] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A7C59]"></span>
            </span>
            <span>CATÁLOGO ACTIVO · SALÓN</span>
          </span>
          <h2 id="bb-services-title">Catálogo de servicios</h2>
          <p>Administra los servicios, categorías, tarifas e imágenes del salón.</p>
        </div>
        <div className="bb-agenda-side">
          <div className="bb-agenda-capsule" role="list" aria-label="Resumen del catálogo">
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">EN CATÁLOGO</span>
              <strong className="bb-agenda-value">{catalogTotal}</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">CATEGORÍAS</span>
              <strong className="bb-agenda-value">{catalogCategories}</strong>
            </div>
            <div className="bb-agenda-metric" role="listitem">
              <span className="bb-agenda-label">TICKET PROMEDIO</span>
              <strong className="bb-agenda-value is-accent">{formatCOP(catalogAverage)}</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="bb-panel bb-table-panel bb-agenda-card">
        <div className="bb-agenda-controls">
          <div className="bb-agenda-tabs" role="tablist" aria-label="Filtrar servicios por categoría">
            <button
              type="button"
              role="tab"
              aria-selected={serviceCategory === 'Todas'}
              className={serviceCategory === 'Todas' ? 'is-active' : ''}
              onClick={() => setServiceCategory('Todas')}
            >
              Todos <span className="bb-count-beige">{services.length}</span>
            </button>
            {serviceCategories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={serviceCategory === item}
                className={serviceCategory === item ? 'is-active' : ''}
                onClick={() => setServiceCategory(item)}
              >
                {categoryLabel(item)}
              </button>
            ))}
          </div>
          <button type="button" className="bb-hello-primary bb-agenda-new" onClick={onAdd}>
            <Plus aria-hidden="true" />
            Añadir servicio
          </button>
        </div>
        <div className="bb-agenda-searchrow">
          <label className="bb-agenda-search">
            <Search aria-hidden="true" />
            <input
              value={serviceQuery}
              onChange={(event) => setServiceQuery(event.target.value)}
              placeholder="Buscar servicio por nombre o descripción..."
              aria-label="Buscar servicios"
            />
          </label>
        </div>
        <div className="bb-table-scroll">
          <table className="bb-data-table bb-agenda-table bb-service-table">
            <thead>
              <tr>
                <th>SERVICIO</th>
                <th>CATEGORÍA</th>
                <th>PRECIO</th>
                <th className="bb-th-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <span className="bb-service-main">
                      <span className="bb-service-thumb">
                        <Image src={service.image} alt={`Imagen de ${service.name}`} fill sizes="96px" />
                      </span>
                      <span className="bb-service-text">
                        <strong>{service.name}</strong>
                        <small>{service.description}</small>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="bb-category-chip">{service.category}</span>
                  </td>
                  <td>
                    <strong className="bb-service-price">{formatCOP(service.price)}</strong>
                  </td>
                  <td className="bb-actions-cell">
                    <span className="bb-ghost-actions">
                      <button
                        type="button"
                        className="bb-ghost-btn bb-ghost-view"
                        aria-label={`Ver ${service.name}`}
                        onClick={() => setServiceDetail(service)}
                      >
                        <Eye aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="bb-ghost-btn bb-ghost-edit"
                        aria-label={`Editar ${service.name}`}
                        onClick={() => onEdit(service)}
                      >
                        <Pencil aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="bb-ghost-btn bb-ghost-delete"
                        aria-label={`Eliminar ${service.name}`}
                        onClick={() => setServiceDeleting(service)}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredServices.length === 0 && (
            <div className="bb-empty-state">
              <Search aria-hidden="true" />
              <strong>No hay servicios con estos filtros</strong>
              <span>Prueba con otra categoría o término de búsqueda.</span>
            </div>
          )}
        </div>
        <div className="bb-table-footer bb-agenda-footer">
          <span>
            Mostrando {filteredServices.length} de {services.length} servicios
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
      {serviceDetail && <ServiceDetailModal service={serviceDetail} onClose={() => setServiceDetail(null)} />}
      {serviceDeleting && (
        <DeleteServiceModal service={serviceDeleting} onClose={cancelServiceDelete} onConfirm={confirmServiceDelete} />
      )}
    </div>
  )
}
