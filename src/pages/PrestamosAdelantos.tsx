import { useState, useEffect } from 'react'
import { Plus, Eye } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { Stepper } from '../components/ui/Stepper'
import { solicitudesAdelantoService } from '../services/db'
import type { SolicitudAdelanto } from '../types'

const MOCK_DATA: SolicitudAdelanto[] = [
  { id: '1', numero: 'ADV-2026-001', tipo: 'adelanto_sueldo', monto: 800, fecha_solicitud: '01/03/2026', estado: 'aprobado', created_at: '' },
  { id: '2', numero: 'ADV-2026-002', tipo: 'prestamo_personal', monto: 2500, fecha_solicitud: '10/03/2026', estado: 'en_revision_bienestar', created_at: '' },
  { id: '3', numero: 'ADV-2026-003', tipo: 'adelanto_sueldo', monto: 400, fecha_solicitud: '18/03/2026', estado: 'rechazado', created_at: '' },
]

const MATRIZ_DATA = [
  { n: 1, area: 'UN. DE TI', puesto: 'Analista', nombre: 'Nuñez Muñoz, Aaron', dni: '77434028', tipo: 'Adelanto', motivo: 'Necesidad personal', monto: 800, fecha: '01/03/2026', cuotas: 1, mes_descuento: 'Abril 2026', aprueba: 'Jef. GDTH', abono_fecha: '10/03/2026', documento: 'ADV-2026-001' },
  { n: 2, area: 'UN. DE GDTH', puesto: 'Especialista', nombre: 'Torres H., María', dni: '54321876', tipo: 'Préstamo', motivo: 'Gastos médicos', monto: 2500, fecha: '10/03/2026', cuotas: 3, mes_descuento: 'Abril 2026', aprueba: 'Gerencia', abono_fecha: '—', documento: 'ADV-2026-002' },
]

function estadoBadge(estado: string) {
  const map: Record<string, { variant: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray'; label: string }> = {
    aprobado: { variant: 'green', label: 'Aprobado' },
    en_revision_bienestar: { variant: 'blue', label: 'En revisión — Bienestar' },
    en_revision_gdth: { variant: 'purple', label: 'En revisión — GDTH' },
    rechazado: { variant: 'red', label: 'Rechazado' },
    pendiente: { variant: 'yellow', label: 'Pendiente' },
  }
  const cfg = map[estado] ?? { variant: 'gray' as const, label: estado }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

function stepperForSolicitud(estado: string) {
  const idx = { en_revision_bienestar: 1, en_revision_gdth: 2, aprobado: 4, rechazado: 2 }[estado] ?? 0
  return [
    { label: 'Solicitud', status: idx >= 1 ? 'done' : 'current' },
    { label: 'Bienestar', status: idx === 1 ? 'current' : idx > 1 ? 'done' : 'pending' },
    { label: 'Jef. GDTH', status: idx === 2 ? 'current' : idx > 2 ? 'done' : 'pending' },
    { label: 'Sec. Admin.', status: idx === 3 ? 'current' : idx > 3 ? 'done' : 'pending' },
    { label: 'Contabilidad', status: idx >= 4 ? 'done' : 'pending' },
  ] as { label: string; status: 'done' | 'current' | 'pending' }[]
}

function calcularCuotas(monto: number, numCuotas: number): Array<{ cuota: number; mes: string; monto: string }> {
  const montoCuota = monto / numCuotas
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const hoy = new Date()
  return Array.from({ length: numCuotas }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i + 1, 1)
    return {
      cuota: i + 1,
      mes: `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`,
      monto: `S/. ${montoCuota.toFixed(2)}`,
    }
  })
}

export function PrestamosAdelantos() {
  const [data, setData] = useState<SolicitudAdelanto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mis_solicitudes')
  const [subTab, setSubTab] = useState('solicitudes')
  const [showNueva, setShowNueva] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [selected, setSelected] = useState<SolicitudAdelanto | null>(null)
  const { toast, toastState, hideToast } = useToast()

  const [form, setForm] = useState({ tipo: 'adelanto_sueldo', monto: '', motivo: '', justificacion: '', num_cuotas: '1' })

  useEffect(() => {
    solicitudesAdelantoService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as SolicitudAdelanto[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    const nueva: SolicitudAdelanto = {
      id: String(Date.now()),
      numero: `ADV-2026-${String(data.length + 1).padStart(3, '0')}`,
      tipo: form.tipo as SolicitudAdelanto['tipo'],
      monto: parseFloat(form.monto),
      fecha_solicitud: new Date().toLocaleDateString('es-PE'),
      estado: 'en_revision_bienestar',
      motivo: form.motivo,
      num_cuotas: parseInt(form.num_cuotas),
      created_at: new Date().toISOString(),
    }
    try { await solicitudesAdelantoService.create({ ...nueva, justificacion: form.justificacion }) } catch { /* ignore */ }
    setData(prev => [nueva, ...prev])
    setShowNueva(false)
    setForm({ tipo: 'adelanto_sueldo', monto: '', motivo: '', justificacion: '', num_cuotas: '1' })
    toast('Solicitud enviada correctamente.')
  }

  const tabs = [
    { id: 'mis_solicitudes', label: 'Mis Solicitudes' },
    { id: 'bandeja_gdth', label: 'Bandeja GDTH' },
    { id: 'bandeja_bienestar', label: 'Bandeja Bienestar' },
    { id: 'historial', label: 'Historial' },
  ]

  const montoNum = parseFloat(form.monto) || 0
  const cuotas = form.tipo === 'prestamo_personal' && montoNum > 0 ? calcularCuotas(montoNum, parseInt(form.num_cuotas) || 1) : []

  return (
    <div>
      <PageHeader
        title="Préstamos y Adelantos de Sueldo"
        subtitle="Gestión de solicitudes de adelanto de sueldo y préstamos personales"
        breadcrumb={<>Gestión de Recursos &rsaquo; Préstamos y Adelantos</>}
        actions={<Button size="sm" onClick={() => setShowNueva(true)}><Plus size={13} /> Nueva Solicitud</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {activeTab === 'mis_solicitudes' && (
            <div className="space-y-4">
              {/* Stepper de flujo */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-[12px] font-semibold text-gray-500 mb-3 uppercase tracking-wide">Flujo de aprobación</div>
                <Stepper steps={[
                  { label: 'Solicitud', status: 'done' },
                  { label: 'Bienestar', status: 'current' },
                  { label: 'Jefatura GDTH', status: 'pending' },
                  { label: 'Sec. Administ.', status: 'pending' },
                  { label: 'Contabilidad', status: 'pending' },
                ]} />
              </div>

              {/* Tabla */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['N° Solicitud', 'Tipo', 'Monto', 'Fecha solicitud', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay solicitudes</td></tr>
                    )}
                    {data.map(s => (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8] font-medium">{s.numero}</td>
                        <td className="px-4 py-3">
                          <Badge variant={s.tipo === 'adelanto_sueldo' ? 'blue' : 'purple'}>
                            {s.tipo === 'adelanto_sueldo' ? 'Adelanto de sueldo' : 'Préstamo personal'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1E1B4B]">S/. {s.monto.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{s.fecha_solicitud}</td>
                        <td className="px-4 py-3">{estadoBadge(s.estado)}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="xs" onClick={() => { setSelected(s); setShowDetalle(true) }}>
                            <Eye size={12} /> Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bandeja_gdth' && (
            <div>
              <div className="flex border-b border-gray-200 mb-4">
                {[{ id: 'solicitudes', label: 'Solicitudes' }, { id: 'matriz', label: 'Matriz Préstamos/Adelantos' }].map(t => (
                  <button key={t.id} onClick={() => setSubTab(t.id)}
                    className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer border-b-2 -mb-px transition-all
                      ${subTab === t.id ? 'text-[#6B21A8] border-[#6B21A8]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {subTab === 'solicitudes' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['N° Solicitud', 'Tipo', 'Monto', 'Fecha', 'Estado', 'Acción'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(s => (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8]">{s.numero}</td>
                          <td className="px-4 py-3">
                            <Badge variant={s.tipo === 'adelanto_sueldo' ? 'blue' : 'purple'}>
                              {s.tipo === 'adelanto_sueldo' ? 'Adelanto' : 'Préstamo'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-semibold">S/. {s.monto.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-500">{s.fecha_solicitud}</td>
                          <td className="px-4 py-3">{estadoBadge(s.estado)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <Button variant="outline" size="xs" onClick={() => {
                                setData(prev => prev.map(x => x.id === s.id ? { ...x, estado: 'aprobado' } : x))
                                toast('Solicitud aprobada.')
                              }}>Aprobar</Button>
                              <Button variant="ghost" size="xs" onClick={() => {
                                setData(prev => prev.map(x => x.id === s.id ? { ...x, estado: 'rechazado' } : x))
                                toast('Solicitud rechazada.')
                              }}>Rechazar</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {subTab === 'matriz' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['N°', 'Área', 'Puesto', 'Apellidos y Nombres', 'DNI', 'Tipo', 'Motivo', 'Monto', 'F. Solicitud', 'Cuotas', 'Mes Descuento', 'Aprueba', 'Abono Fecha', 'Documento'].map(h => (
                          <th key={h} className="text-left px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MATRIZ_DATA.map(r => (
                        <tr key={r.n} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2.5">{r.n}</td>
                          <td className="px-3 py-2.5 text-gray-600">{r.area}</td>
                          <td className="px-3 py-2.5 text-gray-600">{r.puesto}</td>
                          <td className="px-3 py-2.5 font-medium text-[#1E1B4B]">{r.nombre}</td>
                          <td className="px-3 py-2.5 font-mono">{r.dni}</td>
                          <td className="px-3 py-2.5">
                            <Badge variant={r.tipo === 'Adelanto' ? 'blue' : 'purple'}>{r.tipo}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">{r.motivo}</td>
                          <td className="px-3 py-2.5 font-semibold">S/. {r.monto.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-gray-500">{r.fecha}</td>
                          <td className="px-3 py-2.5 text-center">{r.cuotas}</td>
                          <td className="px-3 py-2.5 text-gray-500">{r.mes_descuento}</td>
                          <td className="px-3 py-2.5 text-gray-500">{r.aprueba}</td>
                          <td className="px-3 py-2.5 text-gray-500">{r.abono_fecha}</td>
                          <td className="px-3 py-2.5 font-mono text-[#6B21A8]">{r.documento}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bandeja_bienestar' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['N° Solicitud', 'Tipo', 'Monto', 'Fecha', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.filter(s => s.estado === 'en_revision_bienestar').map(s => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8]">{s.numero}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.tipo === 'adelanto_sueldo' ? 'blue' : 'purple'}>
                          {s.tipo === 'adelanto_sueldo' ? 'Adelanto' : 'Préstamo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">S/. {s.monto.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{s.fecha_solicitud}</td>
                      <td className="px-4 py-3">{estadoBadge(s.estado)}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="xs" onClick={() => {
                          setData(prev => prev.map(x => x.id === s.id ? { ...x, estado: 'en_revision_gdth' } : x))
                          toast('Enviado a GDTH.')
                        }}>Derivar a GDTH</Button>
                      </td>
                    </tr>
                  ))}
                  {data.filter(s => s.estado === 'en_revision_bienestar').length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay solicitudes pendientes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['N° Solicitud', 'Tipo', 'Monto', 'Fecha solicitud', 'Estado'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.filter(s => ['aprobado', 'rechazado'].includes(s.estado)).map(s => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8]">{s.numero}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.tipo === 'adelanto_sueldo' ? 'blue' : 'purple'}>
                          {s.tipo === 'adelanto_sueldo' ? 'Adelanto' : 'Préstamo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">S/. {s.monto.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{s.fecha_solicitud}</td>
                      <td className="px-4 py-3">{estadoBadge(s.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Nueva Solicitud */}
      <Modal
        open={showNueva}
        onClose={() => setShowNueva(false)}
        title="Nueva Solicitud"
        subtitle="Complete los datos de su solicitud de adelanto o préstamo"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNueva(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.monto || !form.motivo || parseFloat(form.monto) <= 0}>
              Enviar Solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Tipo radio cards */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-2">Tipo de solicitud <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'adelanto_sueldo', label: 'Adelanto de Sueldo', desc: 'Descuento en el mes siguiente' },
                { value: 'prestamo_personal', label: 'Préstamo Personal', desc: 'Descuento en cuotas' },
              ].map(opt => (
                <label key={opt.value} className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${form.tipo === opt.value ? 'border-[#6B21A8] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="tipo" value={opt.value} checked={form.tipo === opt.value} onChange={e => setForm(f => ({ ...f, tipo: e.target.value, num_cuotas: '1' }))} className="hidden" />
                  <div className="text-[13px] font-semibold text-[#1E1B4B]">{opt.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Monto (S/.) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              />
            </div>
            {form.tipo === 'prestamo_personal' && (
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">N° de cuotas</label>
                <select
                  value={form.num_cuotas}
                  onChange={e => setForm(f => ({ ...f, num_cuotas: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} cuota{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Motivo <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
              placeholder="Ej: Gastos médicos, emergencia familiar..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Justificación</label>
            <textarea
              value={form.justificacion}
              onChange={e => setForm(f => ({ ...f, justificacion: e.target.value }))}
              rows={2}
              placeholder="Detalle adicional..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
            />
          </div>

          {/* Tabla de cuotas calculada */}
          {form.tipo === 'prestamo_personal' && cuotas.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold text-gray-700 mb-2">Tabla de cuotas estimada</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Cuota</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Mes</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotas.map(c => (
                      <tr key={c.cuota} className="border-b border-gray-50">
                        <td className="px-3 py-2">{c.cuota}</td>
                        <td className="px-3 py-2 text-gray-600">{c.mes}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[#1E1B4B]">{c.monto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        open={showDetalle && !!selected}
        onClose={() => setShowDetalle(false)}
        title={`Solicitud ${selected?.numero}`}
        subtitle="Detalle del seguimiento"
        footer={<Button variant="gray" size="sm" onClick={() => setShowDetalle(false)}>Cerrar</Button>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#F8F6FB] rounded-lg p-4">
              <Stepper steps={stepperForSolicitud(selected.estado)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-[11px] text-gray-400 mb-0.5">N° Solicitud</div><div className="text-[13px] font-medium text-[#1E1B4B]">{selected.numero}</div></div>
              <div><div className="text-[11px] text-gray-400 mb-0.5">Tipo</div><div className="text-[13px]"><Badge variant={selected.tipo === 'adelanto_sueldo' ? 'blue' : 'purple'}>{selected.tipo === 'adelanto_sueldo' ? 'Adelanto de sueldo' : 'Préstamo personal'}</Badge></div></div>
              <div><div className="text-[11px] text-gray-400 mb-0.5">Monto</div><div className="text-[13px] font-semibold text-[#1E1B4B]">S/. {selected.monto.toLocaleString()}</div></div>
              <div><div className="text-[11px] text-gray-400 mb-0.5">Fecha</div><div className="text-[13px] text-gray-700">{selected.fecha_solicitud}</div></div>
              <div><div className="text-[11px] text-gray-400 mb-0.5">Estado</div><div>{estadoBadge(selected.estado)}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
