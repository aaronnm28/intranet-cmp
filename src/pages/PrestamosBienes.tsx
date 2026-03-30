import { useState, useEffect } from 'react'
import { Eye, Plus } from 'lucide-react'
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

const BIENES_DISPONIBLES_PRESTAMO = [
  { id: '1', nombre: 'Laptop HP Pavilion', codigo: 'CMP-038412', disponibles: 1 },
  { id: '2', nombre: 'Proyector Epson EB-X41', codigo: 'CMP-038398', disponibles: 2 },
  { id: '3', nombre: 'Tablet Samsung Tab S7', codigo: 'CMP-038399', disponibles: 1 },
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

function diffDays(a: string, b: string): number {
  const da = new Date(a)
  const db = new Date(b)
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 0
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

export function PrestamosBienes() {
  const [data, setData] = useState<PrestamoBien[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activos')
  const [showNuevo, setShowNuevo] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [showDevolucion, setShowDevolucion] = useState(false)
  const [selected, setSelected] = useState<PrestamoBien | null>(null)
  const [selectedForDev, setSelectedForDev] = useState<PrestamoBien | null>(null)
  const { toast, toastState, hideToast } = useToast()

  // Solicitar préstamo form
  const [form, setForm] = useState({
    bien_id: '',
    codigo: '',
    fecha_prestamo: '',
    fecha_devolucion: '',
    direccion: '',
    motivo: '',
  })

  // Devolucion form
  const [devForm, setDevForm] = useState({ estado: '', observaciones: '' })

  // Firma states
  const [firmaStates, setFirmaStates] = useState<Record<number, string>>({ 0: '', 1: '', 2: '' })
  const [firmaModo, setFirmaModo] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false })

  const exceedsDays = form.fecha_prestamo && form.fecha_devolucion
    ? diffDays(form.fecha_prestamo, form.fecha_devolucion) > 15
    : false

  useEffect(() => {
    prestamosBienesService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as PrestamoBien[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleBienSelect = (id: string) => {
    const bien = BIENES_DISPONIBLES_PRESTAMO.find(b => b.id === id)
    setForm(f => ({ ...f, bien_id: id, codigo: bien?.codigo ?? '' }))
  }

  const handleSolicitar = async () => {
    const bien = BIENES_DISPONIBLES_PRESTAMO.find(b => b.id === form.bien_id)
    const nuevo: PrestamoBien = {
      id: String(Date.now()),
      numero: `PREST-2026-${String(data.length + 1).padStart(3, '0')}`,
      bien_nombre: bien?.nombre ?? 'Bien',
      bien_codigo: bien?.codigo ?? 'N/A',
      tipo: 'computo',
      solicitante: 'Aaron Nuñez M.',
      area: 'UN. DE TI',
      fecha_prestamo: form.fecha_prestamo || new Date().toLocaleDateString('es-PE'),
      fecha_devolucion_est: form.fecha_devolucion || '—',
      estado: 'activo',
      created_at: new Date().toISOString(),
    }
    try { await prestamosBienesService.create({ ...nuevo, motivo: form.motivo }) } catch { /* ignore */ }
    setData(prev => [nuevo, ...prev])
    setShowNuevo(false)
    setForm({ bien_id: '', codigo: '', fecha_prestamo: '', fecha_devolucion: '', direccion: '', motivo: '' })
    setFirmaStates({ 0: '', 1: '', 2: '' })
    setFirmaModo({ 0: false, 1: false, 2: false })
    toast('Solicitud de préstamo enviada correctamente.')
  }

  const handleConfirmarDevolucion = async () => {
    if (!selectedForDev) return
    try { await prestamosBienesService.devolver(selectedForDev.id) } catch { /* ignore */ }
    setData(prev => prev.map(p => p.id === selectedForDev.id ? { ...p, estado: 'devuelto' } : p))
    setShowDevolucion(false)
    setSelectedForDev(null)
    setDevForm({ estado: '', observaciones: '' })
    toast('Devolución confirmada correctamente.')
  }

  const tabs = [
    { id: 'activos', label: 'Activos' },
    { id: 'devueltos', label: 'Devueltos' },
    { id: 'vencidos', label: 'Vencidos' },
  ]

  const filtered = data.filter(p => {
    if (activeTab === 'activos') return p.estado === 'activo'
    if (activeTab === 'devueltos') return p.estado === 'devuelto'
    if (activeTab === 'vencidos') return p.estado === 'vencido'
    return true
  })

  const firmaLabels = [
    { title: 'Firma del Solicitante', label: 'Aaron Samuel Nuñez Muñoz' },
    { title: 'V°B° Jefe UN. DE TI', label: 'Roberto Limas' },
    { title: 'V°B° Administración', label: 'Lizzetti Díaz E.' },
  ]

  const miniStepperSteps = ['Tu solicitud', 'V°B° Jefe TI', 'Entrega Administ.', 'Recepción', 'Devolución']

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
                          <Button variant="outline" size="xs" onClick={() => { setSelectedForDev(p); setShowDevolucion(true) }}>
                            Registrar devolución
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

      {/* Modal Solicitar Préstamo de Bien Tecnológico */}
      <Modal
        open={showNuevo}
        onClose={() => setShowNuevo(false)}
        title="Solicitar Préstamo de Bien Tecnológico"
        subtitle="Complete los datos del préstamo temporal"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNuevo(false)}>Cancelar</Button>
            <Button variant="outline" size="sm" onClick={() => toast('Borrador guardado.')}>💾 Guardar borrador</Button>
            <Button size="sm" onClick={handleSolicitar} disabled={!form.bien_id || !form.fecha_prestamo || !form.direccion}>
              📤 Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* DATOS DEL BIEN */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Datos del Bien</div>
            <div className="flex gap-3">
              <div style={{ flex: 2 }}>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bien solicitado <span className="text-red-500">*</span></label>
                <select
                  value={form.bien_id}
                  onChange={e => handleBienSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                >
                  <option value="">Seleccionar bien disponible...</option>
                  {BIENES_DISPONIBLES_PRESTAMO.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.nombre} ({b.disponibles} disponible{b.disponibles !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Código inventariado</label>
                <input
                  type="text"
                  readOnly
                  value={form.codigo}
                  placeholder="Auto"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* PERÍODO DE PRÉSTAMO */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Período de Préstamo (máx. 15 días)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha de préstamo <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.fecha_prestamo}
                  onChange={e => setForm(f => ({ ...f, fecha_prestamo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
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
            </div>
            {exceedsDays && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[12px] text-amber-700">
                ⚠ El período supera los 15 días máximos permitidos para préstamos de bienes tecnológicos.
              </div>
            )}
          </div>

          {/* DATOS DEL DESTINO */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Datos del Destino</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Dirección donde se llevará el bien <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                  placeholder="Ingrese la dirección de destino..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Motivo del préstamo</label>
                <textarea
                  value={form.motivo}
                  onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                  rows={2}
                  placeholder="Describa el motivo del préstamo..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Jefe de área aprobador</label>
                <input
                  type="text"
                  readOnly
                  value="Roberto Limas — Jefe TI (pre-asignado)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Flujo de aprobación */}
          <div className="rounded-lg border p-3" style={{ backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }}>
            <div className="text-[11px] font-bold text-[#6B21A8] mb-2">Flujo de aprobación:</div>
            <div className="flex items-center gap-1 flex-wrap">
              {miniStepperSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex items-center justify-center rounded-full border-2 border-gray-300 bg-white text-[10px] font-bold text-gray-400"
                      style={{ width: 22, height: 22 }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap">{step}</span>
                  </div>
                  {i < miniStepperSteps.length - 1 && (
                    <div className="w-4 h-0.5 bg-gray-300 mb-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FIRMAS DE SOLICITUD */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Firmas de Solicitud</div>
            <div className="grid grid-cols-3 gap-3">
              {firmaLabels.map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-[11px] font-semibold text-gray-600 mb-1.5 text-center">{f.title}</div>
                  <div
                    className="w-full rounded-lg border-2 border-dashed border-[#6B21A8] flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: '#FAF8FF', minHeight: 52 }}
                    onClick={() => setFirmaModo(prev => ({ ...prev, [i]: true }))}
                  >
                    {firmaModo[i] ? (
                      <input
                        type="text"
                        value={firmaStates[i]}
                        onChange={e => setFirmaStates(prev => ({ ...prev, [i]: e.target.value }))}
                        placeholder="Firma..."
                        className="w-full px-2 py-1 text-center bg-transparent outline-none border-none"
                        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#1E1B4B' }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-[11px] text-gray-400">
                        {firmaStates[i] ? (
                          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{firmaStates[i]}</span>
                        ) : 'Firmar aquí'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 text-center">{f.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-[#F8F6FB] rounded-lg px-3 py-2 text-[11px] text-gray-500">
              Las firmas de Recepción y Devolución del bien se registrarán en el Acta de Entrega correspondiente.
            </div>
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
              <Button size="sm" onClick={() => { setSelectedForDev(selected); setShowDetalle(false); setShowDevolucion(true) }}>
                Registrar Devolución
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

      {/* Modal Registrar Devolución */}
      <Modal
        open={showDevolucion && !!selectedForDev}
        onClose={() => { setShowDevolucion(false); setSelectedForDev(null); setDevForm({ estado: '', observaciones: '' }) }}
        title={`Registrar Devolución — ${selectedForDev?.numero ?? ''}`}
        subtitle="Confirme el estado del bien devuelto"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => { setShowDevolucion(false); setSelectedForDev(null); setDevForm({ estado: '', observaciones: '' }) }}>Cancelar</Button>
            <Button size="sm" onClick={handleConfirmarDevolucion} disabled={!devForm.estado}>
              ✔ Confirmar Devolución
            </Button>
          </>
        }
      >
        {selectedForDev && (
          <div className="space-y-4">
            {/* Summary block */}
            <div className="border-l-4 border-[#6B21A8] bg-[#F5F3FF] rounded-r-lg px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Bien</span>
                <span className="text-[#1E1B4B] font-semibold">{selectedForDev.bien_nombre}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Prestado el</span>
                <span className="text-[#1E1B4B]">{selectedForDev.fecha_prestamo}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Devolución pactada</span>
                <span className="text-[#1E1B4B]">{selectedForDev.fecha_devolucion_est}</span>
              </div>
              <div className="flex justify-between text-[12px] items-center">
                <span className="text-gray-500 font-medium">Estado al préstamo</span>
                <Badge variant="green">Bueno</Badge>
              </div>
            </div>

            {/* Estado de devolución */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Estado de devolución <span className="text-red-500">*</span></label>
              <select
                value={devForm.estado}
                onChange={e => setDevForm(f => ({ ...f, estado: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              >
                <option value="">Seleccionar estado...</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="con_danos">Con daños</option>
                <option value="extraviado">Extraviado</option>
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Observaciones <span className="text-[11px] text-gray-400 font-normal">(opcional)</span></label>
              <textarea
                value={devForm.observaciones}
                onChange={e => setDevForm(f => ({ ...f, observaciones: e.target.value }))}
                rows={3}
                placeholder="Describa el estado del bien al momento de la devolución..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
