export interface Service { id: string; name: string; category: string; description: string; price: number; image: string }
export interface Professional { id: string; name: string; specialty: string; initials: string; image: string; categories?: string[]; email?: string; password?: string; phone?: string; bio?: string }
export const services: Service[] = [
  { id: 'corte', name: 'Corte', category: 'CORTES', description: 'Un corte pensado para ti, con lavado relajante y acabado.', price: 200000, image: '/beauty-service-hair.png' },
  { id: 'peinado', name: 'Peinado & ondas', category: 'PEINADOS', description: 'Brushing, ondas suaves o recogido elegante con acabado de larga duración.', price: 115000, image: '/beauty-service-hair.png' },
  { id: 'manicura', name: 'Manicura esencial', category: 'UÑAS', description: 'Cuidado completo de uñas, hidratación y esmaltado impecable.', price: 145000, image: '/beauty-service-nails.png' },
  { id: 'pestanas', name: 'Lifting & mirada', category: 'PESTAÑAS', description: 'Diseño y lifting para realzar tu mirada de forma natural.', price: 170000, image: '/beauty-service-lashes.png' },
  { id: 'cejas', name: 'Diseño de cejas', category: 'CEJAS', description: 'Diseño personalizado, depilación y definición de la forma.', price: 110000, image: '/beauty-service-brows.png' },
  { id: 'maquillaje', name: 'Maquillaje especial', category: 'MAQUILLAJE', description: 'Un look a medida para celebrar tus momentos especiales.', price: 260000, image: '/beauty-service-makeup.png' },
]
export const professionals: Professional[] = [
  { id: 'laura', name: 'Laura Martín', specialty: 'Peluquería & color', initials: 'LM', image: '/professional-laura.jpg' },
  { id: 'clara', name: 'Clara Ruiz', specialty: 'Manicura & nail art', initials: 'CR', image: '/professional-clara.jpg' },
  { id: 'ines', name: 'Inés Vega', specialty: 'Cejas & mirada', initials: 'IV', image: '/professional-ines.jpg' },
  { id: 'matias', name: 'Matías Rojas', specialty: 'Peluquería & color', initials: 'MR', image: '/professional-matias.jpg' },
]

export const serviceProfessionals: Record<string, string[]> = {
  corte: ['laura', 'matias'],
  peinado: ['laura', 'matias'],
  manicura: ['clara'],
  pestanas: ['ines'],
  cejas: ['ines'],
  maquillaje: ['laura', 'ines'],
}
export interface Testimonial { name: string; quote: string }
export const testimonials: Testimonial[] = [
  { name: 'Lucía M.', quote: 'Entrar en BeautyMC es como regalarte una pausa. Salgo sintiéndome yo, pero en mi mejor versión.' },
  { name: 'Marta R.', quote: 'Por fin un salón donde escuchan lo que quiero. Cada visita se siente como un ratito solo para mí.' },
  { name: 'Ana P.', quote: 'El equipo es maravilloso y el espacio transmite calma desde el primer minuto. Ya es mi sitio favorito.' },
  { name: 'Sofía G.', quote: 'Un equipo atento y un espacio precioso. Cada visita se convierte en un momento para desconectar y cuidarme.' },
]
