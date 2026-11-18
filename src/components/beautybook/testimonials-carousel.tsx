'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import type { Testimonial } from '@/lib/beautybook-data'
import { getCarouselVisibleCount } from '@/lib/carousel'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
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
    const card = viewport.querySelector<HTMLElement>('.testimonial-card')
    if (!card) return
    const gap = 28
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
      const visible = getCarouselVisibleCount()
      const count = Math.max(1, testimonials.length - visible + 1)
      setSteps(count)
      setActive((current) => Math.min(current, count - 1))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [testimonials.length])

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
    const card = viewport.querySelector<HTMLElement>('.testimonial-card')
    if (!card) return
    const index = Math.round(viewport.scrollLeft / (card.offsetWidth + 28))
    setActive(Math.max(0, Math.min(index, steps - 1)))
    if (!programmaticScroll.current) setAutoPlay(true)
  }

  const resumeOnUserScroll = () => {
    setAutoPlay(true)
  }

  return (
    <div className="testimonials-carousel">
      <div
        className="testimonials-viewport"
        ref={viewportRef}
        onScroll={onScroll}
        onWheel={resumeOnUserScroll}
        onTouchMove={resumeOnUserScroll}
        onPointerDown={resumeOnUserScroll}
      >
        <div className="testimonials-track">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="testimonial-card-top">
                <div className="quote-stars" role="img" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={18} strokeWidth={0} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <span className="quote-mark" aria-hidden="true">“</span>
              </div>
              <blockquote>{testimonial.quote}</blockquote>
              <footer className="testimonial-card-footer">
                <span className="testimonial-avatar" aria-hidden="true">{getInitials(testimonial.name)}</span>
                <span className="testimonial-author">{testimonial.name}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
      <div className="testimonials-dots" role="tablist" aria-label="Testimonios">
        {Array.from({ length: steps }, (_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-label={`Ir al grupo ${index + 1}`}
            className={`testimonial-dot${active === index ? ' is-active' : ''}`}
            onClick={() => scrollToIndex(index, true)}
          />
        ))}
      </div>
    </div>
  )
}
