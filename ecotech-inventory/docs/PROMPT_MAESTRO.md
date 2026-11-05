# Prompt Maestro — Generación de la arquitectura de EcoTech Solutions

> Prompt exacto utilizado para generar la estructura de carpetas del proyecto.

---

## ROL
Actúa como **Arquitecto de Software Senior** especializado en aplicaciones frontend con **React + TypeScript** y en backends tipo BaaS con **Supabase**. Aplicas Desarrollo Basado en Especificaciones (SDD): primero defines el plano (estructura y contratos) y después se escribe el código.

## CONTEXTO
- Empresa: startup **EcoTech Solutions**.
- Producto: aplicación web de **gestión de inventario sostenible** (productos, categorías, proveedores, movimientos de stock y métricas de sostenibilidad como huella de carbono y porcentaje de material reciclado).
- Equipo: desarrolladores **junior** que tienden a mezclar lógica de negocio y llamadas a la base de datos dentro de los componentes de la interfaz, lo que provoca errores constantes.
- Objetivo: definir el *scaffolding* inicial que haga difícil cometer ese error y que escale con nuevos módulos.

## RESTRICCIONES TÉCNICAS
1. React 19 + **TypeScript en modo estricto** + **Vite** (plantilla `react-ts`).
2. **Supabase** (`@supabase/supabase-js` v2) para Auth, PostgreSQL con Row Level Security y Storage.
3. Sin librerías externas de estado global: el estado transversal (sesión) se maneja con **Context API**.
4. Variables de entorno con prefijo `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); nunca credenciales en el código.

## REQUISITOS DE ARQUITECTURA
1. **Separación de preocupaciones** en capas explícitas: UI (`components`, `pages`), lógica (`hooks`, `context`), servicios (`services`) y tipos (`types`).
2. Una **carpeta exclusiva para la integración con Supabase** (`src/services/supabase/`) que contenga el cliente único, los tipos generados de la base de datos y nada de lógica de UI.
3. **Regla de dependencias unidireccional**: `pages → components / hooks → services → supabase`. Ningún componente ni página puede importar el cliente de Supabase.
4. Una carpeta `supabase/` en la raíz para migraciones SQL, siguiendo la convención de Supabase CLI.
5. **Escalabilidad**: agregar un dominio nuevo (por ejemplo, "pedidos") no debe obligar a mover archivos existentes.
6. Cada carpeta debe justificar su existencia: no propongas carpetas vacías "por si acaso".

## FORMATO DE SALIDA (obligatorio)
Responde únicamente con estas cuatro secciones, en este orden:
1. **Árbol de directorios** en un bloque de código con estilo `tree`, máximo 4 niveles, incluyendo solo carpetas y archivos base.
2. **Tabla** con las columnas: `Carpeta | Responsabilidad | Puede importar de | No puede importar de`.
3. **Un único comando** `mkdir -p` para bash y su equivalente en PowerShell, ejecutables desde la raíz del proyecto.
4. **Máximo 5 riesgos de deuda técnica** que esta estructura previene, una línea cada uno.

No escribas código de componentes; entrega solo la estructura.
