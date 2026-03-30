import { useState, useEffect } from 'react'
import { Eye, ArrowLeft, Search, CheckSquare, Square } from 'lucide-react'
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
  { id: '1', colaborador_dni: '45231089', colaborador_nombre: 'Ramírez López, Carlos', area: 'UN. DE TI', tipo_salida: 'cese', fecha_inicio: '15/03/2026', estado: 'en_proceso', bienes_count: 3, created_at: '' },
  { id: '2', colaborador_dni: '32187654', colaborador_nombre: 'Flores Vega, Ana', area: 'SEC. ADMINISTRACIÓN', tipo_salida: 'vacaciones', fecha_inicio: '20/03/2026', estado: 'completado', bienes_count: 1, created_at: '' },
]

const MOCK_BIENES: Record<string, Array<{ id: string; bien: string; codigo: string; devuelto: boolean }>> = {
  '1': [
    { id: 'b1', bien: 'Laptop HP ProBook', codigo: 'TI-LAP-002', devuelto: false },
    { id: 'b2', bien: 'Monitor 24"', codigo: 'TI-MON-003', devuelto: false },
    { id: 'b3', bien: 'Teclado + Mouse', codigo: 'TI-KBD-001', devuelto: true },
  ],
  '2': [
    { id: 'b4', bien: 'Teléfono IP', codigo: 'ADM-TEL-002', devuelto: true },
  ],
}

function estadoBadge(estado: string) {
  if (estado === 'en_proceso') return <Badge variant="blue">En proceso</Badge>
  if (estado === 'completado') return <Badge variant="green">Completado</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

function tipoSalidaBadge(tipo: string) {
  if (tipo === 'cese') return <Badge variant="red">Cese</Badge>
  if (tipo === 'licencia') return <Badge variant="amber">Licencia</Badge>
  if (tipo === 'vacaciones') return <Badge variant="teal">Vacaciones</Badge>
  return <Badge variant="gray">{tipo}</Badge>
}

interface DetallePanelProps {
  devolucion: Devolucion
  onBack: () => void
  onComplete: (id: string) => void
  toast: (msg: string) => void
}

function DetallePanel({ devolucion, onBack, onComplete, toast }: DetallePanelProps) {
  const [bienes, setBienes] = useState(MOCK_BIENES[devolucion.id] ?? [])

  const toggleBien = (id: string) => {
    setBienes(prev => prev.map(b => b.id === id ? { ...b, devuelto: !b.devuelto } : b))
  }

  const todosDevueltos = bienes.every(b => b.devuelto)

  const handleComplete = () => {
    onComplete(devolucion.id)
    toast('Proceso de devolución completado.')
  }

  const steps = [
    { label: 'Solicitud', status: 'done' as const },
    { label: 'Revisión inventario', status: 'current' as const },
    { label: 'Firma entrega', status: 'pending' as const },
    { label: 'Completado', status: 'pending' as const },
  ]

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#6B21A8] hover:underline mb-4 cursor-pointer">
        <ArrowLeft size={14} /> Regresar
      </button>

      {/* Profile card */}
      <div className="bg-gradient-to-r from-[#6B21A8] to-[#4A1272] rounded-xl p-5 text-white mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
            {devolucion.colaborador_nombre.split(',')[0]?.charAt(0) ?? 'X'}
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

      {/* Bienes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-[14px] font-bold text-[#1E1B4B]">Bienes a devolver</div>
          <span className="text-[12px] text-gray-400">{bienes.filter(b => b.devuelto).length}/{bienes.length} devueltos</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Bien</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Código</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Estado</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">Marcar</th>
            </tr>
          </thead>
          <tbody>
            {bienes.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#1E1B4B]">{b.bien}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{b.codigo}</td>
                <td className="px-4 py-3">
                  {b.devuelto ? <Badge variant="green">Devuelto</Badge> : <Badge variant="amber">Pendiente</Badge>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleBien(b.id)} className="text-[#6B21A8] cursor-pointer hover:opacity-70">
                    {b.devuelto ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {todosDevueltos && devolucion.estado !== 'completado' && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
            <Button size="sm" onClick={handleComplete}>Completar devolución</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DevolucionBienes() {
  const [data, setData] = useState<Devolucion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('en_proceso')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Devolucion | null>(null)
  const { toast, toastState, hideToast } = useToast()

  // Form
  const [form, setForm] = useState({ dni: '', nombre: '', area: '', tipo_salida: 'cese', fecha_inicio: '' })
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    devolucionesService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as Devolucion[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const buscarColaborador = () => {
    setBuscando(true)
    setTimeout(() => {
      if (form.dni === '45231089') setForm(f => ({ ...f, nombre: 'Ramírez López, Carlos', area: 'UN. DE TI' }))
      else setForm(f => ({ ...f, nombre: 'Colaborador no encontrado', area: '' }))
      setBuscando(false)
    }, 600)
  }

  const handleRegistrar = async () => {
    const nueva: Devolucion = {
      id: String(Date.now()),
      colaborador_dni: form.dni,
      colaborador_nombre: form.nombre,
      area: form.area,
      tipo_salida: form.tipo_salida as Devolucion['tipo_salida'],
      fecha_inicio: form.fecha_inicio || new Date().toLocaleDateString('es-PE'),
      estado: 'en_proceso',
      bienes_count: 0,
      created_at: new Date().toISOString(),
    }
    try { await devolucionesService.create(nueva as unknown as Record<string, unknown>) } catch { /* ignore */ }
    setData(prev => [nueva, ...prev])
    setShowModal(false)
    setForm({ dni: '', nombre: '', area: '', tipo_salida: 'cese', fecha_inicio: '' })
    toast('Proceso de devolución registrado.')
  }

  const handleComplete = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, estado: 'completado' } : d))
    setSelected(null)
  }

  const tabs = [
    { id: 'en_proceso', label: 'En proceso' },
    { id: 'completadas', label: 'Completadas' },
  ]

  const filtered = data.filter(d => activeTab === 'en_proceso' ? d.estado === 'en_proceso' : d.estado === 'completado')

  if (selected) {
    return (
      <DetallePanel
        devolucion={selected}
        onBack={() => setSelected(null)}
        onComplete={handleComplete}
        toast={toast}
      />
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
                  {['DNI', 'Colaborador', 'Área', 'Tipo salida', 'F. inicio', 'Bienes asignados', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">{h}</th>
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
                    <td className="px-4 py-3">{tipoSalidaBadge(d.tipo_salida)}</td>
                    <td className="px-4 py-3 text-gray-500">{d.fecha_inicio}</td>
                    <td className="px-4 py-3 text-center">{d.bienes_count}</td>
                    <td className="px-4 py-3">{estadoBadge(d.estado)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="xs" onClick={() => setSelected(d)}>
                        <Eye size={12} /> Ver proceso
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Registrar Salida */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Salida de Personal"
        subtitle="Inicie el proceso de devolución de bienes"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleRegistrar} disabled={!form.dni || !form.nombre || form.nombre.includes('no encontrado')}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">DNI del colaborador <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.dni}
                onChange={e => setForm(f => ({ ...f, dni: e.target.value, nombre: '', area: '' }))}
                placeholder="Ej: 45231089"
                maxLength={8}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
              <Button variant="outline" size="sm" onClick={buscarColaborador} disabled={form.dni.length < 8 || buscando}>
                <Search size={13} /> {buscando ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>
          {form.nombre && (
            <div className="bg-[#F8F6FB] rounded-lg p-3 text-[13px]">
              <div className="font-semibold text-[#1E1B4B]">{form.nombre}</div>
              {form.area && <div className="text-gray-500 text-[12px]">{form.area}</div>}
            </div>
          )}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo de salida <span className="text-red-500">*</span></label>
            <select
              value={form.tipo_salida}
              onChange={e => setForm(f => ({ ...f, tipo_salida: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            >
              <option value="cese">Cese</option>
              <option value="licencia">Licencia</option>
              <option value="vacaciones">Vacaciones</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
        </div>
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
