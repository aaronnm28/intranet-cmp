-- ================================================================
-- INTRANET CMP — Migración 003: Correcciones de esquema
-- Ejecutar en Supabase: SQL Editor → New Query → Run
-- ================================================================

-- ─── solicitudes_asignacion: columnas faltantes ────────────────
ALTER TABLE solicitudes_asignacion ADD COLUMN IF NOT EXISTS colaborador_dni text;
ALTER TABLE solicitudes_asignacion ADD COLUMN IF NOT EXISTS colaborador      text;
ALTER TABLE solicitudes_asignacion ADD COLUMN IF NOT EXISTS area_encargada   text;
ALTER TABLE solicitudes_asignacion ADD COLUMN IF NOT EXISTS sub_area         text;
ALTER TABLE solicitudes_asignacion ADD COLUMN IF NOT EXISTS motivo           text;
-- NOTA: NO agregar columna 'puesto' — se obtiene de la tabla colaboradores

-- ─── prestamos_bienes: columnas faltantes ─────────────────────
-- La tabla original usa nombres distintos; agregamos los que usa el código
ALTER TABLE prestamos_bienes ADD COLUMN IF NOT EXISTS colaborador_dni  text;
ALTER TABLE prestamos_bienes ADD COLUMN IF NOT EXISTS colaborador       text;
ALTER TABLE prestamos_bienes ADD COLUMN IF NOT EXISTS fecha_solicitud   date    DEFAULT CURRENT_DATE;
ALTER TABLE prestamos_bienes ADD COLUMN IF NOT EXISTS fecha_devolucion  date;
ALTER TABLE prestamos_bienes ADD COLUMN IF NOT EXISTS direccion         text;
-- Hacer nullable las columnas que antes eran NOT NULL y no siempre se envían
ALTER TABLE prestamos_bienes ALTER COLUMN tipo          DROP NOT NULL;
ALTER TABLE prestamos_bienes ALTER COLUMN solicitante   DROP NOT NULL;
ALTER TABLE prestamos_bienes ALTER COLUMN area          DROP NOT NULL;
ALTER TABLE prestamos_bienes ALTER COLUMN bien_codigo   DROP NOT NULL;
ALTER TABLE prestamos_bienes ALTER COLUMN fecha_prestamo DROP NOT NULL;
ALTER TABLE prestamos_bienes ALTER COLUMN fecha_devolucion_est DROP NOT NULL;

-- ─── solicitudes_adelanto: columnas faltantes ──────────────────
ALTER TABLE solicitudes_adelanto ADD COLUMN IF NOT EXISTS colaborador     text;
ALTER TABLE solicitudes_adelanto ADD COLUMN IF NOT EXISTS colaborador_dni text;
ALTER TABLE solicitudes_adelanto ADD COLUMN IF NOT EXISTS sustento_url    text;
ALTER TABLE solicitudes_adelanto ADD COLUMN IF NOT EXISTS cuotas          int DEFAULT 1;
-- Hacer nullable monto y fecha_solicitud ya que el código los controla
ALTER TABLE solicitudes_adelanto ALTER COLUMN monto DROP NOT NULL;

-- ─── user_profiles: agregar puesto ────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS puesto text;

-- ─── Actualizar perfiles existentes con puesto real ───────────
-- (Ejecutar después de tener los usuarios creados en Auth)
-- Ejemplo:
-- UPDATE user_profiles SET puesto = 'Jefe de TI' WHERE nombres = 'Jesús Luman';
-- UPDATE user_profiles SET puesto = 'Jefa de GDTH' WHERE nombres = 'Julieth Zenina';
-- UPDATE user_profiles SET puesto = 'Jefa de Administración' WHERE nombres = 'Guissela Del Rocio';
-- UPDATE user_profiles SET puesto = 'Analista de TI' WHERE nombres = 'Aaron Samuel';

-- ─── caja_chica_cajas: agregar subarea ────────────────────────
ALTER TABLE caja_chica_cajas ADD COLUMN IF NOT EXISTS subarea text;

-- ─── Deshabilitar RLS en nuevas columnas (prototipo) ──────────
-- (RLS ya está deshabilitado en estas tablas desde migración 001)
