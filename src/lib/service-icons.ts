import { Eye, Hand, Paintbrush, Scissors, Sparkles, type LucideIcon } from 'lucide-react'

const serviceIcons: Record<string, LucideIcon> = {
  corte: Scissors,
  manicura: Hand,
  pestanas: Eye,
  cejas: Sparkles,
  maquillaje: Paintbrush,
}

/** Icono asociado a un servicio por su id. Los servicios sin icono propio usan Sparkles. */
export function getServiceIcon(serviceId: string): LucideIcon {
  return serviceIcons[serviceId] ?? Sparkles
}
