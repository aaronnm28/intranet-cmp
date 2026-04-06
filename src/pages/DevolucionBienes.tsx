import { useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { Stepper } from '../components/ui/Stepper'
import { devolucionesService } from '../services/db'
import type { Devolucion } from '../types'

const MOCK_DATA: Devolucion[] = [
  { id: '1', colaborador_dni: '45231089', colaborador_nombre: 'Carlos Pérez Ramos', area: 'UN. DE TI', tipo_salida: 'cese', fecha_inicio: '31/03/2026', estado: 'en_proceso', bienes_count: 5, created_at: '' },
  { id: '2', colaborador_dni: '32187654', colaborador_nombre: 'María Torres Huamán', area: 'UN. DE GDTH', tipo_salida: 'cese', fecha_inicio: '28/03/2026', estado: 'observado', bienes_count: 3, created_at: '' },
  { id: '3', colaborador_dni: '77410231', colaborador_nombre: 'Jorge Lima Castillo', area: 'UN. DE COMUN. E IMAGEN INSTI.', tipo_salida: 'cese', fecha_inicio: '20/03/2026', estado: 'bloqueado', bienes_count: 2, created_at: '' },
]

const COLABORADORES: Record<string, { nombre: string; area: string; cargo: string; sede: string }> = {
  '45231089': { nombre: 'Carlos Pérez Ramos', area: 'UN. DE TI', cargo: 'Técnico Soporte', sede: 'Lima' },
}

function estadoBadge(estado: string) {
  if (estado === 'en_proceso') return <Badge variant="blue">En proceso</Badge>
  if (estado === 'observado') return <Badge variant="yellow">Con observaciones</Badge>
  if (estado === 'bloqueado') return <Badge variant="red">Bloqueado</Badge>
  if (estado === 'completado') return <Badge variant="green">Completado</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

function semaforoDot(estado: string) {
  const colorMap: Record<string, string> = {
    en_proceso: '#22C55E',
    observado: '#EAB308',
    bloqueado: '#EF4444',
    completado: '#22C55E',
  }
  const color = colorMap[estado] ?? '#9CA3AF'
  return (
    <span
      style={{ backgroundColor: color, display: 'inline-block', width: 12, height: 12, borderRadius: '50%' }}
    />
  )
}

interface DetallePanelProps {
  devolucion: Devolucion
  onBack: () => void
  toast: (msg: string) => void
  onGenerarReporte: () => void
}

const BIENES_DEVOLUCION = [
  { id: '111030', desc: 'Laptop Dell', codigo: 'CMP-038401', custodio: 'UN. DE TI', estado: 'bueno', devolucion: 'pendiente' },
  { id: '111031', desc: 'Mouse Logitech', codigo: 'CMP-038402', custodio: 'UN. DE TI', estado: 'bueno', devolucion: 'pendiente' },
  { id: '200201', desc: 'Silla ergonómica', codigo: 'CMP-ART-041', custodio: 'Administración', estado: 'regular', devolucion: 'observado' },
]

const ACCESORIOS_DEVOLUCION = [
  { id: '20261106', nombre: 'Teclado HP', marca: 'HP', estado: 'bueno' },
  { id: '20261107', nombre: 'USB Kingston', marca: 'Kingston', estado: 'bueno' },
]

function DetallePanel({ devolucion, onBack, toast, onGenerarReporte }: DetallePanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['bienes', 'accesorios']))

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const steps = [
    { label: 'Solicitud', status: 'done' as const },
    { label: 'Revisión inventario', status: 'current' as const },
    { label: 'Firma entrega', status: 'pending' as const },
    { label: 'Completado', status: 'pending' as const },
  ]

  // Get initials: first letter of first name + first letter of first apellido
  const nameParts = devolucion.colaborador_nombre.trim().split(' ')
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : nameParts[0]?.substring(0, 2).toUpperCase() ?? 'XX'

  return (
    <div>
      {/* Profile card */}
      <div className="bg-gradient-to-r from-[#6B21A8] to-[#4A1272] rounded-xl p-5 text-white mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div>
            <div className="text-[17px] font-bold">{devolucion.colaborador_nombre}</div>
            <div className="text-white/75 text-[13px] mt-0.5">{devolucion.area}</div>
            <div className="flex gap-2 mt-2">
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">DNI: {devolucion.colaborador_dni}</span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full capitalize">Motivo: {devolucion.tipo_salida}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="text-[12px] font-semibold text-gray-500 mb-3">PROGRESO DEL PROCESO</div>
        <Stepper steps={steps} />
      </div>

      {/* Section 1: Bienes a devolver */}
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
        <div
          className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('bienes')}
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full flex-shrink-0 bg-yellow-400"></span>
            Bienes a devolver
            <span className="text-[11px] text-gray-400 font-normal">(custodio: TI / ADMINISTRACIÓN)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="yellow">3 pendientes</Badge>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${openSections.has('bienes') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {openSections.has('bienes') && (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Descripción', 'Código QR', 'Custodio', 'Estado actual', 'Semáforo', 'Devolución', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 text-[11px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BIENES_DEVOLUCION.map(b => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">{b.id}</td>
                    <td className="px-3 py-2.5 font-medium text-[#1E1B4B]">{b.desc}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">{b.codigo}</td>
                    <td className="px-3 py-2.5 text-gray-600">{b.custodio}</td>
                    <td className="px-3 py-2.5">
                      {b.estado === 'bueno' ? <Badge variant="green">Bueno</Badge> : <Badge variant="yellow">Regular</Badge>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        style={{
                          backgroundColor: b.estado === 'bueno' ? '#EAB308' : '#EF4444',
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                        }}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-[12px]">
                      {b.devolucion === 'pendiente' ? '☐ Pendiente' : '⚠ Observado'}
                    </td>
                    <td className="px-3 py-2.5">
                      <Button size="xs" onClick={() => toast('Devolución registrada correctamente.')}>
                        Registrar devolución
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Accesorios a devolver */}
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
        <div
          className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('accesorios')}
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full flex-shrink-0 bg-green-400"></span>
            Accesorios a devolver
            <span className="text-[11px] text-gray-400 font-normal">(custodio: ADMINISTRACIÓN)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="green">2 pendientes</Badge>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${openSections.has('accesorios') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {openSections.has('accesorios') && (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Nombre', 'Marca', 'Estado', 'Semáforo', 'Devolución', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 text-[11px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACCESORIOS_DEVOLUCION.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">{a.id}</td>
                    <td className="px-3 py-2.5 font-medium text-[#1E1B4B]">{a.nombre}</td>
                    <td className="px-3 py-2.5 text-gray-600">{a.marca}</td>
                    <td className="px-3 py-2.5">
                      {a.estado === 'bueno' ? <Badge variant="green">Bueno</Badge> : <Badge variant="yellow">Regular</Badge>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span style={{ backgroundColor: '#EAB308', display: 'inline-block', width: 10, height: 10, borderRadius: '50%' }} />
                    </td>
                    <td className="px-3 py-2.5 text-[12px]">☐ Pendiente</td>
                    <td className="px-3 py-2.5">
                      <Button size="xs" onClick={() => toast('Devolución de accesorio registrada.')}>
                        Registrar devolución
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Préstamos Bienes Tecnológicos */}
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
        <div
          className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('prestamos_tec')}
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full flex-shrink-0 bg-green-400"></span>
            Préstamos Bienes Tecnológicos
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gray">Sin registros activos</Badge>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${openSections.has('prestamos_tec') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {openSections.has('prestamos_tec') && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-[13px] font-semibold text-gray-600 mb-1">Sin préstamos de bienes tecnológicos activos</div>
            <div className="text-[11px] text-gray-400">No se registran préstamos de equipos pendientes de devolución para este colaborador.</div>
          </div>
        )}
      </div>

      {/* Section 4: Préstamos y Adelantos de Sueldo */}
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
        <div
          className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('prestamos_sueldo')}
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full flex-shrink-0 bg-green-400"></span>
            Préstamos y Adelantos de Sueldo
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gray">Sin registros</Badge>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${openSections.has('prestamos_sueldo') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {openSections.has('prestamos_sueldo') && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-[13px] font-semibold text-gray-600 mb-1">Sin préstamos ni adelantos pendientes</div>
            <div className="text-[11px] text-gray-400">No se registran préstamos o adelantos de sueldo con saldo pendiente para este colaborador.</div>
          </div>
        )}
      </div>

      {/* Section 5: Caja Chica */}
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
        <div
          className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('caja_chica')}
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <span className="w-3 h-3 rounded-full flex-shrink-0 bg-green-400"></span>
            Caja Chica
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gray">No designado</Badge>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${openSections.has('caja_chica') ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {openSections.has('caja_chica') && (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-2">🏧</div>
            <div className="text-[13px] font-semibold text-gray-600 mb-1">No designado como responsable de Caja Chica</div>
            <div className="text-[11px] text-gray-400">Este colaborador no tiene designación activa de responsable de caja chica.</div>
          </div>
        )}
      </div>

      {/* Footer panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold">Estado global: 0 de 5 ítems devueltos</span>
          <span className="text-[12px] text-gray-400">0%</span>
        </div>
        <div className="bg-purple-100 rounded-full h-2 mb-4">
          <div className="bg-[#6B21A8] h-2 rounded-full" style={{ width: '0%' }} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button variant="gray" size="sm" onClick={onBack}>← Regresar</Button>
          <Button size="sm" onClick={onGenerarReporte}>📊 Generar Reporte</Button>
          <Button variant="outline" size="sm">📄 Emitir acta parcial</Button>
          <Button variant="gray" size="sm" disabled>✔ Emitir conformidad final</Button>
          <span className="ml-auto bg-[#0DA882] text-white text-[10px] px-2 py-0.5 rounded-full self-center">⚡ API — Datos desde Activos y Bienes</span>
        </div>
      </div>
    </div>
  )
}

export function DevolucionBienes() {
  const [data, setData] = useState<Devolucion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activos')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Devolucion | null>(null)
  const [showReporte, setShowReporte] = useState(false)
  const { toast, toastState, hideToast } = useToast()

  // Form
  const [form, setForm] = useState({ dni: '', tipo_salida: 'cese', fecha_efectiva: '', motivo: '', notificar: true })
  const [buscando, setBuscando] = useState(false)
  const [colaboradorInfo, setColaboradorInfo] = useState<{ nombre: string; area: string; cargo: string; sede: string } | null>(null)

  useEffect(() => {
    devolucionesService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as Devolucion[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const buscarColaborador = () => {
    setBuscando(true)
    setTimeout(() => {
      const info = COLABORADORES[form.dni] ?? null
      setColaboradorInfo(info)
      setBuscando(false)
    }, 600)
  }

  const handleRegistrar = async () => {
    if (!colaboradorInfo) return
    const nueva: Devolucion = {
      id: String(Date.now()),
      colaborador_dni: form.dni,
      colaborador_nombre: colaboradorInfo.nombre,
      area: colaboradorInfo.area,
      tipo_salida: form.tipo_salida as Devolucion['tipo_salida'],
      fecha_inicio: form.fecha_efectiva || new Date().toLocaleDateString('es-PE'),
      estado: 'en_proceso',
      bienes_count: 0,
      created_at: new Date().toISOString(),
    }
    try { await devolucionesService.create(nueva as unknown as Record<string, unknown>) } catch { /* ignore */ }
    setData(prev => [nueva, ...prev])
    setShowModal(false)
    setForm({ dni: '', tipo_salida: 'cese', fecha_efectiva: '', motivo: '', notificar: true })
    setColaboradorInfo(null)
    toast('Proceso de devolución registrado y creado correctamente.')
  }

  const tabs = [
    { id: 'activos', label: 'Procesos Activos' },
    { id: 'historial', label: 'Historial de Devoluciones' },
  ]

  const filtered = data.filter(d => {
    if (activeTab === 'activos') return ['en_proceso', 'observado', 'bloqueado'].includes(d.estado)
    return d.estado === 'completado'
  })

  if (selected) {
    return (
      <>
        <PageHeader
          title="Devolución de Bienes"
          subtitle="Control de devoluciones por cese, licencia o vacaciones"
          breadcrumb={<>Gestión de Recursos &rsaquo; Devolución de Bienes</>}
        />
        <DetallePanel
          devolucion={selected}
          onBack={() => setSelected(null)}
          toast={toast}
          onGenerarReporte={() => setShowReporte(true)}
        />
        {/* Modal Reporte Devolución */}
        <Modal
          open={showReporte}
          onClose={() => setShowReporte(false)}
          title="Reporte de Devolución de Bienes"
          subtitle="Detalle completo con flujo de firmas y observaciones"
          maxWidth="max-w-2xl"
          footer={
            <>
              <Button variant="gray" size="sm" onClick={() => setShowReporte(false)}>Cerrar</Button>
              <Button variant="outline" size="sm" onClick={() => { toast('Imprimiendo reporte...'); window.print() }}>🖨 Imprimir</Button>
              <Button size="sm" onClick={() => { toast('Generando PDF...'); window.print() }}>📄 Generar PDF</Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Colaborador */}
            <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg px-4 py-3">
              <div className="text-[14px] font-bold text-[#1E1B4B]">{selected.colaborador_nombre}</div>
              <div className="text-[12px] text-gray-500 mt-1">DNI: {selected.colaborador_dni} · Área: {selected.area} · Fecha cese: {selected.fecha_inicio}</div>
            </div>

            {/* Sección Bienes */}
            <div>
              <div className="text-[12px] font-bold text-gray-700 bg-amber-50 border-l-4 border-amber-400 px-3 py-2 rounded mb-2 flex justify-between">
                <span>📦 Sección 1 — Bienes a devolver</span>
                <span className="text-amber-600 font-normal">3 pendientes</span>
              </div>
              <table className="w-full text-[12px] border-collapse">
                <thead><tr className="bg-gray-50"><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">ID</th><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">Descripción</th><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">Estado</th><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">Devolución</th></tr></thead>
                <tbody>
                  {BIENES_DEVOLUCION.map(b => (
                    <tr key={b.id}><td className="border border-gray-200 px-3 py-2 font-mono text-[11px]">{b.id}</td><td className="border border-gray-200 px-3 py-2">{b.desc}</td><td className="border border-gray-200 px-3 py-2">{b.estado === 'bueno' ? <Badge variant="green">Bueno</Badge> : <Badge variant="yellow">Regular</Badge>}</td><td className="border border-gray-200 px-3 py-2 text-amber-600">{b.devolucion === 'pendiente' ? '☐ Pendiente' : '⚠ Observado'}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 bg-amber-50 border border-amber-100 rounded px-3 py-2 text-[11px] text-gray-600">
                <strong>Flujo de firmas:</strong> Admin registra ✓ → Jefe de Área ✓ → Colaborador firma ⏳ Pendiente
              </div>
              <div className="mt-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-[11px] text-gray-600">
                <strong>Obs. Silla ergonómica (200201):</strong> Presenta desgaste en soporte lumbar y rasguños en apoyabrazos izquierdo. Requiere evaluación.
              </div>
            </div>

            {/* Sección Accesorios */}
            <div>
              <div className="text-[12px] font-bold text-gray-700 bg-emerald-50 border-l-4 border-emerald-400 px-3 py-2 rounded mb-2 flex justify-between">
                <span>🔌 Sección 2 — Accesorios a devolver</span>
                <span className="text-amber-600 font-normal">2 pendientes</span>
              </div>
              <table className="w-full text-[12px] border-collapse">
                <thead><tr className="bg-gray-50"><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">ID</th><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">Nombre</th><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">Marca</th><th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-500">Estado</th></tr></thead>
                <tbody>
                  {ACCESORIOS_DEVOLUCION.map(a => (
                    <tr key={a.id}><td className="border border-gray-200 px-3 py-2 font-mono text-[11px]">{a.id}</td><td className="border border-gray-200 px-3 py-2">{a.nombre}</td><td className="border border-gray-200 px-3 py-2">{a.marca}</td><td className="border border-gray-200 px-3 py-2"><Badge variant="green">Bueno</Badge></td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded px-3 py-2 text-[11px] text-gray-600">
                <strong>Flujo de firmas:</strong> Admin registra ✓ → Colaborador firma ⏳ Pendiente
              </div>
            </div>

            {/* Secciones vacías */}
            {['📦 Sección 3 — Préstamos Bienes Tecnológicos', '💰 Sección 4 — Préstamos y Adelantos', '🏧 Sección 5 — Caja Chica'].map(s => (
              <div key={s} className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-[12px] text-gray-400 italic">
                {s}: Sin registros activos.
              </div>
            ))}

            {/* Resumen */}
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[12px]">
              <div className="font-bold text-red-700 mb-1">Estado global: Proceso incompleto — 0 de 5 ítems devueltos (0%)</div>
              <div className="text-gray-500">Generado el {new Date().toLocaleDateString('es-PE')} · Sistema de Gestión Interna — CMP</div>
            </div>
          </div>
        </Modal>
        <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
      </>
    )
  }

  return (
    <div>
      <PageHeader
        title="Devolución de Bienes"
        subtitle="Control de devoluciones por cese, licencia o vacaciones"
        breadcrumb={<>Gestión de Recursos &rsaquo; Devolución de Bienes</>}
        actions={<Button size="sm" onClick={() => setShowModal(true)}>+ Registrar Salida de Personal</Button>}
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
                  {['DNI', 'Colaborador', 'Área', 'Fecha cese', 'Bienes pendientes', 'Estado proceso', 'Semáforo', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No hay registros</td></tr>
                )}
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px]">{d.colaborador_dni}</td>
                    <td className="px-4 py-3 font-medium text-[#1E1B4B]">{d.colaborador_nombre}</td>
                    <td className="px-4 py-3 text-gray-500 text-[12px]">{d.area}</td>
                    <td className="px-4 py-3 text-gray-500">{d.fecha_inicio}</td>
                    <td className="px-4 py-3 text-gray-700">{d.bienes_count} bienes</td>
                    <td className="px-4 py-3">{estadoBadge(d.estado)}</td>
                    <td className="px-4 py-3">{semaforoDot(d.estado)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="xs" onClick={() => setSelected(d)}>
                        Ver proceso
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Footer note */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500">
              🟢 Sin observaciones &nbsp;&nbsp; 🟡 Con observaciones pendientes &nbsp;&nbsp; 🔴 Bloqueado
            </div>
          </div>
        </>
      )}

      {/* Modal Registrar Salida de Personal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setColaboradorInfo(null) }}
        title="Registrar Salida de Personal"
        subtitle="Inicie el proceso de devolución de bienes"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => { setShowModal(false); setColaboradorInfo(null) }}>Cancelar</Button>
            <Button size="sm" onClick={handleRegistrar} disabled={!colaboradorInfo}>
              Registrar y Crear Proceso
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* DNI search */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">DNI del colaborador <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.dni}
                onChange={e => { setForm(f => ({ ...f, dni: e.target.value })); setColaboradorInfo(null) }}
                placeholder="Ej: 45231089"
                maxLength={8}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
              <Button variant="outline" size="sm" onClick={buscarColaborador} disabled={form.dni.length < 8 || buscando}>
                <Search size={13} /> {buscando ? 'Buscando...' : '🔍 Buscar'}
              </Button>
            </div>
          </div>

          {/* Colaborador info */}
          {colaboradorInfo && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nombres y apellidos</label>
                <input type="text" readOnly value={colaboradorInfo.nombre} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Área</label>
                <input type="text" readOnly value={colaboradorInfo.area} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Cargo</label>
                <input type="text" readOnly value={colaboradorInfo.cargo} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Sede</label>
                <input type="text" readOnly value={colaboradorInfo.sede} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-700" />
              </div>
            </div>
          )}

          {/* Tipo salida + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo de salida <span className="text-red-500">*</span></label>
              <select
                value={form.tipo_salida}
                onChange={e => setForm(f => ({ ...f, tipo_salida: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              >
                <option value="renuncia">Renuncia voluntaria</option>
                <option value="cese">Cese</option>
                <option value="no_renovacion">No renovación</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha efectiva de cese</label>
              <input
                type="date"
                value={form.fecha_efectiva}
                onChange={e => setForm(f => ({ ...f, fecha_efectiva: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
            </div>
          </div>

          {/* Motivo adicional */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Motivo adicional <span className="text-[11px] text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
              rows={2}
              placeholder="Observaciones adicionales..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
            />
          </div>

          {/* Checkbox notificar */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.notificar}
              onChange={e => setForm(f => ({ ...f, notificar: e.target.checked }))}
              className="mt-0.5 accent-[#6B21A8]"
            />
            <span className="text-[12px] text-gray-700">Notificar automáticamente a TI, Administración y Comunicaciones</span>
          </label>

          {/* Info banner */}
          <div className="bg-[#EDE9FE] rounded-lg px-4 py-3 text-[12px] text-[#6B21A8]">
            Al registrar la salida se creará automáticamente el proceso de devolución con todos los bienes asignados al colaborador, consultados desde el módulo Activos y Bienes.
          </div>
        </div>
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
