export type EstadoSolicitud = 'en_revision' | 'aprobado' | 'observado' | 'rechazado' | 'entregado_pendiente' | 'completado'
export type TipoBien = 'computo' | 'mobiliario' | 'comunicaciones' | 'vehiculo' | 'otro'
export type TipoAdelanto = 'adelanto_sueldo' | 'prestamo_personal'
export type EstadoGasto = 'declarado' | 'pendiente_sustento' | 'observado' | 'aprobado'
export type EstadoDevolucion = 'en_proceso' | 'observado' | 'bloqueado' | 'completado' | 'cancelado'
export type EstadoPrestamoBien = 'activo' | 'devuelto' | 'vencido'

export interface Colaborador {
  id: string
  nombres: string
  apellidos: string
  dni: string
  area: string
  puesto: string
  correo?: string
  telefono?: string
  fecha_ingreso?: string
}

export interface Bien {
  id: string
  codigo: string
  nombre: string
  tipo: TipoBien
  marca?: string
  modelo?: string
  serie?: string
  estado: 'disponible' | 'asignado' | 'prestado' | 'mantenimiento' | 'dado_baja'
  descripcion?: string
}

export interface SolicitudAsignacion {
  id: string
  numero: string
  bien_nombre: string
  tipo: TipoBien
  fecha_solicitud: string
  estado: EstadoSolicitud
  colaborador_id?: string
  observacion?: string
  created_at: string
}

export interface Devolucion {
  id: string
  colaborador_dni: string
  colaborador_nombre: string
  area: string
  tipo_salida: 'cese' | 'licencia' | 'vacaciones'
  fecha_inicio: string
  estado: EstadoDevolucion
  bienes_count: number
  created_at: string
}

export interface PrestamoBien {
  id: string
  numero: string
  bien_nombre: string
  bien_codigo: string
  tipo: TipoBien
  solicitante: string
  area: string
  fecha_prestamo: string
  fecha_devolucion_est: string
  estado: EstadoPrestamoBien
  created_at: string
}

export interface SolicitudAdelanto {
  id: string
  numero: string
  tipo: TipoAdelanto
  monto: number
  fecha_solicitud: string
  estado: string
  colaborador_id?: string
  motivo?: string
  num_cuotas?: number
  created_at: string
}

export interface CajaChica {
  id: string
  area: string
  responsable: string
  monto_asignado: number
  gastado_mes: number
  created_at: string
}

export interface GastoCajaChica {
  id: string
  caja_id: string
  fecha: string
  descripcion: string
  comprobante: string
  monto: number
  estado: EstadoGasto
  created_at: string
}
