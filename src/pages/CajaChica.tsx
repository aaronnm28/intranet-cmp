import { useState, useEffect } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { MetricCard } from '../components/ui/MetricCard'
import { cajaChicaService } from '../services/db'
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
    { fecha: '21/03/2026', descripcion: 'Papelería y útiles', comprobante: 'FAC-001-00231', monto: 145, estado: 'declarado' },
    { fecha: '16/03/2026', descripcion: 'Movilidad comisión', comprobante: 'REC-001-00067', monto: 75, estado: 'declarado' },
    { fecha: '11/03/2026', descripcion: 'Refrigerio capacitación', comprobante: 'BOL-001-00512', monto: 180, estado: 'pendiente_sustento' },
  ],
  'Decanato': [
    { fecha: '25/03/2026', descripcion: 'Flores protocolo', comprobante: 'BOL-001-00789', monto: 250, estado: 'pendiente_sustento' },
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
  { area: 'Sec. Economía y Finanzas', responsable: 'María Torres H.', asignado: 'S/. 3,000', gastado: 'S/. 1,200', saldo: 'S/. 1,800', estadoV: 'green' as const, reposicion: '—' },
  { area: 'Sec. Administración', responsable: 'Lizzetti Díaz E.', asignado: 'S/. 4,000', gastado: 'S/. 2,100', saldo: 'S/. 1,900', estadoV: 'green' as const, reposicion: '—' },
  { area: 'Uni. Administración', responsable: 'Pedro Salas Q.', asignado: 'S/. 2,000', gastado: 'S/. 980', saldo: 'S/. 1,020', estadoV: 'green' as const, reposicion: '—' },
  { area: 'FOSEMED', responsable: 'Carmen Vega R.', asignado: 'S/. 3,500', gastado: 'S/. 850', saldo: 'S/. 2,650', estadoV: 'green' as const, reposicion: '—' },
  { area: 'SEMEFA', responsable: 'Jorge Lima C.', asignado: 'S/. 2,500', gastado: 'S/. 1,050', saldo: 'S/. 1,450', estadoV: 'green' as const, reposicion: '—' },
  { area: 'Decanato', responsable: 'Aaron Nuñez M.', asignado: 'S/. 3,000', gastado: 'S/. 250', saldo: 'S/. 2,750', estadoV: 'yellow' as const, reposicion: 'Sí' },
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

function gastoBadge(estado: string) {
  if (estado === 'declarado') return <Badge variant="green">Declarado</Badge>
  if (estado === 'pendiente_sustento') return <Badge variant="yellow">Pendiente sustento</Badge>
  if (estado === 'observado') return <Badge variant="red">Observado</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

export function CajaChica() {
  const [cajas, setCajas] = useState<CajaChicaType[]>([])
  const [gastosState, setGastosState] = useState<Record<string, GastoRow[]>>(MOCK_GASTOS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tablero')
  const [showRegistrarGasto, setShowRegistrarGasto] = useState(false)
  const [showReposicion, setShowReposicion] = useState(false)
  const [showDetalleGasto, setShowDetalleGasto] = useState(false)
  const [selectedCaja, setSelectedCaja] = useState<CajaChicaType | null>(null)
  const [selectedGasto, setSelectedGasto] = useState<GastoRow | null>(null)
  const { toast, toastState, hideToast } = useToast()

  const [formGasto, setFormGasto] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: '',
    tipo_comprobante: 'Factura',
    num_comprobante: '',
    monto: '',
  })

  useEffect(() => {
    cajaChicaService.getCajas()
      .then(rows => { if (rows && rows.length > 0) setCajas(rows as CajaChicaType[]); else setCajas(MOCK_CAJAS) })
      .catch(() => setCajas(MOCK_CAJAS))
      .finally(() => setLoading(false))
  }, [])

  const handleRegistrarGasto = () => {
    if (!selectedCaja) return
    const nuevoGasto: GastoRow = {
      fecha: formGasto.fecha || new Date().toLocaleDateString('es-PE'),
      descripcion: formGasto.descripcion,
      comprobante: `${formGasto.tipo_comprobante.slice(0, 3).toUpperCase()}-${formGasto.num_comprobante}`,
      monto: parseFloat(formGasto.monto),
      estado: 'declarado',
    }
    setGastosState(prev => ({
      ...prev,
      [selectedCaja.area]: [nuevoGasto, ...(prev[selectedCaja.area] ?? [])],
    }))
    setShowRegistrarGasto(false)
    setFormGasto({ fecha: new Date().toISOString().slice(0, 10), descripcion: '', tipo_comprobante: 'Factura', num_comprobante: '', monto: '' })
    toast('Gasto registrado correctamente.')
  }

  const activeCaja = cajas.find(c => c.area === activeTab) ?? null
  const activeGastos = activeCaja ? (gastosState[activeCaja.area] ?? []) : []

  const totalFondos = 18000
  const totalGastado = 6430
  const pctEjecucion = 35.7

  return (
    <div>
      <PageHeader
        title="Caja Chica"
        subtitle="Control de fondos por área — 6 cajas activas"
        breadcrumb={<>Gestión de Recursos &rsaquo; Caja Chica Decanato</>}
        actions={<Button variant="outline" size="sm">📥 Exportar Excel</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            {AREA_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer border-b-2 -mb-px transition-all whitespace-nowrap
                  ${activeTab === tab.id ? 'text-[#6B21A8] border-[#6B21A8]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: Tablero */}
          {activeTab === 'tablero' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <MetricCard icon="💰" value="S/. 18,000" label="Total fondos asignados" />
                <MetricCard icon="📤" value="S/. 6,430" label="Total gastado este mes" />
                <MetricCard icon="📊" value="S/. 11,570" label="Saldo total disponible" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Área', 'Responsable', 'Monto asignado S/.', 'Gastado mes S/.', 'Saldo disponible S/.', 'Estado', 'Reposición pendiente', 'Acciones'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLERO_ROWS.map((r, idx) => (
                      <tr key={r.area} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                        <td className="px-4 py-3 font-medium text-[#1E1B4B]">{r.area}</td>
                        <td className="px-4 py-3 text-gray-500">{r.responsable}</td>
                        <td className="px-4 py-3 font-semibold">{r.asignado}</td>
                        <td className="px-4 py-3 font-semibold text-red-600">{r.gastado}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">{r.saldo}</td>
                        <td className="px-4 py-3">
                          {r.estadoV === 'green' && <Badge variant="green">Al día</Badge>}
                          {r.estadoV === 'yellow' && <Badge variant="yellow">Pendiente sustento</Badge>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{r.reposicion}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="xs" onClick={() => setActiveTab(r.area)}>Ver detalle</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer ejecución */}
                <div className="px-4 py-3 border-t border-gray-100 bg-[#F8F6FB]">
                  <div className="text-[12px] text-gray-600 mb-2">
                    Ejecución presupuestal del mes: <span className="font-semibold text-[#1E1B4B]">{pctEjecucion}%</span>
                    {' '}(S/. {totalGastado.toLocaleString()} / S/. {totalFondos.toLocaleString()})
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#6B21A8]" style={{ width: `${pctEjecucion}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-700">
                ⚠ Contabilidad aún está validando el formato estándar de registro. Este módulo está en versión preliminar — los campos pueden ajustarse.
              </div>
            </div>
          )}

          {/* Area tabs */}
          {activeCaja && activeTab !== 'tablero' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="text-[14px] font-bold text-[#1E1B4B]">{activeCaja.area}</div>
                  <div className="text-[12px] text-gray-400">Responsable: {activeCaja.responsable}</div>
                </div>

                <div className="p-4">
                  <div className="flex gap-3 mb-4">
                    <MetricCard icon="💰" value={`S/. ${activeCaja.monto_asignado.toLocaleString()}`} label="Monto asignado" />
                    <MetricCard icon="📤" value={`S/. ${activeCaja.gastado_mes.toLocaleString()}`} label="Gastado este mes" />
                    <MetricCard icon="💵" value={`S/. ${(activeCaja.monto_asignado - activeCaja.gastado_mes).toLocaleString()}`} label="Saldo disponible" />
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Button size="sm" onClick={() => { setSelectedCaja(activeCaja); setShowRegistrarGasto(true) }}>+ Registrar Gasto</Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCaja(activeCaja); setShowReposicion(true) }}>Solicitar Reposición</Button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {['Fecha', 'Descripción gasto', 'Comprobante', 'Monto S/.', 'Estado', 'Acciones'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeGastos.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin gastos registrados</td></tr>
                        )}
                        {activeGastos.map((g, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500">{g.fecha}</td>
                            <td className="px-4 py-3 text-[#1E1B4B]">{g.descripcion}</td>
                            <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{g.comprobante}</td>
                            <td className="px-4 py-3 font-semibold">S/. {g.monto.toFixed(2)}</td>
                            <td className="px-4 py-3">{gastoBadge(g.estado)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <Button variant="ghost" size="xs" onClick={() => { setSelectedGasto(g); setShowDetalleGasto(true) }}>Ver</Button>
                                {g.estado === 'pendiente_sustento' && (
                                  <Button variant="outline" size="xs" onClick={() => toast('Adjuntando comprobante...')}>Adjuntar</Button>
                                )}
                                {g.estado === 'observado' && (
                                  <Button variant="outline" size="xs" onClick={() => toast('Subsanando observación...')}>Subsanar</Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Registrar Gasto */}
      <Modal
        open={showRegistrarGasto}
        onClose={() => setShowRegistrarGasto(false)}
        title={`Registrar Gasto — ${selectedCaja?.area ?? ''}`}
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowRegistrarGasto(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleRegistrarGasto} disabled={!formGasto.descripcion || !formGasto.monto || !formGasto.num_comprobante}>
              💾 Guardar Gasto
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha</label>
            <input
              type="date"
              value={formGasto.fecha}
              onChange={e => setFormGasto(f => ({ ...f, fecha: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Descripción del gasto <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formGasto.descripcion}
              onChange={e => setFormGasto(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Ej: Compra de útiles de escritorio..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo de comprobante</label>
              <select
                value={formGasto.tipo_comprobante}
                onChange={e => setFormGasto(f => ({ ...f, tipo_comprobante: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              >
                <option value="Factura">Factura</option>
                <option value="Boleta">Boleta</option>
                <option value="Recibo">Recibo</option>
                <option value="Ticket">Ticket</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">N° de comprobante <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formGasto.num_comprobante}
                onChange={e => setFormGasto(f => ({ ...f, num_comprobante: e.target.value }))}
                placeholder="001-00001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Monto S/. <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formGasto.monto}
              onChange={e => setFormGasto(f => ({ ...f, monto: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Adjuntar comprobante</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 cursor-pointer hover:border-[#6B21A8] transition-colors">
              <div className="text-[20px] mb-1">📎</div>
              <div className="text-[13px] text-gray-500">Arrastrar o hacer clic para adjuntar comprobante</div>
              <div className="text-[11px] text-gray-400 mt-1">PDF, JPG, PNG — máx. 5MB</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Solicitar Reposición — confirmation */}
      <Modal
        open={showReposicion}
        onClose={() => setShowReposicion(false)}
        title=""
        maxWidth="max-w-[400px]"
        footer={
          <div className="flex justify-center w-full">
            <Button size="sm" onClick={() => setShowReposicion(false)}>Entendido</Button>
          </div>
        }
      >
        <div className="text-center space-y-4 py-2">
          <div className="text-[48px]">📬</div>
          <div className="text-[15px] font-bold text-[#1E1B4B]">Reposición solicitada</div>
          <div className="text-[13px] text-gray-500">{selectedCaja?.area}</div>
          <div className="bg-[#F5F3FF] rounded-lg px-6 py-4 mx-auto inline-block">
            <div className="text-[20px] font-bold text-[#6B21A8] tracking-widest font-mono">REP-2026-001</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-[12px] text-teal-700 text-left">
            ✉ Se ha enviado una notificación al área de Contabilidad y al correo del responsable con el código de reposición.
          </div>
        </div>
      </Modal>

      {/* Modal Ver Detalle Gasto */}
      <Modal
        open={showDetalleGasto && !!selectedGasto}
        onClose={() => { setShowDetalleGasto(false); setSelectedGasto(null) }}
        title="Detalle del Gasto"
        maxWidth="max-w-[420px]"
        footer={<Button variant="gray" size="sm" onClick={() => { setShowDetalleGasto(false); setSelectedGasto(null) }}>Cerrar</Button>}
      >
        {selectedGasto && (
          <div className="space-y-3">
            {[
              { label: 'Fecha', value: selectedGasto.fecha },
              { label: 'Descripción', value: selectedGasto.descripcion },
              { label: 'Comprobante', value: selectedGasto.comprobante },
              { label: 'Monto S/.', value: `S/. ${selectedGasto.monto.toFixed(2)}` },
              { label: 'Área', value: activeCaja?.area ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-[13px]">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="text-[#1E1B4B] font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-[13px] items-center">
              <span className="text-gray-500 font-medium">Estado</span>
              {gastoBadge(selectedGasto.estado)}
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
