import { useState, useEffect } from 'react'
import { Eye, CheckCircle, Plus, Search } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { Stepper } from '../components/ui/Stepper'
import { solicitudesAsignacionService } from '../services/db'
import type { SolicitudAsignacion, EstadoSolicitud, TipoBien } from '../types'

const MOCK_DATA: SolicitudAsignacion[] = [
  { id: '1', numero: 'SOL-2026-001', bien_nombre: 'Laptop', tipo: 'computo', fecha_solicitud: '10/03/2026', estado: 'en_revision', created_at: '' },
  { id: '2', numero: 'SOL-2026-002', bien_nombre: 'Silla ergonómica', tipo: 'mobiliario', fecha_solicitud: '08/03/2026', estado: 'aprobado', created_at: '' },
  { id: '3', numero: 'SOL-2026-003', bien_nombre: 'Teléfono IP', tipo: 'comunicaciones', fecha_solicitud: '05/03/2026', estado: 'observado', created_at: '' },
  { id: '4', numero: 'SOL-2026-004', bien_nombre: 'Monitor 24"', tipo: 'computo', fecha_solicitud: '01/03/2026', estado: 'entregado_pendiente', created_at: '' },
]

const BIENES_POR_TIPO: Record<string, string[]> = {
  computo: ['Laptop HP ProBook', 'Laptop Dell Latitude', 'Monitor 24"', 'Monitor 27"', 'Teclado + Mouse', 'Impresora HP'],
  mobiliario: ['Silla ergonómica', 'Escritorio ejecutivo', 'Archivador metálico', 'Mesa de reuniones'],
  comunicaciones: ['Teléfono IP', 'Auricular headset', 'Switch de red'],
  vehiculo: ['Camioneta Hilux', 'Sedán Corolla'],
  otro: ['Proyector EPSON', 'Ecran portátil', 'Extensión eléctrica'],
}

const BIENES_DISPONIBLES = [
  { codigo: 'TI-MON-004', nombre: 'Monitor 27" Dell', tipo: 'Cómputo', estado: 'disponible' },
  { codigo: 'LOG-SIL-001', nombre: 'Silla ergonómica', tipo: 'Mobiliario', estado: 'disponible' },
  { codigo: 'TI-TEL-001', nombre: 'Teléfono IP Fanvil', tipo: 'Comunicaciones', estado: 'disponible' },
]

function estadoBadge(estado: EstadoSolicitud) {
  const map: Record<EstadoSolicitud, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'; label: string }> = {
    en_revision: { variant: 'blue', label: 'En revisión' },
    aprobado: { variant: 'green', label: 'Aprobado' },
    observado: { variant: 'yellow', label: 'Observado' },
    rechazado: { variant: 'red', label: 'Rechazado' },
    entregado_pendiente: { variant: 'purple', label: 'Entregado — pendiente conformidad' },
    completado: { variant: 'gray', label: 'Completado' },
  }
  const cfg = map[estado] ?? { variant: 'gray' as const, label: estado }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

function stepperForEstado(estado: EstadoSolicitud) {
  const steps = ['Solicitud', 'Revisión', 'Aprobación', 'Entrega']
  const idx = { en_revision: 1, observado: 1, aprobado: 2, rechazado: 2, entregado_pendiente: 3, completado: 4 }[estado] ?? 0
  return steps.map((label, i) => ({
    label,
    status: i < idx ? 'done' : i === idx ? 'current' : 'pending',
  })) as { label: string; status: 'done' | 'current' | 'pending' }[]
}

const labelTipo: Record<TipoBien, string> = {
  computo: 'Cómputo', mobiliario: 'Mobiliario', comunicaciones: 'Comunicaciones', vehiculo: 'Vehículo', otro: 'Otro',
}

export function AsignacionBienes() {
  const [data, setData] = useState<SolicitudAsignacion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mis_solicitudes')
  const [showNueva, setShowNueva] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [showConformidad, setShowConformidad] = useState(false)
  const [showDisponibilidad, setShowDisponibilidad] = useState(false)
  const [selected, setSelected] = useState<SolicitudAsignacion | null>(null)
  const { toast, toastState, hideToast } = useToast()

  // Form state
  const [form, setForm] = useState({ tipo: '' as TipoBien | '', bien: '', justificacion: '', prioridad: 'normal' })

  useEffect(() => {
    solicitudesAsignacionService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as SolicitudAsignacion[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    const nueva: SolicitudAsignacion = {
      id: String(Date.now()),
      numero: `SOL-2026-${String(data.length + 1).padStart(3, '0')}`,
      bien_nombre: form.bien || 'Bien sin especificar',
      tipo: (form.tipo || 'otro') as TipoBien,
      fecha_solicitud: new Date().toLocaleDateString('es-PE'),
      estado: 'en_revision',
      created_at: new Date().toISOString(),
    }
    try {
      await solicitudesAsignacionService.create({ ...nueva, justificacion: form.justificacion, prioridad: form.prioridad })
    } catch {
      // ignore, use local
    }
    setData(prev => [nueva, ...prev])
    setShowNueva(false)
    setForm({ tipo: '', bien: '', justificacion: '', prioridad: 'normal' })
    toast('Solicitud registrada correctamente')
  }

  const handleConformidad = () => {
    if (selected) {
      setData(prev => prev.map(x => x.id === selected.id ? { ...x, estado: 'completado' } : x))
    }
    setShowConformidad(false)
    setShowDetalle(false)
    toast('Conformidad registrada. Solicitud completada.')
  }

  const tabs = [
    { id: 'mis_solicitudes', label: 'Mis Solicitudes' },
    { id: 'pendientes', label: 'Pendientes de Aprobación' },
    { id: 'historial', label: 'Historial' },
  ]

  const filtered = data.filter(s => {
    if (activeTab === 'mis_solicitudes') return ['en_revision', 'observado', 'aprobado', 'entregado_pendiente'].includes(s.estado)
    if (activeTab === 'pendientes') return s.estado === 'aprobado'
    return s.estado === 'completado' || s.estado === 'rechazado'
  })

  const todayStr = new Date().toLocaleDateString('es-PE')

  return (
    <div>
      <PageHeader
        title="Asignación de Bienes"
        subtitle="Gestión de solicitudes de asignación de bienes institucionales"
        breadcrumb={<>Gestión de Recursos &rsaquo; Asignación de Bienes</>}
        actions={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowDisponibilidad(true)}><Search size={13} /> Consultar disponibilidad</Button>
            <Button size="sm" onClick={() => setShowNueva(true)}><Plus size={13} /> Nueva Solicitud</Button>
          </>
        }
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">N° Solicitud</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">Bien solicitado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">Fecha solicitud</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay registros</td></tr>
                )}
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8] font-medium">{s.numero}</td>
                    <td className="px-4 py-3 font-medium text-[#1E1B4B]">{s.bien_nombre}</td>
                    <td className="px-4 py-3">
                      <Badge variant="gray">{labelTipo[s.tipo]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.fecha_solicitud}</td>
                    <td className="px-4 py-3">{estadoBadge(s.estado)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="xs" onClick={() => { setSelected(s); setShowDetalle(true) }}>
                          <Eye size={12} /> Ver
                        </Button>
                        {s.estado === 'entregado_pendiente' && (
                          <Button variant="outline" size="xs" onClick={() => { setSelected(s); setShowConformidad(true) }}>
                            <CheckCircle size={12} /> Conformidad
                          </Button>
                        )}
                        {s.estado === 'observado' && (
                          <Button variant="outline" size="xs" onClick={() => toast('Acción de subsanación registrada.')}>
                            Subsanar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Footer banner */}
            <div className="px-4 py-3 border-t border-gray-100 bg-[#F8F6FB] text-[11px] text-gray-500">
              📋 Para solicitudes de bienes de cómputo, TI verificará disponibilidad. Para comunicaciones, el área de Comunicaciones gestionará el equipamiento.
            </div>
          </div>
        </>
      )}

      {/* Modal Nueva Solicitud */}
      <Modal
        open={showNueva}
        onClose={() => setShowNueva(false)}
        title="Nueva Solicitud de Asignación"
        subtitle="Complete los datos del bien que necesita"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNueva(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.tipo || !form.bien || !form.justificacion}>
              Enviar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo de bien <span className="text-red-500">*</span></label>
            <select
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoBien, bien: '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="computo">Cómputo</option>
              <option value="mobiliario">Mobiliario</option>
              <option value="comunicaciones">Comunicaciones</option>
              <option value="vehiculo">Vehículo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          {form.tipo && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bien <span className="text-red-500">*</span></label>
              <select
                value={form.bien}
                onChange={e => setForm(f => ({ ...f, bien: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              >
                <option value="">Seleccionar bien...</option>
                {(BIENES_POR_TIPO[form.tipo] ?? []).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Justificación <span className="text-red-500">*</span></label>
            <textarea
              value={form.justificacion}
              onChange={e => setForm(f => ({ ...f, justificacion: e.target.value }))}
              rows={3}
              placeholder="Explique por qué necesita este bien..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-2">Prioridad</label>
            <div className="flex gap-4">
              {['normal', 'urgente', 'critica'].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="prioridad" value={p} checked={form.prioridad === p} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))} className="accent-[#6B21A8]" />
                  <span className="text-[13px] capitalize">{p === 'critica' ? 'Crítica' : p.charAt(0).toUpperCase() + p.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        open={showDetalle && !!selected}
        onClose={() => setShowDetalle(false)}
        title={`Solicitud ${selected?.numero}`}
        subtitle="Detalle de la solicitud de asignación"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowDetalle(false)}>Cerrar</Button>
            {selected?.estado === 'entregado_pendiente' && (
              <Button size="sm" onClick={() => { setShowDetalle(false); setShowConformidad(true) }}>
                <CheckCircle size={13} /> Registrar Conformidad
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#F8F6FB] rounded-lg p-4">
              <Stepper steps={stepperForEstado(selected.estado)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'N° Solicitud', value: selected.numero },
                { label: 'Bien', value: selected.bien_nombre },
                { label: 'Tipo', value: labelTipo[selected.tipo] },
                { label: 'Fecha', value: selected.fecha_solicitud },
                { label: 'Estado', value: estadoBadge(selected.estado) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] text-gray-400 font-medium mb-0.5">{label}</div>
                  <div className="text-[13px] text-[#1E1B4B] font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Conformidad */}
      <Modal
        open={showConformidad && !!selected}
        onClose={() => setShowConformidad(false)}
        title="Registrar Conformidad"
        subtitle="Confirme la recepción del bien asignado"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowConformidad(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleConformidad}>
              <CheckCircle size={13} /> Confirmar Conformidad
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            {/* Summary block */}
            <div className="border-l-4 border-[#6B21A8] bg-[#F5F3FF] rounded-r-lg px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Bien</span>
                <span className="text-[#1E1B4B] font-semibold">{selected.bien_nombre}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Código QR</span>
                <span className="text-[#1E1B4B] font-mono">CMP-{selected.id.padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between text-[12px] items-center">
                <span className="text-gray-500 font-medium">Estado</span>
                <Badge variant="green">Bueno</Badge>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Área</span>
                <span className="text-[#1E1B4B]">UN. DE TI</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Fecha entrega</span>
                <span className="text-[#1E1B4B]">{todayStr}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500 font-medium">Entregado por</span>
                <span className="text-[#1E1B4B]">Administración</span>
              </div>
            </div>

            {/* Acta text */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-[12px] text-gray-600 italic leading-relaxed border border-gray-200">
              "Yo, Aaron Samuel Nuñez Muñoz, identificado con DNI 77434028, declaro haber recibido el bien descrito en conformidad, en las condiciones indicadas, comprometiéndome a su uso responsable y devolución en caso corresponda."
            </div>

            {/* Two-col row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nombre completo</label>
                <input
                  type="text"
                  readOnly
                  value="Aaron Samuel Nuñez Muñoz"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">DNI</label>
                <input
                  type="text"
                  readOnly
                  value="77434028"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Two-col row 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Cargo</label>
                <input
                  type="text"
                  readOnly
                  value="Analista de Sistemas"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fecha de firma</label>
                <input
                  type="text"
                  readOnly
                  value={todayStr}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Footer note */}
            <div className="text-[11px] text-gray-400 text-center">
              Esta acción registra tu conformidad. Podrás descargar el PDF desde Historial.
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Consultar Disponibilidad */}
      <Modal
        open={showDisponibilidad}
        onClose={() => setShowDisponibilidad(false)}
        title="Consultar Disponibilidad"
        subtitle="Bienes disponibles para asignación"
        footer={
          <Button variant="gray" size="sm" onClick={() => setShowDisponibilidad(false)}>Cerrar</Button>
        }
      >
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Código</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Nombre</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Tipo</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {BIENES_DISPONIBLES.map(b => (
                <tr key={b.codigo} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#6B21A8]">{b.codigo}</td>
                  <td className="px-4 py-2.5 font-medium text-[#1E1B4B]">{b.nombre}</td>
                  <td className="px-4 py-2.5 text-gray-500">{b.tipo}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="green">Disponible</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
