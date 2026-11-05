# pages/

**Qué va aquí:** una pantalla por archivo (`InventoryPage.tsx`, `DashboardPage.tsx`, `LoginPage.tsx`).

Una página **compone**: llama a los hooks para obtener datos y estado, y pasa esos datos a los componentes de `components/`.

**Reglas**
- No contiene consultas a Supabase ni reglas de negocio; esas viven en `hooks/` y `services/`.
- Si una página supera ~150 líneas, extrae partes a `components/` o la lógica a un hook.
