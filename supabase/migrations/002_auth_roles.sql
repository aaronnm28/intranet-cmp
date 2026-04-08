-- ================================================================
-- INTRANET CMP — Migración 002: Auth + Roles de usuario
-- Ejecutar en Supabase: SQL Editor → New Query → Run
-- ================================================================

-- Tabla de perfiles de usuario (vinculada a Supabase Auth)
create table if not exists user_profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  colaborador_id uuid references colaboradores(id),
  rol            text not null default 'colaborador',
  -- roles: colaborador | custodio | gdth | contabilidad | admin
  nombres        text not null,
  apellidos      text not null,
  area           text not null default '',
  avatar_initials text generated always as (
    upper(left(nombres, 1) || left(apellidos, 1))
  ) stored,
  created_at     timestamptz default now()
);

comment on column user_profiles.rol is
  'colaborador = usuario final; custodio = responsable de área de bienes;
   gdth = Gestión de Talento Humano; contabilidad = área contabilidad; admin = superusuario';

-- RLS: cada usuario ve y edita solo su propio perfil; admin ve todo
alter table user_profiles enable row level security;

create policy "Perfil propio" on user_profiles
  for select using (auth.uid() = id);

create policy "Admin: acceso total" on user_profiles
  for all using (
    exists (
      select 1 from user_profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- Trigger: al crear usuario en Auth, insertar perfil vacío automáticamente
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (id, nombres, apellidos, area, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombres', ''),
    coalesce(new.raw_user_meta_data->>'apellidos', ''),
    coalesce(new.raw_user_meta_data->>'area', ''),
    coalesce(new.raw_user_meta_data->>'rol', 'colaborador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ================================================================
-- USUARIOS DE PRUEBA — crear manualmente en Supabase Auth Dashboard
-- o vía SQL (requiere extensión pgcrypto activada):
-- Authentication → Users → Add User → luego insertar perfil:
-- ================================================================

-- Ejemplo de inserción de perfiles (después de crear los users en Auth):
-- insert into user_profiles (id, nombres, apellidos, area, rol) values
--   ('<uuid-del-user>', 'Aaron Samuel', 'Nuñez Muñoz', 'UN. DE TI', 'admin'),
--   ('<uuid-del-user>', 'Carlos', 'Pérez Ramos', 'UN. DE TI', 'colaborador'),
--   ('<uuid-del-user>', 'María', 'Torres Huamán', 'UN. DE GDTH', 'gdth');

-- ================================================================
-- MEJORAS MENORES AL SCHEMA EXISTENTE
-- ================================================================

-- Agregar campo codigo_qr a bienes (para trazabilidad)
alter table bienes add column if not exists codigo_qr text;
alter table bienes add column if not exists area_funcional text;

-- Actualizar bienes existentes con QR de demo
update bienes set codigo_qr = 'CMP-038401', area_funcional = 'UN. DE TI' where codigo = 'TI-LAP-001';
update bienes set codigo_qr = 'CMP-038402', area_funcional = 'UN. DE TI' where codigo = 'TI-MON-002';
update bienes set codigo_qr = 'CMP-038403', area_funcional = 'UN. DE COMUNICACIONES' where codigo = 'TI-TEL-001';

-- Tabla accesorios (separada de bienes, items de menor valor)
create table if not exists accesorios (
  id             uuid primary key default gen_random_uuid(),
  codigo         text unique not null,  -- formato: 2026_ADM_NNNN
  nombre         text not null,
  marca          text,
  area_funcional text,
  estado_fisico  text default 'bueno',  -- bueno | regular | malo
  colaborador_id uuid references colaboradores(id),
  created_at     timestamptz default now()
);

alter table accesorios disable row level security;

-- Datos de accesorios de demo
insert into accesorios (codigo, nombre, marca, area_funcional, estado_fisico) values
  ('2026_ADM_0001', 'Teclado HP K1500', 'HP', 'SEC. DE ADMINISTRACION', 'bueno'),
  ('2026_ADM_0002', 'USB Kingston DataTraveler', 'Kingston', 'SEC. DE ADMINISTRACION', 'bueno'),
  ('2026_ADM_0003', 'Mouse Logitech M185', 'Logitech', 'UN. DE TI', 'bueno'),
  ('2026_ADM_0004', 'Auriculares Jabra', 'Jabra', 'UN. DE TI', 'regular'),
  ('2026_ADM_0005', 'Webcam HD Logitech', 'Logitech', 'UN. DE COMUNICACIONES', 'bueno'),
  ('2026_ADM_0006', 'Teclado Logitech MK270', 'Logitech', 'UN. DE TI', 'bueno'),
  ('2026_ADM_0007', 'Mouse Logitech M185', 'Logitech', 'UN. DE TI', 'bueno'),
  ('2026_ADM_0008', 'Auriculares Jabra Evolve2', 'Jabra', 'UN. DE TI', 'bueno')
on conflict (codigo) do nothing;
