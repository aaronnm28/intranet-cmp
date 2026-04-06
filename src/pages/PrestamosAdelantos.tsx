import { useState, useEffect } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { Stepper } from '../components/ui/Stepper'
import { solicitudesAdelantoService } from '../services/db'
import type { SolicitudAdelanto } from '../types'

interface MisSolicitudRow {
  id: string
  numero: string
  tipo: string
  monto: string
  fecha: string
  estado: string
  proximo: string
}

const MIS_SOLICITUDES: MisSolicitudRow[] = [
  { id: '1', numero: 'ADV-2026-001', tipo: 'Adelanto de sueldo', monto: 'S/. 800', fecha: '01/03/2026', estado: 'aprobado', proximo: 'Desembolso por Contabilidad' },
  { id: '2', numero: 'ADV-2026-002', tipo: 'Préstamo personal', monto: 'S/. 2,500', fecha: '10/03/2026', estado: 'en_revision_bienestar', proximo: 'Evaluación Bienestar' },
  { id: '3', numero: 'ADV-2026-003', tipo: 'Adelanto de sueldo', monto: 'S/. 400', fecha: '18/03/2026', estado: 'rechazado', proximo: '—' },
]

const HISTORIAL_DATA: MisSolicitudRow[] = [
  { id: '1', numero: 'ADV-2026-001', tipo: 'Adelanto de sueldo', monto: 'S/. 800', fecha: '01/03/2026', estado: 'aprobado', proximo: 'Desembolso por Contabilidad' },
]

const MATRIZ_DATA = [
  { n: 1, area: 'UN. DE TI', puesto: 'Analista Sistemas', nombre: 'NUÑEZ MUÑOZ, Aaron Samuel', dni: '77434028', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 800', fecha: '01/03/2026', cuotas: '2', mes_descuento: 'Mar-26 / Abr-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '05/03/2026', documento: 'ver' },
  { n: 2, area: 'SEC. DE ADMINISTRACION', puesto: 'Secretaria Administrativa', nombre: 'DÍAZ ESPINOZA, Lizzetti', dni: '45123890', tipo: 'prestamo', motivo: 'SALUD', monto: 'S/ 2,500', fecha: '10/03/2026', cuotas: '5', mes_descuento: 'Abr-26 a Ago-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: 'pendiente', documento: 'ver' },
  { n: 3, area: 'UN. DE TI', puesto: 'Analista Sistemas', nombre: 'NUÑEZ MUÑOZ, Aaron Samuel', dni: '77434028', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 400', fecha: '18/03/2026', cuotas: '1', mes_descuento: 'Abr-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: 'rechazado', documento: 'ver' },
  { n: 4, area: 'UN. DE GDTH', puesto: 'Analista RR.HH.', nombre: 'TORRES HUAMÁN, María', dni: '32145678', tipo: 'adelanto', motivo: 'FAMILIARES', monto: 'S/ 1,200', fecha: '15/02/2026', cuotas: '1', mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: 'en_proceso', documento: 'ver' },
  { n: 5, area: 'SEC. DE ECONOMIA Y FINANZAS', puesto: 'Economista', nombre: 'SALAS QUISPE, Pedro', dni: '56789012', tipo: 'prestamo', motivo: 'VIVIENDA', monto: 'S/ 3,000', fecha: '05/01/2026', cuotas: '6', mes_descuento: 'Feb-26 a Jul-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '10/01/2026', documento: '—' },
  { n: 6, area: 'FOSEMED', puesto: 'Técnica Enfermería', nombre: 'VEGA RÍOS, Carmen', dni: '67890123', tipo: 'adelanto', motivo: 'SALUD', monto: 'S/ 600', fecha: '20/02/2026', cuotas: '1', mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '25/02/2026', documento: '—' },
]

function estadoBadge(estado: string) {
  if (estado === 'aprobado') return <Badge variant="green">Aprobado</Badge>
  if (estado === 'en_revision_bienestar') return <Badge variant="blue">En revisión — Bienestar</Badge>
  if (estado === 'rechazado') return <Badge variant="red">Rechazado</Badge>
  if (estado === 'pendiente_vob_gdth') return <Badge variant="yellow">Pendiente V°B° GDTH</Badge>
  if (estado === 'en_evaluacion') return <Badge variant="blue">En evaluación</Badge>
  return <Badge variant="gray">{estado}</Badge>
}

function stepperForSolicitud(estado: string) {
  const idx = ({ en_revision_bienestar: 1, en_revision_gdth: 2, aprobado: 4, rechazado: 2 } as Record<string, number>)[estado] ?? 0
  return [
    { label: 'Solicitud', status: (idx >= 1 ? 'done' : 'current') as 'done' | 'current' | 'pending' },
    { label: 'Bienestar', status: (idx === 1 ? 'current' : idx > 1 ? 'done' : 'pending') as 'done' | 'current' | 'pending' },
    { label: 'Jefatura GDTH', status: (idx === 2 ? 'current' : idx > 2 ? 'done' : 'pending') as 'done' | 'current' | 'pending' },
    { label: 'Sec. Administ.', status: (idx === 3 ? 'current' : idx > 3 ? 'done' : 'pending') as 'done' | 'current' | 'pending' },
    { label: 'Contabilidad', status: (idx >= 4 ? 'done' : 'pending') as 'done' | 'current' | 'pending' },
  ]
}

function calcularCuotas(monto: number, numCuotas: number): Array<{ cuota: number; mes: string; montoStr: string }> {
  const montoCuota = monto / numCuotas
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const hoy = new Date()
  return Array.from({ length: numCuotas }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i + 1, 1)
    return {
      cuota: i + 1,
      mes: `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`,
      montoStr: `S/. ${montoCuota.toFixed(2)}`,
    }
  })
}

export function PrestamosAdelantos() {
  const [, setData] = useState<SolicitudAdelanto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mis_solicitudes')
  const [gdthSubTab, setGdthSubTab] = useState<'solicitudes' | 'matriz'>('solicitudes')
  const [bienestarSubTab, setBienestarSubTab] = useState<'solicitudes' | 'historial'>('solicitudes')
  const [showNueva, setShowNueva] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [selectedRow, setSelectedRow] = useState<MisSolicitudRow | null>(null)
  const { toast, toastState, hideToast } = useToast()

  // Nueva solicitud form state
  const [tipoSolicitud, setTipoSolicitud] = useState<'adelanto' | 'prestamo'>('adelanto')
  const [domicilio, setDomicilio] = useState('')
  const [montoSolicitud, setMontoSolicitud] = useState('')
  const [motivoSolicitud, setMotivoSolicitud] = useState('Personales')
  const [justificacionSolicitud, setJustificacionSolicitud] = useState('')
  const [numCuotas, setNumCuotas] = useState('')
  const [firmaStates, setFirmaStates] = useState<Record<number, string>>({ 0: '', 1: '' })
  const [firmaModo, setFirmaModo] = useState<Record<number, boolean>>({ 0: false, 1: false })

  const cuotasData = tipoSolicitud === 'prestamo' && parseFloat(montoSolicitud) > 0 && parseInt(numCuotas) > 0
    ? calcularCuotas(parseFloat(montoSolicitud), parseInt(numCuotas))
    : []

  useEffect(() => {
    solicitudesAdelantoService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as SolicitudAdelanto[]); else setData([]) })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const handleEnviarSolicitud = () => {
    toast('Solicitud enviada correctamente.')
    setShowNueva(false)
    setDomicilio('')
    setMontoSolicitud('')
    setJustificacionSolicitud('')
    setNumCuotas('')
    setFirmaStates({ 0: '', 1: '' })
    setFirmaModo({ 0: false, 1: false })
  }

  const tabs = [
    { id: 'mis_solicitudes', label: 'Mis Solicitudes' },
    { id: 'bandeja_gdth', label: 'Bandeja GDTH' },
    { id: 'bandeja_bienestar', label: 'Bandeja Bienestar' },
    { id: 'historial', label: 'Historial' },
  ]

  const misSolicitudesTable = (rows: MisSolicitudRow[]) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['N°', 'Tipo', 'Monto S/.', 'Fecha solicitud', 'Estado flujo', 'Próximo paso', 'Acciones'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={7} className="text-center py-10 text-gray-400">No hay registros</td></tr>
          )}
          {rows.map((r, idx) => (
            <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
              <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8] font-medium">{r.numero}</td>
              <td className="px-4 py-3 text-[#1E1B4B]">{r.tipo}</td>
              <td className="px-4 py-3 font-semibold">{r.monto}</td>
              <td className="px-4 py-3 text-gray-500">{r.fecha}</td>
              <td className="px-4 py-3">{estadoBadge(r.estado)}</td>
              <td className="px-4 py-3 text-gray-500 text-[12px]">{r.proximo}</td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="xs" onClick={() => { setSelectedRow(r); setShowDetalle(true) }}>Ver detalle</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Préstamos y Adelantos de Sueldo"
        subtitle="Gestión de solicitudes de adelantos y préstamos del personal"
        breadcrumb={<>Gestión de Recursos &rsaquo; Préstamos y Adelantos</>}
        actions={<Button size="sm" onClick={() => setShowNueva(true)}>+ Nueva Solicitud</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#6B21A8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {/* TAB: Mis Solicitudes */}
          {activeTab === 'mis_solicitudes' && (
            <div>
              {misSolicitudesTable(MIS_SOLICITUDES)}

              {/* Stepper tracking card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold text-[#6B21A8]">ADV-2026-002 — Seguimiento de flujo</span>
                  <Badge variant="blue">En revisión — Bienestar</Badge>
                </div>
                <Stepper steps={[
                  { label: 'Solicitud', status: 'done' },
                  { label: 'Bienestar', status: 'current' },
                  { label: 'Jefatura GDTH', status: 'pending' },
                  { label: 'Sec. Administ.', status: 'pending' },
                  { label: 'Contabilidad', status: 'pending' },
                ]} />
                <div className="text-[11px] text-gray-400 mt-2">Última actualización: Solicitud recibida por Bienestar — 11/03/2026</div>
              </div>
            </div>
          )}

          {/* TAB: Bandeja GDTH */}
          {activeTab === 'bandeja_gdth' && (
            <div>
              <div className="flex gap-2 mb-4">
                {[{ id: 'solicitudes', label: '📋 Solicitudes' }, { id: 'matriz', label: '📊 Matriz Préstamos / Adelantos' }].map(st => (
                  <button key={st.id} onClick={() => setGdthSubTab(st.id as 'solicitudes' | 'matriz')}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors
                      ${gdthSubTab === st.id ? 'bg-[#6B21A8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {st.label}
                  </button>
                ))}
              </div>

              {gdthSubTab === 'solicitudes' && (
                <div>
                  <div className="text-[13px] font-semibold text-[#1E1B4B] mb-1">Solicitudes pendientes de aprobación GDTH</div>
                  <div className="text-[12px] text-gray-400 mb-3">Solicitudes que han pasado evaluación de Bienestar y requieren V°B° de Jefatura GDTH</div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {['N°', 'Colaborador', 'Área', 'Tipo', 'Monto S/.', 'F. Solicitud', 'Estado', 'Evaluado por Bienestar', 'Acciones'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8]">ADV-2026-004</td>
                          <td className="px-4 py-3 text-[#1E1B4B]">Torres Huamán, María</td>
                          <td className="px-4 py-3 text-gray-500 text-[12px]">UN. DE GDTH</td>
                          <td className="px-4 py-3 text-gray-600">Adelanto de sueldo</td>
                          <td className="px-4 py-3 font-semibold">S/. 1,200</td>
                          <td className="px-4 py-3 text-gray-500">15/02/2026</td>
                          <td className="px-4 py-3"><Badge variant="yellow">Pendiente V°B° GDTH</Badge></td>
                          <td className="px-4 py-3 text-gray-500 text-[12px]">Bienestar — 18/02/2026</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <Button variant="ghost" size="xs" onClick={() => { setSelectedRow({ id: 'gdth-1', numero: 'ADV-2026-004', tipo: 'Adelanto de sueldo', monto: 'S/. 1,200', fecha: '15/02/2026', estado: 'pendiente_vob_gdth', proximo: 'V°B° GDTH' }); setShowDetalle(true) }}>Ver detalle</Button>
                              <Button size="xs" onClick={() => toast('Solicitud aprobada.')}>✔ Aprobar</Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {gdthSubTab === 'matriz' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold text-[#1E1B4B]">Matriz Préstamos / Adelantos 2026</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">📥 Exportar Excel</Button>
                      <Button variant="gray" size="sm">📄 Imprimir</Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr>
                          <th colSpan={14} className="bg-[#6B21A8] text-white text-center text-[12px] py-2 px-4">
                            PRÉSTAMOS / ADELANTOS DE SUELDO — 2026
                          </th>
                        </tr>
                        <tr className="bg-[#4A1272] text-white text-[10px]">
                          {['N°', 'ÁREA', 'PUESTO', 'APELLIDOS Y NOMBRES', 'DNI', 'TIPO', 'MOTIVO', 'MONTO', 'F. SOLICITUD', 'CUOTAS', 'MES DESCUENTO', 'APRUEBA', 'ABONO FECHA', 'DOCUMENTO'].map(h => (
                            <th key={h} className="text-left px-3 py-2 whitespace-nowrap font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MATRIZ_DATA.map((r, idx) => (
                          <tr key={r.n} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}>
                            <td className="px-3 py-2 text-gray-500">{r.n}</td>
                            <td className="px-3 py-2 text-[#1E1B4B] whitespace-nowrap">{r.area}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.puesto}</td>
                            <td className="px-3 py-2 font-medium text-[#1E1B4B] whitespace-nowrap">{r.nombre}</td>
                            <td className="px-3 py-2 font-mono text-gray-500">{r.dni}</td>
                            <td className="px-3 py-2">
                              {r.tipo === 'adelanto'
                                ? <Badge variant="purple">ADELANTO DE SUELDO</Badge>
                                : <Badge variant="blue">PRÉSTAMO PERSONAL</Badge>}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{r.motivo}</td>
                            <td className="px-3 py-2 font-semibold whitespace-nowrap">{r.monto}</td>
                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.fecha}</td>
                            <td className="px-3 py-2 text-center">{r.cuotas}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.mes_descuento}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.aprueba}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {r.abono_fecha === 'pendiente' && <span className="italic text-gray-400">Pendiente</span>}
                              {r.abono_fecha === 'rechazado' && <span className="font-bold text-red-600">Rechazado</span>}
                              {r.abono_fecha === 'en_proceso' && <span className="italic text-amber-500">En proceso</span>}
                              {!['pendiente', 'rechazado', 'en_proceso'].includes(r.abono_fecha) && <span>{r.abono_fecha}</span>}
                            </td>
                            <td className="px-3 py-2">
                              {r.documento === 'ver'
                                ? <Button variant="ghost" size="xs" onClick={() => toast('Abriendo detalle...')}>Ver</Button>
                                : <span className="text-gray-400">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Bandeja Bienestar */}
          {activeTab === 'bandeja_bienestar' && (
            <div>
              <div className="flex gap-2 mb-4">
                {[{ id: 'solicitudes', label: '📋 Solicitudes' }, { id: 'historial', label: '📊 Historial Evaluaciones' }].map(st => (
                  <button key={st.id} onClick={() => setBienestarSubTab(st.id as 'solicitudes' | 'historial')}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors
                      ${bienestarSubTab === st.id ? 'bg-[#6B21A8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {st.label}
                  </button>
                ))}
              </div>

              {bienestarSubTab === 'solicitudes' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['N°', 'Colaborador', 'Área', 'Tipo', 'Monto', 'F. Solicitud', 'Estado', 'Acciones'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[12px] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-[12px] text-[#6B21A8]">ADV-2026-002</td>
                        <td className="px-4 py-3 text-[#1E1B4B]">Nuñez Muñoz, Aaron</td>
                        <td className="px-4 py-3 text-gray-500 text-[12px]">UN. DE TI</td>
                        <td className="px-4 py-3 text-gray-600">Préstamo personal</td>
                        <td className="px-4 py-3 font-semibold">S/. 2,500</td>
                        <td className="px-4 py-3 text-gray-500">10/03/2026</td>
                        <td className="px-4 py-3"><Badge variant="blue">En evaluación</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Button variant="ghost" size="xs" onClick={() => { setSelectedRow({ id: '2', numero: 'ADV-2026-002', tipo: 'Préstamo personal', monto: 'S/. 2,500', fecha: '10/03/2026', estado: 'en_revision_bienestar', proximo: 'Evaluación Bienestar' }); setShowDetalle(true) }}>Ver</Button>
                            <Button size="xs" onClick={() => toast('Evaluación favorable registrada.')}>✔ Evaluar favorable</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {bienestarSubTab === 'historial' && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="italic text-gray-400 text-[13px]">Sin evaluaciones completadas este período</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Historial */}
          {activeTab === 'historial' && misSolicitudesTable(HISTORIAL_DATA)}
        </>
      )}

      {/* Modal Nueva Solicitud */}
      <Modal
        open={showNueva}
        onClose={() => setShowNueva(false)}
        title="FICHA DE PRÉSTAMO PERSONAL O ADELANTO DE SUELDO"
        footer={
          <>
            <Button variant="gray" size="sm" onClick={() => setShowNueva(false)}>Cancelar</Button>
            <Button variant="outline" size="sm" onClick={() => toast('Borrador guardado.')}>💾 Guardar borrador</Button>
            <Button size="sm" onClick={handleEnviarSolicitud}>📤 Enviar solicitud</Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* DATOS PERSONALES */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">DATOS PERSONALES DEL TRABAJADOR</div>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px 1fr', borderCollapse: 'collapse' }} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-500 px-3 py-2">Nombres y Apellidos</div>
              <div className="border border-gray-200 text-[12px] px-3 py-2 font-medium">Aaron Samuel Nuñez Muñoz</div>
              <div className="bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-500 px-3 py-2">Fecha de Ingreso</div>
              <div className="border border-gray-200 text-[12px] px-3 py-2">15/01/2023</div>

              <div className="bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-500 px-3 py-2">DNI</div>
              <div className="border border-gray-200 text-[12px] px-3 py-2 font-mono">77434028</div>
              <div className="bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-500 px-3 py-2">Tiempo de Servicio</div>
              <div className="border border-gray-200 text-[12px] px-3 py-2">3 años 2 meses</div>

              <div className="bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-500 px-3 py-2">Domicilio Actual</div>
              <div className="border border-gray-200 text-[12px] px-3 py-1 col-span-3">
                <input
                  type="text"
                  value={domicilio}
                  onChange={e => setDomicilio(e.target.value)}
                  placeholder="Ingresa tu domicilio actual..."
                  className="w-full text-[12px] outline-none bg-transparent"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-500 px-3 py-2">Área — Puesto</div>
              <div className="border border-gray-200 text-[12px] px-3 py-2 col-span-3">UN. DE TI — Analista de Sistemas</div>
            </div>
          </div>

          {/* TIPO DE SOLICITUD */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">TIPO DE SOLICITUD</div>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setTipoSolicitud('adelanto')}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${tipoSolicitud === 'adelanto' ? 'border-[#6B21A8] bg-[#F5F3FF]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-[18px] mb-1">💰</div>
                <div className="text-[13px] font-semibold text-[#1E1B4B]">Adelanto de Sueldo</div>
                <div className="text-[11px] text-gray-500">Hasta 1 remuneración mensual</div>
              </div>
              <div
                onClick={() => setTipoSolicitud('prestamo')}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${tipoSolicitud === 'prestamo' ? 'border-[#6B21A8] bg-[#F5F3FF]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-[18px] mb-1">🤝</div>
                <div className="text-[13px] font-semibold text-[#1E1B4B]">Préstamo Personal</div>
                <div className="text-[11px] text-gray-500">Monto mayor con cuotas</div>
              </div>
            </div>
          </div>

          {/* DATOS DE LA SOLICITUD */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">DATOS DE LA SOLICITUD</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Monto solicitado S/.</label>
                <input
                  type="number"
                  value={montoSolicitud}
                  onChange={e => setMontoSolicitud(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Motivo</label>
                <select
                  value={motivoSolicitud}
                  onChange={e => setMotivoSolicitud(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                >
                  <option value="Personales">Personales</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Vivienda">Vivienda</option>
                  <option value="Familiares">Familiares</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Justificación</label>
                <textarea
                  value={justificacionSolicitud}
                  onChange={e => setJustificacionSolicitud(e.target.value)}
                  rows={3}
                  placeholder="Describa la justificación de su solicitud..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] resize-none"
                />
              </div>
              {tipoSolicitud === 'prestamo' && (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">N° de cuotas</label>
                  <input
                    type="number"
                    value={numCuotas}
                    onChange={e => setNumCuotas(e.target.value)}
                    min="1"
                    max="12"
                    placeholder="Ingrese número de cuotas (máx. 12)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8]"
                  />
                </div>
              )}
              {cuotasData.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 font-semibold text-gray-600">Cuota N°</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600">Mes</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600">Monto S/.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuotasData.map(c => (
                        <tr key={c.cuota} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-center">{c.cuota}</td>
                          <td className="px-3 py-2 text-gray-600">{c.mes}</td>
                          <td className="px-3 py-2 font-semibold">{c.montoStr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* APROBACIONES */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">APROBACIONES</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Firma del Solicitante', name: 'Aaron Samuel Nuñez Muñoz', idx: 0 },
                { title: 'V°B° Bienestar Social', name: 'Por asignar', idx: 1 },
              ].map(f => (
                <div key={f.idx} className="border rounded-lg p-3">
                  <div className="text-[11px] font-bold text-gray-500 mb-2">{f.title}</div>
                  <div
                    className="min-h-12 border-dashed border border-purple-300 bg-[#FAF8FF] rounded flex items-center justify-center text-[11px] text-gray-400 cursor-pointer"
                    onClick={() => setFirmaModo(prev => ({ ...prev, [f.idx]: true }))}
                  >
                    {firmaModo[f.idx] ? (
                      <input
                        type="text"
                        value={firmaStates[f.idx]}
                        onChange={e => setFirmaStates(prev => ({ ...prev, [f.idx]: e.target.value }))}
                        placeholder="Firma..."
                        className="w-full px-2 py-1 text-center bg-transparent outline-none border-none"
                        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#1E1B4B' }}
                        autoFocus
                      />
                    ) : (
                      firmaStates[f.idx]
                        ? <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{firmaStates[f.idx]}</span>
                        : 'Firmar aquí'
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 text-center">{f.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal block */}
          <div className="border-l-2 border-gray-300 pl-3 text-[11px] text-gray-500 italic mb-4">
            El trabajador se compromete a destinar el monto solicitado al motivo indicado y autoriza el descuento por planilla de las cuotas correspondientes, de conformidad con el Reglamento Interno de Trabajo del CMP.
          </div>
        </div>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        open={showDetalle && !!selectedRow}
        onClose={() => setShowDetalle(false)}
        title={`Detalle — ${selectedRow?.numero ?? ''}`}
        footer={
          <Button variant="gray" size="sm" onClick={() => setShowDetalle(false)}>Cerrar</Button>
        }
      >
        {selectedRow && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {estadoBadge(selectedRow.estado)}
              <span className="text-[12px] font-mono text-gray-500">{selectedRow.numero}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'N°', value: selectedRow.numero },
                { label: 'Tipo', value: selectedRow.tipo },
                { label: 'Monto S/.', value: selectedRow.monto },
                { label: 'Fecha solicitud', value: selectedRow.fecha },
                { label: 'Estado', value: estadoBadge(selectedRow.estado) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] text-gray-400 font-medium mb-0.5">{label}</div>
                  <div className="text-[13px] text-[#1E1B4B] font-medium">{value}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#F8F6FB] rounded-lg p-4">
              <Stepper steps={stepperForSolicitud(selectedRow.estado)} />
            </div>
            {selectedRow.estado === 'rechazado' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-[12px] text-amber-800">
                Motivo: No cumple con los requisitos mínimos de tiempo de servicio.
              </div>
            )}
          </div>
        )}
      </Modal>

      <Toast message={toastState.message} show={toastState.show} onHide={hideToast} />
    </div>
  )
}
