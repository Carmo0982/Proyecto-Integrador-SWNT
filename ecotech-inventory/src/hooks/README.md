# hooks/

**Qué va aquí:** hooks personalizados (`useProducts`, `useSuppliers`, `useAuth`) que contienen la **lógica de negocio del lado del cliente** y el estado asociado: datos, `loading`, `error`, validaciones y acciones.

Son el puente entre la UI y los servicios: llaman a `services/` y exponen a la UI una interfaz simple.

**Reglas**
- Nombre siempre con prefijo `use` y en `camelCase` (`useProducts.ts`).
- Nunca importan el cliente de Supabase directamente: usan funciones de `services/`.
- No devuelven JSX.

Ejemplo de referencia: `useProducts.ts`.
