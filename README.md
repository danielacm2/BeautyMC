# BeautyMC

Aplicación web de un salón de belleza en Colombia: sitio público para conocer los servicios y reservar citas, y dos paneles internos (administración y profesional).

> **Estado del proyecto: solo frontend.** No existe todavía backend, base de datos ni autenticación. Todo lo que se ve en los paneles son **datos de demostración** que viven en memoria y se pierden al recargar la página.

## Tecnologías

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 (solo unas pocas utilidades) + CSS propio por zona
- `lucide-react` para iconos · `next/font` (Playfair Display e Inter) · `@vercel/analytics`
- pnpm como gestor de paquetes

## Puesta en marcha

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `pnpm build` | Compila para producción (necesita red para descargar las fuentes de Google). |
| `pnpm start` | Sirve la compilación de producción. |
| `pnpm lint` | ESLint. |
| `pnpm exec tsc --noEmit` | Comprobación de tipos. |

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Portada: hero, servicios, equipo, testimonios. |
| `/servicios` | Catálogo de servicios. |
| `/reservar` | Reserva en 5 pasos. Acepta `?servicio=<id>&profesional=<id>`; la profesional solo se preselecciona si atiende ese servicio. |
| `/gestionar` | Consulta, modificación y cancelación de una cita con su código. |
| `/login` | Formulario de acceso (solo validación visual, no autentica). |
| `/admin` | Panel de administración. |
| `/profesional` | Panel de la profesional. |

### ⚠️ Sin autenticación ni protección de rutas

`/admin` y `/profesional` **son accesibles para cualquiera**: no hay sesión, roles, middleware ni protección alguna, y `/login` no inicia sesión de verdad. Las contraseñas que piden los formularios de profesionales no se guardan ni se envían a ninguna parte. Antes de publicar con datos reales hay que implementar autenticación y autorización en el backend y proteger ambas rutas.

## Estructura

```
src/
├─ app/
│  ├─ layout.tsx, globals.css       Layout raíz, fuentes y estilos del sitio público
│  ├─ page.tsx, servicios/, reservar/, gestionar/, login/   Sitio público
│  ├─ dashboard-base.css            Estilos comunes a los dos paneles
│  ├─ admin/                        Panel de administración (layout + page)
│  └─ profesional/                  Panel profesional (layout + page + profesional.css)
├─ components/beautybook/
│  ├─ booking-flow.tsx, manage-booking.tsx, login-form.tsx, …   Sitio público
│  ├─ dashboard-shell.tsx           Marco común de los paneles (menú lateral, barra superior)
│  ├─ dashboard-ui.tsx              Piezas compartidas: Modal, DialogBackdrop, DeleteDialog, FilterDropdown, Pager…
│  ├─ admin-dashboard.tsx + admin/  Vistas del panel de administración
│  └─ professional-dashboard.tsx + professional/   Vistas del panel profesional
└─ lib/
   ├─ beautybook-data.ts            Datos públicos: servicios, profesionales, testimonios
   ├─ dashboard-demo-data.ts        Datos de demostración de los paneles y tipos administrativos
   ├─ validation.ts                 Validación de correo y teléfono
   ├─ image-upload.ts               Lectura y validación de imágenes subidas
   ├─ date-utils.ts, demo-availability.ts, utils.ts, …
public/                             Imágenes (JPEG optimizados)
```

Los tipos **públicos** (`Professional`, `Service`) están en `beautybook-data.ts`. Los **administrativos** (`AdminProfessional`, con correo, teléfono, contraseña del formulario, horario, etc.) están en `dashboard-demo-data.ts` y no se usan en el sitio público.

## Validaciones que deberá repetir el backend

El frontend valida por comodidad de la usuaria; **el backend debe volver a validar todo** porque el navegador no es de fiar.

- **Correo** (`isValidEmail`): forma `algo@dominio.ext`.
- **Teléfono colombiano** (`isValidColombianPhone`):
  - móvil: 10 dígitos que empiezan por `3`;
  - fijo: 10 dígitos con indicativo `601`–`608`;
  - prefijo opcional `+57`, `57` o `0057`; se admiten espacios, guiones, puntos y paréntesis como formato;
  - no se aceptan fijos de 7 dígitos sin indicativo.
  - Conviene guardar el número normalizado (por ejemplo `+573001234567`).
- **Imágenes subidas**: deben ser `image/*` y pesar **2 MB o menos** (2 MB exactos son válidos). Comprobar también el contenido real del archivo, no solo la extensión.
- **Reserva**: servicio, fecha y hora obligatorios; la profesional debe atender el servicio elegido; no se puede reservar en el pasado ni en domingo.
- **Contraseñas de profesionales**: obligatorias en el formulario; en el backend solo deben guardarse como hash.
- **Estados de cita** (`Confirmada`, `Pendiente`, `Completada`, `Cancelada`): el frontend no define reglas de transición entre estados; hay que acordarlas antes de implementarlas.

## Datos de demostración pendientes

- Los datos de contacto del salón son de demostración y **no coinciden entre sí**: el pie de página usa `beautymc@gmail.com`, Configuración usa `hola@beautymc.studio` y `+57 314 892 4510`, y hay una dirección con «Calle Sur, 42 123». Hay que confirmar los reales con el negocio.
- Los clientes y citas de demostración están fechados respecto al «hoy» ficticio del 14 de noviembre de 2026 (`DEMO_TODAY_LABEL`).
- Algunos datos de demostración usan teléfonos con prefijos internacionales a propósito (p. ej. `+34`); no pasan por `isValidColombianPhone` hasta que se editen.
- Las cifras del inicio de administración (citas de hoy, ingresos, «1.284» clientes, porcentajes de variación) y los porcentajes del panel profesional son ilustrativos y no se calculan a partir de los datos de muestra; no hay forma de confirmar valores reales sin backend. Habrá que calcularlos a partir de la base de datos.
- No hay interfaz para cambiar el estado de una cita (`Pendiente` → `Confirmada` → `Completada` / `Cancelada`): el proyecto no define sus reglas de transición y no se han inventado.
