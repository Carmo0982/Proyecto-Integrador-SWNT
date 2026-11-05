# services/supabase/

**Qué va aquí:** exclusivamente la **integración técnica con Supabase**.

| Archivo | Contenido |
|---|---|
| `client.ts` | Instancia **única** del cliente (`createClient<Database>`), leída de variables de entorno. |
| `database.types.ts` | Tipos del esquema de la BD. Se regeneran con `npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts`. |
| `index.ts` | Punto de entrada público de esta carpeta. |

**Reglas**
- No se edita `database.types.ts` a mano en producción: se regenera tras cada migración.
- Solo los archivos de `services/` importan desde aquí.
- Nunca se usa la `service_role` key en el frontend; solo la `anon key` protegida por RLS.
