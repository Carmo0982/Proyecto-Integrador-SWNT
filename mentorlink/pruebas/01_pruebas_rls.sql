\set QUIET on
\pset footer off
\set ON_ERROR_STOP off
-- Usuarios: M = mentor, E1 y E2 = estudiantes (registro tipo Google y tipo Email)
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a', 'ana.mentora@mail.com', '{"full_name":"Ana Mentora"}'),
 ('00000000-0000-0000-0000-0000000000e1', 'luis@mail.com', '{}'),
 ('00000000-0000-0000-0000-0000000000e2', 'sofia@mail.com', '{"full_name":"Sofía Estudiante"}');
\echo '== P1. Perfiles creados automáticamente por el trigger'
select nombre, rol from public.perfiles order by nombre;
-- Un administrador (service_role / SQL Editor) promueve a Ana a mentora
update public.perfiles set rol = 'mentor' where id = '00000000-0000-0000-0000-00000000000a';

\echo '== P2. Trigger: no se puede crear una sesión cuyo mentor es estudiante (esperado: ERROR)'
insert into public.sesiones (mentor_id, estudiante_id, fecha)
values ('00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e1', now());

-- Admin crea una sesión Ana–Sofía
insert into public.sesiones (id, mentor_id, estudiante_id, fecha) values
 ('11111111-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000e2','2026-11-20 15:00-05');

-- ===== Como Luis (E1) =====
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}';
\echo '== P3. Luis solicita sesión con Ana a su nombre (esperado: OK)'
insert into public.sesiones (id, mentor_id, estudiante_id, fecha) values
 ('11111111-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000e1','2026-11-21 10:00-05');
\echo '== P4. Luis ve solo sus sesiones (esperado: 1 fila)'
select count(*) as sesiones_visibles_luis from public.sesiones;
\echo '== P5. Luis envía mensaje en su sesión (esperado: OK)'
insert into public.mensajes (sesion_id, remitente_id, contenido)
values ('11111111-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000e1','Hola Ana, ¿revisamos mi CV?');
commit;

begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
\echo '== P6. Luis intenta crear sesión a nombre de Sofía (esperado: ERROR RLS)'
insert into public.sesiones (mentor_id, estudiante_id, fecha) values
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000e2','2026-12-01 10:00-05');
rollback;

begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
\echo '== P7. Luis intenta escribir en la sesión de Sofía (esperado: ERROR RLS)'
insert into public.mensajes (sesion_id, remitente_id, contenido)
values ('11111111-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000e1','intruso');
rollback;

begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
\echo '== P8. Luis intenta suplantar a Ana como remitente (esperado: ERROR RLS)'
insert into public.mensajes (sesion_id, remitente_id, contenido)
values ('11111111-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','soy Ana');
rollback;

begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
\echo '== P9. Luis intenta auto-asignarse rol mentor (esperado: ERROR permiso)'
update public.perfiles set rol = 'mentor' where id = '00000000-0000-0000-0000-0000000000e1';
rollback;

begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
\echo '== P10. Luis edita su bio (esperado: UPDATE 1) y la de Ana (esperado: UPDATE 0)'
\set QUIET off
update public.perfiles set bio = 'Estudiante de sistemas' where id = '00000000-0000-0000-0000-0000000000e1';
update public.perfiles set bio = 'hackeado' where id = '00000000-0000-0000-0000-00000000000a';
\echo '== P11. Luis intenta borrar su mensaje (esperado: DELETE 0, mensajes inmutables)'
delete from public.mensajes;
\set QUIET on
commit;

-- ===== Como Sofía (E2) =====
begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e2"}';
\echo '== P12. Sofía: sesiones y mensajes visibles (esperado: 1 sesión, 0 mensajes)'
select (select count(*) from public.sesiones) as sesiones_sofia, (select count(*) from public.mensajes) as mensajes_sofia;
commit;

-- ===== Como Ana (mentora) =====
begin; set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';
\echo '== P13. Ana: ve sus 2 sesiones y el mensaje de Luis'
select (select count(*) from public.sesiones) as sesiones_ana, (select string_agg(contenido, ' | ') from public.mensajes) as mensajes_ana;
commit;

\echo '== P14. Doble reserva: misma mentora y misma hora (esperado: ERROR unique)'
insert into public.sesiones (mentor_id, estudiante_id, fecha) values
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000e1','2026-11-20 15:00-05');

begin; set local role anon;
\echo '== P15. Usuario anónimo lee sesiones (esperado: ERROR permiso)'
select * from public.sesiones;
rollback;

\echo '== P16. Restricción: mensaje vacío (esperado: ERROR check)'
insert into public.mensajes (sesion_id, remitente_id, contenido)
values ('11111111-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000e1','   ');
