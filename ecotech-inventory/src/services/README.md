# services/

**Qué va aquí:** la **capa de acceso a datos**. Un archivo por dominio (`products.service.ts`, `suppliers.service.ts`, `auth.service.ts`) con funciones asíncronas que hablan con Supabase y devuelven **tipos de dominio** (`Product`, no filas crudas de la BD).

Responsabilidades:
1. Ejecutar consultas (`select`, `insert`, `update`, `delete`, RPC, Storage).
2. Traducir filas `snake_case` de PostgreSQL a modelos `camelCase` de `types/`.
3. Convertir errores de Supabase en `Error` con mensajes claros.

**Reglas**
- Es la **única** capa que importa `./supabase`.
- No usa React (sin hooks, sin JSX): son funciones puras de TypeScript, fáciles de probar.

Ejemplo de referencia: `products.service.ts`.
