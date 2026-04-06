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

const COLABS: Record<string, { nombre: string; apellido: string; puesto: string; subarea: string; consejo: string; initials: string }> = {
  '77434028': { nombre: 'Aaron Samuel', apellido: 'Nuñez Muñoz', puesto: 'Analista de Sistemas', subarea: 'Tecnología de Información', consejo: 'Consejo Nacional', initials: 'AN' },
  '45231089': { nombre: 'Carlos', apellido: 'Pérez Ramos', puesto: 'Analista Contable', subarea: 'UN. DE GDTH', consejo: 'Consejo Nacional', initials: 'CP' },
  '32187654': { nombre: 'Ana María', apellido: 'Flores Vega', puesto: 'Asistente Administrativa', subarea: 'SEC. ADMINISTRACIÓN', consejo: 'Consejo Nacional', initials: 'FA' },
}

const BIENES_DISPONIBLES = [
  { codigo: 'TI-MON-004', nombre: 'Monitor 27" Dell P2722H', tipo: 'Cómputo' },
  { codigo: 'LOG-SIL-001', nombre: 'Silla ergonómica Actiu', tipo: 'Mobiliario' },
  { codigo: 'TI-TEL-001', nombre: 'Teléfono IP Fanvil X4U', tipo: 'Comunicaciones' },
  { codigo: 'LOG-PRY-003', nombre: 'Proyector EPSON EB-W51', tipo: 'Otro' },
]

const DISPONIBILIDAD_BIENES = [
  { id: '111025', qr: 'CMP-038395', icono: '💻', nombre: 'Laptop', marca: 'HP EliteBook 840', condicion: 'Nuevo', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'HP-00-2025-111025' },
  { id: '111026', qr: 'CMP-038396', icono: '🖥️', nombre: 'Monitor', marca: 'Samsung 27" S27A', condicion: 'En Uso', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'SAM-00-2024-111026' },
  { id: '111027', qr: 'CMP-038397', icono: '🖨️', nombre: 'Impresora', marca: 'Epson L3150', condicion: 'En Uso', disponibilidad: 'revision' as const, area: 'UN. DE TI', serie: 'EPS-00-2023-111027' },
  { id: '111028', qr: 'CMP-038398', icono: '📽️', nombre: 'Proyector', marca: 'Epson EB-X51', condicion: 'En Uso', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'EPS-00-2024-111028' },
  { id: '111029', qr: 'CMP-038399', icono: '📱', nombre: 'Tablet', marca: 'Samsung Tab S7', condicion: 'Nuevo', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'SAM-00-2025-111029' },
]

const DISPONIBILIDAD_ACCESORIOS = [
  { id: '20261114', nombre: 'Teclado Inalámbrico', marca: 'Logitech', subarea: 'UN. DE TI', estado: 'bueno' as const, disponibilidad: 'disponible' as const },
  { id: '20261115', nombre: 'Mouse Inalámbrico', marca: 'Logitech', subarea: 'UN. DE TI', estado: 'bueno' as const, disponibilidad: 'disponible' as const },
  { id: '20261116', nombre: 'Hub USB 4 puertos', marca: 'Anker', subarea: 'ADMINISTRACION', estado: 'bueno' as const, disponibilidad: 'disponible' as const },
  { id: '20261117', nombre: 'Webcam HD', marca: 'Logitech', subarea: 'COMUNICACIONES', estado: 'bueno' as const, disponibilidad: 'asignado' as const },
  { id: '20261118', nombre: 'Auriculares', marca: 'Sony', subarea: 'UN. DE GDTH', estado: 'regular' as const, disponibilidad: 'revision' as const },
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
  const idx = ({ en_revision: 1, observado: 1, aprobado: 2, rechazado: 2, entregado_pendiente: 3, completado: 4 } as Record<string, number>)[estado] ?? 0
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

  // Existing form state
  const [form, setForm] = useState({ tipo: '' as TipoBien | '', bien: '', justificacion: '', prioridad: 'normal' })

  // New state for modal
  const [modalTab, setModalTab] = useState<'bienes' | 'accesorios' | 'disponibles'>('bienes')
  const [dniSearch, setDniSearch] = useState('')
  const [colaboradorEncontrado, setColaboradorEncontrado] = useState<{ nombre: string; apellido: string; puesto: string; subarea: string; consejo: string; initials: string } | null>(null)
  const [dniNotFound, setDniNotFound] = useState(false)
  const [bienNombre, setBienNombre] = useState('')
  const [tipoBien, setTipoBien] = useState('computo')
  const [dispTab, setDispTab] = useState<'bienes' | 'accesorios'>('bienes')
  const [dispBienSeleccionado, setDispBienSeleccionado] = useState<typeof DISPONIBILIDAD_BIENES[0] | null>(null)

  useEffect(() => {
    solicitudesAsignacionService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as SolicitudAsignacion[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleBuscarColab = () => {
    const found = COLABS[dniSearch.trim()]
    if (found) {
      setColaboradorEncontrado(found)
      setDniNotFound(false)
    } else {
      setColaboradorEncontrado(null)
      setDniNotFound(true)
    }
  }

  const handleSave = async () => {
    const nueva: SolicitudAsignacion = {
      id: String(Date.now()),
      numero: `SOL-2026-${String(data.length + 1).padStart(3, '0')}`,
      bien_nombre: bienNombre || form.bien || 'Bien sin especificar',
      tipo: (tipoBien || form.tipo || 'otro') as TipoBien,
      fecha_solicitud: new Date().toLocaleDateString('es-PE'),
      estado: 'en_revision',
      created_at: new Date().toISOString(),
    }
    try {
      await solicitudesAsignacionService.create({ ...nueva, justificacion: form.justificacion })
    } catch {
      // ignore, use local
    }
    setData(prev => [nueva, ...prev])
    setShowNueva(false)
    setForm({ tipo: '', bien: '', justificacion: '', prioridad: 'normal' })
    setModalTab('bienes')
    setDniSearch('')
    setColaboradorEncontrado(null)
    setDniNotFound(false)
    setBienNombre('')
    setTipoBien('computo')
    toast('Solicitud enviada correctamente.')
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
            <div className="px-4 py-3 border-t border-gray-100 bg-[#F8F6FB] text-[11px] text-gray-500">
              📋 Para solicitudes de bienes de cómputo, TI verificará disponibilidad. Para comunicaciones, el área de Comunicaciones gestionará el equipamiento.
            </div>
          </div>
        </>
      )}

      {/* Modal Nueva Solicitud de Asignación de Bien */}
      <Modal
        open={showNueva}
        onClose={() => setShowNueva(false)}
        title="Nueva Solicitud de Asignación de Bien"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNueva(false)}>Cancelar</Button>
            <Button variant="outline" size="sm" onClick={() => toast('Borrador guardado.')}>💾 Guardar borrador</Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!colaboradorEncontrado || !bienNombre || !form.justificacion}
            >
              📤 Enviar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* BUSCAR COLABORADOR */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">BUSCAR COLABORADOR</div>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                value={dniSearch}
                onChange={e => setDniSearch(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={e => { if (e.key === 'Enter') handleBuscarColab() }}
                placeholder="Ingrese DNI..."
                style={{ flex: 1, maxWidth: 180 }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
              <Button size="sm" onClick={handleBuscarColab}>🔍 Buscar</Button>
              <Button variant="gray" size="sm" onClick={() => { setDniSearch(''); setColaboradorEncontrado(null); setDniNotFound(false) }}>Limpiar</Button>
            </div>
            <div className="text-[11px] text-gray-400 mt-1.5">
              DNIs de prueba: <strong>45231089</strong> · <strong>77434028</strong> · <strong>32187654</strong>
            </div>
            {dniNotFound && (
              <div className="mt-2 text-[12px] text-red-600 font-medium">DNI no encontrado</div>
            )}
            {colaboradorEncontrado && (
              <div className="border border-[#6B21A8] bg-[#F5F3FF] rounded-lg p-3 mt-2">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-[#6B21A8] text-white font-bold text-[13px] flex items-center justify-center flex-shrink-0">
                    {colaboradorEncontrado.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#1E1B4B]">{colaboradorEncontrado.nombre} {colaboradorEncontrado.apellido}</div>
                    <div className="text-[11px] text-gray-500">{colaboradorEncontrado.puesto} · {colaboradorEncontrado.subarea}</div>
                    <Badge variant="green">✓ Encontrado</Badge>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-purple-200 grid grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    { label: 'Nombre(s)', value: colaboradorEncontrado.nombre },
                    { label: 'Apellido(s)', value: colaboradorEncontrado.apellido },
                    { label: 'Puesto', value: colaboradorEncontrado.puesto },
                    { label: 'Sub-Área', value: colaboradorEncontrado.subarea },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">{f.label}</div>
                      <div className="text-[12px] text-gray-800">{f.value}</div>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Consejo Regional</div>
                    <div className="text-[12px] text-gray-800">{colaboradorEncontrado.consejo}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Modal tabs */}
          <div className="flex gap-2 mb-3">
            {[
              { id: 'bienes', label: '📦 Bienes' },
              { id: 'accesorios', label: '🔌 Accesorios' },
              { id: 'disponibles', label: '📋 Disponibles' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setModalTab(t.id as 'bienes' | 'accesorios' | 'disponibles')}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors
                  ${modalTab === t.id ? 'bg-[#6B21A8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Bienes */}
          {modalTab === 'bienes' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo de bien</label>
                <select
                  value={tipoBien}
                  onChange={e => setTipoBien(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                >
                  <option value="computo">Cómputo</option>
                  <option value="mobiliario">Mobiliario o Móvil</option>
                  <option value="comunicaciones">Comunicaciones</option>
                </select>
                <div className="text-[11px] text-gray-400 mt-1">El tipo determina el área responsable del custodio</div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bien a asignar</label>
                <input
                  type="text"
                  value={bienNombre}
                  onChange={e => setBienNombre(e.target.value)}
                  placeholder="Ej: Laptop HP EliteBook 840"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Justificación / Motivo</label>
                <textarea
                  value={form.justificacion}
                  onChange={e => setForm(f => ({ ...f, justificacion: e.target.value }))}
                  rows={3}
                  placeholder="Explique por qué necesita este bien..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Área funcional</label>
                  <input
                    type="text"
                    readOnly
                    value="UN. DE TI"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Sede</label>
                  <input
                    type="text"
                    readOnly
                    value="Sede Malecón de la Reserva"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
              {tipoBien === 'computo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[12px] text-blue-700">
                  💻 Esta solicitud será revisada por SEC. DE ADMINISTRACION y derivada a UN. DE TI para verificar disponibilidad en inventario.
                </div>
              )}
            </div>
          )}

          {/* Tab: Accesorios */}
          {modalTab === 'accesorios' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="text-3xl mb-2">🔌</div>
              <div className="text-gray-500 text-[13px]">Módulo de accesorios próximamente disponible.</div>
            </div>
          )}

          {/* Tab: Disponibles */}
          {modalTab === 'disponibles' && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Código', 'Nombre', 'Tipo', 'Estado'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BIENES_DISPONIBLES.map(item => (
                    <tr
                      key={item.codigo}
                      className="border-b border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors"
                      onClick={() => {
                        setBienNombre(item.nombre)
                        setModalTab('bienes')
                        toast(`✓ Bien seleccionado: ${item.nombre}`)
                      }}
                    >
                      <td className="px-4 py-2.5 font-mono text-[12px] text-[#6B21A8]">{item.codigo}</td>
                      <td className="px-4 py-2.5 font-medium text-[#1E1B4B]">{item.nombre}</td>
                      <td className="px-4 py-2.5 text-gray-500">{item.tipo}</td>
                      <td className="px-4 py-2.5"><Badge variant="green">Disponible</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-[11px] text-gray-400 text-center mt-2">
            Esta solicitud requiere aprobación de Jefe de Área y Administración antes de la asignación física.
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        open={showDetalle && !!selected}
        onClose={() => setShowDetalle(false)}
        title={`Solicitud ${selected?.numero}`}
        subtitle="Detalle de la solicitud de asignación"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowDetalle(false)}>Cerrar</Button>
            {selected?.estado === 'entregado_pendiente' && (
              <Button size="sm" onClick={() => { setShowDetalle(false); setShowConformidad(true) }}>
                <CheckCircle size={13} /> Firmar conformidad
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Estado badge */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-medium">Estado actual:</span>
              {estadoBadge(selected.estado)}
            </div>

            {/* Stepper */}
            <div className="bg-[#F8F6FB] rounded-lg p-4">
              <Stepper steps={stepperForEstado(selected.estado)} />
            </div>

            {/* DATOS DE LA SOLICITUD */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-gray-100">
                DATOS DE LA SOLICITUD
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: 'N° Solicitud', value: selected.numero },
                  { label: 'Bien', value: selected.bien_nombre },
                  { label: 'Tipo', value: labelTipo[selected.tipo] },
                  { label: 'Fecha solicitud', value: selected.fecha_solicitud },
                  { label: 'Prioridad', value: 'Normal' },
                  { label: 'Área solicitante', value: 'UN. DE TI' },
                  { label: 'Observación', value: selected.observacion ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{label}</div>
                    <div className="text-[13px] text-[#1E1B4B] font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FLUJO DE APROBACIÓN Y FIRMAS */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-gray-100">
                FLUJO DE APROBACIÓN Y FIRMAS
              </div>
              <div className="space-y-2">
                {(() => {
                  const e = selected.estado
                  // Paso 1: Administración registra solicitud — siempre done
                  // Paso 2: Área custodio entrega bien a Administración — done si aprobado/entregado_pendiente/completado
                  // Paso 3: Administración entrega bien al colaborador — done si entregado_pendiente/completado
                  // Paso 4: Colaborador firma conformidad — done si completado
                  const steps: { paso: number; rol: string; descripcion: string; nombre: string; fecha: string | null; status: 'done' | 'current' | 'pending' }[] = [
                    {
                      paso: 1,
                      rol: 'Solicitud registrada',
                      descripcion: 'Administración registra la solicitud de asignación',
                      nombre: 'SEC. ADMINISTRACIÓN',
                      fecha: selected.fecha_solicitud,
                      status: 'done',
                    },
                    {
                      paso: 2,
                      rol: 'Área custodio entrega bien',
                      descripcion: 'El área que custodia el bien lo entrega a Administración',
                      nombre: 'UN. DE TI',
                      fecha: ['aprobado','entregado_pendiente','completado'].includes(e) ? '11/03/2026' : null,
                      status: ['aprobado','entregado_pendiente','completado'].includes(e) ? 'done' : e === 'observado' ? 'current' : 'pending',
                    },
                    {
                      paso: 3,
                      rol: 'Administración entrega bien al colaborador',
                      descripcion: 'Administración hace entrega física del bien al colaborador',
                      nombre: 'SEC. ADMINISTRACIÓN',
                      fecha: ['entregado_pendiente','completado'].includes(e) ? '13/03/2026' : null,
                      status: ['entregado_pendiente','completado'].includes(e) ? 'done' : ['aprobado'].includes(e) ? 'current' : 'pending',
                    },
                    {
                      paso: 4,
                      rol: 'Colaborador firma conformidad',
                      descripcion: 'El colaborador firma el acta de recepción y conformidad',
                      nombre: 'Colaborador receptor',
                      fecha: e === 'completado' ? '15/03/2026' : null,
                      status: e === 'completado' ? 'done' : e === 'entregado_pendiente' ? 'current' : 'pending',
                    },
                  ]
                  return steps.map(step => (
                    <div key={step.paso} className={`flex gap-3 border rounded-lg px-4 py-3 ${step.status === 'done' ? 'border-green-200 bg-green-50' : step.status === 'current' ? 'border-[#6B21A8] bg-[#F5F3FF]' : 'border-gray-100 bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 ${step.status === 'done' ? 'bg-green-500 text-white' : step.status === 'current' ? 'bg-[#6B21A8] text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {step.status === 'done' ? '✓' : step.paso}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-[#1E1B4B]">{step.rol}</div>
                        <div className="text-[11px] text-gray-500">{step.descripcion}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{step.nombre}{step.fecha ? ` · ${step.fecha}` : ''}</div>
                      </div>
                      <div className={`border rounded-lg px-3 py-2 text-center min-w-[90px] flex-shrink-0 self-center ${step.status === 'done' ? 'border-green-300 bg-white' : 'border-dashed border-gray-200 bg-white'}`}>
                        {step.status === 'done' ? (
                          <div className="text-[10px] text-green-600 font-semibold">✓ Firmado</div>
                        ) : step.status === 'current' ? (
                          <div className="text-[10px] text-[#6B21A8] font-semibold">Pendiente</div>
                        ) : (
                          <div className="text-[10px] text-gray-300">—</div>
                        )}
                      </div>
                    </div>
                  ))
                })()}
              </div>
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

            <div className="bg-gray-50 rounded-lg px-4 py-3 text-[12px] text-gray-600 italic leading-relaxed border border-gray-200">
              "Yo, Aaron Samuel Nuñez Muñoz, identificado con DNI 77434028, declaro haber recibido el bien descrito en conformidad, en las condiciones indicadas, comprometiéndome a su uso responsable y devolución en caso corresponda."
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nombre completo</label>
                <input type="text" readOnly value="Aaron Samuel Nuñez Muñoz" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">DNI</label>
                <input type="text" readOnly value="77434028" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Cargo</label>
                <input type="text" readOnly value="Analista de Sistemas" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fecha de firma</label>
                <input type="text" readOnly value={todayStr} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-center">
              Esta acción registra tu conformidad. Podrás descargar el PDF desde Historial.
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Consultar Disponibilidad */}
      <Modal
        open={showDisponibilidad}
        onClose={() => { setShowDisponibilidad(false); setDispBienSeleccionado(null); setDispTab('bienes') }}
        title="Consultar Disponibilidad"
        subtitle="Inventario de bienes y accesorios institucionales"
        maxWidth="max-w-3xl"
        footer={<Button variant="gray" size="sm" onClick={() => { setShowDisponibilidad(false); setDispBienSeleccionado(null) }}>Cerrar</Button>}
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[{ id: 'bienes' as const, label: '📦 Bienes' }, { id: 'accesorios' as const, label: '🔌 Accesorios' }].map(t => (
            <button
              key={t.id}
              onClick={() => { setDispTab(t.id); setDispBienSeleccionado(null) }}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium cursor-pointer transition-colors
                ${dispTab === t.id ? 'bg-[#6B21A8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Bienes */}
        {dispTab === 'bienes' && !dispBienSeleccionado && (
          <div className="space-y-2">
            {DISPONIBILIDAD_BIENES.map(b => (
              <div
                key={b.id}
                onClick={() => setDispBienSeleccionado(b)}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-[#6B21A8] hover:bg-[#F5F3FF] transition-all"
              >
                <div className="text-[28px] w-10 flex-shrink-0">{b.icono}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#1E1B4B]">{b.nombre} — {b.marca}</div>
                  <div className="text-[11px] text-gray-400">ID: {b.id} · QR: {b.qr} · Condición: {b.condicion}</div>
                </div>
                {b.disponibilidad === 'disponible'
                  ? <Badge variant="green">Disponible</Badge>
                  : <Badge variant="yellow">En revisión</Badge>}
              </div>
            ))}
          </div>
        )}

        {/* Detalle bien seleccionado */}
        {dispTab === 'bienes' && dispBienSeleccionado && (
          <div>
            <button
              onClick={() => setDispBienSeleccionado(null)}
              className="text-[12px] text-[#6B21A8] font-medium mb-3 flex items-center gap-1 cursor-pointer hover:underline"
            >
              ← Volver al listado
            </button>
            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-28 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-[32px] border border-gray-200 flex-shrink-0">
                  {dispBienSeleccionado.icono}
                </div>
                <div className="w-28 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-[11px] text-gray-400 border border-gray-200 flex-shrink-0">
                  Vista QR
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-[#1E1B4B]">{dispBienSeleccionado.nombre}</div>
                  <div className="text-[13px] text-gray-500">{dispBienSeleccionado.marca}</div>
                  <div className="mt-2">
                    {dispBienSeleccionado.disponibilidad === 'disponible'
                      ? <Badge variant="green">Disponible</Badge>
                      : <Badge variant="yellow">En revisión</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                {[
                  { label: 'ID Inventario', value: dispBienSeleccionado.id },
                  { label: 'Código QR', value: dispBienSeleccionado.qr },
                  { label: 'Condición', value: dispBienSeleccionado.condicion },
                  { label: 'Área custodio', value: dispBienSeleccionado.area },
                  { label: 'N° Serie', value: dispBienSeleccionado.serie },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">{f.label}</div>
                    <div className="text-[12px] text-[#1E1B4B] font-medium">{f.value}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setBienNombre(`${dispBienSeleccionado.nombre} ${dispBienSeleccionado.marca}`)
                  setShowDisponibilidad(false)
                  setDispBienSeleccionado(null)
                  setShowNueva(true)
                  toast(`✓ Bien seleccionado: ${dispBienSeleccionado.nombre}`)
                }}
                className="w-full bg-[#6B21A8] hover:bg-[#4A1272] text-white rounded-lg py-2.5 text-[13px] font-semibold cursor-pointer transition-colors"
              >
                ✔ Seleccionar para solicitud
              </button>
            </div>
          </div>
        )}

        {/* Tab Accesorios */}
        {dispTab === 'accesorios' && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['ID', 'Nombre', 'Marca', 'Sub Área', 'Estado', 'Disponibilidad'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DISPONIBILIDAD_ACCESORIOS.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[#6B21A8]">{a.id}</td>
                    <td className="px-3 py-2.5 font-medium text-[#1E1B4B]">{a.nombre}</td>
                    <td className="px-3 py-2.5 text-gray-500">{a.marca}</td>
                    <td className="px-3 py-2.5 text-gray-500">{a.subarea}</td>
                    <td className="px-3 py-2.5">
                      {a.estado === 'bueno' ? <Badge variant="green">Bueno</Badge> : <Badge variant="yellow">Regular</Badge>}
                    </td>
                    <td className="px-3 py-2.5">
                      {a.disponibilidad === 'disponible'
                        ? <Badge variant="green">Disponible</Badge>
                        : a.disponibilidad === 'asignado'
                          ? <Badge variant="blue">Asignado</Badge>
                          : <Badge variant="yellow">En revisión</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
