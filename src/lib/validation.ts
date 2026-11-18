const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Comprueba que el texto tenga forma de correo electrónico (algo@dominio.ext).
 * No recorta espacios: quien llama decide si aplica trim() antes.
 * Esta validación del frontend debe repetirse en el backend.
 */
export function isValidEmail(value: string): boolean {
  return emailPattern.test(value)
}
