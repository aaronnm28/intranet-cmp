-- ================================================================
-- INTRANET CMP — Schema inicial
-- Pegar este script en Supabase: SQL Editor → New Query → Run
-- ================================================================

-- 1. Colaboradores
create table if not exists colaboradores (
  id          uuid primary key default gen_random_uuid(),
  nombres     text not null,
  apellidos   text not null,
  dni         text unique not null,
  area        text not null,
  puesto      text not null,
  correo      text,
  telefono    text,
  tipo_contrato text default 'CAS',
  estado      text default 'activo',
  fecha_ingreso date,
  created_at  timestamptz default now()
);

-- 2. Bienes (inventario)
create table if not exists bienes (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,
  nombre      text not null,
  tipo        text not null,  -- computo | mobiliario | comunicaciones | vehiculo | otro
  marca       text,
  modelo      text,
  serie       text,
  estado      text default 'disponible',
  descripcion text,
  created_at  timestamptz default now()
);

-- 3. Solicitudes de asignación
create table if not exists solicitudes_asignacion (
  id              uuid primary key default gen_random_uuid(),
  numero          text unique not null,
  bien_nombre     text not null,
  tipo            text not null,
  fecha_solicitud date not null default current_date,
  estado          text not null default 'en_revision',
  colaborador_id  uuid references colaboradores(id),
  observacion     text,
  prioridad       text default 'normal',
  justificacion   text,
  created_at      timestamptz default now()
);

-- 4. Devoluciones
create table if not exists devoluciones (
  id                  uuid primary key default gen_random_uuid(),
  colaborador_dni     text not null,
  colaborador_nombre  text not null,
  area                text not null,
  tipo_salida         text not null,  -- cese | licencia | vacaciones
  fecha_inicio        date not null,
  estado              text default 'en_proceso',
  bienes_count        int default 0,
  observacion         text,
  created_at          timestamptz default now()
);

create table if not exists devolucion_items (
  id              uuid primary key default gen_random_uuid(),
  devolucion_id   uuid references devoluciones(id) on delete cascade,
  bien_nombre     text not null,
  bien_codigo     text not null,
  estado          text default 'pendiente',  -- pendiente | entregado | observado
  observacion     text,
  created_at      timestamptz default now()
);

-- 5. Préstamos de bienes tecnológicos
create table if not exists prestamos_bienes (
  id                    uuid primary key default gen_random_uuid(),
  numero                text unique not null,
  bien_nombre           text not null,
  bien_codigo           text not null,
  tipo                  text not null,
  solicitante           text not null,
  area                  text not null,
  fecha_prestamo        date not null default current_date,
  fecha_devolucion_est  date not null,
  fecha_devolucion_real date,
  estado                text default 'activo',  -- activo | devuelto | vencido
  motivo                text,
  created_at            timestamptz default now()
);

-- 6. Solicitudes adelanto / préstamo de sueldo
create table if not exists solicitudes_adelanto (
  id              uuid primary key default gen_random_uuid(),
  numero          text unique not null,
  tipo            text not null,  -- adelanto_sueldo | prestamo_personal
  monto           numeric(10,2) not null,
  fecha_solicitud date not null default current_date,
  estado          text default 'en_revision_bienestar',
  colaborador_id  uuid references colaboradores(id),
  motivo          text,
  justificacion   text,
  num_cuotas      int default 1,
  created_at      timestamptz default now()
);

-- 7. Caja chica
create table if not exists caja_chica_cajas (
  id              uuid primary key default gen_random_uuid(),
  area            text unique not null,
  responsable     text not null,
  monto_asignado  numeric(10,2) not null default 0,
  gastado_mes     numeric(10,2) not null default 0,
  created_at      timestamptz default now()
);

create table if not exists caja_chica_gastos (
  id              uuid primary key default gen_random_uuid(),
  caja_id         uuid references caja_chica_cajas(id) on delete cascade,
  fecha           date not null default current_date,
  descripcion     text not null,
  comprobante     text not null,  -- numero de comprobante
  tipo_comprobante text default 'factura',
  monto           numeric(10,2) not null,
  estado          text default 'declarado',
  created_at      timestamptz default now()
);

-- ================================================================
-- DATOS INICIALES DE PRUEBA
-- ================================================================

-- Colaboradores
insert into colaboradores (nombres, apellidos, dni, area, puesto, tipo_contrato, fecha_ingreso) values
  ('Aaron Samuel', 'Nuñez Muñoz', '77434028', 'UN. DE TI', 'Analista de Sistemas', 'CAS', '2023-06-01'),
  ('Carlos', 'Ramírez López', '45231089', 'UN. DE TI', 'Técnico Soporte', 'CAS', '2022-03-15'),
  ('Ana', 'Flores Vega', '32187654', 'SEC. ADMINISTRACIÓN', 'Asistente Administrativa', 'CAS', '2021-07-20'),
  ('María', 'Torres Huamán', '87654321', 'UN. DE GDTH', 'Especialista GDTH', 'CAS', '2020-01-10')
on conflict (dni) do nothing;

-- Bienes
insert into bienes (codigo, nombre, tipo, marca, modelo, estado) values
  ('TI-LAP-001', 'Laptop HP ProBook', 'computo', 'HP', 'ProBook 450 G8', 'asignado'),
  ('TI-LAP-003', 'Laptop Dell Latitude', 'computo', 'Dell', 'Latitude 5520', 'prestado'),
  ('TI-MON-002', 'Monitor 24"', 'computo', 'LG', '24MK430H', 'asignado'),
  ('TI-MON-004', 'Monitor 27"', 'computo', 'Dell', 'P2722H', 'disponible'),
  ('LOG-SIL-001', 'Silla ergonómica', 'mobiliario', 'Actiu', 'Kassia', 'disponible'),
  ('LOG-PRY-001', 'Proyector EPSON', 'otro', 'EPSON', 'EB-X51', 'prestado'),
  ('TI-TEL-001', 'Teléfono IP', 'comunicaciones', 'Fanvil', 'X4U', 'disponible')
on conflict (codigo) do nothing;

-- Solicitudes de asignación
insert into solicitudes_asignacion (numero, bien_nombre, tipo, fecha_solicitud, estado) values
  ('SOL-2026-001', 'Laptop HP 840 G9', 'computo', '2026-03-10', 'en_revision'),
  ('SOL-2026-002', 'Silla Ergonómica', 'mobiliario', '2026-03-08', 'aprobado'),
  ('SOL-2026-003', 'Teléfono IP Fanvil', 'comunicaciones', '2026-03-05', 'observado'),
  ('SOL-2026-004', 'Monitor 24" LG', 'computo', '2026-03-01', 'entregado_pendiente')
on conflict (numero) do nothing;

-- Caja chica
insert into caja_chica_cajas (area, responsable, monto_asignado, gastado_mes) values
  ('Sec. Economía y Finanzas', 'María Torres H.', 3000, 1200),
  ('Sec. Administración', 'Lizzetti Díaz E.', 4000, 2100),
  ('Uni. Administración', 'Pedro Salas Q.', 2000, 980),
  ('FOSEMED', 'Carmen Vega R.', 3500, 850),
  ('SEMEFA', 'Jorge Lima C.', 2500, 1050),
  ('Decanato', 'Aaron Nuñez M.', 3000, 250)
on conflict (area) do nothing;

-- ================================================================
-- POLITICAS RLS (Row Level Security) — desactivar para prototipo
-- ================================================================
alter table colaboradores disable row level security;
alter table bienes disable row level security;
alter table solicitudes_asignacion disable row level security;
alter table devoluciones disable row level security;
alter table devolucion_items disable row level security;
alter table prestamos_bienes disable row level security;
alter table solicitudes_adelanto disable row level security;
alter table caja_chica_cajas disable row level security;
alter table caja_chica_gastos disable row level security;
