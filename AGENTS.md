# BeautyMC - Instrucciones del proyecto

Instrucciones comunes para cualquier agente o asistente de código. `CLAUDE.md` las importa y solo añade lo específico de Claude Code.

## Información general
- BeautyMC es una aplicación web de un salón de belleza en Colombia, desarrollada con Next.js 16 (App Router), React 19 y TypeScript. Usa Tailwind CSS 4 (pocas utilidades) y CSS propio por zona, `lucide-react` para iconos y `next/font`.
- Se utiliza pnpm como gestor de paquetes. Comandos: `pnpm dev`, `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build`.
- Actualmente el proyecto contiene únicamente el frontend. Todavía no existe un backend ni una base de datos implementados.
- Los paneles `/admin` y `/profesional` **no tienen autenticación ni protección de rutas** (cualquiera puede abrirlos) y `/login` no inicia sesión. Todos sus datos son de demostración en memoria y se pierden al recargar.
- La descripción del proyecto, las rutas y la estructura están en `README.md`; mantenerlo al día.

## Uso de Codebase Memory MCP
- Antes de explorar el código para una tarea, utilizar Codebase Memory MCP para localizar los archivos, componentes, funciones y dependencias relevantes.
- Aprovechar el grafo de conocimiento para comprender las relaciones entre los módulos.
- Consultar el código fuente de los archivos relevantes antes de modificarlos.
- Evitar explorar o leer archivos y directorios que no estén relacionados con la tarea.
- Identificar los posibles efectos de los cambios sobre otros componentes.

## Desarrollo
- Respetar la arquitectura y organización existente.
- Mantener los patrones visuales y de programación del proyecto.
- No modificar funcionalidades ajenas a la tarea solicitada.
- No instalar dependencias ni cambiar configuraciones sin necesidad.
- Verificar los cambios realizados y comprobar que no afecten otras funcionalidades.

## Estructura y convenciones
- Sitio público: `src/app/*` y `src/components/beautybook/*` (reserva, gestión de cita, login). Estilos en `src/app/globals.css`.
- Paneles: `dashboard-shell.tsx` (marco común, recibe nombre, iniciales y fecha por props), `admin-dashboard.tsx` + `admin/`, `professional-dashboard.tsx` + `professional/`. Estilos comunes en `src/app/dashboard-base.css`; los propios del panel profesional en `src/app/profesional/profesional.css`.
- Piezas compartidas de los paneles en `dashboard-ui.tsx` (`Modal`, `DialogBackdrop`, `DeleteDialog`, `FilterDropdown`, `Pager`/`usePagination`, `useDismissable`). Todo diálogo debe usar `Modal` o `DialogBackdrop` para tener Escape, bloqueo de scroll y manejo del foco coherentes; los desplegables usan `useDismissable` para que Escape cierre solo el desplegable.
- Tipos públicos (`Professional`, `Service`) en `src/lib/beautybook-data.ts`; tipos administrativos (`AdminProfessional`, con contraseña de formulario, correo, teléfono…) en `src/lib/dashboard-demo-data.ts`. No mezclar datos administrativos en tipos públicos.
- Validaciones en `src/lib/validation.ts` (`isValidEmail`, `isValidColombianPhone`) y subida de imágenes en `src/lib/image-upload.ts` (máx. 2 MB). Reutilizarlas en todos los formularios; **el backend deberá repetir las mismas reglas**.

## Datos de demostración y límites actuales
- Los datos de contacto son ficticios: correos `@example.com`, `@beautymc.example` y `demo@beautymc.test`, y el teléfono `+57 300 000 0000`. No introducir datos personales ni de contacto reales.
- Las imágenes de `public/` fueron generadas con herramientas de inteligencia artificial y son ilustrativas.
- No inventar reglas de negocio (por ejemplo transiciones entre estados de cita): documentarlas como pendientes.
- Las contraseñas de los formularios de profesionales no se guardan ni se envían a ningún sitio; no implementar autenticación real sin definir antes la arquitectura del backend.

## Evolución del proyecto
- Mantener estas instrucciones actualizadas cuando cambien las tecnologías, la arquitectura o las funcionalidades.
- Cuando se implemente el backend y la base de datos, actualizar la documentación para reflejar la arquitectura real.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
