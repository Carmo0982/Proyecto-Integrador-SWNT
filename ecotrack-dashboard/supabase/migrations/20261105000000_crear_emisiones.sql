-- =====================================================================
-- EcoTrack · Tabla de mediciones de emisiones (esquema supuesto del backend)
-- =====================================================================
create table if not exists public.emisiones (
  id             uuid primary key default gen_random_uuid(),
  nombre_fuente  text not null check (char_length(trim(nombre_fuente)) between 2 and 80),
  categoria      text not null check (categoria in ('transporte', 'energia', 'residuos')),
  co2_kg         numeric(12, 2) not null check (co2_kg > 0 and co2_kg <= 1000000),
  medido_en      timestamptz not null default now()
);

create index if not exists emisiones_medido_en_idx on public.emisiones (medido_en desc);

-- Seguridad a nivel de fila.
alter table public.emisiones enable row level security;

-- DEMO del laboratorio: la app no tiene inicio de sesión, por eso se permite
-- leer e insertar con la anon key. En producción: solo `authenticated` y
-- filtrar por la empresa del usuario.
create policy "emisiones: lectura demo"
  on public.emisiones for select
  to anon, authenticated
  using (true);

create policy "emisiones: inserción demo"
  on public.emisiones for insert
  to anon, authenticated
  with check (true);

-- Habilita Supabase Realtime para esta tabla (eventos INSERT en el dashboard).
alter publication supabase_realtime add table public.emisiones;
