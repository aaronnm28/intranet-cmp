import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Upload } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { MetricCard } from '../components/ui/MetricCard'
import { cajaChicaService } from '../services/db'
import type { CajaChica as CajaChicaType, GastoCajaChica } from '../types'

const MOCK_CAJAS: CajaChicaType[] = [
  { id: '1', area: 'Sec. Economía y Finanzas', responsable: 'María Torres H.', monto_asignado: 3000, gastado_mes: 1200, created_at: '' },
  { id: '2', area: 'Sec. Administración', responsable: 'Lizzetti Díaz E.', monto_asignado: 4000, gastado_mes: 2100, created_at: '' },
  { id: '3', area: 'Uni. Administración', responsable: 'Pedro Salas Q.', monto_asignado: 2000, gastado_mes: 980, created_at: '' },
  { id: '4', area: 'FOSEMED', responsable: 'Carmen Vega R.', monto_asignado: 3500, gastado_mes: 850, created_at: '' },
  { id: '5', area: 'SEMEFA', responsable: 'Jorge Lima C.', monto_asignado: 2500, gastado_mes: 1050, created_at: '' },
  { id: '6', area: 'Decanato', responsable: 'Aaron Nuñez M.', monto_asignado: 3000, gastado_mes: 250, created_at: '' },
]

const MOCK_GASTOS: Record<string, GastoCajaChica[]> = {
  '1': [
    { id: 'g1', caja_id: '1', fecha: '05/03/2026', descripcion: 'Compra de útiles de escritorio', comprobante: 'Boleta 001-0045', monto: 150, estado: 'aprobado', created_at: '' },
    { id: 'g2', caja_id: '1', fecha: '10/03/2026', descripcion: 'Impresión de documentos', comprobante: 'Boleta 003-0120', monto: 45, estado: 'aprobado', created_at: '' },
    { id: 'g3', caja_id: '1', fecha: '15/03/2026', descripcion: 'Courier documentos', comprobante: 'Recibo 00234', monto: 80, estado: 'pendiente_sustento', created_at: '' },
  ],
  '2': [
    { id: 'g4', caja_id: '2', fecha: '03/03/2026', descripcion: 'Material de limpieza', comprobante: 'Factura 001-0891', monto: 320, estado: 'aprobado', created_at: '' },
    { id: 'g5', caja_id: '2', fecha: '12/03/2026', descripcion: 'Refrigerio reunión', comprobante: 'Boleta 005-0234', monto: 180, estado: 'observado', created_at: '' },
  ],
}

function gastoBadge(estado: string) {
  if (estado === 'aprobado') return <Badge variant="green">Aprobado</Badge>
  if (estado === 'pendiente_sustento') return <Badge variant="amber">Pendiente sustento</Badge>
  if (estado === 'observado') return <Badge variant="yellow">Observado</Badge>
  if (estado === 'declarado') return <Badge variant="blue">Declarado</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-400' : 'bg-[#6B21A8]'
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

interface AreaTabProps {
  caja: CajaChicaType
  gastos: GastoCajaChica[]
  onRegistrarGasto: (caja: CajaChicaType) => void
  onSolicitarReposicion: (caja: CajaChicaType) => void
}

function AreaTab({ caja, gastos, onRegistrarGasto, onSolicitarReposicion }: AreaTabProps) {
  const saldo = caja.monto_asignado - caja.gastado_mes
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <MetricCard icon="💰" value={`S/. ${caja.monto_asignado.toLocaleString()}`} label="Fondo asignado" />
        <MetricCard icon="📤" value={`S/. ${caja.gastado_mes.toLocaleString()}`} label="Gastado este mes" />
        <MetricCard icon="💵" value={`S/. ${saldo.toLocaleString()}`} label="Saldo disponible" />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => onSolicitarReposicion(caja)}>
          <RefreshCw size={13} /> Solicitar Reposición
        </Button>
        <Button size="sm" onClick={() => onRegistrarGasto(caja)}>
          <Plus size={13} /> Registrar Gasto
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-[14px] font-bold text-[#1E1B4B]">Gastos del mes</div>
          <span className="text-[12px] text-gray-400">Responsable: {caja.responsable}</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Fecha', 'Descripción', 'Comprobante', 'Monto', 'Estado'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin gastos registrados</td></tr>
            )}
            {gastos.map(g => (
              <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{g.fecha}</td>
                <td className="px-4 py-3 text-[#1E1B4B]">{g.descripcion}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{g.comprobante}</td>
                <td className="px-4 py-3 font-semibold">S/. {g.monto.toFixed(2)}</td>
                <td className="px-4 py-3">{gastoBadge(g.estado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CajaChica() {
  const [cajas, setCajas] = useState<CajaChicaType[]>([])
  const [gastosPorCaja, setGastosPorCaja] = useState<Record<string, GastoCajaChica[]>>(MOCK_GASTOS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tablero')
  const [showGasto, setShowGasto] = useState(false)
  const [showReposicion, setShowReposicion] = useState(false)
  const [selectedCaja, setSelectedCaja] = useState<CajaChicaType | null>(null)
  const { toast, toastState, hideToast } = useToast()

  const [formGasto, setFormGasto] = useState({ fecha: '', descripcion: '', tipo_comprobante: 'boleta', num_comprobante: '', monto: '' })
  const [formRepo, setFormRepo] = useState({ monto: '', justificacion: '' })

  useEffect(() => {
    cajaChicaService.getCajas()
      .then(rows => { if (rows && rows.length > 0) setCajas(rows as CajaChicaType[]); else setCajas(MOCK_CAJAS) })
      .catch(() => setCajas(MOCK_CAJAS))
      .finally(() => setLoading(false))
  }, [])

  const handleRegistrarGasto = async () => {
    if (!selectedCaja) return
    const nuevoGasto: GastoCajaChica = {
      id: String(Date.now()),
      caja_id: selectedCaja.id,
      fecha: formGasto.fecha || new Date().toLocaleDateString('es-PE'),
      descripcion: formGasto.descripcion,
      comprobante: `${formGasto.tipo_comprobante.charAt(0).toUpperCase() + formGasto.tipo_comprobante.slice(1)} ${formGasto.num_comprobante}`,
      monto: parseFloat(formGasto.monto),
      estado: 'declarado',
      created_at: new Date().toISOString(),
    }
    try {
      await cajaChicaService.registrarGasto({ ...nuevoGasto })
    } catch { /* ignore */ }
    setGastosPorCaja(prev => ({
      ...prev,
      [selectedCaja.id]: [nuevoGasto, ...(prev[selectedCaja.id] ?? [])],
    }))
    setCajas(prev => prev.map(c => c.id === selectedCaja.id ? { ...c, gastado_mes: c.gastado_mes + parseFloat(formGasto.monto) } : c))
    setShowGasto(false)
    setFormGasto({ fecha: '', descripcion: '', tipo_comprobante: 'boleta', num_comprobante: '', monto: '' })
    toast('Gasto registrado correctamente.')
  }

  const handleReposicion = () => {
    setShowReposicion(false)
    setFormRepo({ monto: '', justificacion: '' })
    toast('Solicitud de reposición enviada.')
  }

  const openGastoModal = (caja: CajaChicaType) => { setSelectedCaja(caja); setShowGasto(true) }
  const openRepoModal = (caja: CajaChicaType) => { setSelectedCaja(caja); setShowReposicion(true) }

  const tabs = [
    { id: 'tablero', label: 'Tablero' },
    ...MOCK_CAJAS.map(c => ({ id: c.id, label: c.area })),
  ]

  const totalFondos = cajas.reduce((s, c) => s + c.monto_asignado, 0)
  const totalGastado = cajas.reduce((s, c) => s + c.gastado_mes, 0)
  const totalSaldo = totalFondos - totalGastado

  const activeCaja = cajas.find(c => c.id === activeTab) ?? null
  const activeGastos = activeCaja ? (gastosPorCaja[activeCaja.id] ?? []) : []

  return (
    <div>
      <PageHeader
        title="Caja Chica"
        subtitle="Control de fondos por área — 6 cajas activas"
        breadcrumb={<>Gestión de Recursos &rsaquo; Caja Chica Decanato</>}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            {tabs.map(tab => (
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

          {activeTab === 'tablero' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <MetricCard icon="🏦" value={`S/. ${totalFondos.toLocaleString()}`} label="Total fondos asignados" />
                <MetricCard icon="📊" value={`S/. ${totalGastado.toLocaleString()}`} label="Total gastado este mes" />
                <MetricCard icon="💵" value={`S/. ${totalSaldo.toLocaleString()}`} label="Saldo total disponible" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Área', 'Responsable', 'Monto asignado', 'Gastado', 'Saldo', 'Uso', 'Estado'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cajas.map(c => {
                      const saldo = c.monto_asignado - c.gastado_mes
                      const pct = Math.round((c.gastado_mes / c.monto_asignado) * 100)
                      return (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTab(c.id)}>
                          <td className="px-4 py-3 font-medium text-[#1E1B4B]">{c.area}</td>
                          <td className="px-4 py-3 text-gray-500">{c.responsable}</td>
                          <td className="px-4 py-3 font-semibold">S/. {c.monto_asignado.toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-red-600">S/. {c.gastado_mes.toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">S/. {saldo.toLocaleString()}</td>
                          <td className="px-4 py-3 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <ProgressBar value={c.gastado_mes} max={c.monto_asignado} />
                              <span className="text-[11px] text-gray-500 flex-shrink-0">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {pct >= 80 ? <Badge variant="red">Crítico</Badge> : pct >= 60 ? <Badge variant="amber">En uso</Badge> : <Badge variant="green">Normal</Badge>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeCaja && activeTab !== 'tablero' && (
            <AreaTab
              caja={activeCaja}
              gastos={activeGastos}
              onRegistrarGasto={openGastoModal}
              onSolicitarReposicion={openRepoModal}
            />
          )}
        </>
      )}

      {/* Modal Registrar Gasto */}
      <Modal
        open={showGasto}
        onClose={() => setShowGasto(false)}
        title="Registrar Gasto"
        subtitle={selectedCaja?.area}
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowGasto(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleRegistrarGasto} disabled={!formGasto.descripcion || !formGasto.monto || !formGasto.num_comprobante}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formGasto.fecha}
                onChange={e => setFormGasto(f => ({ ...f, fecha: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Monto (S/.) <span className="text-red-500">*</span></label>
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
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Descripción <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formGasto.descripcion}
              onChange={e => setFormGasto(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción del gasto..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo comprobante</label>
              <select
                value={formGasto.tipo_comprobante}
                onChange={e => setFormGasto(f => ({ ...f, tipo_comprobante: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              >
                <option value="factura">Factura</option>
                <option value="boleta">Boleta</option>
                <option value="recibo">Recibo</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">N° Comprobante <span className="text-red-500">*</span></label>
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
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Adjuntar comprobante</label>
            <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#6B21A8] transition-colors">
              <Upload size={16} className="text-gray-400" />
              <span className="text-[13px] text-gray-500">Haga clic para adjuntar archivo...</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal Solicitar Reposición */}
      <Modal
        open={showReposicion}
        onClose={() => setShowReposicion(false)}
        title="Solicitar Reposición de Caja Chica"
        subtitle={selectedCaja?.area}
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowReposicion(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleReposicion} disabled={!formRepo.monto || !formRepo.justificacion}>
              <RefreshCw size={13} /> Enviar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Monto a reponer (S/.) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formRepo.monto}
              onChange={e => setFormRepo(f => ({ ...f, monto: e.target.value }))}
              placeholder="0.00"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Justificación <span className="text-red-500">*</span></label>
            <textarea
              value={formRepo.justificacion}
              onChange={e => setFormRepo(f => ({ ...f, justificacion: e.target.value }))}
              rows={3}
              placeholder="Detalle los gastos que justifican la reposición..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Adjuntar sustento</label>
            <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#6B21A8] transition-colors">
              <Upload size={16} className="text-gray-400" />
              <span className="text-[13px] text-gray-500">Adjuntar comprobantes y/o informe...</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple />
            </label>
          </div>
        </div>
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
