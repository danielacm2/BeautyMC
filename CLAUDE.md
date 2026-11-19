# BeautyMC - Instrucciones para Claude Code

@AGENTS.md

## Específico de Claude Code
- Las instrucciones del proyecto (estructura, convenciones, validaciones, límites actuales) están en `AGENTS.md`, importado arriba; no duplicarlas aquí.
- La configuración local de Claude vive en `.claude/` y está ignorada por Git (`.gitignore`): no versionarla ni incluir rutas locales en archivos del repositorio.
- No añadir líneas de coautoría ni atribución de Claude en mensajes de commit ni en descripciones de pull request.
- `next dev` puede añadir a `AGENTS.md` el bloque autogenerado entre `BEGIN/END:nextjs-agent-rules`; incluirlo en un commit solo si es intencionado.
