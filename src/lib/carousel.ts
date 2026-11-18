/** Número de tarjetas visibles a la vez en los carruseles según el ancho de la ventana. */
export function getCarouselVisibleCount(): number {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth <= 620) return 1
  if (window.innerWidth <= 850) return 2
  return 3
}
