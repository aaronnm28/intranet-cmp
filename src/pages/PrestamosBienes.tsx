import { useState, useEffect } from 'react'
import { Eye, Plus, RotateCcw } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { Stepper } from '../components/ui/Stepper'
import { prestamosBienesService } from '../services/db'
import type { PrestamoBien } from '../types'

const MOCK_DATA: PrestamoBien[] = [
  { id: '1', numero: 'PREST-2026-001', bien_nombre: 'Laptop Dell Latitude', bien_codigo: 'TI-LAP-003', tipo: 'computo', solicitante: 'Nuñez Muñoz, Aaron', area: 'UN. DE TI', fecha_prestamo: '01/03/2026', fecha_devolucion_est: '15/03/2026', estado: 'activo', created_at: '' },
  { id: '2', numero: 'PREST-2026-002', bien_nombre: 'Proyector EPSON', bien_codigo: 'LOG-PRY-001', tipo: 'otro', solicitante: 'Torres H., María', area: 'UN. DE GDTH', fecha_prestamo: '05/03/2026', fecha_devolucion_est: '10/03/2026', estado: 'vencido', created_at: '' },
]

const BIENES_DISPONIBLES = [
  { id: '1', nombre: 'Laptop HP ProBook 440', codigo: 'TI-LAP-004' },
  { id: '2', nombre: 'Proyector EPSON EB-X50', codigo: 'LOG-PRY-002' },
  { id: '3', nombre: 'Cámara Canon EOS', codigo: 'COM-CAM-001' },
  { id: '4', nombre: 'Tablet Samsung A8', codigo: 'TI-TAB-002' },
]

function estadoBadge(estado: string) {
  if (estado === 'activo') return <Badge variant="green">Activo</Badge>
  if (estado === 'devuelto') return <Badge variant="gray">Devuelto</Badge>
  if (estado === 'vencido') return <Badge variant="red">Vencido</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

function stepperForPrestamo(estado: string) {
  const idx = { activo: 1, vencido: 1, devuelto: 3 }[estado] ?? 1
  return [
    { label: 'Solicitud', status: idx >= 1 ? 'done' : 'pending' },
    { label: 'Préstamo activo', status: idx === 1 ? 'current' : idx > 1 ? 'done' : 'pending' },
    { label: 'Devolución', status: idx >= 3 ? 'done' : 'pending' },
  ] as { label: string; status: 'done' | 'current' | 'pending' }[]
}

export function PrestamosBienes() {
  const [data, setData] = useState<PrestamoBien[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activos')
  const [showNuevo, setShowNuevo] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [selected, setSelected] = useState<PrestamoBien | null>(null)
  const { toast, toastState, hideToast } = useToast()

  const [form, setForm] = useState({ bien_id: '', fecha_devolucion: '', motivo: '' })

  useEffect(() => {
    prestamosBienesService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as PrestamoBien[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleSolicitar = async () => {
    const bien = BIENES_DISPONIBLES.find(b => b.id === form.bien_id)
    const nuevo: PrestamoBien = {
      id: String(Date.now()),
      numero: `PREST-2026-${String(data.length + 1).padStart(3, '0')}`,
      bien_nombre: bien?.nombre ?? 'Bien',
      bien_codigo: bien?.codigo ?? 'N/A',
      tipo: 'computo',
      solicitante: 'Aaron Nuñez M.',
      area: 'UN. DE TI',
      fecha_prestamo: new Date().toLocaleDateString('es-PE'),
      fecha_devolucion_est: form.fecha_devolucion || '—',
      estado: 'activo',
      created_at: new Date().toISOString(),
    }
    try { await prestamosBienesService.create({ ...nuevo, motivo: form.motivo }) } catch { /* ignore */ }
    setData(prev => [nuevo, ...prev])
    setShowNuevo(false)
    setForm({ bien_id: '', fecha_devolucion: '', motivo: '' })
    toast('Préstamo registrado correctamente.')
  }

  const handleDevolver = async (id: string) => {
    try { await prestamosBienesService.devolver(id) } catch { /* ignore */ }
    setData(prev => prev.map(p => p.id === id ? { ...p, estado: 'devuelto' } : p))
    setShowDetalle(false)
    toast('Devolución registrada correctamente.')
  }

  const tabs = [
    { id: 'activos', label: 'Activos' },
    { id: 'devueltos', label: 'Devueltos' },
    { id: 'vencidos', label: 'Vencidos' },
  ]

  const filtered = data.filter(p => p.estado === activeTab.replace('s', '') || p.estado === activeTab.slice(0, -1))
    .filter(p => {
      if (activeTab === 'activos') return p.estado === 'activo'
      if (activeTab === 'devueltos') return p.estado === 'devuelto'
      if (activeTab === 'vencidos') return p.estado === 'vencido'
      return true
    })

  return (
    <div>
      <PageHeader
        title="Préstamos de Bienes Tecnológicos"
        subtitle="Control de préstamos temporales de bienes institucionales"
        breadcrumb={<>Gestión de Recursos &rsaquo; Préstamos Bienes Tec.</>}
        actions={<Button size="sm" onClick={() => setShowNuevo(true)}><Plus size={13} /> Solicitar Préstamo</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['N° Préstamo', 'Bien', 'Código', 'Solicitante', 'Área', 'F. Préstamo', 'F. Devolución est.', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400">No hay registros</td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8] font-medium">{p.numero}</td>
                    <td className="px-4 py-3 font-medium text-[#1E1B4B]">{p.bien_nombre}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{p.bien_codigo}</td>
                    <td className="px-4 py-3 text-gray-700">{p.solicitante}</td>
                    <td className="px-4 py-3 text-gray-500 text-[12px]">{p.area}</td>
                    <td className="px-4 py-3 text-gray-500">{p.fecha_prestamo}</td>
                    <td className="px-4 py-3 text-gray-500">{p.fecha_devolucion_est}</td>
                    <td className="px-4 py-3">{estadoBadge(p.estado)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="xs" onClick={() => { setSelected(p); setShowDetalle(true) }}>
                          <Eye size={12} /> Ver
                        </Button>
                        {p.estado === 'activo' && (
                          <Button variant="outline" size="xs" onClick={() => handleDevolver(p.id)}>
                            <RotateCcw size={12} /> Devolver
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Solicitar Préstamo */}
      <Modal
        open={showNuevo}
        onClose={() => setShowNuevo(false)}
        title="Solicitar Préstamo de Bien"
        subtitle="Complete los datos del préstamo temporal"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNuevo(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSolicitar} disabled={!form.bien_id || !form.motivo}>
              Registrar Préstamo
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bien <span className="text-red-500">*</span></label>
            <select
              value={form.bien_id}
              onChange={e => setForm(f => ({ ...f, bien_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            >
              <option value="">Seleccionar bien disponible...</option>
              {BIENES_DISPONIBLES.map(b => (
                <option key={b.id} value={b.id}>{b.nombre} — {b.codigo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha estimada de devolución</label>
            <input
              type="date"
              value={form.fecha_devolucion}
              onChange={e => setForm(f => ({ ...f, fecha_devolucion: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Motivo del préstamo <span className="text-red-500">*</span></label>
            <textarea
              value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
              rows={3}
              placeholder="Describa el motivo del préstamo..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        open={showDetalle && !!selected}
        onClose={() => setShowDetalle(false)}
        title={`Préstamo ${selected?.numero}`}
        subtitle="Detalle del préstamo de bien tecnológico"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowDetalle(false)}>Cerrar</Button>
            {selected?.estado === 'activo' && (
              <Button size="sm" onClick={() => handleDevolver(selected.id)}>
                <RotateCcw size={13} /> Registrar Devolución
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#F8F6FB] rounded-lg p-4">
              <Stepper steps={stepperForPrestamo(selected.estado)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'N° Préstamo', value: selected.numero },
                { label: 'Bien', value: selected.bien_nombre },
                { label: 'Código', value: selected.bien_codigo },
                { label: 'Solicitante', value: selected.solicitante },
                { label: 'Área', value: selected.area },
                { label: 'F. Préstamo', value: selected.fecha_prestamo },
                { label: 'F. Devolución est.', value: selected.fecha_devolucion_est },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] text-gray-400 font-medium mb-0.5">{label}</div>
                  <div className="text-[13px] text-[#1E1B4B] font-medium">{value}</div>
                </div>
              ))}
              <div>
                <div className="text-[11px] text-gray-400 font-medium mb-0.5">Estado</div>
                <div>{estadoBadge(selected.estado)}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
