# Especificación de Arquitectura — EcoTech Inventory

## 1. Problema
El equipo mezcla lógica de negocio y consultas a la base de datos dentro de los componentes. El resultado son componentes difíciles de probar, errores repetidos en varias pantallas y cambios de esquema que rompen la interfaz en lugares inesperados. Siguiendo SDD, este documento se escribe **antes** del código: la estructura de carpetas es el plano y el contrato que todo el equipo respeta.

## 2. Decisión: capas con dependencias en una sola dirección

```
pages → components / hooks → services → services/supabase → Supabase
```

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| UI | `components/`, `pages/` | Mostrar datos y capturar eventos. |
| Lógica | `hooks/`, `context/` | Estado, carga, errores y reglas del cliente. |
| Servicios | `services/` | Acceso a datos por dominio. |
| Integración | `services/supabase/` | Cliente único y tipos de la BD. |
| Contratos | `types/` | Modelos de dominio compartidos. |
| Utilidades | `utils/` | Funciones puras. |

Organicé por **responsabilidad** y no por funcionalidad porque, para un equipo junior, una regla simple ("si habla con la base de datos, va en `services/`") reduce las dudas sobre dónde ubicar cada archivo. Un dominio nuevo, como pedidos, se agrega con un archivo por capa (`orders.service.ts`, `useOrders.ts`, `components/orders/`) sin mover nada existente.

## 3. Relación con Supabase
1. **Cliente único** en `services/supabase/client.ts`, leído de `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Evita sesiones inconsistentes por instancias duplicadas.
2. **Tipos generados** (`database.types.ts`) con `supabase gen types`. Si una columna cambia, TypeScript señala el error en el servicio afectado, no en producción.
3. **Traducción en la frontera**: los servicios convierten filas `snake_case` de PostgreSQL en modelos `camelCase` de `types/`. La UI nunca depende del esquema físico de la base de datos.
4. **Errores normalizados**: cada servicio transforma el error de Supabase en un `Error` con mensaje claro que el hook expone como estado.
5. **Seguridad**: el frontend solo usa la *anon key*; los permisos reales viven en políticas RLS versionadas en `supabase/migrations/`.

Si mañana se cambia Supabase por otra API, solo se reescribe `services/`; hooks, páginas y componentes no cambian.

## 4. Cómo se hace cumplir
- **oxlint** (`no-restricted-imports`) marca como error que `components/` o `pages/` importen `services` o `@supabase/supabase-js`, y que cualquier capa distinta de `services/` use el cliente.
- TypeScript estricto y `no-explicit-any` como error.
- Alias `@/` para importaciones legibles y estables.
- Cada carpeta tiene un `README.md` con qué va y qué está prohibido.

## 5. Consecuencias
- **A favor**: componentes fáciles de probar con *props*, lógica reutilizable en hooks, un único punto de cambio para datos.
- **En contra**: más archivos por funcionalidad. Se acepta ese costo porque es menor que la deuda técnica de mezclar capas.
- **Revisión futura**: si el proyecto supera unos diez dominios, conviene agrupar por funcionalidad (`features/`) manteniendo estas mismas capas dentro de cada una.
