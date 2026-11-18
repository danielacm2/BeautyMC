'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Service } from '@/lib/beautybook-data'
import { getServiceIcon } from '@/lib/service-icons'
import { formatCOP } from '@/lib/utils'

function getVisibleCount() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth <= 620) return 1
  if (window.innerWidth <= 850) return 2
  return 3
}

export function ServicesCarousel({ services }: { services: Service[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [steps, setSteps] = useState(1)
  const [autoPlay, setAutoPlay] = useState(true)
  const programmaticScroll = useRef(false)
  const scrollTimeout = useRef<number | null>(null)

  const activeRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  const scrollToIndex = useCallback((index: number, fromUser = false) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const card = viewport.querySelector<HTMLElement>('.service-card')
    if (!card) return
    const gap = window.innerWidth <= 620 ? 12 : 18
    programmaticScroll.current = true
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
    viewport.scrollTo({ left: index * (card.offsetWidth + gap), behavior: 'smooth' })
    setActive(index)
    if (fromUser) setAutoPlay(false)
    scrollTimeout.current = window.setTimeout(() => {
      programmaticScroll.current = false
    }, 600)
  }, [])

  useEffect(() => {
    const update = () => {
      const visible = getVisibleCount()
      const count = Math.max(1, services.length - visible + 1)
      setSteps(count)
      setActive((current) => Math.min(current, count - 1))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [services.length])

  useEffect(() => {
    if (!autoPlay || steps <= 1) return
    const id = window.setInterval(() => {
      scrollToIndex((activeRef.current + 1) % steps)
    }, 5200)
    return () => window.clearInterval(id)
  }, [steps, autoPlay, scrollToIndex])

  const onScroll = () => {
    const viewport = viewportRef.current
    if (!viewport) return
    const card = viewport.querySelector<HTMLElement>('.service-card')
    if (!card) return
    const gap = window.innerWidth <= 620 ? 12 : 18
    const index = Math.round(viewport.scrollLeft / (card.offsetWidth + gap))
    setActive(Math.max(0, Math.min(index, steps - 1)))
    if (!programmaticScroll.current) setAutoPlay(true)
  }

  const resumeOnUserScroll = () => {
    setAutoPlay(true)
  }

  return (
    <div className="services-carousel">
      <div
        className="services-viewport"
        ref={viewportRef}
        onScroll={onScroll}
        onWheel={resumeOnUserScroll}
        onTouchMove={resumeOnUserScroll}
        onPointerDown={resumeOnUserScroll}
      >
        <div className="services-track">
          {services.map((service, index) => {
            const Icon = getServiceIcon(service.id)
            return (
              <Link href="/servicios" key={service.id} className={`service-card service-tone-${(index % 4) + 1}`}>
                <div className="service-photo">
                  <Image src={service.image} alt={`Servicio de ${service.category.toLowerCase()}`} fill sizes="(max-width: 620px) 85vw, (max-width: 850px) 45vw, 30vw" />
                </div>
                <div className="service-card-content">
                  <div className="service-icon"><Icon /></div>
                  <span className="service-number">0{index + 1}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <span>Desde {formatCOP(service.price)}</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="services-dots" role="tablist" aria-label="Servicios">
        {Array.from({ length: steps }, (_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-label={`Ir al grupo ${index + 1}`}
            className={`services-dot${active === index ? ' is-active' : ''}`}
            onClick={() => scrollToIndex(index, true)}
          />
        ))}
      </div>
    </div>
  )
}
