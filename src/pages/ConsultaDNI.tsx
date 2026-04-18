import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────

type FirmaStatus = 'done' | 'pend' | 'wait'

interface FirmaInfo {
  status: FirmaStatus
  nombre?: string
  cargo?: string
  fecha?: string
}

interface BienRow {
  id: string
  desc: string
  tipo: string
  codigo: string
  estado: 'bueno' | 'regular'
  devolucion: string
  custodio: FirmaInfo
  colaborador: FirmaInfo
}

interface AccesorioRow {
  id: string
  nombre: string
  marca: string
  estado: 'bueno' | 'regular'
  custodio: FirmaInfo
  colaborador: FirmaInfo
}

interface PrestamoRow {
  numero: string
  tipo: string
  monto: string
  cuotas: string
  estado: 'active' | 'revision' | 'prestamo'
  custodio: FirmaInfo
  colaborador: FirmaInfo
}

interface ReporteRow {
  id: string
  desc: string
  tipo: string
  codigo: string
  estado: 'bueno' | 'regular'
  custodio: FirmaInfo
  colaborador: FirmaInfo
  estadoFirma: 'completado' | 'pendiente'
}

interface ColaboradorData {
  nombre: string
  initials: string
  meta: string
  tags: string[]
  rightBadge: { label: string; variant: 'green' | 'yellow' }
  rightDate: string | null
  counters: Array<{ icon: string; num: number; label: string; green?: boolean }>
  bienes: BienRow[]
  accesorios: AccesorioRow[]
  prestamosBienes: PrestamoRow[]
  prestamosAdelantos: PrestamoRow[]
  cajaChica: string | null
  reporte: ReporteRow[]
  footerBanner: string | null
  footerSem: 'g' | 'y' | 'r' | null
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_MAP: Record<string, ColaboradorData> = {
  '45231089': {
    nombre: 'Carlos Pérez Ramos',
    initials: 'CP',
    meta: 'DNI: 45231089 · Cargo: Analista Contable · Área: UN. DE GDTH',
    tags: ['🏢 Sede Malecón de la Reserva', '📌 CR III - Lima'],
    rightBadge: { label: '⚠ Proceso de salida activo', variant: 'yellow' },
    rightDate: '31/03/2026',
    counters: [
      { icon: '🖥', num: 3, label: 'Activos' },
      { icon: '📦', num: 2, label: 'Artículos' },
      { icon: '🔌', num: 2, label: 'Accesorios' },
      { icon: '💰', num: 1, label: 'Préstamo pendiente' },
      { icon: '⚠', num: 0, label: 'Caja chica', green: true },
    ],
    bienes: [
      {
        id: '111030', desc: 'Laptop Dell', tipo: 'Activo', codigo: 'CMP-038401', estado: 'bueno',
        devolucion: 'pendiente',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
      },
      {
        id: '111031', desc: 'Mouse Logitech', tipo: 'Activo', codigo: 'CMP-038402', estado: 'bueno',
        devolucion: 'pendiente',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
      },
      {
        id: '200201', desc: 'Silla ergonómica', tipo: 'Artículo', codigo: 'CMP-ART-041', estado: 'regular',
        devolucion: 'observado',
        custodio: { status: 'done', nombre: 'G. Palacios', cargo: 'Jefa de Administración', fecha: '⚠ Observado' },
        colaborador: { status: 'pend' },
      },
    ],
    accesorios: [
      {
        id: '20261106', nombre: 'Teclado HP', marca: 'HP', estado: 'bueno',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
      {
        id: '20261107', nombre: 'USB Kingston', marca: 'Kingston', estado: 'bueno',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
    ],
    prestamosBienes: [],
    prestamosAdelantos: [
      {
        numero: 'ADV-2025-018', tipo: 'Préstamo', monto: 'S/. 1,500', cuotas: '3 cuotas', estado: 'active',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
    ],
    cajaChica: null,
    reporte: [
      {
        id: '111030', desc: 'Laptop Dell', tipo: 'Activo', codigo: 'CMP-038401', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
        estadoFirma: 'pendiente',
      },
      {
        id: '111031', desc: 'Mouse Logitech', tipo: 'Activo', codigo: 'CMP-038402', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
        estadoFirma: 'pendiente',
      },
      {
        id: '200201', desc: 'Silla ergonómica', tipo: 'Artículo', codigo: 'CMP-ART-041', estado: 'regular',
        custodio: { status: 'done', nombre: 'G. Palacios', cargo: 'Jefa de Administración', fecha: '⚠ Observado' },
        colaborador: { status: 'pend' },
        estadoFirma: 'pendiente',
      },
      {
        id: '20261106', desc: 'Teclado HP', tipo: 'Accesorio', codigo: '2026_ADM_0001', estado: 'bueno',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
        estadoFirma: 'pendiente',
      },
      {
        id: '20261107', desc: 'USB Kingston', tipo: 'Accesorio', codigo: '2026_ADM_0002', estado: 'bueno',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
        estadoFirma: 'pendiente',
      },
    ],
    footerBanner: '2 bienes pendientes de devolución, 1 préstamo activo',
    footerSem: 'r',
  },
  '77434028': {
    nombre: 'Aaron Samuel Nuñez Muñoz',
    initials: 'AN',
    meta: 'DNI: 77434028 · Cargo: Analista de Sistemas · Área: UN. DE TI',
    tags: ['🏢 Sede Malecón de la Reserva', '📌 CR III - Lima'],
    rightBadge: { label: '✓ Sin pendientes de salida', variant: 'green' },
    rightDate: null,
    counters: [
      { icon: '🖥', num: 2, label: 'Activos' },
      { icon: '📦', num: 1, label: 'Artículos' },
      { icon: '🔌', num: 3, label: 'Accesorios' },
      { icon: '💰', num: 1, label: 'Préstamo pendiente' },
      { icon: '⚠', num: 0, label: 'Caja chica', green: true },
    ],
    bienes: [
      {
        id: 'SOL-2026-001', desc: 'Laptop HP EliteBook 840', tipo: 'Activo', codigo: 'CMP-038410', estado: 'bueno',
        devolucion: 'n/a',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
      },
      {
        id: '111033', desc: 'Monitor HP 24"', tipo: 'Activo', codigo: 'CMP-038411', estado: 'bueno',
        devolucion: 'n/a',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
      },
      {
        id: '111032', desc: 'Teléfono IP Fanvil X4U', tipo: 'Activo', codigo: 'CMP-038403', estado: 'bueno',
        devolucion: 'pendiente',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
    ],
    accesorios: [
      {
        id: '2026_ADM_0006', nombre: 'Teclado Logitech MK270', marca: 'Logitech', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
      },
      {
        id: '2026_ADM_0007', nombre: 'Mouse Logitech M185', marca: 'Logitech', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
      },
      {
        id: '2026_ADM_0008', nombre: 'Auriculares Jabra', marca: 'Jabra', estado: 'regular',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
    ],
    prestamosBienes: [
      {
        numero: 'PREST-2026-002', tipo: 'Préstamo bien tec.', monto: '—', cuotas: 'Pendiente devolución', estado: 'prestamo',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
    ],
    prestamosAdelantos: [
      {
        numero: 'ADV-2026-002', tipo: 'Préstamo', monto: 'S/. 2,500', cuotas: '5 cuotas', estado: 'revision',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
      },
    ],
    cajaChica: null,
    reporte: [
      {
        id: 'SOL-2026-001', desc: 'Laptop HP EliteBook 840', tipo: 'Activo', codigo: 'CMP-038410', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
        estadoFirma: 'completado',
      },
      {
        id: '111033', desc: 'Monitor HP 24"', tipo: 'Activo', codigo: 'CMP-038411', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
        estadoFirma: 'completado',
      },
      {
        id: '111032', desc: 'Teléfono IP Fanvil X4U', tipo: 'Activo', codigo: 'CMP-038403', estado: 'bueno',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
        estadoFirma: 'pendiente',
      },
      {
        id: '2026_ADM_0006', desc: 'Teclado Logitech MK270', tipo: 'Accesorio', codigo: '2026_ADM_0006', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
        estadoFirma: 'completado',
      },
      {
        id: '2026_ADM_0007', desc: 'Mouse Logitech M185', tipo: 'Accesorio', codigo: '2026_ADM_0007', estado: 'bueno',
        custodio: { status: 'done', nombre: 'J. Luman', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
        estadoFirma: 'completado',
      },
      {
        id: '2026_ADM_0008', desc: 'Auriculares Jabra', tipo: 'Accesorio', codigo: '2026_ADM_0008', estado: 'regular',
        custodio: { status: 'pend' },
        colaborador: { status: 'wait' },
        estadoFirma: 'pendiente',
      },
    ],
    footerBanner: '2 bienes pendientes de devolución, 1 préstamo activo, 3 accesorios (2 completados)',
    footerSem: 'y',
  },
  '32187654': {
    nombre: 'Flores Vega, Ana María',
    initials: 'FA',
    meta: 'DNI: 32187654 · Cargo: Asistente Administrativa · Área: SEC. ADMINISTRACIÓN',
    tags: ['🏢 Sede Malecón de la Reserva'],
    rightBadge: { label: '✓ Sin pendientes', variant: 'green' },
    rightDate: null,
    counters: [
      { icon: '🖥', num: 1, label: 'Activos' },
      { icon: '📦', num: 1, label: 'Artículos' },
      { icon: '🔌', num: 0, label: 'Accesorios', green: true },
      { icon: '💰', num: 0, label: 'Préstamo pendiente', green: true },
      { icon: '⚠', num: 0, label: 'Caja chica', green: true },
    ],
    bienes: [
      {
        id: 'TEL-001', desc: 'Teléfono IP Fanvil', tipo: 'Activo', codigo: 'ADM-TEL-002', estado: 'bueno',
        devolucion: 'n/a',
        custodio: { status: 'done', nombre: 'G. Palacios', cargo: 'Jefa de Administración', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Chafloque', cargo: 'Anali J. Chafloque — Asistente Administrativo', fecha: '10/01/2026' },
      },
      {
        id: 'SIL-001', desc: 'Silla ejecutiva', tipo: 'Artículo', codigo: 'ADM-ART-007', estado: 'bueno',
        devolucion: 'n/a',
        custodio: { status: 'done', nombre: 'G. Palacios', cargo: 'Jefa de Administración', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Chafloque', cargo: 'Anali J. Chafloque — Asistente Administrativo', fecha: '10/01/2026' },
      },
    ],
    accesorios: [],
    prestamosBienes: [],
    prestamosAdelantos: [],
    cajaChica: null,
    reporte: [
      {
        id: 'TEL-001', desc: 'Teléfono IP Fanvil', tipo: 'Activo', codigo: 'ADM-TEL-002', estado: 'bueno',
        custodio: { status: 'done', nombre: 'G. Palacios', cargo: 'Jefa de Administración', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Chafloque', cargo: 'Anali J. Chafloque — Asistente Administrativo', fecha: '10/01/2026' },
        estadoFirma: 'completado',
      },
      {
        id: 'SIL-001', desc: 'Silla ejecutiva', tipo: 'Artículo', codigo: 'ADM-ART-007', estado: 'bueno',
        custodio: { status: 'done', nombre: 'G. Palacios', cargo: 'Jefa de Administración', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Chafloque', cargo: 'Anali J. Chafloque — Asistente Administrativo', fecha: '10/01/2026' },
        estadoFirma: 'completado',
      },
    ],
    footerBanner: null,
    footerSem: null,
  },
}

// ── Helper components ──────────────────────────────────────────────────────

function FirmaTd({ f }: { f: FirmaInfo }) {
  if (f.status === 'done') {
    return (
      <td style={{ verticalAlign: 'top', padding: 6 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 12, color: '#1E1B4B', borderBottom: '1.5px solid #6B21A8', paddingBottom: 2, marginBottom: 3 }}>
          {f.nombre}
        </div>
        <div style={{ fontSize: 10, color: '#6B7280' }}>{f.cargo}</div>
        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{f.fecha}</div>
      </td>
    )
  }
  if (f.status === 'pend') {
    return (
      <td>
        <span style={{ color: '#991B1B', fontSize: 11, fontWeight: 600 }}>⏳ Pendiente</span>
      </td>
    )
  }
  // wait
  return (
    <td>
      <span style={{ color: '#991B1B', fontSize: 11 }}>○ En espera</span>
    </td>
  )
}

function DevolucionCell({ val }: { val: string }) {
  if (val === 'pendiente') return <span style={{ color: '#991B1B', fontWeight: 600 }}>☐ Pendiente</span>
  if (val === 'observado') return <span style={{ color: '#92400E', fontWeight: 600 }}>⚠ Observado</span>
  return <span style={{ color: '#6B7280' }}>—</span>
}

function EstadoBadge({ estado }: { estado: 'bueno' | 'regular' }) {
  if (estado === 'bueno') return <span className="badge b-green">Bueno</span>
  return <span className="badge b-yellow">Regular</span>
}

function PrestamoEstadoBadge({ estado }: { estado: string }) {
  if (estado === 'active') return <span className="badge b-red">Activo</span>
  if (estado === 'revision') return <span className="badge b-blue">En revisión</span>
  if (estado === 'prestamo') return <span className="badge b-blue">En préstamo</span>
  return <span className="badge b-gray">{estado}</span>
}

// Firma cell with aprob-cell/aprob-zona (for Reporte de Asignaciones)
function AprobFirmaTd({ f }: { f: FirmaInfo }) {
  if (f.status === 'done') {
    return (
      <td>
        <div className="aprob-cell">
          <div className="aprob-zona">
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{f.nombre}</span>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{f.cargo}</div>
              <div style={{ fontSize: 10, color: '#6B7280' }}>{f.fecha}</div>
            </div>
          </div>
        </div>
      </td>
    )
  }
  if (f.status === 'pend') {
    return (
      <td>
        <div className="aprob-cell">
          <div className="aprob-zona">
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#991B1B', fontSize: 13 }}>Pendiente</span>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>—</div>
            </div>
          </div>
        </div>
      </td>
    )
  }
  // wait
  return (
    <td>
      <div className="aprob-cell">
        <div className="aprob-zona">
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#6B7280', fontSize: 13 }}>En espera</span>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>—</div>
          </div>
        </div>
      </div>
    </td>
  )
}

// ── Recordatorio helpers ────────────────────────────────────────────────────

const TIPOS_RECORDATORIO = [
  { value: 'proceso_salida',    label: 'Proceso de salida — todos los pendientes' },
  { value: 'devolucion_bienes', label: 'Devolución de bienes y accesorios' },
  { value: 'prestamo',          label: 'Liquidación de préstamo / adelanto' },
  { value: 'urgente',           label: 'Recordatorio urgente — plazo vencido' },
]

function buildMensaje(tipo: string, nombre: string, bienesStr: string, prestamosStr: string, total: number): string {
  if (tipo === 'devolucion_bienes')
    return `Estimado/a ${nombre},\n\nLe recordamos que tiene bienes y/o accesorios institucionales pendientes de devolución:\n\n${bienesStr || '• Sin bienes pendientes'}\n\nPor favor, coordine la entrega con el área de Administración a la brevedad.\n\nAtentamente,\nÁrea de GDTH — CMP`
  if (tipo === 'prestamo')
    return `Estimado/a ${nombre},\n\nLe recordamos que tiene el siguiente préstamo/adelanto pendiente de liquidación:\n\n${prestamosStr || '• Sin pendientes registrados'}\n\nPor favor, regularice este pendiente con el área de Finanzas.\n\nAtentamente,\nÁrea de GDTH — CMP`
  if (tipo === 'urgente')
    return `Estimado/a ${nombre},\n\n⚠ RECORDATORIO URGENTE\n\nEl plazo para la regularización de sus pendientes institucionales ha vencido. Se requiere acción inmediata.\n\nPendientes: ${total} ítem(s) por regularizar.\n\nComuníquese con GDTH de manera urgente.\n\nAtentamente,\nÁrea de GDTH — CMP`
  return `Estimado/a ${nombre},\n\nPor medio del presente correo, GDTH le recuerda que tiene pendientes por regularizar en el marco de su proceso de salida:\n\n${bienesStr ? bienesStr + '\n' : ''}${prestamosStr ? prestamosStr + '\n' : ''}${total === 0 ? '• Sin pendientes registrados\n' : ''}\nSolicitamos regularizar estos pendientes a la brevedad. Adjuntamos el acta detallada.\n\nAtentamente,\nÁrea de GDTH — CMP`
}

// ── Main component ─────────────────────────────────────────────────────────

export function ConsultaDNI() {
  const [dniInput, setDniInput] = useState('45231089')
  const [result, setResult] = useState<ColaboradorData | null>(MOCK_MAP['45231089'])
  const [notFound, setNotFound] = useState(false)

  // Section open state
  const [openBienes, setOpenBienes] = useState(true)
  const [openAccesorios, setOpenAccesorios] = useState(true)
  const [openPrestamosBienes, setOpenPrestamosBienes] = useState(true)
  const [openPrestamosAdelantos, setOpenPrestamosAdelantos] = useState(true)
  const [openCajaChica, setOpenCajaChica] = useState(true)
  const [openReporte, setOpenReporte] = useState(true)

  // Modal: Recordatorio
  const [showRecordatorio, setShowRecordatorio] = useState(false)
  const [recCorreo, setRecCorreo] = useState('')
  const [recTipo, setRecTipo] = useState('proceso_salida')
  const [recMensaje, setRecMensaje] = useState('')
  const [recCopiaJefe, setRecCopiaJefe] = useState(true)
  const [recCanal, setRecCanal] = useState('correo')
  const [recFechaLimite, setRecFechaLimite] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]
  })

  // Modal: Acta de Pendientes
  const [showActa, setShowActa] = useState(false)

  const hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const handleConsultar = async () => {
    const val = dniInput.trim()
    if (!val) return
    setNotFound(false)
    // Primero buscar en mock
    const mock = MOCK_MAP[val]
    if (mock) { setResult(mock); return }
    // Luego en Supabase
    const { data: colab } = await supabase.from('colaboradores').select('*').eq('dni', val).maybeSingle()
    if (!colab) { setResult(null); setNotFound(true); return }
    const nombre = `${colab.nombres} ${colab.apellidos}`
    const initials = (colab.nombres[0] + colab.apellidos[0]).toUpperCase()
    const { data: solicitudes } = await supabase.from('solicitudes_asignacion').select('numero,bien_nombre,estado').eq('colaborador_dni', val)
    const { data: adelantos } = await supabase.from('solicitudes_adelanto').select('numero,tipo,monto,cuotas,estado').eq('colaborador_dni', val)
    setResult({
      nombre,
      initials,
      meta: `DNI: ${val} · Cargo: ${colab.puesto ?? '—'} · Área: ${colab.area ?? '—'}`,
      tags: [colab.sede ? `🏢 ${colab.sede}` : '🏢 Sede CMP'].filter(Boolean),
      rightBadge: { label: '✔ Activo', variant: 'green' },
      rightDate: null,
      counters: [
        { icon: '🖥', num: solicitudes?.length ?? 0, label: 'Solicitudes' },
        { icon: '💰', num: adelantos?.length ?? 0, label: 'Adelantos' },
        { icon: '📦', num: 0, label: 'Accesorios', green: true },
        { icon: '⚠', num: 0, label: 'Caja chica', green: true },
      ],
      bienes: (solicitudes ?? []).map(s => ({
        id: s.numero, desc: s.bien_nombre, tipo: 'Solicitud', codigo: s.numero,
        estado: 'bueno' as const, devolucion: s.estado,
        custodio: { status: 'pend' as const },
        colaborador: { status: 'pend' as const },
      })),
      accesorios: [],
      prestamosBienes: [],
      prestamosAdelantos: (adelantos ?? []).map(a => ({
        numero: a.numero, tipo: a.tipo === 'adelanto' ? 'Adelanto' : 'Préstamo',
        monto: `S/. ${Number(a.monto).toLocaleString('es-PE')}`,
        cuotas: String(a.cuotas ?? 1),
        estado: 'revision' as const,
        custodio: { status: 'pend' as const },
        colaborador: { status: 'pend' as const },
      })),
      cajaChica: null,
      reporte: [],
      footerBanner: null,
      footerSem: 'g',
    })
  }

  const handleLimpiar = () => {
    setDniInput('')
    setResult(null)
    setNotFound(false)
  }

  const getPendientes = (r: ColaboradorData) => {
    const bienes = r.bienes.filter(b => b.devolucion === 'pendiente' || b.devolucion === 'observado').map(b => `• ${b.desc}`)
    const accesorios = r.accesorios.map(a => `• ${a.nombre}`)
    const prestamos = [...r.prestamosBienes, ...r.prestamosAdelantos]
      .filter(p => p.estado === 'active' || p.estado === 'revision')
      .map(p => `• ${p.numero} (${p.tipo} — ${p.monto})`)
    return { bienes, accesorios, prestamos, total: bienes.length + accesorios.length + prestamos.length }
  }

  const openRecordatorio = () => {
    if (!result) return
    const pend = getPendientes(result)
    const correo = `${dniInput}@cmp.org.pe`
    setRecCorreo(correo)
    setRecTipo('proceso_salida')
    setRecMensaje(buildMensaje('proceso_salida', result.nombre, pend.bienes.join('\n'), pend.prestamos.join('\n'), pend.total))
    setRecCopiaJefe(true)
    const d = new Date(); d.setDate(d.getDate() + 7)
    setRecFechaLimite(d.toISOString().split('T')[0])
    setShowRecordatorio(true)
  }

  const handleTipoChange = (tipo: string) => {
    if (!result) return
    setRecTipo(tipo)
    const pend = getPendientes(result)
    setRecMensaje(buildMensaje(tipo, result.nombre, pend.bienes.join('\n'), pend.prestamos.join('\n'), pend.total))
  }

  const confirmarRecordatorio = () => {
    if (!recCorreo.trim()) return
    setShowRecordatorio(false)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">Gestión de Recursos › <span>Consulta por DNI</span></div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">🔍 Consulta de Pendientes por DNI</div>
          <div className="page-subtitle">Vista unificada de bienes asignados y pendientes económicos de un colaborador — uso GDTH al ingreso y salida de personal</div>
        </div>
      </div>

      {/* Search card */}
      <div className="search-card">
        <div className="search-label">DNI DEL COLABORADOR</div>
        <div className="search-row">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Ingresa el DNI"
            value={dniInput}
            onChange={e => setDniInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
            onKeyDown={e => { if (e.key === 'Enter') handleConsultar() }}
          />
          <button className="btn btn-primary" onClick={handleConsultar}>🔍 Consultar</button>
          <button className="btn btn-gray" onClick={handleLimpiar}>Limpiar</button>
          <button className="btn btn-outline" onClick={() => alert('Generando PDF...')}>📄 Generar PDF</button>
          <button className="btn btn-gray" onClick={() => alert('Imprimiendo...')}>🖨 Imprimir</button>
        </div>
        <div className="search-hint">DNIs de prueba: <strong>45231089</strong> · <strong>77434028</strong> · <strong>32187654</strong></div>
        {notFound && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#991B1B', fontWeight: 600 }}>
            Colaborador no encontrado para DNI: {dniInput}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div id="dni-result">

          {/* Profile card */}
          <div className="profile-card">
            <div className="profile-avatar">{result.initials}</div>
            <div className="profile-info">
              <div className="profile-name">{result.nombre}</div>
              <div className="profile-meta">{result.meta}</div>
              <div className="profile-tags" style={{ marginTop: 8 }}>
                {result.tags.map((tag, i) => (
                  <span key={i} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
            <div className="profile-right">
              {result.rightDate && (
                <div className="date">Fecha cese: {result.rightDate}</div>
              )}
              <span className={`badge ${result.rightBadge.variant === 'green' ? 'b-green' : 'b-yellow'}`}>
                {result.rightBadge.label}
              </span>
            </div>
          </div>

          {/* Counters */}
          <div className="counters-row">
            {result.counters.map((c, i) => (
              <div key={i} className="counter-card">
                <div className="counter-icon">{c.icon}</div>
                <div className="counter-num" style={c.green ? { color: '#22C55E' } : undefined}>{c.num}</div>
                <div className="counter-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Section 1: Bienes Asignados */}
          <div className="section-block">
            <div className="section-block-hdr" onClick={() => setOpenBienes(v => !v)}>
              <span className="section-block-title">
                <span className={`sem ${result.bienes.some(b => b.devolucion === 'pendiente' || b.devolucion === 'observado') ? 'sem-y' : 'sem-g'}`}></span>
                Bienes Asignados
              </span>
              <div className="flex-row">
                <span className="badge b-gray">{result.bienes.length} bienes</span>
                <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openBienes ? '▴' : '▾'}</span>
              </div>
            </div>
            {openBienes && (
              <div className="section-block-body">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Código QR</th>
                        <th>Estado</th>
                        <th>Custodio Responsable</th>
                        <th>Colaborador</th>
                        <th>Devolución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.bienes.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '22px 16px', color: '#9CA3AF', fontStyle: 'italic' }}>
                            Sin bienes asignados.
                          </td>
                        </tr>
                      ) : result.bienes.map(b => (
                        <tr key={b.id}>
                          <td>{b.id}</td>
                          <td className="fw-600">{b.desc}</td>
                          <td>{b.tipo}</td>
                          <td><code>{b.codigo}</code></td>
                          <td><EstadoBadge estado={b.estado} /></td>
                          <FirmaTd f={b.custodio} />
                          <FirmaTd f={b.colaborador} />
                          <td><DevolucionCell val={b.devolucion} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Accesorios */}
          <div className="section-block">
            <div className="section-block-hdr" onClick={() => setOpenAccesorios(v => !v)}>
              <span className="section-block-title">
                <span className={`sem ${result.accesorios.length > 0 && result.accesorios.some(a => a.custodio.status !== 'done') ? 'sem-y' : 'sem-g'}`}></span>
                Accesorios
              </span>
              <div className="flex-row">
                <span className={`badge ${result.accesorios.length === 0 ? 'b-gray' : result.accesorios.some(a => a.custodio.status !== 'done') ? 'b-red' : 'b-green'}`}>
                  {result.accesorios.length === 0 ? 'Sin registros' : `${result.accesorios.length} accesorio(s)`}
                </span>
                <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openAccesorios ? '▴' : '▾'}</span>
              </div>
            </div>
            {openAccesorios && (
              <div className="section-block-body">
                {result.accesorios.length === 0 ? (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>🔌</div>
                    <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>Sin accesorios asignados</div>
                    <div className="text-xs text-gray">No se registran accesorios para este colaborador.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Marca</th>
                          <th>Estado</th>
                          <th>Custodio Responsable</th>
                          <th>Colaborador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.accesorios.map(a => (
                          <tr key={a.id}>
                            <td>{a.id}</td>
                            <td className="fw-600">{a.nombre}</td>
                            <td>{a.marca}</td>
                            <td><EstadoBadge estado={a.estado} /></td>
                            <FirmaTd f={a.custodio} />
                            <FirmaTd f={a.colaborador} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Préstamos Bienes Tecnológicos */}
          <div className="section-block">
            <div className="section-block-hdr" onClick={() => setOpenPrestamosBienes(v => !v)}>
              <span className="section-block-title">
                <span className={`sem ${result.prestamosBienes.length > 0 ? 'sem-y' : 'sem-g'}`}></span>
                Préstamos Bienes Tecnológicos <span className="text-xs text-gray">(custodio: TI)</span>
              </span>
              <div className="flex-row">
                <span className="badge b-gray">
                  {result.prestamosBienes.length === 0 ? 'Sin registros activos' : `${result.prestamosBienes.length} préstamo(s)`}
                </span>
                <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openPrestamosBienes ? '▴' : '▾'}</span>
              </div>
            </div>
            {openPrestamosBienes && (
              <div className="section-block-body">
                {result.prestamosBienes.length === 0 ? (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📦</div>
                    <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>Sin préstamos de bienes tecnológicos activos</div>
                    <div className="text-xs text-gray">No se registran préstamos de equipos pendientes para este colaborador.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Tipo</th>
                          <th>Monto S/.</th>
                          <th>Cuotas pendientes</th>
                          <th>Estado</th>
                          <th>Custodio Responsable</th>
                          <th>Colaborador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.prestamosBienes.map((p, i) => (
                          <tr key={i}>
                            <td className="fw-600">{p.numero}</td>
                            <td>{p.tipo}</td>
                            <td>{p.monto}</td>
                            <td>{p.cuotas}</td>
                            <td><PrestamoEstadoBadge estado={p.estado} /></td>
                            <FirmaTd f={p.custodio} />
                            <FirmaTd f={p.colaborador} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Préstamos y Adelantos */}
          <div className="section-block">
            <div className="section-block-hdr" onClick={() => setOpenPrestamosAdelantos(v => !v)}>
              <span className="section-block-title">
                <span className={`sem ${result.prestamosAdelantos.length > 0 ? 'sem-y' : 'sem-g'}`}></span>
                Préstamos y Adelantos de Sueldo <span className="text-xs text-gray">(GDTH)</span>
              </span>
              <div className="flex-row">
                <span className="badge b-gray">
                  {result.prestamosAdelantos.length === 0 ? 'Sin registros' : `${result.prestamosAdelantos.length} préstamo(s)`}
                </span>
                <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openPrestamosAdelantos ? '▴' : '▾'}</span>
              </div>
            </div>
            {openPrestamosAdelantos && (
              <div className="section-block-body">
                {result.prestamosAdelantos.length === 0 ? (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>💰</div>
                    <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>Sin préstamos ni adelantos pendientes</div>
                    <div className="text-xs text-gray">No se registran préstamos o adelantos con saldo pendiente para este colaborador.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Tipo</th>
                          <th>Monto S/.</th>
                          <th>Cuotas pendientes</th>
                          <th>Estado</th>
                          <th>Custodio Responsable</th>
                          <th>Colaborador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.prestamosAdelantos.map((p, i) => (
                          <tr key={i}>
                            <td className="fw-600">{p.numero}</td>
                            <td>{p.tipo}</td>
                            <td>{p.monto}</td>
                            <td>{p.cuotas}</td>
                            <td><PrestamoEstadoBadge estado={p.estado} /></td>
                            <FirmaTd f={p.custodio} />
                            <FirmaTd f={p.colaborador} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Caja Chica */}
          <div className="section-block">
            <div className="section-block-hdr" onClick={() => setOpenCajaChica(v => !v)}>
              <span className="section-block-title">
                <span className="sem sem-g"></span>
                Caja Chica <span className="text-xs text-gray">(Contabilidad)</span>
              </span>
              <div className="flex-row">
                <span className="badge b-gray">
                  {result.cajaChica ? 'Designado' : 'No designado'}
                </span>
                <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openCajaChica ? '▴' : '▾'}</span>
              </div>
            </div>
            {openCajaChica && (
              <div className="section-block-body">
                {result.cajaChica ? (
                  <div style={{ padding: '12px 16px', fontSize: 13 }}>{result.cajaChica}</div>
                ) : (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>🏧</div>
                    <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>No designado como responsable de Caja Chica</div>
                    <div className="text-xs text-gray">El colaborador no figura entre los responsables de caja chica. No aplica proceso de liquidación.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 6: Reporte de Asignaciones */}
          <div className="section-block">
            <div className="section-block-hdr" onClick={() => setOpenReporte(v => !v)}>
              <span className="section-block-title">
                <span className={`sem ${result.reporte.some(r => r.estadoFirma === 'pendiente') ? 'sem-y' : 'sem-g'}`}></span>
                Reporte de Asignaciones
              </span>
              <div className="flex-row">
                <span className="badge b-gray">{result.reporte.length} ítem(s)</span>
                <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openReporte ? '▴' : '▾'}</span>
              </div>
            </div>
            {openReporte && (
              <div className="section-block-body">
                {result.reporte.length === 0 ? (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
                    <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>Sin asignaciones registradas</div>
                    <div className="text-xs text-gray">No hay asignaciones para este colaborador.</div>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>N° / ID</th>
                          <th>Descripción</th>
                          <th>Tipo</th>
                          <th>Código QR</th>
                          <th>Estado</th>
                          <th>Custodio Responsable</th>
                          <th>Colaborador</th>
                          <th>Estado firma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.reporte.map((r, i) => (
                          <tr key={i}>
                            <td>{r.id}</td>
                            <td className="fw-600">{r.desc}</td>
                            <td>{r.tipo}</td>
                            <td><code>{r.codigo}</code></td>
                            <td><EstadoBadge estado={r.estado} /></td>
                            <AprobFirmaTd f={r.custodio} />
                            <AprobFirmaTd f={r.colaborador} />
                            <td>
                              {r.estadoFirma === 'completado'
                                ? <span style={{ color: '#059669', fontWeight: 600, fontSize: 11 }}>✓ Completado</span>
                                : <span style={{ color: '#991B1B', fontWeight: 600 }}>☐ Pendiente</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer panel */}
          <div className="panel-footer">
            {result.footerBanner && (
              <div className="banner banner-amber mb-12" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`sem ${result.footerSem === 'r' ? 'sem-r' : result.footerSem === 'y' ? 'sem-y' : 'sem-g'}`}></span>
                <strong>Proceso incompleto</strong> — {result.footerBanner}
              </div>
            )}
            <div className="flex-row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowActa(true)}>📄 Generar acta de pendientes</button>
              <button
                className={`btn btn-sm ${result.footerBanner ? 'btn-disabled' : 'btn-gray'}`}
                disabled={!!result.footerBanner}
                title={result.footerBanner ? 'Completa todas las devoluciones y pendientes' : undefined}
              >
                ✔ Cerrar proceso de salida
              </button>
              <button className="btn btn-primary btn-sm" onClick={openRecordatorio}>📤 Enviar recordatorio al colaborador</button>
            </div>
          </div>

        </div>
      )}

      <div className="text-xs text-gray" style={{ marginTop: 8, fontStyle: 'italic' }}>
        📌 Nota de diseño: Datos consumidos vía API REST desde Activos y Bienes (.NET 9) — GET /api/bienes/&#123;dni&#125; — Autenticación: token inter-servicio
      </div>

      {/* ── Modal: Enviar Recordatorio ── */}
      {showRecordatorio && result && (
        <div className="modal-overlay" onClick={() => setShowRecordatorio(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Enviar Recordatorio al Colaborador</div>
                <div className="modal-subtitle">Notificación formal de pendientes — generado por GDTH</div>
              </div>
              <button className="modal-close" onClick={() => setShowRecordatorio(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Info colaborador */}
              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#6B21A8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{result.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>{result.nombre}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{result.meta}</div>
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Correo electrónico <span style={{ fontSize: 10, color: '#9CA3AF' }}>(editable)</span></label>
                  <input type="email" className="form-control" value={recCorreo} onChange={e => setRecCorreo(e.target.value)} />
                </div>
              </div>

              {/* Tipo recordatorio */}
              <div className="form-group">
                <label className="form-label">Tipo de recordatorio <span className="req">*</span></label>
                <select className="form-control" value={recTipo} onChange={e => handleTipoChange(e.target.value)}>
                  {TIPOS_RECORDATORIO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Pendientes banner */}
              {(() => {
                const pend = getPendientes(result)
                return pend.total > 0 ? (
                  <div className="banner banner-amber" style={{ fontSize: 12 }}>
                    ⚠ <strong>Pendientes detectados:</strong>{' '}
                    {[pend.bienes.length ? `${pend.bienes.length} bien(es)` : '', pend.accesorios.length ? `${pend.accesorios.length} accesorio(s)` : '', pend.prestamos.length ? `${pend.prestamos.length} préstamo(s)` : ''].filter(Boolean).join(' · ')}
                  </div>
                ) : (
                  <div className="banner banner-teal" style={{ fontSize: 12 }}>✓ <strong>Sin pendientes registrados</strong> — el colaborador está al día.</div>
                )
              })()}

              {/* Copia jefe */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={recCopiaJefe} onChange={e => setRecCopiaJefe(e.target.checked)} style={{ accentColor: '#6B21A8' }} />
                  Enviar copia al jefe de área
                </label>
                {recCopiaJefe && (
                  <div style={{ marginTop: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <span className="fw-600" style={{ color: '#1E1B4B' }}>Jefe del Área</span>
                    <span style={{ color: '#9CA3AF' }}>gdth@cmp.org.pe</span>
                  </div>
                )}
              </div>

              {/* Mensaje */}
              <div className="form-group">
                <label className="form-label">Mensaje del recordatorio <span className="req">*</span></label>
                <textarea className="form-control" rows={7} value={recMensaje} onChange={e => setRecMensaje(e.target.value)} style={{ resize: 'none' }} />
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>El correo incluirá el listado de pendientes adjunto en PDF.</div>
              </div>

              {/* Fecha límite + canal */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha límite de respuesta</label>
                  <input type="date" className="form-control" value={recFechaLimite} onChange={e => setRecFechaLimite(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Canal adicional</label>
                  <select className="form-control" value={recCanal} onChange={e => setRecCanal(e.target.value)}>
                    <option value="correo">Solo correo electrónico</option>
                    <option value="correo_teams">Correo + Teams</option>
                    <option value="correo_whatsapp">Correo + WhatsApp</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowRecordatorio(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarRecordatorio}>📤 Confirmar envío</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Acta de Pendientes Institucionales ── */}
      {showActa && result && (() => {
        const pend = getPendientes(result)
        const renderItems = (items: string[], empty: string) => items.length > 0
          ? items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #E5E7EB', padding: '6px 12px', fontSize: 12 }}>{item}</td>
                <td style={{ border: '1px solid #E5E7EB', padding: '6px 12px', fontSize: 12, color: '#D97706', textAlign: 'center', width: 110 }}>Pendiente</td>
              </tr>
            ))
          : [<tr key="e"><td colSpan={2} style={{ border: '1px solid #E5E7EB', padding: '6px 12px', fontSize: 12, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' }}>{empty}</td></tr>]

        return (
          <div className="modal-overlay" onClick={() => setShowActa(false)}>
            <div className="modal-box" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="modal-hdr">
                <div>
                  <div className="modal-title">Acta de Pendientes Institucionales</div>
                  <div className="modal-subtitle">Generado el {hoy} · Uso interno GDTH</div>
                </div>
                <button className="modal-close" onClick={() => setShowActa(false)}>×</button>
              </div>
              <div className="modal-body">
                {/* Encabezado */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #6B21A8', paddingBottom: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6B21A8', textTransform: 'uppercase' }}>Colegio Médico del Perú — GDTH</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1E1B4B', marginTop: 4 }}>Acta de Pendientes Institucionales</div>
                </div>

                {/* Datos colaborador */}
                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Datos del Colaborador</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 12 }}>
                    <div><span style={{ color: '#6B7280' }}>Nombre:</span> <strong>{result.nombre}</strong></div>
                    <div><span style={{ color: '#6B7280' }}>DNI:</span> <strong>{dniInput}</strong></div>
                    <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#6B7280' }}>Datos:</span> {result.meta}</div>
                  </div>
                </div>

                {/* Resumen */}
                <div style={{ borderRadius: 8, border: `1px solid ${pend.total > 0 ? '#FECACA' : '#BBF7D0'}`, background: pend.total > 0 ? '#FEF2F2' : '#F0FDF4', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{pend.total > 0 ? '⚠' : '✓'}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: pend.total > 0 ? '#991B1B' : '#065F46' }}>
                      {pend.total > 0 ? `${pend.total} ítem(s) pendientes de regularización` : 'Sin pendientes — colaborador al día'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Estado global del proceso</div>
                  </div>
                </div>

                {/* Secciones */}
                {[
                  { title: '📦 Bienes Institucionales', items: pend.bienes, empty: 'Sin bienes pendientes' },
                  { title: '🔌 Accesorios Institucionales', items: pend.accesorios, empty: 'Sin accesorios pendientes' },
                  { title: '💰 Préstamos y Adelantos', items: pend.prestamos, empty: 'Sin préstamos ni adelantos pendientes' },
                ].map(sec => (
                  <div key={sec.title} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px 6px 0 0', padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{sec.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 400, color: sec.items.length ? '#D97706' : '#059669' }}>{sec.items.length ? `${sec.items.length} pendiente(s)` : '✓ Al día'}</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          <th style={{ border: '1px solid #E5E7EB', padding: '5px 12px', fontSize: 11, color: '#6B7280', fontWeight: 600, textAlign: 'left' }}>Ítem</th>
                          <th style={{ border: '1px solid #E5E7EB', padding: '5px 12px', fontSize: 11, color: '#6B7280', fontWeight: 600, textAlign: 'center', width: 110 }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>{renderItems(sec.items, sec.empty)}</tbody>
                    </table>
                  </div>
                ))}

                {/* Caja Chica */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px 6px 0 0', padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🏧 Caja Chica</span>
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#059669' }}>✓ No designado</span>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '8px 12px', fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
                    No figura como responsable de Caja Chica. No aplica proceso de liquidación.
                  </div>
                </div>

                {/* Firmas */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 16px', marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Firmas de Conformidad</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, textAlign: 'center' }}>
                    {[
                      { nombre: result.nombre, cargo: 'Colaborador' },
                      { nombre: 'Jesús Luman Marcos Aragon', cargo: 'Jefe de TI' },
                      { nombre: 'Julieth Z. Carbajal Garro', cargo: 'Jefa de GDTH' },
                    ].map((f, i) => (
                      <div key={i}>
                        <div style={{ height: 40 }} />
                        <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: 6 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{f.nombre}</div>
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>{f.cargo}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: 10, color: '#9CA3AF', marginTop: 12 }}>
                  Documento generado por el Sistema de Gestión Interna — CMP · {hoy} · Uso interno
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-gray" onClick={() => setShowActa(false)}>Cerrar</button>
                <button className="btn btn-outline" onClick={() => window.print()}>🖨 Imprimir</button>
                <button className="btn btn-primary" onClick={() => window.print()}>📄 Descargar PDF</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
