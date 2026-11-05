# EcoTech Inventory

Aplicación de gestión de inventario sostenible. React 19 + TypeScript + Vite + Supabase.

## Puesta en marcha
1. `npm install`
2. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. `npm run dev`

## Scripts
| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación de tipos y build de producción |
| `npm run lint` | oxlint, incluida la regla que impide que la UI acceda a Supabase |

## Documentación
- `ARCHITECTURE.md`: especificación y justificación de la arquitectura.
- `docs/PROMPT_MAESTRO.md`: prompt usado para generar la estructura.
- `docs/RESPUESTA_IA.md`: respuesta de la IA y comando de creación.
- `docs/arbol-directorios.txt`: árbol de directorios final.
- Cada carpeta de `src/` tiene un `README.md` con sus reglas.
