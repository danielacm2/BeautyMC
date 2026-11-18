'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { Service } from '@/lib/beautybook-data'
import { formatCOP } from '@/lib/utils'

const filterChips = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Cortes', value: 'CORTES' },
  { label: 'Peinados', value: 'PEINADOS' },
  { label: 'Uñas', value: 'UÑAS' },
  { label: 'Pestañas', value: 'PESTAÑAS' },
  { label: 'Cejas', value: 'CEJAS' },
  { label: 'Maquillaje', value: 'MAQUILLAJE' },
] as const

export function ServicesCatalog({ services }: { services: Service[] }) {
  const [selected, setSelected] = useState<string>('ALL')

  const filtered = selected === 'ALL'
    ? services
    : services.filter((service) => service.category === selected)

  return (
    <>
      <div className="catalog-filters" role="tablist" aria-label="Filtrar servicios por categoría">
        {filterChips.map((chip) => {
          const isActive = selected === chip.value
          return (
            <button
              key={chip.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`catalog-chip${isActive ? ' is-active' : ''}`}
              onClick={() => setSelected(chip.value)}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
      <div className="catalog-grid">
        {filtered.map((service) => {
          const index = services.findIndex((item) => item.id === service.id)
          return (
            <article className="catalog-card" key={service.id}>
              <div className={`catalog-photo catalog-photo-${index + 1}`}>
                <Image
                  src={service.image}
                  alt={`Servicio de ${service.category.toLowerCase()}: ${service.name}`}
                  fill
                  sizes="(max-width: 700px) 100vw, 240px"
                />
                <span className="catalog-index">0{index + 1}</span>
              </div>
              <div className="catalog-details">
                <div className="catalog-copy">
                  <span className="eyebrow">{service.category}</span>
                  <h2>
                    {service.name.split('&').map((part, partIndex, parts) => (
                      <span key={partIndex}>
                        {part}
                        {partIndex < parts.length - 1 && <span className="catalog-amp">&amp;</span>}
                      </span>
                    ))}
                  </h2>
                  <p>{service.description}</p>
                </div>
                <div className="catalog-bottom">
                  <div className="catalog-price">
                    <span>Desde</span>
                    <strong>{formatCOP(service.price)}</strong>
                  </div>
                </div>
                <Link className="catalog-book-button" href={`/reservar?servicio=${service.id}`}>
                  Reservar este servicio <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
