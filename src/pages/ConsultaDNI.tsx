import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
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

export function ConsultaDNI() {
  const [dniInput, setDniInput] = useState('45231089')
  const [result, setResult] = useState<ColaboradorData | null>(MOCK_MAP['45231089'])
  const [notFound, setNotFound] = useState(false)
  const { toast, toastState, hideToast } = useToast()

  const handleConsultar = () => {
    const val = dniInput.trim()
    if (!val) return
    setNotFound(false)
    const found = MOCK_MAP[val]
    if (found) {
      setResult(found)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }

  const handleLimpiar = () => {
    setDniInput('')
    setResult(null)
    setNotFound(false)
  }

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
          <Button variant="outline" size="sm" onClick={() => toast('Generando PDF...')}>📄 Generar PDF</Button>
          <Button variant="gray" size="sm" onClick={() => toast('Imprimiendo...')}>🖨 Imprimir</Button>
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
              <Button variant="outline" size="sm" onClick={() => toast('Generando acta de pendientes...')}>📄 Generar acta de pendientes</Button>
              <Button variant="gray" size="sm" disabled={!result.footerBanner} onClick={() => toast('Cerrando proceso de salida...')}>✔ Cerrar proceso de salida</Button>
              <Button variant="gray" size="sm" onClick={() => toast('Recordatorio enviado.')}>📤 Enviar recordatorio al colaborador</Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] italic text-gray-400 mt-3">
        📌 Nota de diseño: Datos consumidos vía API REST desde Activos y Bienes (.NET 9) — GET /api/bienes/&#123;dni&#125; — Autenticación: token inter-servicio
      </p>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
