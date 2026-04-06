import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'

interface BienRow {
  id: string
  desc: string
  tipo: string
  codigo: string
  estado: string
  devolucion: string
}

interface PrestamoRow {
  numero: string
  tipo: string
  monto: string
  cuotas: string
  estado: string
}

interface ColaboradorData {
  nombre: string
  initials: string
  meta: string
  tags: string[]
  rightBadge: { label: string; variant: 'green' | 'yellow' }
  rightDate: string | null
  counters: Array<{ icon: string; num: number; label: string; green?: boolean }>
  bienes: BienRow[]
  prestamos: PrestamoRow[]
  footerBanner: string | null
  // datos extendidos para modales
  dni: string
  cargo: string
  area: string
  subarea: string
  correo: string
  sede: string
  fechaCese: string | null
  jefeArea: string
  correoJefe: string
  pendientesLista: { bienes: string[]; accesorios: string[]; prestamos: string[] }
}

const MOCK_MAP: Record<string, ColaboradorData> = {
  '45231089': {
    nombre: 'Carlos Pérez Ramos',
    initials: 'CP',
    meta: 'DNI: 45231089 · Cargo: Analista Contable · Área: UN. DE GDTH',
    tags: ['🏢 Sede Malecón de la Reserva', '📌 CR III - Lima'],
    rightBadge: { label: '⚠ Proceso de salida activo', variant: 'yellow' },
    rightDate: '31/03/2026',
    counters: [
      { icon: '🖥', num: 3, label: 'Activos' },
      { icon: '📦', num: 2, label: 'Artículos' },
      { icon: '🔌', num: 2, label: 'Accesorios' },
      { icon: '💰', num: 1, label: 'Préstamo pendiente' },
      { icon: '⚠', num: 0, label: 'Caja chica', green: true },
    ],
    bienes: [
      { id: '111030', desc: 'Laptop Dell', tipo: 'Activo', codigo: 'CMP-038401', estado: 'bueno', devolucion: 'pendiente' },
      { id: '111031', desc: 'Mouse Logitech', tipo: 'Activo', codigo: 'CMP-038402', estado: 'bueno', devolucion: 'pendiente' },
      { id: '200201', desc: 'Silla ergonómica', tipo: 'Artículo', codigo: 'CMP-ART-041', estado: 'regular', devolucion: 'observado' },
      { id: '20261106', desc: 'Teclado HP', tipo: 'Accesorio', codigo: 'CMP-ACC-106', estado: 'bueno', devolucion: 'pendiente' },
      { id: '20261107', desc: 'USB Kingston', tipo: 'Accesorio', codigo: 'CMP-ACC-107', estado: 'bueno', devolucion: 'pendiente' },
    ],
    prestamos: [
      { numero: 'ADV-2025-018', tipo: 'Préstamo', monto: 'S/. 1,500', cuotas: '3 cuotas', estado: 'active' },
    ],
    footerBanner: '🔴 Proceso incompleto — 2 bienes pendientes de devolución, 1 préstamo activo',
    dni: '45231089', cargo: 'Analista Contable', area: 'SEC. DE ECONOMIA Y FINANZAS', subarea: 'UN. DE GDTH',
    correo: 'c.perez@cmp.org.pe', sede: 'Sede Malecón de la Reserva', fechaCese: '31/03/2026',
    jefeArea: 'Karla Mendoza', correoJefe: 'k.mendoza@cmp.org.pe',
    pendientesLista: {
      bienes: ['Laptop Dell Latitude 5420 (111030)', 'Mouse Logitech M185 (111031)', 'Silla ergonómica (200201) — observada'],
      accesorios: ['Teclado HP K1500 (20261106)', 'USB Kingston DataTraveler (20261107)'],
      prestamos: ['ADV-2025-018 — Préstamo S/. 1,500 · 3 cuotas pendientes'],
    },
  },
  '77434028': {
    nombre: 'Aaron Samuel Nuñez Muñoz',
    initials: 'AN',
    meta: 'DNI: 77434028 · Cargo: Analista de Sistemas · Área: UN. DE TI',
    tags: ['🏢 Sede Malecón de la Reserva', '📌 CR III - Lima'],
    rightBadge: { label: '✓ Sin pendientes de salida', variant: 'green' },
    rightDate: null,
    counters: [
      { icon: '🖥', num: 2, label: 'Activos' },
      { icon: '📦', num: 0, label: 'Artículos', green: true },
      { icon: '🔌', num: 1, label: 'Accesorios' },
      { icon: '💰', num: 1, label: 'Préstamo pendiente' },
      { icon: '⚠', num: 0, label: 'Caja chica', green: true },
    ],
    bienes: [
      { id: 'TI-LAP-001', desc: 'Laptop HP ProBook', tipo: 'Activo', codigo: 'CMP-028301', estado: 'bueno', devolucion: 'n/a' },
      { id: 'TI-MON-002', desc: 'Monitor 24"', tipo: 'Activo', codigo: 'CMP-028302', estado: 'bueno', devolucion: 'n/a' },
      { id: 'ACC-001', desc: 'Teclado + Mouse', tipo: 'Accesorio', codigo: 'CMP-ACC-001', estado: 'bueno', devolucion: 'n/a' },
    ],
    prestamos: [
      { numero: 'ADV-2026-002', tipo: 'Préstamo', monto: 'S/. 2,500', cuotas: '5 cuotas', estado: 'revision' },
    ],
    footerBanner: null,
    dni: '77434028', cargo: 'Analista de Sistemas', area: 'SEC. DE ADMINISTRACION', subarea: 'UN. DE TI',
    correo: 'a.nunez@cmp.org.pe', sede: 'Sede Malecón de la Reserva', fechaCese: null,
    jefeArea: 'Roberto Limas', correoJefe: 'r.limas@cmp.org.pe',
    pendientesLista: { bienes: [], accesorios: [], prestamos: [] },
  },
  '32187654': {
    nombre: 'Flores Vega, Ana María',
    initials: 'FA',
    meta: 'DNI: 32187654 · Cargo: Asistente Administrativa · Área: SEC. ADMINISTRACIÓN',
    tags: ['🏢 Sede Malecón de la Reserva'],
    rightBadge: { label: '✓ Sin pendientes', variant: 'green' },
    rightDate: null,
    counters: [
      { icon: '🖥', num: 1, label: 'Activos' },
      { icon: '📦', num: 1, label: 'Artículos' },
      { icon: '🔌', num: 0, label: 'Accesorios', green: true },
      { icon: '💰', num: 0, label: 'Préstamo pendiente', green: true },
      { icon: '⚠', num: 0, label: 'Caja chica', green: true },
    ],
    bienes: [
      { id: 'TEL-001', desc: 'Teléfono IP Fanvil', tipo: 'Activo', codigo: 'ADM-TEL-002', estado: 'bueno', devolucion: 'n/a' },
      { id: 'SIL-001', desc: 'Silla ejecutiva', tipo: 'Artículo', codigo: 'ADM-ART-007', estado: 'bueno', devolucion: 'n/a' },
    ],
    prestamos: [],
    footerBanner: null,
    dni: '32187654', cargo: 'Asistente Administrativa', area: 'SEC. DE ADMINISTRACION', subarea: 'UN. DE ADMINISTRACION',
    correo: 'a.floresvega@cmp.org.pe', sede: 'Sede Malecón de la Reserva', fechaCese: null,
    jefeArea: 'Lizzetti Díaz', correoJefe: 'l.diaz@cmp.org.pe',
    pendientesLista: { bienes: [], accesorios: [], prestamos: [] },
  },
}

function devolucionCell(val: string) {
  if (val === 'pendiente') return <span className="text-gray-500">☐ Pendiente</span>
  if (val === 'observado') return <span className="text-amber-600 font-medium">⚠ Observado</span>
  return <span className="text-gray-400">—</span>
}

function prestamoBadge(estado: string) {
  if (estado === 'active') return <Badge variant="red">Activo</Badge>
  if (estado === 'revision') return <Badge variant="blue">En revisión</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

const TIPOS_RECORDATORIO = [
  { value: 'proceso_salida', label: 'Proceso de salida — todos los pendientes' },
  { value: 'devolucion_bienes', label: 'Devolución de bienes y accesorios' },
  { value: 'prestamo', label: 'Liquidación de préstamo / adelanto' },
  { value: 'urgente', label: 'Recordatorio urgente — plazo vencido' },
]

function buildMensaje(tipo: string, d: ColaboradorData): string {
  const bienesStr = [...d.pendientesLista.bienes, ...d.pendientesLista.accesorios].map(b => `• ${b}`).join('\n')
  const prestamosStr = d.pendientesLista.prestamos.map(p => `• ${p}`).join('\n')
  const total = d.pendientesLista.bienes.length + d.pendientesLista.accesorios.length + d.pendientesLista.prestamos.length
  if (tipo === 'devolucion_bienes') {
    return `Estimado/a ${d.nombre},\n\nLe recordamos que tiene bienes y/o accesorios institucionales pendientes de devolución:\n\n${bienesStr || '• Sin bienes pendientes'}\n\nPor favor, coordine la entrega con el área de Administración a la brevedad.\n\nAtentamente,\nÁrea de GDTH — CMP`
  }
  if (tipo === 'prestamo') {
    return `Estimado/a ${d.nombre},\n\nLe recordamos que tiene el siguiente préstamo/adelanto pendiente de liquidación:\n\n${prestamosStr || '• Sin pendientes registrados'}\n\nPor favor, regularice este pendiente con el área de Finanzas.\n\nAtentamente,\nÁrea de GDTH — CMP`
  }
  if (tipo === 'urgente') {
    return `Estimado/a ${d.nombre},\n\n⚠ RECORDATORIO URGENTE\n\nEl plazo para la regularización de sus pendientes institucionales ha vencido. Se requiere acción inmediata.\n\nPendientes: ${total} ítem(s) por regularizar.\n\nComuníquese con GDTH de manera urgente.\n\nAtentamente,\nÁrea de GDTH — CMP`
  }
  return `Estimado/a ${d.nombre},\n\nPor medio del presente correo, GDTH le recuerda que tiene pendientes por regularizar en el marco de su proceso de salida:\n\n${bienesStr ? bienesStr + '\n' : ''}${prestamosStr ? prestamosStr + '\n' : ''}${total === 0 ? '• Sin pendientes registrados\n' : ''}\nSolicitamos regularizar estos pendientes a la brevedad. Adjuntamos el acta detallada.\n\nAtentamente,\nÁrea de GDTH — CMP`
}

export function ConsultaDNI() {
  const [dniInput, setDniInput] = useState('45231089')
  const [result, setResult] = useState<ColaboradorData | null>(MOCK_MAP['45231089'])
  const [notFound, setNotFound] = useState(false)
  const { toast, toastState, hideToast } = useToast()

  // Modal recordatorio
  const [showRecordatorio, setShowRecordatorio] = useState(false)
  const [recCorreo, setRecCorreo] = useState('')
  const [recTipo, setRecTipo] = useState('proceso_salida')
  const [recMensaje, setRecMensaje] = useState('')
  const [recCopiaJefe, setRecCopiaJefe] = useState(true)
  const [recCanal, setRecCanal] = useState('correo')
  const [recFechaLimite, setRecFechaLimite] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })

  // Modal acta pendientes
  const [showActa, setShowActa] = useState(false)

  const handleConsultar = () => {
    const val = dniInput.trim()
    if (!val) return
    setNotFound(false)
    const found = MOCK_MAP[val]
    if (found) { setResult(found) }
    else { setResult(null); setNotFound(true) }
  }

  const handleLimpiar = () => {
    setDniInput('')
    setResult(null)
    setNotFound(false)
  }

  const openRecordatorio = () => {
    if (!result) return
    setRecCorreo(result.correo)
    setRecTipo('proceso_salida')
    setRecMensaje(buildMensaje('proceso_salida', result))
    setRecCopiaJefe(true)
    const d = new Date(); d.setDate(d.getDate() + 7)
    setRecFechaLimite(d.toISOString().split('T')[0])
    setShowRecordatorio(true)
  }

  const handleTipoChange = (tipo: string) => {
    setRecTipo(tipo)
    if (result) setRecMensaje(buildMensaje(tipo, result))
  }

  const confirmarRecordatorio = () => {
    if (!recCorreo.trim()) { toast('Ingresa el correo del colaborador'); return }
    if (!recMensaje.trim()) { toast('El mensaje no puede estar vacío'); return }
    setShowRecordatorio(false)
    const extra = recCopiaJefe && result ? ` con copia a ${result.jefeArea}` : ''
    toast(`✓ Recordatorio enviado a ${result?.nombre}${extra}`)
  }

  const hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <PageHeader
        title="Consulta por DNI — Panel GDTH"
        subtitle="Consulta bienes, préstamos y pendientes por colaborador"
        breadcrumb={<>Gestión de Recursos &rsaquo; Consulta por DNI</>}
      />

      {/* Search card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">DNI DEL COLABORADOR</div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={dniInput}
            onChange={e => setDniInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
            onKeyDown={e => { if (e.key === 'Enter') handleConsultar() }}
            placeholder="Ingrese DNI..."
            style={{ maxWidth: 200 }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
          />
          <Button size="sm" onClick={handleConsultar}>🔍 Consultar</Button>
          <Button variant="gray" size="sm" onClick={handleLimpiar}>Limpiar</Button>
          <Button variant="outline" size="sm" onClick={() => { if (result) { toast('Preparando PDF del colaborador...'); setTimeout(() => window.print(), 400) } else toast('Primero consulta un colaborador') }}>📄 Generar PDF</Button>
          <Button variant="gray" size="sm" onClick={() => { if (result) window.print(); else toast('Primero consulta un colaborador') }}>🖨 Imprimir</Button>
        </div>
        <div className="text-[11px] text-gray-400 mt-2">
          DNIs de prueba: <strong>45231089</strong> · <strong>77434028</strong> · <strong>32187654</strong>
        </div>
        {notFound && (
          <div className="mt-2 text-[12px] text-red-600 font-medium">
            Colaborador no encontrado para DNI: {dniInput}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-gradient-to-r from-[#4A1272] to-[#6B21A8] rounded-xl p-4 text-white mb-4">
            <div className="flex justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0">
                  {result.initials}
                </div>
                <div>
                  <div className="text-[15px] font-bold">{result.nombre}</div>
                  <div className="text-[11px] text-white/75 mt-0.5">{result.meta}</div>
                  <div className="flex gap-2 flex-wrap mt-1.5">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {result.rightDate && (
                  <div className="text-[10px] text-white/70">Fecha de cese: {result.rightDate}</div>
                )}
                <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${result.rightBadge.variant === 'green' ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' : 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30'}`}>
                  {result.rightBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Counters row */}
          <div className="flex gap-3 mb-4">
            {result.counters.map((c, i) => (
              <div key={i} className="flex-1 bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-[18px] mb-1">{c.icon}</div>
                <div className="text-[22px] font-bold" style={{ color: c.green ? '#22C55E' : '#6B21A8' }}>{c.num}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Bienes Asignados */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3">
            <div className="bg-[#F0FDF9] border-b border-[#D1FAE5] px-4 py-2.5 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#065F46]">📦 Bienes Asignados</span>
              <span className="text-[10px] bg-[#0DA882] text-white px-2 py-0.5 rounded-full font-medium">⚡ Activos y Bienes</span>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['ID', 'Descripción', 'Tipo', 'Código QR', 'Estado', 'Devolución'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.bienes.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-400 italic text-[12px]">Sin bienes asignados para este colaborador.</td></tr>
                )}
                {result.bienes.map(b => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500">{b.id}</td>
                    <td className="px-4 py-2.5 font-medium text-[#1E1B4B]">{b.desc}</td>
                    <td className="px-4 py-2.5 text-gray-500">{b.tipo}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500">{b.codigo}</td>
                    <td className="px-4 py-2.5">
                      {b.estado === 'bueno' && <Badge variant="green">Bueno</Badge>}
                      {b.estado === 'regular' && <Badge variant="yellow">Regular</Badge>}
                    </td>
                    <td className="px-4 py-2.5">{devolucionCell(b.devolucion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pendientes Económicos */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3">
            <div className="bg-[#F5F3FF] border-b border-[#DDD6FE] px-4 py-2.5">
              <span className="text-[13px] font-bold text-[#4C1D95]">💰 Pendientes Económicos</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-[12px] font-bold text-gray-700 mb-2">Préstamos y Adelantos</div>
              {result.prestamos.length > 0 ? (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['N°', 'Tipo', 'Monto S/.', 'Cuotas pendientes', 'Estado'].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 text-[11px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.prestamos.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-[11px] text-[#6B21A8]">{p.numero}</td>
                        <td className="px-3 py-2 text-gray-600">{p.tipo}</td>
                        <td className="px-3 py-2 font-semibold">{p.monto}</td>
                        <td className="px-3 py-2 text-gray-500">{p.cuotas}</td>
                        <td className="px-3 py-2">{prestamoBadge(p.estado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[12px] italic text-gray-400 py-2">Sin préstamos ni adelantos pendientes para este colaborador.</p>
              )}
              <hr className="border-gray-100 my-3" />
              <div className="text-[12px] font-bold text-gray-700 mb-2">Caja Chica</div>
              <p className="text-[12px] italic text-gray-400 py-2">Sin asignación de caja chica para este colaborador.</p>
            </div>
          </div>

          {/* Footer panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {result.footerBanner && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-[12px] text-amber-800 mb-3 font-medium">
                {result.footerBanner}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowActa(true)}>📄 Generar acta de pendientes</Button>
              <Button variant="gray" size="sm" disabled={!result.footerBanner} onClick={() => toast('Cerrando proceso de salida...')}>✔ Cerrar proceso de salida</Button>
              <Button size="sm" onClick={openRecordatorio}>📤 Enviar recordatorio al colaborador</Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] italic text-gray-400 mt-3">
        📌 Nota de diseño: Datos consumidos vía API REST desde Activos y Bienes (.NET 9) — GET /api/bienes/&#123;dni&#125; — Autenticación: token inter-servicio
      </p>

      {/* ── Modal Recordatorio ── */}
      <Modal
        open={showRecordatorio && !!result}
        onClose={() => setShowRecordatorio(false)}
        title="Enviar Recordatorio al Colaborador"
        subtitle="Notificación formal de pendientes — generado por GDTH"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowRecordatorio(false)}>Cancelar</Button>
            <Button size="sm" onClick={confirmarRecordatorio}>📤 Confirmar envío</Button>
          </>
        }
      >
        {result && (
          <div className="space-y-4">
            {/* Datos colaborador */}
            <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#6B21A8] rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                  {result.initials}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#1E1B4B]">{result.nombre}</div>
                  <div className="text-[11px] text-gray-500">{result.cargo} · {result.subarea}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div><span className="text-gray-500">DNI:</span> <strong>{result.dni}</strong></div>
                <div><span className="text-gray-500">Sede:</span> {result.sede}</div>
                <div><span className="text-gray-500">Área:</span> {result.area}</div>
                <div><span className="text-gray-500">Sub-Área:</span> {result.subarea}</div>
              </div>
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Correo electrónico <span className="text-[10px] text-gray-400">(editable)</span></label>
                <input
                  type="email"
                  value={recCorreo}
                  onChange={e => setRecCorreo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
            </div>

            {/* Tipo de recordatorio */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipo de recordatorio <span className="text-red-500">*</span></label>
              <select
                value={recTipo}
                onChange={e => handleTipoChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
              >
                {TIPOS_RECORDATORIO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Pendientes banner */}
            {(() => {
              const total = result.pendientesLista.bienes.length + result.pendientesLista.accesorios.length + result.pendientesLista.prestamos.length
              return total > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[12px] text-amber-800">
                  ⚠ <strong>Pendientes detectados:</strong>{' '}
                  {[
                    result.pendientesLista.bienes.length ? `${result.pendientesLista.bienes.length} bien(es)` : '',
                    result.pendientesLista.accesorios.length ? `${result.pendientesLista.accesorios.length} accesorio(s)` : '',
                    result.pendientesLista.prestamos.length ? `${result.pendientesLista.prestamos.length} préstamo(s)` : '',
                  ].filter(Boolean).join(' · ')}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-[12px] text-emerald-700">
                  ✓ <strong>Sin pendientes registrados</strong> — el colaborador está al día.
                </div>
              )
            })()}

            {/* Copia al jefe */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
                <input
                  type="checkbox"
                  checked={recCopiaJefe}
                  onChange={e => setRecCopiaJefe(e.target.checked)}
                  className="accent-[#6B21A8]"
                />
                Enviar copia al jefe de área
              </label>
              {recCopiaJefe && (
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[12px] flex justify-between">
                  <span className="font-semibold text-[#1E1B4B]">{result.jefeArea}</span>
                  <span className="text-gray-400">{result.correoJefe}</span>
                </div>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mensaje del recordatorio <span className="text-red-500">*</span></label>
              <textarea
                value={recMensaje}
                onChange={e => setRecMensaje(e.target.value)}
                rows={7}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
              />
              <div className="text-[11px] text-gray-400 mt-1">El correo incluirá el listado de pendientes adjunto en PDF.</div>
            </div>

            {/* Fecha límite + canal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Fecha límite de respuesta</label>
                <input
                  type="date"
                  value={recFechaLimite}
                  onChange={e => setRecFechaLimite(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Canal adicional</label>
                <select
                  value={recCanal}
                  onChange={e => setRecCanal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                >
                  <option value="correo">Solo correo electrónico</option>
                  <option value="correo_teams">Correo + Teams</option>
                  <option value="correo_whatsapp">Correo + WhatsApp</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal Acta de Pendientes ── */}
      <Modal
        open={showActa && !!result}
        onClose={() => setShowActa(false)}
        title="Acta de Pendientes Institucionales"
        subtitle={`Generado el ${hoy} · Uso interno GDTH`}
        maxWidth="max-w-3xl"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowActa(false)}>Cerrar</Button>
            <Button variant="outline" size="sm" onClick={() => { toast('Imprimiendo acta...'); window.print() }}>🖨 Imprimir</Button>
            <Button size="sm" onClick={() => { toast('Generando PDF del acta...'); window.print() }}>📄 Descargar PDF</Button>
          </>
        }
      >
        {result && (() => {
          const total = result.pendientesLista.bienes.length + result.pendientesLista.accesorios.length + result.pendientesLista.prestamos.length
          const renderItems = (items: string[], empty: string) => items.length > 0
            ? items.map((item, i) => (
                <tr key={i}>
                  <td className="border border-gray-200 px-3 py-2 text-[12px]">• {item}</td>
                  <td className="border border-gray-200 px-3 py-2 text-[12px] text-amber-600 text-center w-28">Pendiente</td>
                </tr>
              ))
            : [<tr key="empty"><td colSpan={2} className="border border-gray-200 px-3 py-2 text-[12px] text-gray-400 italic text-center">{empty}</td></tr>]

          return (
            <div className="space-y-4">
              {/* Encabezado */}
              <div className="text-center border-b-2 border-[#6B21A8] pb-3">
                <div className="text-[11px] font-bold tracking-widest text-[#6B21A8] uppercase">Colegio Médico del Perú — GDTH</div>
                <div className="text-[16px] font-bold text-[#1E1B4B] mt-1">Acta de Pendientes Institucionales</div>
              </div>

              {/* Datos colaborador */}
              <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg p-3">
                <div className="text-[11px] font-bold text-[#6B21A8] uppercase tracking-wide mb-2">Datos del Colaborador</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                  <div><span className="text-gray-500">Nombre:</span> <strong>{result.nombre}</strong></div>
                  <div><span className="text-gray-500">DNI:</span> <strong>{result.dni}</strong></div>
                  <div><span className="text-gray-500">Cargo:</span> {result.cargo}</div>
                  <div><span className="text-gray-500">Correo:</span> {result.correo}</div>
                  <div><span className="text-gray-500">Área:</span> {result.area}</div>
                  <div><span className="text-gray-500">Sub-Área:</span> {result.subarea}</div>
                  <div><span className="text-gray-500">Sede:</span> {result.sede}</div>
                  {result.fechaCese && <div><span className="text-gray-500">Fecha cese:</span> <strong className="text-red-600">{result.fechaCese}</strong></div>}
                </div>
              </div>

              {/* Resumen */}
              <div className={`rounded-lg border px-4 py-2.5 flex items-center gap-3 ${total > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <span className="text-[20px]">{total > 0 ? '⚠' : '✓'}</span>
                <div>
                  <div className={`text-[13px] font-bold ${total > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {total > 0 ? `${total} ítem(s) pendientes de regularización` : 'Sin pendientes — colaborador al día'}
                  </div>
                  <div className="text-[11px] text-gray-500">Estado global del proceso</div>
                </div>
              </div>

              {/* Secciones */}
              {[
                { title: '📦 Bienes Institucionales', items: result.pendientesLista.bienes, empty: 'Sin bienes pendientes' },
                { title: '🔌 Accesorios Institucionales', items: result.pendientesLista.accesorios, empty: 'Sin accesorios pendientes' },
                { title: '💰 Préstamos y Adelantos', items: result.pendientesLista.prestamos, empty: 'Sin préstamos ni adelantos pendientes' },
              ].map(sec => (
                <div key={sec.title}>
                  <div className="text-[12px] font-bold text-gray-700 bg-gray-50 rounded-t-lg border border-gray-200 px-3 py-2 flex justify-between items-center">
                    <span>{sec.title}</span>
                    <span className={`text-[11px] font-normal ${sec.items.length ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {sec.items.length ? `${sec.items.length} pendiente(s)` : '✓ Al día'}
                    </span>
                  </div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-3 py-1.5 text-left text-[11px] text-gray-500 font-semibold">Ítem</th>
                        <th className="border border-gray-200 px-3 py-1.5 text-center text-[11px] text-gray-500 font-semibold w-28">Estado</th>
                      </tr>
                    </thead>
                    <tbody>{renderItems(sec.items, sec.empty)}</tbody>
                  </table>
                </div>
              ))}

              {/* Caja Chica */}
              <div>
                <div className="text-[12px] font-bold text-gray-700 bg-gray-50 rounded-t-lg border border-gray-200 px-3 py-2 flex justify-between">
                  <span>🏧 Caja Chica</span>
                  <span className="text-[11px] font-normal text-emerald-600">✓ No designado</span>
                </div>
                <div className="border border-t-0 border-gray-200 rounded-b-lg px-3 py-2 text-[12px] text-gray-400 italic">
                  No figura como responsable de Caja Chica. No aplica proceso de liquidación.
                </div>
              </div>

              {/* Firmas */}
              <div className="border border-gray-200 rounded-lg p-4 mt-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-4">Firmas de Conformidad</div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  {[
                    { nombre: result.nombre, cargo: result.cargo, rol: 'Colaborador' },
                    { nombre: result.jefeArea, cargo: 'Jefe de Área', rol: result.area },
                    { nombre: 'Responsable GDTH', cargo: 'Gestión del Talento Humano', rol: 'CMP' },
                  ].map((f, i) => (
                    <div key={i}>
                      <div className="h-10" />
                      <div className="border-t border-gray-400 pt-2">
                        <div className="text-[11px] font-semibold text-gray-700">{f.nombre}</div>
                        <div className="text-[10px] text-gray-400">{f.cargo}</div>
                        <div className="text-[10px] text-gray-400">{f.rol}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400">
                Documento generado por el Sistema de Gestión Interna — CMP · {hoy} · Uso interno
              </div>
            </div>
          )
        })()}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
