# supabase/

Carpeta gestionada con **Supabase CLI** (fuera de `src/` porque no forma parte del bundle del frontend).

- `migrations/`: archivos SQL versionados con el esquema de tablas y las políticas **RLS**. Se crean con `npx supabase migration new <nombre>`.

Tras cada migración, regenerar los tipos en `src/services/supabase/database.types.ts`.
