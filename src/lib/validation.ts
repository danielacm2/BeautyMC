const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Comprueba que el texto tenga forma de correo electrónico (algo@dominio.ext).
 * No recorta espacios: quien llama decide si aplica trim() antes.
 * Esta validación del frontend debe repetirse en el backend.
 */
export function isValidEmail(value: string): boolean {
  return emailPattern.test(value)
}

/**
 * Comprueba que el texto sea un teléfono colombiano válido:
 *  - móvil: 10 dígitos que empiezan por 3 (por ejemplo 300 123 4567);
 *  - fijo: 10 dígitos con indicativo 60X (por ejemplo 604 123 4567).
 * Acepta de forma opcional el prefijo +57, 57 o 0057 y los separadores de presentación
 * (espacios, guiones, puntos y paréntesis). No acepta fijos de 7 dígitos sin indicativo.
 * No recorta ni normaliza el valor guardado: solo decide si es válido.
 * Los indicativos fijos válidos son 601–608 (las 8 zonas de marcación).
 * Esta misma regla debe repetirse en el backend.
 */
export function isValidColombianPhone(value: string): boolean {
  const compact = value.trim().replace(/[\s\-.()]/g, '')
  const hasPlus = compact.startsWith('+')
  if (hasPlus && !compact.startsWith('+57')) return false
  const digits = hasPlus ? compact.slice(1) : compact
  if (!/^\d+$/.test(digits)) return false
  let national = digits
  if (digits.startsWith('0057')) national = digits.slice(4)
  else if (digits.startsWith('57') && (hasPlus || digits.length === 12)) national = digits.slice(2)
  else if (hasPlus) return false
  return /^3\d{9}$/.test(national) || /^60[1-8]\d{7}$/.test(national)
}
