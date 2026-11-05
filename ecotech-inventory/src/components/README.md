# components/

**Qué va aquí:** componentes de interfaz **presentacionales**. Reciben datos por *props* y avisan acciones por *callbacks* (`onSave`, `onDelete`).

| Subcarpeta | Contenido |
|---|---|
| `ui/` | Piezas genéricas reutilizables sin conocimiento del dominio: `Button`, `Input`, `Modal`, `Table`. |
| `layout/` | Estructura visual de la app: `Header`, `Sidebar`, `PageContainer`. |
| `inventory/` | Componentes del dominio de inventario: `ProductTable`, `ProductForm`, `StockBadge`. |

**Reglas**
- Prohibido importar `@/services` o `@supabase/supabase-js`. Si un componente necesita datos, los recibe de una página o de un hook.
- Sin `useEffect` que haga peticiones de red.
- Un componente por archivo, nombre en `PascalCase` (`ProductTable.tsx`).
