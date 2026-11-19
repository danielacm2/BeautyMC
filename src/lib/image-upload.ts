/** Tamaño máximo de una imagen subida desde un formulario: 2 MB exactos son válidos, más no. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

/**
 * Valida y lee una imagen elegida en un formulario, y la entrega como data URL.
 * Rechaza lo que no sea una imagen y los archivos de más de 2 MB. Cada formulario decide cómo
 * mostrar el mensaje de error (campo de error, aviso, etc.) y qué hacer con la imagen leída.
 * El backend deberá repetir estas mismas comprobaciones.
 */
export function readImageFile(
  file: File,
  { onLoad, onError }: { onLoad: (dataUrl: string) => void; onError: (message: string) => void },
): void {
  if (!file.type.startsWith('image/')) {
    onError('El archivo debe ser una imagen.')
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    onError('La imagen no puede pesar más de 2 MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => onLoad(String(reader.result ?? ''))
  reader.onerror = () => onError('No se pudo leer la imagen. Prueba con otra.')
  reader.readAsDataURL(file)
}
