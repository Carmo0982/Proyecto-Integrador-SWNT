-- =====================================================================
-- MentorLink · Migración: inicializar_esquema
-- Tablas: perfiles, sesiones, mensajes + RLS
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- Perfil público de cada usuario. Su id ES el id de auth.users (1 a 1).
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null check (char_length(trim(nombre)) between 1 and 100),
  bio        text check (char_length(bio) <= 1000),
  rol        text not null default 'estudiante'
             check (rol in ('mentor', 'estudiante')),
  creado_en  timestamptz not null default now()
);

-- Sesión de mentoría entre un mentor y un estudiante.
create table public.sesiones (
  id             uuid primary key default gen_random_uuid(),
  mentor_id      uuid not null references public.perfiles (id) on delete cascade,
  estudiante_id  uuid not null references public.perfiles (id) on delete cascade,
  fecha          timestamptz not null,
  estado         text not null default 'pendiente'
                 check (estado in ('pendiente', 'confirmada', 'completada', 'cancelada')),
  creado_en      timestamptz not null default now(),
  constraint sesiones_participantes_distintos check (mentor_id <> estudiante_id)
);

-- Mensajes dentro de una sesión.
create table public.mensajes (
  id            uuid primary key default gen_random_uuid(),
  sesion_id     uuid not null references public.sesiones (id) on delete cascade,
  remitente_id  uuid not null references public.perfiles (id) on delete cascade,
  contenido     text not null check (char_length(trim(contenido)) between 1 and 2000),
  enviado_en    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. ÍNDICES (claves foráneas y columnas usadas por las políticas RLS)
-- ---------------------------------------------------------------------
create index sesiones_mentor_id_idx      on public.sesiones (mentor_id);
create index sesiones_estudiante_id_idx  on public.sesiones (estudiante_id);
create index mensajes_sesion_id_idx      on public.mensajes (sesion_id, enviado_en);
create index mensajes_remitente_id_idx   on public.mensajes (remitente_id);

-- Un mentor no puede tener dos sesiones activas a la misma hora.
create unique index sesiones_mentor_fecha_unica
  on public.sesiones (mentor_id, fecha)
  where estado <> 'cancelada';

-- ---------------------------------------------------------------------
-- 3. FUNCIONES Y TRIGGERS
-- ---------------------------------------------------------------------

-- Crea el perfil automáticamente al registrarse (Email/Password o Google).
-- Google envía el nombre en raw_user_meta_data ->> 'full_name'.
-- Todo usuario nuevo es 'estudiante'; solo un administrador asigna 'mentor'.
create function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- Garantiza que mentor_id sea un mentor y estudiante_id un estudiante.
create function public.validar_roles_sesion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.perfiles where id = new.mentor_id and rol = 'mentor') then
    raise exception 'mentor_id (%) no corresponde a un perfil con rol mentor', new.mentor_id;
  end if;
  if not exists (select 1 from public.perfiles where id = new.estudiante_id and rol = 'estudiante') then
    raise exception 'estudiante_id (%) no corresponde a un perfil con rol estudiante', new.estudiante_id;
  end if;
  return new;
end;
$$;

create trigger validar_roles_sesion
  before insert or update of mentor_id, estudiante_id on public.sesiones
  for each row execute function public.validar_roles_sesion();

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.perfiles enable row level security;
alter table public.sesiones enable row level security;
alter table public.mensajes enable row level security;

-- Usuarios anónimos (sin sesión) no tienen ningún acceso.
revoke all on public.perfiles, public.sesiones, public.mensajes from anon;

-- ---------- perfiles ----------
-- Cualquier usuario autenticado puede ver perfiles (para buscar mentores).
create policy "perfiles: lectura para autenticados"
  on public.perfiles for select
  to authenticated
  using (true);

-- Cada usuario solo edita su propio perfil...
create policy "perfiles: editar solo el propio"
  on public.perfiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ...y solo las columnas nombre y bio (no puede auto-asignarse rol mentor).
revoke update on public.perfiles from authenticated;
grant update (nombre, bio) on public.perfiles to authenticated;

-- ---------- sesiones ----------
-- Solo los participantes (mentor o estudiante) ven la sesión.
create policy "sesiones: leer solo las propias"
  on public.sesiones for select
  to authenticated
  using ((select auth.uid()) in (mentor_id, estudiante_id));

-- Un estudiante solo puede solicitar sesiones a su nombre y en estado pendiente.
create policy "sesiones: el estudiante crea sus solicitudes"
  on public.sesiones for insert
  to authenticated
  with check (
    (select auth.uid()) = estudiante_id
    and estado = 'pendiente'
  );

-- Los participantes pueden reprogramar o cambiar el estado.
create policy "sesiones: participantes actualizan"
  on public.sesiones for update
  to authenticated
  using ((select auth.uid()) in (mentor_id, estudiante_id))
  with check ((select auth.uid()) in (mentor_id, estudiante_id));

revoke update on public.sesiones from authenticated;
grant update (fecha, estado) on public.sesiones to authenticated;
-- Sin política DELETE: las sesiones se cancelan (estado = 'cancelada'), no se borran.

-- ---------- mensajes ----------
-- Solo se leen los mensajes de sesiones en las que el usuario participa.
create policy "mensajes: leer solo de mis sesiones"
  on public.mensajes for select
  to authenticated
  using (
    exists (
      select 1 from public.sesiones s
      where s.id = sesion_id
        and (select auth.uid()) in (s.mentor_id, s.estudiante_id)
    )
  );

-- Solo se envían mensajes como uno mismo y dentro de una sesión propia.
create policy "mensajes: enviar como participante"
  on public.mensajes for insert
  to authenticated
  with check (
    (select auth.uid()) = remitente_id
    and exists (
      select 1 from public.sesiones s
      where s.id = sesion_id
        and (select auth.uid()) in (s.mentor_id, s.estudiante_id)
    )
  );
-- Sin políticas UPDATE/DELETE: los mensajes son inmutables (historial auditable).
