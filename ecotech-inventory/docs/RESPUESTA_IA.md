# Respuesta de la IA al Prompt Maestro

> Respuesta generada por Claude (Anthropic) al prompt de `PROMPT_MAESTRO.md`. Es la base del comando ejecutado en `scripts/scaffold.sh`.

## 1. Árbol de directorios

```
ecotech-inventory/
├── supabase/
│   └── migrations/
├── docs/
├── scripts/
└── src/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   └── inventory/
    ├── pages/
    ├── hooks/
    ├── context/
    ├── services/
    │   └── supabase/
    ├── types/
    └── utils/
```

## 2. Responsabilidades y reglas de importación

| Carpeta | Responsabilidad | Puede importar de | No puede importar de |
|---|---|---|---|
| `components/` | UI presentacional: recibe *props* y emite eventos | `types`, `utils`, otros `components` | `services`, `supabase` |
| `pages/` | Pantallas: componen componentes y hooks | `components`, `hooks`, `context`, `types` | `services`, `supabase` |
| `hooks/` | Lógica de negocio y estado de la UI (carga, error, datos) | `services`, `context`, `types`, `utils` | `components`, `pages` |
| `context/` | Estado transversal (sesión de usuario) | `services`, `types` | `components`, `pages` |
| `services/` | Casos de acceso a datos por dominio (CRUD, consultas) | `services/supabase`, `types` | `components`, `hooks`, `pages` |
| `services/supabase/` | Cliente único y tipos generados de la BD | `@supabase/supabase-js` | Cualquier capa de la app |
| `types/` | Modelos de dominio (`Product`, `Supplier`…) | Nada (o solo `types`) | Todo lo demás |
| `utils/` | Funciones puras sin efectos secundarios | `types` | `services`, `hooks`, `components` |
| `supabase/migrations/` | Esquema SQL versionado y políticas RLS | — | — |

## 3. Comando de creación

**bash**
```bash
mkdir -p supabase/migrations docs scripts src/{components/{ui,layout,inventory},pages,hooks,context,services/supabase,types,utils}
```

**PowerShell**
```powershell
"supabase/migrations","docs","scripts","src/components/ui","src/components/layout","src/components/inventory","src/pages","src/hooks","src/context","src/services/supabase","src/types","src/utils" | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }
```

## 4. Deuda técnica que se previene
1. Consultas a Supabase dispersas en componentes, imposibles de rastrear o probar.
2. Cambios de esquema en la BD que rompen pantallas en lugares inesperados.
3. Componentes gigantes que mezclan estado, red y presentación.
4. Múltiples instancias del cliente de Supabase con sesiones inconsistentes.
5. Tipos duplicados o `any` que ocultan errores hasta producción.
