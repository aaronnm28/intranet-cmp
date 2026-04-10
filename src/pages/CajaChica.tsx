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

function gastoBadge(estado: string) {
  if (estado === 'declarado') return <span className="badge b-green">Declarado</span>
  if (estado === 'pendiente_sustento') return <span className="badge b-red">Pendiente sustento</span>
  if (estado === 'observado') return <span className="badge b-yellow">Observado</span>
  return <span className="badge b-gray">{estado}</span>
}

export function CajaChica() {
  const [cajas, setCajas] = useState<CajaChicaType[]>([])
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
                      {TABLERO_ROWS.map(r => (
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
                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedCaja(activeCaja); setShowReposicion(true) }}>Solicitar Reposición</button>
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
                                <button className="btn btn-outline btn-xs" onClick={() => alert('Función de adjuntar disponible en producción')}>
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
        <div className="modal-overlay" onClick={() => setShowRegistrarGasto(false)}>
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
      {showReposicion && (
        <div className="modal-overlay" onClick={() => setShowReposicion(false)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div className="modal-title">Solicitar Reposición</div>
              <button className="modal-close" onClick={() => setShowReposicion(false)}>×</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', marginBottom: 8 }}>Reposición solicitada</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{selectedCaja?.area}</div>
              <div style={{ background: '#F5F3FF', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div className="text-xs text-gray mb-8">Código de solicitud</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#6B21A8', letterSpacing: 2 }}>REP-2026-001</div>
              </div>
              <div className="banner banner-teal" style={{ textAlign: 'left' }}>✉ Se ha enviado una notificación al área de Contabilidad y al correo del responsable con el código de reposición.</div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowReposicion(false)}>Entendido</button>
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
                    <button className="btn btn-primary btn-sm" onClick={() => alert('Formulario de nuevo responsable disponible en producción')}>+ Nuevo Responsable</button>
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
                    <button className="btn btn-primary btn-sm" onClick={() => { setShowGestionar(false); setSelectedCaja(cajas.find(c => c.area === 'Decanato') ?? null); setShowRegistrarGasto(true) }}>+ Registrar Gasto</button>
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
                    <span className="text-xs text-gray">Selecciona un registro para habilitar la acción</span>
                    <button className="btn btn-primary btn-sm" disabled>Solicitar Reposición</button>
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
                        <tr style={{ cursor: 'pointer' }}>
                          <td><input type="radio" name="rep-sel" style={{ accentColor: '#6B21A8' }} /></td>
                          <td className="fw-600">REP-2026-001</td><td>DECANATO</td><td>Aaron Nuñez M.</td><td>S/. 3,000</td><td>01/03/2026</td><td><span className="badge b-green">Aprobada</span></td><td>Contabilidad ✔</td>
                        </tr>
                        <tr style={{ cursor: 'pointer' }}>
                          <td><input type="radio" name="rep-sel" style={{ accentColor: '#6B21A8' }} /></td>
                          <td className="fw-600">REP-2026-002</td><td>SEC. DE ADMINISTRACION</td><td>Lizzetti Díaz E.</td><td>S/. 2,100</td><td>08/03/2026</td><td><span className="badge b-green">Aprobada</span></td><td>Contabilidad ✔</td>
                        </tr>
                        <tr style={{ cursor: 'pointer' }}>
                          <td><input type="radio" name="rep-sel" style={{ accentColor: '#6B21A8' }} /></td>
                          <td className="fw-600">REP-2026-003</td><td>SEMEFA</td><td>Jorge Lima C.</td><td>S/. 1,200</td><td>15/03/2026</td><td><span className="badge b-yellow">En revisión</span></td><td>Jefe Área ⏳</td>
                        </tr>
                        <tr style={{ cursor: 'pointer' }}>
                          <td><input type="radio" name="rep-sel" style={{ accentColor: '#6B21A8' }} /></td>
                          <td className="fw-600">REP-2026-004</td><td>FONDO DE BIEN.SOCIAL DEL MED.</td><td>Carmen Vega R.</td><td>S/. 900</td><td>20/03/2026</td><td><span className="badge b-red">Pendiente V°B°</span></td><td>Jefe Área ○</td>
                        </tr>
                        <tr style={{ cursor: 'pointer' }}>
                          <td><input type="radio" name="rep-sel" style={{ accentColor: '#6B21A8' }} /></td>
                          <td className="fw-600">REP-2026-005</td><td>SEC. DE ECONOMIA Y FINANZAS</td><td>María Torres H.</td><td>S/. 1,800</td><td>22/03/2026</td><td><span className="badge b-yellow">En revisión</span></td><td>Contabilidad ⏳</td>
                        </tr>
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
    </div>
  )
}
