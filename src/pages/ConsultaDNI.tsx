import { useState } from 'react'
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { MetricCard } from '../components/ui/MetricCard'

const MOCK_COLABORADOR = {
  nombres: 'NUÑEZ MUÑOZ, Aaron Samuel',
  dni: '77434028',
  area: 'UN. DE TI',
  puesto: 'Analista de Sistemas',
  tipo_contrato: 'CAS',
  fecha_ingreso: '01/06/2023',
  estado: 'Activo',
  correo: 'a.nunez@cmp.pe',
  telefono: '+51 987 654 321',
  bienes: [
    { bien: 'Laptop HP ProBook', codigo: 'TI-LAP-001', fecha: '15/06/2023', estado: 'Activo' },
    { bien: 'Monitor 24"', codigo: 'TI-MON-002', fecha: '20/07/2023', estado: 'Activo' },
  ],
  adelantos: [
    { numero: 'ADV-2026-001', tipo: 'Adelanto de sueldo', monto: 'S/. 800', fecha: '01/03/2026', estado: 'Aprobado' },
    { numero: 'ADV-2026-003', tipo: 'Adelanto de sueldo', monto: 'S/. 400', fecha: '18/03/2026', estado: 'Rechazado' },
  ],
  permisos: [
    { tipo: 'Permiso médico', fecha_inicio: '10/02/2026', fecha_fin: '10/02/2026', estado: 'Aprobado' },
  ],
  contrato: {
    tipo: 'CAS',
    fecha_inicio: '01/06/2023',
    fecha_fin: '31/12/2026',
    modalidad: 'Presencial',
    jornada: '8 horas diarias',
    remuneracion: 'S/. 3,200',
  },
}

interface SectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="text-[14px] font-bold text-[#1E1B4B]">{title}</div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  )
}

export function ConsultaDNI() {
  const [dni, setDni] = useState('')
  const [result, setResult] = useState<typeof MOCK_COLABORADOR | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleConsultar = () => {
    if (!dni.trim()) return
    setLoading(true)
    setNotFound(false)
    setResult(null)
    setTimeout(() => {
      if (dni === '77434028') {
        setResult(MOCK_COLABORADOR)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }, 800)
  }

  const handleLimpiar = () => {
    setDni('')
    setResult(null)
    setNotFound(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConsultar()
  }

  return (
    <div>
      <PageHeader
        title="Consulta por DNI"
        subtitle="Panel GDTH — Información integral del colaborador"
        breadcrumb={<>Gestión de Recursos &rsaquo; Consulta por DNI (GDTH)</>}
      />

      {/* Search card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <div className="text-[13px] font-semibold text-gray-700 mb-3">Buscar colaborador</div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={dni}
              onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese el DNI (8 dígitos)..."
              maxLength={8}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
            />
          </div>
          <Button size="sm" onClick={handleConsultar} disabled={dni.length < 8 || loading}>
            <Search size={13} /> {loading ? 'Buscando...' : 'Consultar'}
          </Button>
          {(result || notFound) && (
            <Button variant="ghost" size="sm" onClick={handleLimpiar}>
              <X size={13} /> Limpiar
            </Button>
          )}
        </div>
        <div className="text-[11px] text-gray-400 mt-2">Prueba con DNI: <span className="font-mono font-semibold text-[#6B21A8]">77434028</span></div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Not found */}
      {notFound && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <div className="text-[15px] font-semibold text-gray-700 mb-1">No se encontró el colaborador</div>
          <div className="text-[13px] text-gray-400">El DNI <span className="font-mono font-semibold">{dni}</span> no está registrado en el sistema.</div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-gradient-to-r from-[#6B21A8] to-[#4A1272] rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {result.nombres.split(',')[1]?.trim().charAt(0) ?? 'A'}
              </div>
              <div className="flex-1">
                <div className="text-[20px] font-bold">{result.nombres}</div>
                <div className="text-white/80 text-[14px] mt-0.5">{result.puesto}</div>
                <div className="text-white/65 text-[13px]">{result.area}</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-full">DNI: {result.dni}</span>
                  <span className="bg-emerald-500/80 text-white text-[11px] px-2.5 py-1 rounded-full">{result.estado}</span>
                  <span className="bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-full">Contrato: {result.tipo_contrato}</span>
                  <span className="bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-full">Ingreso: {result.fecha_ingreso}</span>
                </div>
              </div>
              <div className="text-right text-[12px] text-white/65">
                <div>{result.correo}</div>
                <div className="mt-0.5">{result.telefono}</div>
              </div>
            </div>
          </div>

          {/* Counter cards */}
          <div className="flex gap-3">
            <MetricCard icon="💻" value={String(result.bienes.length)} label="Bienes asignados" />
            <MetricCard icon="📦" value="0" label="Préstamos activos" />
            <MetricCard icon="💰" value={String(result.adelantos.length)} label="Préstamos/Adelantos" />
            <MetricCard icon="📋" value={String(result.permisos.length)} label="Permisos vigentes" />
          </div>

          {/* Bienes Asignados */}
          <Section title="Bienes Asignados">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Bien', 'Código', 'Fecha asignación', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.bienes.map((b, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1E1B4B]">{b.bien}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{b.codigo}</td>
                    <td className="px-4 py-3 text-gray-500">{b.fecha}</td>
                    <td className="px-4 py-3"><Badge variant="green">{b.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Historial Préstamos y Adelantos */}
          <Section title="Historial Préstamos y Adelantos">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['N° Solicitud', 'Tipo', 'Monto', 'Fecha', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.adelantos.map((a, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8] font-medium">{a.numero}</td>
                    <td className="px-4 py-3 text-gray-700">{a.tipo}</td>
                    <td className="px-4 py-3 font-semibold text-[#1E1B4B]">{a.monto}</td>
                    <td className="px-4 py-3 text-gray-500">{a.fecha}</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.estado === 'Aprobado' ? 'green' : 'red'}>{a.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Permisos y Licencias */}
          <Section title="Permisos y Licencias">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Tipo', 'Fecha inicio', 'Fecha fin', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-600 text-[12px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.permisos.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[#1E1B4B]">{p.tipo}</td>
                    <td className="px-4 py-3 text-gray-500">{p.fecha_inicio}</td>
                    <td className="px-4 py-3 text-gray-500">{p.fecha_fin}</td>
                    <td className="px-4 py-3"><Badge variant="green">{p.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Información de Contrato */}
          <Section title="Información de Contrato">
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Tipo de contrato', value: result.contrato.tipo },
                { label: 'Fecha de inicio', value: result.contrato.fecha_inicio },
                { label: 'Fecha de fin', value: result.contrato.fecha_fin },
                { label: 'Modalidad', value: result.contrato.modalidad },
                { label: 'Jornada', value: result.contrato.jornada },
                { label: 'Remuneración', value: result.contrato.remuneracion },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F8F6FB] rounded-lg p-3">
                  <div className="text-[11px] text-gray-400 font-medium mb-0.5">{label}</div>
                  <div className="text-[13px] font-semibold text-[#1E1B4B]">{value}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
