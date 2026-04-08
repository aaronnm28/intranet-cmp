import { useState } from 'react'

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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
      },
      {
        id: '111031', desc: 'Mouse Logitech', tipo: 'Activo', codigo: 'CMP-038402', estado: 'bueno',
        devolucion: 'pendiente',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
      },
      {
        id: '200201', desc: 'Silla ergonómica', tipo: 'Artículo', codigo: 'CMP-ART-041', estado: 'regular',
        devolucion: 'observado',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe Admin. CMP', fecha: '⚠ Observado' },
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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
        estadoFirma: 'pendiente',
      },
      {
        id: '111031', desc: 'Mouse Logitech', tipo: 'Activo', codigo: 'CMP-038402', estado: 'bueno',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'pend' },
        estadoFirma: 'pendiente',
      },
      {
        id: '200201', desc: 'Silla ergonómica', tipo: 'Artículo', codigo: 'CMP-ART-041', estado: 'regular',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe Admin. CMP', fecha: '⚠ Observado' },
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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
      },
      {
        id: '111033', desc: 'Monitor HP 24"', tipo: 'Activo', codigo: 'CMP-038411', estado: 'bueno',
        devolucion: 'n/a',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
      },
      {
        id: '2026_ADM_0007', nombre: 'Mouse Logitech M185', marca: 'Logitech', estado: 'bueno',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
        estadoFirma: 'completado',
      },
      {
        id: '111033', desc: 'Monitor HP 24"', tipo: 'Activo', codigo: 'CMP-038411', estado: 'bueno',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
        colaborador: { status: 'done', nombre: 'Aaron N.', cargo: 'Analista de Sistemas — UN. DE TI', fecha: '28/03/2026' },
        estadoFirma: 'completado',
      },
      {
        id: '2026_ADM_0007', desc: 'Mouse Logitech M185', tipo: 'Accesorio', codigo: '2026_ADM_0007', estado: 'bueno',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe UN. DE TI', fecha: '28/03/2026' },
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
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe Admin. CMP', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Flores', cargo: 'Asistente — SEC. ADMINISTRACIÓN', fecha: '10/01/2026' },
      },
      {
        id: 'SIL-001', desc: 'Silla ejecutiva', tipo: 'Artículo', codigo: 'ADM-ART-007', estado: 'bueno',
        devolucion: 'n/a',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe Admin. CMP', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Flores', cargo: 'Asistente — SEC. ADMINISTRACIÓN', fecha: '10/01/2026' },
      },
    ],
    accesorios: [],
    prestamosBienes: [],
    prestamosAdelantos: [],
    cajaChica: null,
    reporte: [
      {
        id: 'TEL-001', desc: 'Teléfono IP Fanvil', tipo: 'Activo', codigo: 'ADM-TEL-002', estado: 'bueno',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe Admin. CMP', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Flores', cargo: 'Asistente — SEC. ADMINISTRACIÓN', fecha: '10/01/2026' },
        estadoFirma: 'completado',
      },
      {
        id: 'SIL-001', desc: 'Silla ejecutiva', tipo: 'Artículo', codigo: 'ADM-ART-007', estado: 'bueno',
        custodio: { status: 'done', nombre: 'R. Limas', cargo: 'Jefe Admin. CMP', fecha: '10/01/2026' },
        colaborador: { status: 'done', nombre: 'A. Flores', cargo: 'Asistente — SEC. ADMINISTRACIÓN', fecha: '10/01/2026' },
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

  const handleConsultar = () => {
    const val = dniInput.trim()
    if (!val) return
    setNotFound(false)
    const found = MOCK_MAP[val]
    if (found) {
      setResult(found)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }

  const handleLimpiar = () => {
    setDniInput('')
    setResult(null)
    setNotFound(false)
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
              <button className="btn btn-outline btn-sm" onClick={() => alert('Generando acta de pendientes...')}>📄 Generar acta de pendientes</button>
              <button
                className={`btn btn-sm ${result.footerBanner ? 'btn-disabled' : 'btn-gray'}`}
                disabled={!!result.footerBanner}
                title={result.footerBanner ? 'Completa todas las devoluciones y pendientes' : undefined}
                onClick={() => !result.footerBanner && alert('Cerrando proceso de salida...')}
              >
                ✔ Cerrar proceso de salida
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => alert('Recordatorio enviado.')}>📤 Enviar recordatorio al colaborador</button>
            </div>
          </div>

        </div>
      )}

      <div className="text-xs text-gray" style={{ marginTop: 8, fontStyle: 'italic' }}>
        📌 Nota de diseño: Datos consumidos vía API REST desde Activos y Bienes (.NET 9) — GET /api/bienes/&#123;dni&#125; — Autenticación: token inter-servicio
      </div>
    </div>
  )
}
