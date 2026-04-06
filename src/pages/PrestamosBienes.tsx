import { useState, useEffect } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { Stepper } from '../components/ui/Stepper'
import { prestamosBienesService } from '../services/db'

interface PrestamoBienRow {
  id: string
  numero: string
  bien: string
  fecha_solicitud: string
  fecha_devolucion: string
  estado: string
}

const MOCK_DATA: PrestamoBienRow[] = [
  { id: '1', numero: 'PREST-2026-001', bien: 'Laptop HP Pavilion', fecha_solicitud: '05/03/2026', fecha_devolucion: '12/03/2026', estado: 'devuelto_conforme' },
  { id: '2', numero: 'PREST-2026-002', bien: 'Proyector Epson', fecha_solicitud: '18/03/2026', fecha_devolucion: '25/03/2026', estado: 'en_prestamo' },
  { id: '3', numero: 'PREST-2026-003', bien: 'Tablet Samsung', fecha_solicitud: '22/03/2026', fecha_devolucion: '29/03/2026', estado: 'pendiente_aprobacion' },
]

const BIENES_DISPONIBLES_PRESTAMO = [
  { id: '1', nombre: 'Laptop HP Pavilion', codigo: 'CMP-038412', disponibles: 1 },
  { id: '2', nombre: 'Proyector Epson EB-X41', codigo: 'CMP-038398', disponibles: 2 },
  { id: '3', nombre: 'Tablet Samsung Tab S7', codigo: 'CMP-038399', disponibles: 1 },
]

function estadoBadge(estado: string) {
  if (estado === 'devuelto_conforme') return <Badge variant="green">Devuelto — conforme</Badge>
  if (estado === 'en_prestamo') return <Badge variant="blue">En préstamo</Badge>
  if (estado === 'pendiente_aprobacion') return <Badge variant="yellow">Pendiente aprobación</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

function diffDays(a: string, b: string): number {
  const da = new Date(a)
  const db = new Date(b)
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 0
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

function stepperForPrestamo(estado: string) {
  if (estado === 'devuelto_conforme') {
    return [
      { label: 'Solicitud', status: 'done' as const },
      { label: 'Aprobación', status: 'done' as const },
      { label: 'En préstamo', status: 'done' as const },
      { label: 'Devuelto', status: 'done' as const },
    ]
  }
  if (estado === 'en_prestamo') {
    return [
      { label: 'Solicitud', status: 'done' as const },
      { label: 'Aprobación', status: 'done' as const },
      { label: 'En préstamo', status: 'current' as const },
      { label: 'Devuelto', status: 'pending' as const },
    ]
  }
  return [
    { label: 'Solicitud', status: 'done' as const },
    { label: 'Aprobación', status: 'current' as const },
    { label: 'En préstamo', status: 'pending' as const },
    { label: 'Devuelto', status: 'pending' as const },
  ]
}

const miniStepperSteps = ['Tu solicitud', 'V°B° Jefe TI', 'Entrega Administ.', 'Recepción', 'Devolución']

export function PrestamosBienes() {
  const [data, setData] = useState<PrestamoBienRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mis_prestamos')
  const [showNuevo, setShowNuevo] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [showDevolucion, setShowDevolucion] = useState(false)
  const [selected, setSelected] = useState<PrestamoBienRow | null>(null)
  const [selectedForDev, setSelectedForDev] = useState<PrestamoBienRow | null>(null)
  const { toast, toastState, hideToast } = useToast()

  const [form, setForm] = useState({
    bien_id: '',
    codigo: '',
    fecha_prestamo: '',
    fecha_devolucion: '',
    direccion: '',
    motivo: '',
  })

  const [devForm, setDevForm] = useState({ estado: '', observaciones: '' })

  const [firmaStates, setFirmaStates] = useState<Record<number, string>>({ 0: '', 1: '', 2: '' })
  const [firmaModo, setFirmaModo] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false })

  const exceedsDays = form.fecha_prestamo && form.fecha_devolucion
    ? diffDays(form.fecha_prestamo, form.fecha_devolucion) > 15
    : false

  useEffect(() => {
    prestamosBienesService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as PrestamoBienRow[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleBienSelect = (id: string) => {
    const bien = BIENES_DISPONIBLES_PRESTAMO.find(b => b.id === id)
    setForm(f => ({ ...f, bien_id: id, codigo: bien?.codigo ?? '' }))
  }

  const handleSolicitar = async () => {
    const bien = BIENES_DISPONIBLES_PRESTAMO.find(b => b.id === form.bien_id)
    const nuevo: PrestamoBienRow = {
      id: String(Date.now()),
      numero: `PREST-2026-${String(data.length + 1).padStart(3, '0')}`,
      bien: bien?.nombre ?? 'Bien',
      fecha_solicitud: new Date().toLocaleDateString('es-PE'),
      fecha_devolucion: form.fecha_devolucion || '—',
      estado: 'pendiente_aprobacion',
    }
    try { await (prestamosBienesService as Record<string, unknown> & { create?: (x: unknown) => Promise<unknown> }).create?.({ ...nuevo, motivo: form.motivo }) } catch { /* ignore */ }
    setData(prev => [nuevo, ...prev])
    setShowNuevo(false)
    setForm({ bien_id: '', codigo: '', fecha_prestamo: '', fecha_devolucion: '', direccion: '', motivo: '' })
    setFirmaStates({ 0: '', 1: '', 2: '' })
    setFirmaModo({ 0: false, 1: false, 2: false })
    toast('Solicitud enviada correctamente.')
  }

  const handleConfirmarDevolucion = async () => {
    if (!selectedForDev) return
    try { await (prestamosBienesService as Record<string, unknown> & { devolver?: (id: string) => Promise<unknown> }).devolver?.(selectedForDev.id) } catch { /* ignore */ }
    setData(prev => prev.map(p => p.id === selectedForDev.id ? { ...p, estado: 'devuelto_conforme' } : p))
    setShowDevolucion(false)
    setSelectedForDev(null)
    setDevForm({ estado: '', observaciones: '' })
    toast('Devolución registrada correctamente.')
  }

  const tabs = [
    { id: 'mis_prestamos', label: 'Mis Préstamos' },
    { id: 'prestamos_area', label: 'Préstamos del Área' },
  ]

  const firmaLabels = [
    { title: 'Firma del Solicitante', label: 'Aaron Samuel Nuñez Muñoz' },
    { title: 'V°B° Jefe UN. DE TI', label: 'Roberto Limas' },
    { title: 'V°B° Administración', label: 'Lizzetti Díaz E.' },
  ]

  return (
    <div>
      <PageHeader
        title="Préstamos de Bienes Tecnológicos"
        subtitle="Solicita préstamos temporales de equipos disponibles"
        breadcrumb={<>Gestión de Recursos &rsaquo; Préstamos Bienes Tec.</>}
        actions={<Button size="sm" onClick={() => setShowNuevo(true)}>+ Solicitar Préstamo</Button>}
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
                  {['N° Préstamo', 'Bien', 'Fecha solicitud', 'Fecha devolución', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay registros</td></tr>
                )}
                {data.map((p, idx) => (
                  <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8] font-medium">{p.numero}</td>
                    <td className="px-4 py-3 font-medium text-[#1E1B4B]">{p.bien}</td>
                    <td className="px-4 py-3 text-gray-500">{p.fecha_solicitud}</td>
                    <td className="px-4 py-3 text-gray-500">{p.fecha_devolucion}</td>
                    <td className="px-4 py-3">{estadoBadge(p.estado)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="xs" onClick={() => { setSelected(p); setShowDetalle(true) }}>
                          Ver detalle
                        </Button>
                        {p.estado === 'en_prestamo' && (
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

          <p className="mt-3 text-[11px] text-gray-400 italic">
            📌 Nota de diseño: Rol activo determina tabs visibles — usuario ve sus solicitudes, GDTH/Admin ven bandeja completa.
          </p>
        </>
      )}

      {/* Modal Solicitar Préstamo de Bien Tecnológico */}
      <Modal
        open={showNuevo}
        onClose={() => setShowNuevo(false)}
        title="Solicitar Préstamo de Bien Tecnológico"
        maxWidth="max-w-[580px]"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNuevo(false)}>Cancelar</Button>
            <Button variant="outline" size="sm" onClick={() => toast('Borrador guardado.')}>💾 Guardar borrador</Button>
            <Button size="sm" onClick={handleSolicitar}>
              📤 Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* DATOS DEL BIEN */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">DATOS DEL BIEN</div>
            <div className="flex gap-3">
              <div style={{ flex: 2 }}>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bien solicitado</label>
                <select
                  value={form.bien_id}
                  onChange={e => handleBienSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                >
                  <option value="">Seleccionar bien disponible...</option>
                  <option value="1">Laptop HP Pavilion (1 disponible)</option>
                  <option value="2">Proyector Epson EB-X41 (2 disponibles)</option>
                  <option value="3">Tablet Samsung Tab S7 (1 disponible)</option>
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

          {/* PERÍODO */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">PERÍODO DE PRÉSTAMO (máx. 15 días)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha préstamo</label>
                <input
                  type="date"
                  value={form.fecha_prestamo}
                  onChange={e => setForm(f => ({ ...f, fecha_prestamo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha devolución</label>
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

          {/* DESTINO */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">DATOS DEL DESTINO</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                  placeholder="Ingrese la dirección de destino..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Motivo</label>
                <textarea
                  value={form.motivo}
                  onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                  rows={2}
                  placeholder="Describa el motivo del préstamo..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Jefe aprobador</label>
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
                      className="flex items-center justify-center rounded-full border border-[#6B21A8] bg-white text-[10px] font-bold text-[#6B21A8]"
                      style={{ width: 22, height: 22 }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-0.5 whitespace-nowrap">{step}</span>
                  </div>
                  {i < miniStepperSteps.length - 1 && (
                    <div className="w-4 h-px bg-[#6B21A8] mb-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FIRMAS */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">FIRMAS DE SOLICITUD</div>
            <div className="grid grid-cols-3 gap-3">
              {firmaLabels.map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-[11px] font-semibold text-gray-600 mb-1.5 text-center">
                    {f.title} / {f.label}
                  </div>
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
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 italic mt-2">
              Las firmas de Recepción y Devolución del bien se registrarán en el Acta de Entrega correspondiente.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        open={showDetalle && !!selected}
        onClose={() => setShowDetalle(false)}
        title={`Préstamo ${selected?.numero ?? ''}`}
        maxWidth="max-w-[520px]"
        footer={
          <Button variant="gray" size="sm" onClick={() => setShowDetalle(false)}>Cerrar</Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {estadoBadge(selected.estado)}
              <span className="text-[12px] font-mono text-gray-500">{selected.numero}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'N° Préstamo', value: selected.numero },
                { label: 'Bien', value: selected.bien },
                { label: 'Fecha solicitud', value: selected.fecha_solicitud },
                { label: 'Fecha devolución estimada', value: selected.fecha_devolucion },
                { label: 'Estado', value: estadoBadge(selected.estado) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] text-gray-400 font-medium mb-0.5">{label}</div>
                  <div className="text-[13px] text-[#1E1B4B] font-medium">{value}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#F8F6FB] rounded-lg p-4">
              <Stepper steps={stepperForPrestamo(selected.estado)} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Registrar Devolución */}
      <Modal
        open={showDevolucion && !!selectedForDev}
        onClose={() => { setShowDevolucion(false); setSelectedForDev(null); setDevForm({ estado: '', observaciones: '' }) }}
        title={`Registrar Devolución — ${selectedForDev?.numero ?? ''}`}
        maxWidth="max-w-[460px]"
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
            <div className="border-l-4 border-[#6B21A8] bg-[#F5F3FF] px-4 py-3 rounded-r-lg mb-4">
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-gray-500 font-medium">Bien</span>
                <span className="text-[#1E1B4B] font-semibold">{selectedForDev.bien}</span>
              </div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-gray-500 font-medium">Prestado el</span>
                <span className="text-[#1E1B4B]">{selectedForDev.fecha_solicitud}</span>
              </div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-gray-500 font-medium">Devolución pactada</span>
                <span className="text-[#1E1B4B]">{selectedForDev.fecha_devolucion}</span>
              </div>
              <div className="flex justify-between text-[12px] items-center">
                <span className="text-gray-500 font-medium">Estado al préstamo</span>
                <Badge variant="green">Bueno</Badge>
              </div>
            </div>

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
