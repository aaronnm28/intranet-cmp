import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { CajaChica as CajaChicaType } from '../types'

interface GastoRow {
  fecha: string
  descripcion: string
  comprobante: string
  monto: number
  estado: string
}

const MOCK_GASTOS: Record<string, GastoRow[]> = {
  'Sec. Economía y Finanzas': [
    { fecha: '15/03/2026', descripcion: 'Servicio de courier', comprobante: 'FAC-001-00892', monto: 180, estado: 'declarado' },
    { fecha: '12/03/2026', descripcion: 'Material de impresión', comprobante: 'BOL-001-01203', monto: 95, estado: 'declarado' },
    { fecha: '08/03/2026', descripcion: 'Movilidad local', comprobante: 'REC-001-00045', monto: 60, estado: 'pendiente_sustento' },
  ],
  'Sec. Administración': [
    { fecha: '20/03/2026', descripcion: 'Útiles de escritorio', comprobante: 'FAC-001-02341', monto: 320, estado: 'declarado' },
    { fecha: '17/03/2026', descripcion: 'Servicio de limpieza extra', comprobante: 'BOL-001-00712', monto: 150, estado: 'declarado' },
    { fecha: '14/03/2026', descripcion: 'Refrigerio reunión directiva', comprobante: 'BOL-001-00698', monto: 210, estado: 'observado' },
  ],
  'Uni. Administración': [
    { fecha: '18/03/2026', descripcion: 'Compra de sellos', comprobante: 'BOL-001-00321', monto: 85, estado: 'declarado' },
    { fecha: '10/03/2026', descripcion: 'Pasajes comisión', comprobante: 'REC-001-00089', monto: 120, estado: 'declarado' },
  ],
  'FOSEMED': [
    { fecha: '22/03/2026', descripcion: 'Material médico menor', comprobante: 'FAC-001-00567', monto: 380, estado: 'declarado' },
    { fecha: '19/03/2026', descripcion: 'Servicio técnico equipo', comprobante: 'BOL-001-00445', monto: 220, estado: 'pendiente_sustento' },
  ],
  'SEMEFA': [
    { fecha: '21/03/2026', descripcion: 'Impresión de diplomas', comprobante: 'FAC-001-01122', monto: 450, estado: 'declarado' },
    { fecha: '16/03/2026', descripcion: 'Insumos de oficina', comprobante: 'BOL-001-00834', monto: 120, estado: 'declarado' },
  ],
  'Decanato': [
    { fecha: '20/03/2026', descripcion: 'Útiles de oficina', comprobante: 'RHH-2026-001', monto: 85, estado: 'declarado' },
    { fecha: '15/03/2026', descripcion: 'Refrigerio reunión', comprobante: 'RHH-2026-003', monto: 165, estado: 'pendiente_sustento' },
  ],
}

const MOCK_CAJAS: CajaChicaType[] = [
  { id: '1', area: 'Sec. Economía y Finanzas', responsable: 'María Torres H.', monto_asignado: 3000, gastado_mes: 1200, created_at: '' },
  { id: '2', area: 'Sec. Administración', responsable: 'Lizzetti Díaz E.', monto_asignado: 4000, gastado_mes: 2100, created_at: '' },
  { id: '3', area: 'Uni. Administración', responsable: 'Pedro Salas Q.', monto_asignado: 2000, gastado_mes: 980, created_at: '' },
  { id: '4', area: 'FOSEMED', responsable: 'Carmen Vega R.', monto_asignado: 3500, gastado_mes: 850, created_at: '' },
  { id: '5', area: 'SEMEFA', responsable: 'Jorge Lima C.', monto_asignado: 2500, gastado_mes: 1050, created_at: '' },
  { id: '6', area: 'Decanato', responsable: 'Aaron Nuñez M.', monto_asignado: 3000, gastado_mes: 250, created_at: '' },
]

const TABLERO_ROWS = [
  { area: 'Sec. Economía y Finanzas', responsable: 'María Torres H.', asignado: 'S/. 3,000', gastado: 'S/. 1,200', saldo: 'S/. 1,800', estadoV: 'green' as const, reposicion: 'No', tab: 'Sec. Economía y Finanzas' },
  { area: 'Sec. Administración', responsable: 'Lizzetti Díaz E.', asignado: 'S/. 4,000', gastado: 'S/. 2,100', saldo: 'S/. 1,900', estadoV: 'green' as const, reposicion: 'No', tab: 'Sec. Administración' },
  { area: 'Uni. Administración', responsable: 'Pedro Salas Q.', asignado: 'S/. 2,000', gastado: 'S/. 980', saldo: 'S/. 1,020', estadoV: 'green' as const, reposicion: 'No', tab: 'Uni. Administración' },
  { area: 'FOSEMED', responsable: 'Carmen Vega R.', asignado: 'S/. 3,500', gastado: 'S/. 850', saldo: 'S/. 2,650', estadoV: 'green' as const, reposicion: 'No', tab: 'FOSEMED' },
  { area: 'SEMEFA', responsable: 'Jorge Lima C.', asignado: 'S/. 2,500', gastado: 'S/. 1,050', saldo: 'S/. 1,450', estadoV: 'green' as const, reposicion: 'No', tab: 'SEMEFA' },
  { area: 'Decanato', responsable: 'Aaron Nuñez M.', asignado: 'S/. 3,000', gastado: 'S/. 250', saldo: 'S/. 2,750', estadoV: 'red' as const, reposicion: 'Sí', tab: 'Decanato' },
]

const AREA_TABS = [
  { id: 'tablero', label: '📊 Tablero' },
  { id: 'Sec. Economía y Finanzas', label: 'Sec. Economía y Finanzas' },
  { id: 'Sec. Administración', label: 'Sec. Administración' },
  { id: 'Uni. Administración', label: 'Uni. Administración' },
  { id: 'FOSEMED', label: 'FOSEMED' },
  { id: 'SEMEFA', label: 'SEMEFA' },
  { id: 'Decanato', label: 'Decanato' },
]

const AREA_META: Record<string, { saldo: string; gastado: string; reposiciones: number }> = {
  'Sec. Economía y Finanzas': { saldo: 'S/. 1,800.00', gastado: 'S/. 1,200.00', reposiciones: 0 },
  'Sec. Administración':      { saldo: 'S/. 1,900.00', gastado: 'S/. 2,100.00', reposiciones: 0 },
  'Uni. Administración':      { saldo: 'S/. 1,020.00', gastado: 'S/. 980.00',   reposiciones: 0 },
  'FOSEMED':                  { saldo: 'S/. 2,650.00', gastado: 'S/. 850.00',   reposiciones: 0 },
  'SEMEFA':                   { saldo: 'S/. 1,450.00', gastado: 'S/. 1,050.00', reposiciones: 0 },
  'Decanato':                 { saldo: 'S/. 2,750.00', gastado: 'S/. 250.00',   reposiciones: 1 },
}

const AREA_SUBAREAS: Record<string, string[]> = {
  'Sec. Economía y Finanzas': ['UN. DE FINANZAS', 'UN. DE ECONOMÍA'],
  'Sec. Administración':      ['UN. DE ADMINISTRACIÓN', 'UN. DE TI'],
  'Uni. Administración':      ['UN. DE ADMINISTRACIÓN'],
  'FOSEMED':                  ['FOSEMED'],
  'SEMEFA':                   ['SEMEFA'],
  'Decanato':                 ['DECANATO', 'SECRETARÍA DECANATO'],
  'Otra área':                [],
}

function gastoBadge(estado: string) {
  if (estado === 'declarado') return <span className="badge b-green">Declarado</span>
  if (estado === 'pendiente_sustento') return <span className="badge b-red">Pendiente sustento</span>
  if (estado === 'observado') return <span className="badge b-yellow">Observado</span>
  return <span className="badge b-gray">{estado}</span>
}

export function CajaChica() {
  const [cajas, setCajas] = useState<CajaChicaType[]>([])
  const [tableroRows, setTableroRows] = useState(TABLERO_ROWS)
  const [gastosState, setGastosState] = useState<Record<string, GastoRow[]>>(MOCK_GASTOS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tablero')
  const [showRegistrarGasto, setShowRegistrarGasto] = useState(false)
  const [showReposicion, setShowReposicion] = useState(false)
  const [showDetalleGasto, setShowDetalleGasto] = useState(false)
  const [showGestionar, setShowGestionar] = useState(false)
  const [gestionarTab, setGestionarTab] = useState('responsables')
  const [selectedCaja, setSelectedCaja] = useState<CajaChicaType | null>(null)
  const [selectedGasto, setSelectedGasto] = useState<GastoRow | null>(null)

  // Sustento de gasto modal
  const [showSustento,       setShowSustento]       = useState(false)
  const [sustentoGasto,      setSustentoGasto]      = useState<GastoRow | null>(null)
  const [sustentoArea,       setSustentoArea]       = useState('')
  const [sustentoSubarea,    setSustentoSubarea]    = useState('')
  const [sustentoNotas,      setSustentoNotas]      = useState('')
  const [sustentoFileName,   setSustentoFileName]   = useState('')

  // Solicitar Reposición modal
  const [repCode,      setRepCode]      = useState('')
  const [repModalData, setRepModalData] = useState<{ area: string; responsable: string; monto: string } | null>(null)
  const [selectedRep,  setSelectedRep]  = useState<{ area: string; responsable: string; monto: string; numero: string } | null>(null)

  // Nuevo responsable modal
  const [showNuevoResp,      setShowNuevoResp]      = useState(false)
  const [nrcTab,             setNrcTab]             = useState<'datos'|'adjuntos'>('datos')
  const [nrcFirma,           setNrcFirma]           = useState('')
  const [nrcNotas,           setNrcNotas]           = useState('')
  const [nrcVisorFile,       setNrcVisorFile]       = useState('')
  const [nrcAdjuntosVisited, setNrcAdjuntosVisited] = useState(false)
  const [formNuevoResp, setFormNuevoResp] = useState({
    area: '', subarea: '', responsable: '', monto: '', periodo: '2026-03',
  })

  const [formGasto, setFormGasto] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: '',
    tipo_comprobante: 'Boleta',
    num_comprobante: '',
    proveedor: '',
    monto: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const { data: rows } = await supabase.from('caja_chica_cajas')
          .select('id,area,responsable,monto_inicial,monto_disponible,created_at')
          .order('created_at', { ascending: true })
        if (rows && rows.length > 0) {
          setCajas(rows.map(r => ({
            id: r.id,
            area: r.area,
            responsable: r.responsable,
            monto_asignado: r.monto_inicial,
            gastado_mes: r.monto_inicial - r.monto_disponible,
            created_at: r.created_at,
          })))
        } else {
          setCajas(MOCK_CAJAS)
        }
      } catch { setCajas(MOCK_CAJAS) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleRegistrarGasto = async () => {
    if (!selectedCaja) return
    const monto = parseFloat(formGasto.monto)
    if (!monto || monto <= 0) return
    const nuevoGasto: GastoRow = {
      fecha: formGasto.fecha ? formGasto.fecha.split('-').reverse().join('/') : new Date().toLocaleDateString('es-PE'),
      descripcion: formGasto.descripcion,
      comprobante: `${formGasto.tipo_comprobante.slice(0, 3).toUpperCase()}-${formGasto.num_comprobante}`,
      monto,
      estado: 'declarado',
    }
    const { error } = await supabase.from('caja_chica_gastos').insert({
      caja_id: selectedCaja.id,
      concepto: formGasto.descripcion,
      monto,
      tipo_comprobante: formGasto.tipo_comprobante,
      numero_comprobante: formGasto.num_comprobante,
      fecha: formGasto.fecha,
      responsable: selectedCaja.responsable,
    })
    if (error) { alert(`Error: ${error.message}`); return }
    setGastosState(prev => ({
      ...prev,
      [selectedCaja.area]: [nuevoGasto, ...(prev[selectedCaja.area] ?? [])],
    }))
    setShowRegistrarGasto(false)
    setFormGasto({ fecha: new Date().toISOString().slice(0, 10), descripcion: '', tipo_comprobante: 'Boleta', num_comprobante: '', proveedor: '', monto: '' })
  }

  const activeCaja = cajas.find(c => c.area === activeTab) ?? null
  const activeGastos = activeCaja ? (gastosState[activeCaja.area] ?? []) : []
  const activeMeta = activeCaja ? AREA_META[activeCaja.area] : null

  const saldoActual = selectedCaja ? (selectedCaja.monto_asignado - selectedCaja.gastado_mes) : 0
  const montoInput = parseFloat(formGasto.monto || '0')
  const saldoTras = Math.max(0, saldoActual - montoInput)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">Gestión de Recursos › <span>Caja Chica CMP</span></div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Caja Chica CMP</div>
          <div className="page-subtitle">Control de fondos por área — 6 cajas activas</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowGestionar(true)}>⚙ Gestionar Caja Chica</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '4px solid #6B21A8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
            {AREA_TABS.map(tab => (
              <div
                key={tab.id}
                className={`tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* TAB: Tablero */}
          {activeTab === 'tablero' && (
            <div>
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-value">S/. 18,000.00</div>
                  <div className="metric-label">Total fondos asignados</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📤</div>
                  <div className="metric-value">S/. 6,430.00</div>
                  <div className="metric-label">Total gastado este mes</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-value">S/. 11,570.00</div>
                  <div className="metric-label">Saldo total disponible</div>
                </div>
              </div>

              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Área</th>
                        <th>Responsable</th>
                        <th>Monto asignado S/.</th>
                        <th>Gastado mes S/.</th>
                        <th>Saldo disponible S/.</th>
                        <th>Estado</th>
                        <th>Reposición pendiente</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableroRows.map(r => (
                        <tr key={r.area}>
                          <td>{r.area}</td>
                          <td>{r.responsable}</td>
                          <td>{r.asignado}</td>
                          <td>{r.gastado}</td>
                          <td>{r.saldo}</td>
                          <td>
                            {r.estadoV === 'green' && <span className="badge b-green">Al día</span>}
                            {r.estadoV === 'red' && <span className="badge b-red">Pendiente sustento</span>}
                          </td>
                          <td>{r.reposicion}</td>
                          <td>
                            <button className="btn btn-gray btn-xs" onClick={() => setActiveTab(r.tab)}>Ver detalle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <div className="text-sm fw-600 mb-8">Ejecución presupuestal del mes: 35.7% (S/. 6,430 / S/. 18,000)</div>
                  <div className="prog-bar"><div className="prog-fill" style={{ width: '36%' }} /></div>
                </div>
              </div>

              <div className="banner banner-amber mt-12">⚠ Contabilidad aún está validando el formato estándar de registro. Este módulo está en versión preliminar — los campos pueden ajustarse.</div>
            </div>
          )}

          {/* Area tabs */}
          {activeCaja && activeTab !== 'tablero' && activeMeta && (
            <div>
              <div className="page-header" style={{ marginBottom: 14 }}>
                <div>
                  <div className="page-title" style={{ fontSize: 17 }}>Caja Chica — {activeCaja.area}</div>
                  <div className="page-subtitle">Responsable: {activeCaja.responsable}</div>
                </div>
              </div>

              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-value">{activeMeta.saldo}</div>
                  <div className="metric-label">Saldo disponible</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📤</div>
                  <div className="metric-value">{activeMeta.gastado}</div>
                  <div className="metric-label">Gastado este mes</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⏳</div>
                  <div className="metric-value">{activeMeta.reposiciones}</div>
                  <div className="metric-label">Reposiciones pendientes</div>
                </div>
              </div>

              <div className="flex gap-8 mb-12">
                <button className="btn btn-primary btn-sm" onClick={() => { setSelectedCaja(activeCaja); setShowRegistrarGasto(true) }}>+ Registrar Gasto</button>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  setRepModalData({
                    area: activeCaja.area,
                    responsable: activeCaja.responsable,
                    monto: `S/. ${activeCaja.gastado_mes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                  })
                  setRepCode(`REP-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`)
                  setShowReposicion(true)
                }}>Solicitar Reposición</button>
              </div>

              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Descripción gasto</th>
                        <th>Comprobante</th>
                        <th>Monto S/.</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGastos.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF' }}>Sin gastos registrados</td></tr>
                      )}
                      {activeGastos.map((g, idx) => (
                        <tr key={idx}>
                          <td>{g.fecha}</td>
                          <td>{g.descripcion}</td>
                          <td>{g.comprobante}</td>
                          <td>S/. {g.monto.toFixed(2)}</td>
                          <td>{gastoBadge(g.estado)}</td>
                          <td>
                            {g.estado === 'pendiente_sustento' ? (
                              <div className="actions-cell">
                                <button className="btn btn-gray btn-xs" onClick={() => { setSelectedGasto(g); setShowDetalleGasto(true) }}>Ver</button>
                                <button className="btn btn-outline btn-xs" onClick={() => {
                                  setSustentoGasto(g)
                                  setSustentoArea(activeCaja?.area ?? '')
                                  setSustentoSubarea('')
                                  setSustentoNotas('')
                                  setSustentoFileName('')
                                  setShowSustento(true)
                                }}>
                                  {activeTab === 'Decanato' ? 'Adjuntar sustento' : 'Adjuntar'}
                                </button>
                              </div>
                            ) : g.estado === 'observado' ? (
                              <div className="actions-cell">
                                <button className="btn btn-gray btn-xs" onClick={() => { setSelectedGasto(g); setShowDetalleGasto(true) }}>Ver</button>
                                <button className="btn btn-outline btn-xs" onClick={() => alert('Iniciando subsanación...')}>Subsanar</button>
                              </div>
                            ) : (
                              <button className="btn btn-gray btn-xs" onClick={() => { setSelectedGasto(g); setShowDetalleGasto(true) }}>Ver</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {activeTab === 'Decanato' && (
                  <div className="card-footer">
                    <div className="flex-between">
                      <span className="text-sm fw-600">Total registrado: S/. 250.00</span>
                      <button className="btn btn-gray btn-sm" onClick={() => alert('Exportando a PDF...')}>📄 Exportar a PDF</button>
                    </div>
                  </div>
                )}
              </div>

              {activeTab === 'Decanato' && (
                <div className="banner banner-amber mt-12">⚠ Contabilidad aún está validando el formato estándar de registro. Este módulo está en versión preliminar — los campos pueden ajustarse.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Modal: Registrar Gasto ── */}
      {showRegistrarGasto && (
        <div
          className={`modal-overlay${showGestionar ? ' stacked' : ''}`}
          style={showGestionar ? { background: 'rgba(0,0,0,.18)' } : undefined}
          onClick={() => setShowRegistrarGasto(false)}
        >
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span className="modal-title">Registrar Gasto — Caja Chica <span>{selectedCaja?.area ?? ''}</span></span>
              <button className="modal-close" onClick={() => setShowRegistrarGasto(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha del gasto <span className="req">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={formGasto.fecha}
                    onChange={e => setFormGasto(f => ({ ...f, fecha: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de comprobante <span className="req">*</span></label>
                  <select
                    className="form-control"
                    value={formGasto.tipo_comprobante}
                    onChange={e => setFormGasto(f => ({ ...f, tipo_comprobante: e.target.value }))}
                  >
                    <option>Boleta</option>
                    <option>Factura</option>
                    <option>Recibo</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción del gasto <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Útiles de oficina"
                  value={formGasto.descripcion}
                  onChange={e => setFormGasto(f => ({ ...f, descripcion: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">N° de comprobante <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="RHH-2026-XXX"
                    value={formGasto.num_comprobante}
                    onChange={e => setFormGasto(f => ({ ...f, num_comprobante: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Proveedor / A favor de</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del proveedor"
                    value={formGasto.proveedor}
                    onChange={e => setFormGasto(f => ({ ...f, proveedor: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Monto (S/.) <span className="req">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  value={formGasto.monto}
                  onChange={e => setFormGasto(f => ({ ...f, monto: e.target.value }))}
                />
              </div>
              {selectedCaja && (
                <div className="saldo-dyn">
                  Saldo actual: <strong>S/. {saldoActual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                  {' '}→ Saldo tras guardar: <strong>S/. {saldoTras.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}
              <div className="form-group mt-12">
                <label className="form-label">Adjuntar comprobante <span className="req">*</span></label>
                <div className="dropzone" onClick={() => alert('Función de carga disponible en producción')}>
                  <div className="dropzone-icon">📎</div>
                  <div>Arrastra el archivo o haz clic para seleccionar</div>
                  <div className="dropzone-text">PDF, JPG, PNG — máx 5MB</div>
                </div>
              </div>
              <div className="readonly-row">
                <div className="readonly-item">
                  <div className="lbl">Responsable</div>
                  <div className="val">{selectedCaja?.responsable ?? '—'}</div>
                </div>
                <div className="readonly-item">
                  <div className="lbl">Área</div>
                  <div className="val">{selectedCaja?.area ?? '—'}</div>
                </div>
                <div className="readonly-item">
                  <div className="lbl">Periodo</div>
                  <div className="val">Marzo 2026</div>
                </div>
              </div>
              <div className="h-divider" />
              <div className="section-title-sm">FLUJO DE VALIDACIÓN</div>
              <div className="banner banner-purple" style={{ fontSize: 12 }}>📋 Al guardar este gasto, el Jefe del Área deberá validarlo antes de que quede declarado.</div>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="step-circ pend" style={{ fontSize: 10, width: 22, height: 22, flexShrink: 0 }}>1</span>
                  <span>Responsable registra el gasto</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="step-circ pend" style={{ fontSize: 10, width: 22, height: 22, flexShrink: 0 }}>2</span>
                  <span>Jefe del Área valida y aprueba</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowRegistrarGasto(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleRegistrarGasto}
                disabled={!formGasto.descripcion || !formGasto.monto || !formGasto.num_comprobante}
              >
                Guardar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Solicitar Reposición ── */}
      {showReposicion && repModalData && (
        <div
          className={`modal-overlay${showGestionar ? ' stacked' : ''}`}
          style={showGestionar ? { background: 'rgba(0,0,0,.18)' } : undefined}
          onClick={() => setShowReposicion(false)}
        >
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Solicitar Reposición de Caja Chica</div>
                <div className="modal-subtitle">{repModalData.area}</div>
              </div>
              <button className="modal-close" onClick={() => setShowReposicion(false)}>×</button>
            </div>
            <div className="modal-body">

              {/* Resumen */}
              <div className="summary-block" style={{ marginBottom: 14 }}>
                <div className="summary-row"><span className="summary-lbl">Código solicitud</span><span className="summary-val fw-600" style={{ color: '#6B21A8', letterSpacing: 1 }}>{repCode}</span></div>
                <div className="summary-row"><span className="summary-lbl">Área responsable</span><span className="summary-val">{repModalData.area}</span></div>
                <div className="summary-row"><span className="summary-lbl">Monto a reponer</span><span className="summary-val fw-600">{repModalData.monto}</span></div>
                <div className="summary-row"><span className="summary-lbl">Fecha solicitud</span><span className="summary-val">{new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>
              </div>

              <div className="banner banner-teal" style={{ marginBottom: 14 }}>✉ Notificación enviada a Contabilidad y al correo del responsable con el código de reposición.</div>

              <div className="h-divider" />

              {/* Flujo del proceso */}
              <div className="section-title-sm" style={{ marginTop: 14 }}>FLUJO DE REPOSICIÓN</div>
              <div className="stepper" style={{ marginBottom: 16 }}>
                <div className="step"><div className="step-circ cur">⏳</div><span className="step-lbl cur">Solicitud enviada</span></div>
                <div className="step-conn" />
                <div className="step"><div className="step-circ pend">2</div><span className="step-lbl pend">V°B° Jefe Área</span></div>
                <div className="step-conn" />
                <div className="step"><div className="step-circ pend">3</div><span className="step-lbl pend">Aprobación Contabilidad</span></div>
                <div className="step-conn" />
                <div className="step"><div className="step-circ pend">4</div><span className="step-lbl pend">Conformidad responsable</span></div>
              </div>

              <div className="h-divider" />

              {/* Firmas del proceso */}
              <div className="section-title-sm" style={{ marginTop: 14 }}>FIRMAS DEL PROCESO</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Responsable de Caja</div>
                  <div className="aprob-cell">
                    <div className="aprob-zona">
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{repModalData.responsable}</span>
                        <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Responsable de Caja Chica</div>
                        <div style={{ fontSize: 10, color: '#6B7280' }}>{new Date().toLocaleDateString('es-PE')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>V°B° Jefe de Área</div>
                  <div className="aprob-cell">
                    <div className="aprob-zona">
                      <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#991B1B', fontSize: 13 }}>Pendiente</span>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>—</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Aprobación Contabilidad</div>
                  <div className="aprob-cell">
                    <div className="aprob-zona">
                      <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#6B7280', fontSize: 13 }}>En espera</span>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>—</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Conformidad final</div>
                  <div className="aprob-cell">
                    <div className="aprob-zona">
                      <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#6B7280', fontSize: 13 }}>En espera</span>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>—</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowReposicion(false)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => setShowReposicion(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Ver Detalle Gasto ── */}
      {showDetalleGasto && selectedGasto && (
        <div className="modal-overlay" onClick={() => { setShowDetalleGasto(false); setSelectedGasto(null) }}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Detalle de Gasto</div>
                <div className="modal-subtitle">{activeCaja?.area}</div>
              </div>
              <button className="modal-close" onClick={() => { setShowDetalleGasto(false); setSelectedGasto(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="mb-12">{gastoBadge(selectedGasto.estado)}</div>
              <div className="section-title-sm">DATOS DEL GASTO</div>
              <div className="bien-detail-grid">
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Fecha</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{selectedGasto.fecha}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Comprobante</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{selectedGasto.comprobante}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Monto S/.</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>S/. {selectedGasto.monto.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Área</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{activeCaja?.area ?? '—'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Descripción</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{selectedGasto.descripcion}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray btn-sm" onClick={() => { setShowDetalleGasto(false); setSelectedGasto(null) }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Sustento de Gasto ── */}
      {showSustento && sustentoGasto && (
        <div className="modal-overlay" onClick={() => setShowSustento(false)}>
          <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Sustento de gasto</div>
                <div className="modal-subtitle">{sustentoGasto.comprobante} · S/. {sustentoGasto.monto.toFixed(2)}</div>
              </div>
              <button className="modal-close" onClick={() => setShowSustento(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Datos del gasto (readonly) */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <div className="section-title-sm" style={{ marginBottom: 8 }}>DATOS DEL GASTO</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div><div style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}>Fecha</div><div style={{ fontWeight: 600 }}>{sustentoGasto.fecha}</div></div>
                  <div><div style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}>Comprobante</div><div style={{ fontWeight: 600 }}>{sustentoGasto.comprobante}</div></div>
                  <div><div style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}>Monto S/.</div><div style={{ fontWeight: 600 }}>S/. {sustentoGasto.monto.toFixed(2)}</div></div>
                  <div><div style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}>Estado</div>{gastoBadge(sustentoGasto.estado)}</div>
                  <div style={{ gridColumn: '1/-1' }}><div style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}>Descripción</div><div style={{ fontWeight: 600 }}>{sustentoGasto.descripcion}</div></div>
                </div>
              </div>

              {/* Campos editables */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Área <span className="req">*</span></label>
                  <input type="text" className="form-control" value={sustentoArea}
                    onChange={e => setSustentoArea(e.target.value)}
                    placeholder="Ej: Decanato" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subárea</label>
                  <input type="text" className="form-control" value={sustentoSubarea}
                    onChange={e => setSustentoSubarea(e.target.value)}
                    placeholder="Ej: Secretaría Decanato" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas / Justificación <span className="req">*</span></label>
                <textarea className="form-control" style={{ minHeight: 72 }}
                  placeholder="Describe el motivo o justificación del gasto para el sustento..."
                  value={sustentoNotas} onChange={e => setSustentoNotas(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Adjuntar documentos <span className="req">*</span></label>
                <div
                  className="dropzone"
                  onClick={() => document.getElementById('sustento-file-input')?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    id="sustento-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={e => setSustentoFileName(e.target.files?.[0]?.name ?? '')}
                  />
                  <div className="dropzone-icon">📎</div>
                  {sustentoFileName
                    ? <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: 13 }}>✔ {sustentoFileName}</div>
                    : <><div>Arrastra el archivo o haz clic para seleccionar</div><div className="dropzone-text">PDF, Word, JPG, PNG — máx 10MB</div></>
                  }
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowSustento(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={!sustentoNotas.trim() || !sustentoFileName}
                onClick={() => {
                  setGastosState(prev => {
                    const area = activeCaja?.area ?? ''
                    return {
                      ...prev,
                      [area]: (prev[area] ?? []).map(g =>
                        g === sustentoGasto ? { ...g, estado: 'declarado' } : g
                      ),
                    }
                  })
                  setShowSustento(false)
                  setSustentoGasto(null)
                  alert('✓ Sustento adjuntado correctamente. El gasto ha sido declarado.')
                }}
              >
                Enviar sustento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Gestionar Caja Chica ── */}
      {showGestionar && (
        <div className="modal-overlay" onClick={() => setShowGestionar(false)}>
          <div className="modal-box" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">Gestionar Responsables — Caja Chica CMP</span>
                <div className="modal-subtitle">Administración de responsables, gastos y reposiciones</div>
              </div>
              <button className="modal-close" onClick={() => setShowGestionar(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-tabs" style={{ marginTop: -4 }}>
                <div className={`modal-tab${gestionarTab === 'responsables' ? ' active' : ''}`} onClick={() => setGestionarTab('responsables')}>👥 Responsables</div>
                <div className={`modal-tab${gestionarTab === 'gastos' ? ' active' : ''}`} onClick={() => setGestionarTab('gastos')}>📋 Registro de Gastos</div>
                <div className={`modal-tab${gestionarTab === 'reposiciones' ? ' active' : ''}`} onClick={() => setGestionarTab('reposiciones')}>🔄 Reposiciones</div>
              </div>

              {/* Pane: Responsables */}
              {gestionarTab === 'responsables' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { setNrcTab('datos'); setNrcFirma(''); setNrcNotas(''); setNrcVisorFile(''); setFormNuevoResp({area:'',subarea:'',responsable:'',monto:'',periodo:'2026-03'}); setShowNuevoResp(true) }}>+ Nuevo Responsable</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Área</th>
                          <th>SubÁrea</th>
                          <th>Responsable</th>
                          <th>Monto Asignado</th>
                          <th>Gasto Mes</th>
                          <th>Saldo Disponible</th>
                          <th>Estado</th>
                          <th>Reposición</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>SEC. DE ECONOMIA Y FINANZAS</td><td>UN. DE FINANZAS</td><td className="fw-600">María Torres H.</td><td>S/. 3,000</td><td>S/. 1,200</td><td>S/. 1,800</td><td><span className="badge b-green">Al día</span></td><td className="text-gray">—</td></tr>
                        <tr><td>SEC. DE ADMINISTRACION</td><td>UN. DE ADMINISTRACION</td><td className="fw-600">Lizzetti Díaz E.</td><td>S/. 4,000</td><td>S/. 2,100</td><td>S/. 1,900</td><td><span className="badge b-green">Al día</span></td><td className="text-gray">—</td></tr>
                        <tr><td>UN. DE ADMINISTRACION</td><td>UN. DE ADMINISTRACION</td><td className="fw-600">Pedro Salas Q.</td><td>S/. 2,000</td><td>S/. 980</td><td>S/. 1,020</td><td><span className="badge b-green">Al día</span></td><td className="text-gray">—</td></tr>
                        <tr><td>FONDO DE BIEN.SOCIAL DEL MED.</td><td>FOSEMED</td><td className="fw-600">Carmen Vega R.</td><td>S/. 3,500</td><td>S/. 850</td><td>S/. 2,650</td><td><span className="badge b-green">Al día</span></td><td className="text-gray">—</td></tr>
                        <tr><td>SEMEFA</td><td>SEMEFA</td><td className="fw-600">Jorge Lima C.</td><td>S/. 2,500</td><td>S/. 1,050</td><td>S/. 1,450</td><td><span className="badge b-green">Al día</span></td><td className="text-gray">—</td></tr>
                        <tr><td>DECANATO</td><td>DECANATO</td><td className="fw-600">Aaron Nuñez M.</td><td>S/. 3,000</td><td>S/. 250</td><td>S/. 2,750</td><td><span className="badge b-red">Pendiente sustento</span></td><td><span className="badge b-amber">Sí</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pane: Registro de Gastos */}
              {gestionarTab === 'gastos' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { setSelectedCaja(cajas.find(c => c.area !== 'tablero') ?? cajas[0] ?? null); setShowRegistrarGasto(true) }}>+ Registrar Gasto</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Área</th>
                          <th>Fecha</th>
                          <th>Descripción</th>
                          <th>Comprobante</th>
                          <th>Monto S/.</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>SEC. DE ECONOMIA Y FINANZAS</td><td>15/03/2026</td><td>Servicio de courier</td><td>FAC-001-00892</td><td>S/. 180.00</td><td><span className="badge b-green">Declarado</span></td><td><button className="btn btn-gray btn-xs">Ver</button></td></tr>
                        <tr><td>SEC. DE ECONOMIA Y FINANZAS</td><td>12/03/2026</td><td>Material de impresión</td><td>BOL-001-01203</td><td>S/. 95.00</td><td><span className="badge b-green">Declarado</span></td><td><button className="btn btn-gray btn-xs">Ver</button></td></tr>
                        <tr><td>SEC. DE ADMINISTRACION</td><td>20/03/2026</td><td>Útiles de escritorio</td><td>FAC-001-02341</td><td>S/. 320.00</td><td><span className="badge b-green">Declarado</span></td><td><button className="btn btn-gray btn-xs">Ver</button></td></tr>
                        <tr><td>SEC. DE ADMINISTRACION</td><td>14/03/2026</td><td>Refrigerio reunión directiva</td><td>BOL-001-00698</td><td>S/. 210.00</td><td><span className="badge b-yellow">Observado</span></td><td><button className="btn btn-gray btn-xs">Ver</button></td></tr>
                        <tr><td>DECANATO</td><td>20/03/2026</td><td>Útiles de oficina</td><td>RHH-2026-001</td><td>S/. 85.00</td><td><span className="badge b-green">Declarado</span></td><td><button className="btn btn-gray btn-xs">Ver</button></td></tr>
                        <tr><td>DECANATO</td><td>15/03/2026</td><td>Refrigerio reunión</td><td>RHH-2026-003</td><td>S/. 165.00</td><td><span className="badge b-red">Pendiente sustento</span></td><td><button className="btn btn-gray btn-xs">Ver</button></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pane: Reposiciones */}
              {gestionarTab === 'reposiciones' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span className="text-xs text-gray" style={{ color: selectedRep ? '#6B21A8' : undefined, fontWeight: selectedRep ? 600 : undefined }}>
                      {selectedRep ? `✓ Seleccionado: ${selectedRep.numero} — ${selectedRep.area}` : 'Selecciona un registro para habilitar la acción'}
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={!selectedRep}
                      onClick={() => {
                        if (!selectedRep) return
                        setRepModalData({ area: selectedRep.area, responsable: selectedRep.responsable, monto: selectedRep.monto })
                        setRepCode(`REP-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`)
                        setShowReposicion(true)
                      }}
                    >
                      Solicitar Reposición
                    </button>
                  </div>
                  <div className="section-title-sm">REGISTRO DE REPOSICIONES</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 32 }}></th>
                          <th>N° Rep.</th>
                          <th>Área</th>
                          <th>Responsable</th>
                          <th>Monto S/.</th>
                          <th>Fecha Solicitud</th>
                          <th>Estado Flujo</th>
                          <th>Aprobaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {([
                          { numero: 'REP-2026-001', area: 'DECANATO',                       responsable: 'Aaron Nuñez M.',    monto: 'S/. 3,000', fecha: '01/03/2026', estadoEl: <span className="badge b-green">Aprobada</span>,        aprobacion: 'Contabilidad ✔' },
                          { numero: 'REP-2026-002', area: 'SEC. DE ADMINISTRACION',         responsable: 'Lizzetti Díaz E.', monto: 'S/. 2,100', fecha: '08/03/2026', estadoEl: <span className="badge b-green">Aprobada</span>,        aprobacion: 'Contabilidad ✔' },
                          { numero: 'REP-2026-003', area: 'SEMEFA',                         responsable: 'Jorge Lima C.',    monto: 'S/. 1,200', fecha: '15/03/2026', estadoEl: <span className="badge b-yellow">En revisión</span>,   aprobacion: 'Jefe Área ⏳' },
                          { numero: 'REP-2026-004', area: 'FONDO DE BIEN.SOCIAL DEL MED.',  responsable: 'Carmen Vega R.',   monto: 'S/. 900',   fecha: '20/03/2026', estadoEl: <span className="badge b-red">Pendiente V°B°</span>,  aprobacion: 'Jefe Área ○' },
                          { numero: 'REP-2026-005', area: 'SEC. DE ECONOMIA Y FINANZAS',    responsable: 'María Torres H.',  monto: 'S/. 1,800', fecha: '22/03/2026', estadoEl: <span className="badge b-yellow">En revisión</span>,   aprobacion: 'Contabilidad ⏳' },
                        ] as const).map(r => {
                          const isSelected = selectedRep?.numero === r.numero
                          return (
                            <tr
                              key={r.numero}
                              style={{ cursor: 'pointer', background: isSelected ? '#F5F3FF' : undefined }}
                              onClick={() => setSelectedRep({ area: r.area, responsable: r.responsable, monto: r.monto, numero: r.numero })}
                            >
                              <td><input type="radio" name="rep-sel" style={{ accentColor: '#6B21A8' }} checked={isSelected} onChange={() => {}} /></td>
                              <td className="fw-600">{r.numero}</td>
                              <td>{r.area}</td>
                              <td>{r.responsable}</td>
                              <td>{r.monto}</td>
                              <td>{r.fecha}</td>
                              <td>{r.estadoEl}</td>
                              <td>{r.aprobacion}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowGestionar(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nuevo Responsable Caja Chica ── */}
      {showNuevoResp && (
        <div className="modal-overlay stacked" style={{ background: 'rgba(0,0,0,.18)' }} onClick={() => { setShowNuevoResp(false); setNrcAdjuntosVisited(false) }}>
          <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span className="modal-title">Nuevo Responsable de Caja Chica</span>
              <button className="modal-close" onClick={() => setShowNuevoResp(false)}>×</button>
            </div>

            {/* Tabs */}
            <div className="modal-tabs" style={{ margin: '0 -18px', padding: '0 18px', borderBottom: '1px solid #F3F4F6', marginBottom: 0 }}>
              <div className={`modal-tab${nrcTab === 'datos' ? ' active' : ''}`} onClick={() => setNrcTab('datos')}>📋 Datos</div>
              <div className={`modal-tab${nrcTab === 'adjuntos' ? ' active' : ''}`} onClick={() => { setNrcTab('adjuntos'); setNrcAdjuntosVisited(true) }}>📎 Adjuntos</div>
            </div>

            <div className="modal-body">
              {/* ── Pane: Datos ── */}
              {nrcTab === 'datos' && (
                <div style={{ paddingTop: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Área <span className="req">*</span></label>
                    <select className="form-control" value={formNuevoResp.area}
                      onChange={e => setFormNuevoResp(f => ({ ...f, area: e.target.value, subarea: '' }))}>
                      <option value="">Seleccionar área...</option>
                      {Object.keys(AREA_SUBAREAS).map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">SubÁrea</label>
                    <select className="form-control" value={formNuevoResp.subarea}
                      disabled={!formNuevoResp.area || (AREA_SUBAREAS[formNuevoResp.area]?.length ?? 0) === 0}
                      onChange={e => setFormNuevoResp(f => ({ ...f, subarea: e.target.value }))}>
                      <option value="">{formNuevoResp.area ? '— Selecciona una SubÁrea —' : '— Selecciona primero un Área —'}</option>
                      {(AREA_SUBAREAS[formNuevoResp.area] ?? []).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Responsable <span className="req">*</span></label>
                    <input type="text" className="form-control" placeholder="Nombre completo del responsable"
                      value={formNuevoResp.responsable}
                      onChange={e => setFormNuevoResp(f => ({ ...f, responsable: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Monto Asignado (S/.) <span className="req">*</span></label>
                      <input type="number" className="form-control" placeholder="0.00"
                        value={formNuevoResp.monto}
                        onChange={e => setFormNuevoResp(f => ({ ...f, monto: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Periodo</label>
                      <input type="month" className="form-control" value={formNuevoResp.periodo}
                        onChange={e => setFormNuevoResp(f => ({ ...f, periodo: e.target.value }))} />
                    </div>
                  </div>

                  <div className="h-divider" />
                  <div className="section-title-sm">FIRMAS DEL PROCESO</div>
                  {!nrcAdjuntosVisited && (
                    <div className="banner banner-amber mb-12" style={{ fontSize: 12 }}>
                      ⚠ Antes de firmar, revisa y adjunta los documentos requeridos en la pestaña <strong>📎 Adjuntos</strong>.
                    </div>
                  )}
                  <div className="banner banner-blue mb-12" style={{ fontSize: 12 }}>ℹ Requiere V°B° del Jefe/Designado de Contabilidad y firma de aceptación del nuevo responsable.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                    {/* Paso 1 — Jefe de Contabilidad (activo) */}
                    <div className="aprob-cell" style={{ border: `1px solid ${nrcAdjuntosVisited ? '#6B21A8' : '#D1D5DB'}`, background: nrcAdjuntosVisited ? '#F5F3FF' : '#FAFAFA' }}>
                      <div className="aprob-title" style={{ fontSize: 10 }}>Paso 1 — Jefe / Designado de Contabilidad</div>
                      <div className="aprob-zona" style={{ minHeight: 40, cursor: nrcAdjuntosVisited ? 'text' : 'default' }}
                        onClick={e => nrcAdjuntosVisited && (e.currentTarget.querySelector('input') as HTMLInputElement | null)?.focus()}>
                        {nrcFirma
                          ? <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{nrcFirma}</span>
                          : <span style={{ fontSize: 11, color: nrcAdjuntosVisited ? '#9CA3AF' : '#D1D5DB' }}>{nrcAdjuntosVisited ? 'Firmar aquí' : '🔒 Primero adjunta documentos'}</span>}
                      </div>
                      {!nrcFirma && nrcAdjuntosVisited && (
                        <input type="text" className="form-control" style={{ fontSize: 12, marginTop: 6 }}
                          placeholder="Escribe tu firma..." value={nrcFirma}
                          onChange={e => setNrcFirma(e.target.value)} />
                      )}
                      <div className="text-xs text-gray mt-4">Jefe de Contabilidad CMP</div>
                      <div className="text-xs text-gray">—</div>
                    </div>
                    {/* Paso 2 — Nuevo Responsable (pendiente) */}
                    <div className="aprob-cell" style={{ border: '1px solid #D1D5DB', background: '#FAFAFA' }}>
                      <div className="aprob-title" style={{ fontSize: 10 }}>Paso 2 — Nuevo Responsable acepta</div>
                      <div style={{ background: '#F3F4F6', border: '1px dashed #D1D5DB', borderRadius: 4, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Pendiente</span>
                      </div>
                      <div className="text-xs text-gray mt-4">{formNuevoResp.responsable || 'Nuevo Responsable designado'}</div>
                      <div className="text-xs text-gray">—</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Pane: Adjuntos ── */}
              {nrcTab === 'adjuntos' && (
                <div style={{ paddingTop: 12 }}>
                  <div style={{ border: '2px dashed #DDD6FE', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', background: '#F9F8FF' }}
                    onClick={() => document.getElementById('nrc-file-input')?.click()}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#6B21A8' }}>Haz clic o arrastra archivos aquí</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>PDF, Word, Excel, imágenes — Máx. 10 MB por archivo</div>
                    <input type="file" id="nrc-file-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" style={{ display: 'none' }} />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { icon: '📄', name: 'Memorando-designacion-cc.pdf', size: '2.3 MB · Subido 08/04/2026' },
                      { icon: '📋', name: 'Acta-asignacion-caja-chica.docx', size: '145 KB · Subido 08/04/2026' },
                    ].map(f => (
                      <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{f.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{f.name}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{f.size}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-gray btn-xs" onClick={() => setNrcVisorFile(nrcVisorFile === f.name ? '' : f.name)}>👁 Ver</button>
                          <button className="btn btn-gray btn-xs">🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {nrcVisorFile && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{nrcVisorFile}</div>
                        <button className="btn btn-gray btn-xs" onClick={() => setNrcVisorFile('')}>× Cerrar visor</button>
                      </div>
                      <div style={{ border: '1.5px solid #DDD6FE', borderRadius: 6, background: '#F9F8FF', padding: 24, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                        <div style={{ fontSize: 13, color: '#6B21A8', fontWeight: 600 }}>Vista previa del documento</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Los documentos reales se visualizarán desde el servidor en la implementación final</div>
                      </div>
                    </div>
                  )}
                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label className="form-label">Notas / Observaciones adicionales</label>
                    <textarea className="form-control" maxLength={500} rows={3}
                      placeholder="Agrega observaciones o comunicaciones relacionadas a la designación..."
                      value={nrcNotas} onChange={e => setNrcNotas(e.target.value)}
                      style={{ height: 80 }} />
                    <div className="form-hint" style={{ textAlign: 'right' }}>{nrcNotas.length}/500 caracteres</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowNuevoResp(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={!formNuevoResp.area || !formNuevoResp.responsable || !formNuevoResp.monto || !nrcFirma.trim()}
                title={!nrcFirma.trim() ? 'El Jefe de Contabilidad debe firmar antes de enviar' : ''}
                onClick={() => {
                  const monto = parseFloat(formNuevoResp.monto) || 0
                  const montoStr = `S/. ${monto.toLocaleString('es-PE')}`
                  setTableroRows(prev => [...prev, {
                    area: formNuevoResp.area,
                    responsable: formNuevoResp.responsable,
                    asignado: montoStr,
                    gastado: 'S/. 0',
                    saldo: montoStr,
                    estadoV: 'green' as const,
                    reposicion: 'No',
                    tab: formNuevoResp.area,
                  }])
                  setCajas(prev => [...prev, {
                    id: String(Date.now()),
                    area: formNuevoResp.area,
                    responsable: formNuevoResp.responsable,
                    monto_asignado: monto,
                    gastado_mes: 0,
                    created_at: '',
                  }])
                  setShowNuevoResp(false)
                  setFormNuevoResp({ area: '', subarea: '', responsable: '', monto: '', periodo: '2026-03' })
                  setNrcFirma('')
                  setNrcAdjuntosVisited(false)
                }}
              >
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
