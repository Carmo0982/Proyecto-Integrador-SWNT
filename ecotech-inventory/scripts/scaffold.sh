#!/usr/bin/env bash
# Crea la estructura de carpetas propuesta por la IA (ver docs/RESPUESTA_IA.md).
# Ejecutar desde la raíz del proyecto: bash scripts/scaffold.sh
set -euo pipefail

mkdir -p supabase/migrations docs scripts src/{components/{ui,layout,inventory},pages,hooks,context,services/supabase,types,utils}

echo "Estructura creada."
