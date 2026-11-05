# types/

**Qué va aquí:** los **modelos de dominio** de la aplicación en TypeScript (`Product`, `Supplier`, `Category`, `StockMovement`), un archivo por dominio (`inventory.types.ts`).

Son el **contrato** que comparten todas las capas: la UI, los hooks y los servicios hablan en estos tipos.

**Reglas**
- Solo `type` / `interface` / `enum`: sin lógica ni imports de otras capas.
- Nombres en `camelCase` (convención de TypeScript). La conversión desde `snake_case` de la BD ocurre en `services/`.
- Prohibido `any`.
