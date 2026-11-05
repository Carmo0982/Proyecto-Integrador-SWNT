# EcoTrack · Dashboard de Emisiones en Tiempo Real

React 19 + TypeScript (estricto) + Vite + Tailwind CSS 4 + Supabase.

## Ejecutar
1. `npm install`
2. (Opcional) Copiar `.env.example` a `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, y aplicar `supabase/migrations/20261105000000_crear_emisiones.sql`. Sin credenciales, la app usa datos simulados.
3. `npm run dev`

En modo simulado puedes forzar estados con la URL: `?simular=error-carga`, `?simular=error-insercion`, `?simular=sin-tiempo-real`.

## Scripts
| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación de tipos y build |
| `npm run lint` | oxlint |
| `npm test` | Pruebas (Vitest + Testing Library) |

## Archivos clave
- `src/components/emissions/EmissionsTracker.tsx`
- `src/hooks/useEmissions.ts`
- `src/lib/supabaseClient.ts` y `src/services/emissionsRepository.ts`
- `docs/BITACORA_PROMPTS.md`: bitácora de prompts e iteraciones
- `docs/capturas/`: capturas y video de demostración
