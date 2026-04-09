import { useState, useEffect } from 'react'
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
  { id: '2', numero: 'ADV-2026-002', tipo: 'Préstamo personal', monto: 'S/. 2,500', fecha: '10/03/2026', estado: 'en_revision', proximo: 'Evaluación Bienestar' },
  { id: '3', numero: 'ADV-2026-003', tipo: 'Adelanto de sueldo', monto: 'S/. 400', fecha: '18/03/2026', estado: 'rechazado', proximo: '—' },
]

const MATRIZ_DATA = [
  { n: 1, area: 'UN. DE TI', puesto: 'Analista Sistemas', nombre: 'NUÑEZ MUÑOZ, Aaron Samuel', dni: '77434028', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 800', fecha: '01/03/2026', cuotas: 2, mes_descuento: 'Mar-26 / Abr-26\n(S/ 400 c/u)', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '05/03/2026', documento: 'ADV-2026-001' },
  { n: 2, area: 'SEC. DE ADMINISTRACION', puesto: 'Secretaria Administrativa', nombre: 'DÍAZ ESPINOZA, Lizzetti', dni: '45123890', tipo: 'prestamo', motivo: 'SALUD', monto: 'S/ 2,500', fecha: '10/03/2026', cuotas: 5, mes_descuento: 'Abr-26 a Ago-26\n(S/ 500 c/u)', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: 'pendiente', documento: 'ADV-2026-002' },
  { n: 3, area: 'UN. DE TI', puesto: 'Analista Sistemas', nombre: 'NUÑEZ MUÑOZ, Aaron Samuel', dni: '77434028', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 400', fecha: '18/03/2026', cuotas: 1, mes_descuento: 'Abr-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: 'rechazado', documento: 'ADV-2026-003' },
  { n: 4, area: 'UN. DE GDTH', puesto: 'Analista RR.HH.', nombre: 'TORRES HUAMÁN, María', dni: '32145678', tipo: 'adelanto', motivo: 'FAMILIARES', monto: 'S/ 1,200', fecha: '15/02/2026', cuotas: 1, mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: 'en_proceso', documento: 'ADV-2026-004' },
  { n: 5, area: 'SEC. DE ECONOMIA Y FINANZAS', puesto: 'Economista', nombre: 'SALAS QUISPE, Pedro', dni: '56789012', tipo: 'prestamo', motivo: 'VIVIENDA', monto: 'S/ 3,000', fecha: '05/01/2026', cuotas: 6, mes_descuento: 'Feb-26 a Jul-26\n(S/ 500 c/u)', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '10/01/2026', documento: '' },
  { n: 6, area: 'FONDO DE BIEN.SOCIAL DEL MED.', puesto: 'Técnica Enfermería', nombre: 'VEGA RÍOS, Carmen', dni: '67890123', tipo: 'adelanto', motivo: 'SALUD', monto: 'S/ 600', fecha: '20/02/2026', cuotas: 1, mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '25/02/2026', documento: '' },
  { n: 7, area: 'SEMEFA', puesto: 'Técnico Especialista', nombre: 'LIMA CASTRO, Jorge', dni: '78901234', tipo: 'adelanto', motivo: 'EDUCACIÓN', monto: 'S/ 400', fecha: '10/02/2026', cuotas: 1, mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '15/02/2026', documento: '' },
  { n: 8, area: 'DECANATO', puesto: 'Asistente Decanato', nombre: 'RÍOS PALOMINO, Ana', dni: '89012345', tipo: 'prestamo', motivo: 'SITUACIÓN FAMILIAR', monto: 'S/ 2,000', fecha: '03/03/2026', cuotas: 4, mes_descuento: 'Abr-26 a Jul-26\n(S/ 500 c/u)', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '08/03/2026', documento: '' },
  { n: 9, area: 'UN. DE ADMINISTRACION', puesto: 'Asistente Administrativo', nombre: 'GÓMEZ VARGAS, Luis', dni: '90123456', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 800', fecha: '25/01/2026', cuotas: 1, mes_descuento: 'Feb-26', aprueba: 'Jefa GDTH — Karla Mendoza', abono_fecha: '29/01/2026', documento: '' },
]

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
  const [activeTab, setActiveTab] = useState('mis')
  const [gdthSubTab, setGdthSubTab] = useState('sol')
  const [bienestarSubTab, setBienestarSubTab] = useState('sol')
  const [showNueva, setShowNueva] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [selectedNumero, setSelectedNumero] = useState('')

  // Nueva solicitud form state
  const [tipoSolicitud, setTipoSolicitud] = useState<'prestamo' | 'adelanto'>('prestamo')
  const [domicilio, setDomicilio] = useState('')
  const [montoSolicitud, setMontoSolicitud] = useState('')
  const [motivoSolicitud, setMotivoSolicitud] = useState('')
  const [justificacionSolicitud, setJustificacionSolicitud] = useState('')
  const [numCuotas, setNumCuotas] = useState('')
  const [inicioDescuento, setInicioDescuento] = useState('2026-04')
  const [mesDescuentoAdelanto, setMesDescuentoAdelanto] = useState('2026-04')
  const [firmaEvaluador, setFirmaEvaluador] = useState('')
  const [firmaTrabajador, setFirmaTrabajador] = useState('')
  const [firmaEvaluadorActivo, setFirmaEvaluadorActivo] = useState(false)
  const [firmaTrabajadorActivo, setFirmaTrabajadorActivo] = useState(false)
  const [aprobNombres, setAprobNombres] = useState<Record<number, string>>({ 0: '', 1: '', 2: '', 3: '' })

  const cuotasData = tipoSolicitud === 'prestamo' && parseFloat(montoSolicitud) > 0 && parseInt(numCuotas) > 0
    ? calcularCuotas(parseFloat(montoSolicitud), parseInt(numCuotas))
    : []

  useEffect(() => {
    solicitudesAdelantoService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as SolicitudAdelanto[]); else setData([]) })
      .catch(() => setData([]))
  }, [])

  const handleEnviarSolicitud = () => {
    setShowNueva(false)
    setDomicilio('')
    setMontoSolicitud('')
    setMotivoSolicitud('')
    setJustificacionSolicitud('')
    setNumCuotas('')
    setFirmaEvaluador('')
    setFirmaTrabajador('')
    setFirmaEvaluadorActivo(false)
    setFirmaTrabajadorActivo(false)
    setAprobNombres({ 0: '', 1: '', 2: '', 3: '' })
  }

  const openDetalle = (numero: string) => {
    setSelectedNumero(numero)
    setShowDetalle(true)
  }

  const selectedRow = MIS_SOLICITUDES.find(r => r.numero === selectedNumero) ?? null

  // Matriz table (shared between GDTH and Bienestar tabs)
  const MatrizTable = () => (
    <div className="matriz-adv-wrap">
      <table className="matriz-adv">
        <tr className="mat-title"><td colSpan={14}>PRÉSTAMOS / ADELANTOS DE SUELDO — 2026</td></tr>
        <thead>
          <tr>
            <th style={{ width: 30 }}>N°</th>
            <th>ÁREA</th>
            <th>PUESTO</th>
            <th>APELLIDOS Y NOMBRES</th>
            <th>DNI</th>
            <th>TIPO</th>
            <th>MOTIVO</th>
            <th>MONTO</th>
            <th>F. SOLICITUD</th>
            <th>CUOTAS</th>
            <th>MES DE DESCUENTO</th>
            <th className="td-left">APRUEBA</th>
            <th>ABONO FECHA</th>
            <th>DOCUMENTO</th>
          </tr>
        </thead>
        <tbody>
          {MATRIZ_DATA.map(r => (
            <tr key={r.n}>
              <td>{r.n}</td>
              <td>{r.area}</td>
              <td>{r.puesto}</td>
              <td className="td-left">{r.nombre}</td>
              <td>{r.dni}</td>
              <td>
                {r.tipo === 'adelanto'
                  ? <span className="badge b-purple" style={{ fontSize: 9 }}>ADELANTO DE SUELDO</span>
                  : <span className="badge b-blue" style={{ fontSize: 9 }}>PRÉSTAMO PERSONAL</span>}
              </td>
              <td>{r.motivo}</td>
              <td className="fw-600">{r.monto}</td>
              <td>{r.fecha}</td>
              <td>{r.cuotas}</td>
              <td className="td-mes">{r.mes_descuento}</td>
              <td className="td-left">{r.aprueba}</td>
              <td>
                {r.abono_fecha === 'pendiente' && <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Pendiente</span>}
                {r.abono_fecha === 'rechazado' && <span style={{ color: '#EF4444', fontWeight: 600 }}>Rechazado</span>}
                {r.abono_fecha === 'en_proceso' && <span style={{ color: '#D97706', fontStyle: 'italic' }}>En proceso</span>}
                {!['pendiente', 'rechazado', 'en_proceso'].includes(r.abono_fecha) && r.abono_fecha}
              </td>
              <td className="td-link">
                {r.documento
                  ? <button className="btn btn-gray btn-xs" onClick={() => openDetalle(r.documento)}>Ver</button>
                  : <span style={{ fontSize: 10, color: '#9CA3AF' }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">Gestión de Recursos › <span>Préstamos y Adelantos</span></div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Préstamos y Adelantos de Sueldo</div>
          <div className="page-subtitle">Gestión de solicitudes de préstamo personal y adelanto de sueldo</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowNueva(true)}>+ Nueva Solicitud</button>
        </div>
      </div>

      {/* Main tabs */}
      <div className="tabs" id="tabs-adv">
        <div className={`tab${activeTab === 'mis' ? ' active' : ''}`} onClick={() => setActiveTab('mis')}>Mis Solicitudes</div>
        <div className={`tab${activeTab === 'gdth' ? ' active' : ''}`} onClick={() => setActiveTab('gdth')}>Bandeja GDTH</div>
        <div className={`tab${activeTab === 'bienestar' ? ' active' : ''}`} onClick={() => setActiveTab('bienestar')}>Bandeja Bienestar</div>
        <div className={`tab${activeTab === 'hist' ? ' active' : ''}`} onClick={() => setActiveTab('hist')}>Historial</div>
      </div>

      {/* PANE: Mis Solicitudes */}
      <div id="pane-adv-mis" className={`tab-pane${activeTab === 'mis' ? ' active' : ''}`}>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N°</th><th>Tipo</th><th>Monto S/.</th><th>Fecha solicitud</th>
                  <th>Estado flujo</th><th>Próximo paso</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-600">ADV-2026-001</td>
                  <td>Adelanto de sueldo</td>
                  <td>S/. 800</td>
                  <td>01/03/2026</td>
                  <td><span className="badge b-green">Aprobado</span></td>
                  <td className="text-sm text-gray">Desembolso por Contabilidad</td>
                  <td><button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-001')}>Ver detalle</button></td>
                </tr>
                <tr>
                  <td className="fw-600">ADV-2026-002</td>
                  <td>Préstamo personal</td>
                  <td>S/. 2,500</td>
                  <td>10/03/2026</td>
                  <td><span className="badge b-yellow">En revisión — Bienestar</span></td>
                  <td className="text-sm text-gray">Evaluación Bienestar</td>
                  <td><button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-002')}>Ver detalle</button></td>
                </tr>
                <tr>
                  <td className="fw-600">ADV-2026-003</td>
                  <td>Adelanto de sueldo</td>
                  <td>S/. 400</td>
                  <td>18/03/2026</td>
                  <td><span className="badge b-red">Rechazado</span></td>
                  <td className="text-sm text-gray">—</td>
                  <td><button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-003')}>Ver detalle</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stepper ADV-2026-002 */}
        <div className="card">
          <div className="card-body">
            <div className="flex-between mb-8">
              <span className="text-sm fw-600 text-purple">ADV-2026-002 — Seguimiento de flujo</span>
              <span className="badge b-yellow">En revisión — Bienestar</span>
            </div>
            <div className="stepper">
              <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
              <div className="step-conn done"></div>
              <div className="step"><div className="step-circ cur">⏳</div><span className="step-lbl cur">Bienestar</span></div>
              <div className="step-conn"></div>
              <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Jefatura GDTH</span></div>
              <div className="step-conn"></div>
              <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Sec. Administ.</span></div>
              <div className="step-conn"></div>
              <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Contabilidad</span></div>
            </div>
            <div className="text-xs text-gray mt-8">Última actualización: Solicitud recibida por Bienestar — 11/03/2026</div>
          </div>
        </div>
      </div>

      {/* PANE: Bandeja GDTH */}
      <div id="pane-adv-gdth" className={`tab-pane${activeTab === 'gdth' ? ' active' : ''}`}>
        <div className="subtabs" id="subtabs-gdth">
          <div className={`subtab${gdthSubTab === 'sol' ? ' active' : ''}`} onClick={() => setGdthSubTab('sol')}>📋 Solicitudes</div>
          <div className={`subtab${gdthSubTab === 'matriz' ? ' active' : ''}`} onClick={() => setGdthSubTab('matriz')}>📊 Matriz Préstamos / Adelantos</div>
        </div>

        {/* Sub-pane: Solicitudes GDTH */}
        <div id="subpane-gdth-sol" className={`tab-pane${gdthSubTab === 'sol' ? ' active' : ''}`}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}>Solicitudes pendientes de aprobación GDTH</div>
              <div className="text-xs text-gray mt-4">Solicitudes que han pasado evaluación de Bienestar y requieren V°B° de Jefatura GDTH</div>
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>N°</th><th>Colaborador</th><th>Área</th><th>Tipo</th>
                    <th>Monto S/.</th><th>F. Solicitud</th><th>Estado</th><th>Evaluado por Bienestar</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-600">ADV-2026-004</td>
                    <td>Torres Huamán, María</td>
                    <td>UN. DE GDTH</td>
                    <td>Adelanto de sueldo</td>
                    <td>S/. 1,200</td>
                    <td>15/02/2026</td>
                    <td><span className="badge b-red">Pendiente V°B° GDTH</span></td>
                    <td className="text-sm text-gray">Bienestar — 18/02/2026</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-004')}>Ver detalle</button>
                        <button className="btn btn-primary btn-xs">✔ Aprobar</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sub-pane: Matriz GDTH */}
        <div id="subpane-gdth-matriz" className={`tab-pane${gdthSubTab === 'matriz' ? ' active' : ''}`}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}>Matriz Préstamos / Adelantos 2026</div>
              <div className="text-xs text-gray mt-4">Registro consolidado del año — fuente: GDTH</div>
            </div>
            <div className="header-actions">
              <button className="btn btn-outline btn-sm">📥 Exportar Excel</button>
              <button className="btn btn-gray btn-sm">📄 Imprimir</button>
            </div>
          </div>
          <MatrizTable />
          <div className="text-xs text-gray" style={{ fontStyle: 'italic' }}>Total registros 2026: 9 · Monto total aprobado: S/. 11,600 · Pendientes: 2</div>
        </div>
      </div>

      {/* PANE: Bandeja Bienestar */}
      <div id="pane-adv-bienestar" className={`tab-pane${activeTab === 'bienestar' ? ' active' : ''}`}>
        <div className="subtabs" id="subtabs-bienestar">
          <div className={`subtab${bienestarSubTab === 'sol' ? ' active' : ''}`} onClick={() => setBienestarSubTab('sol')}>📋 Solicitudes</div>
          <div className={`subtab${bienestarSubTab === 'matriz' ? ' active' : ''}`} onClick={() => setBienestarSubTab('matriz')}>📊 Matriz Préstamos / Adelantos</div>
        </div>

        {/* Sub-pane: Solicitudes Bienestar */}
        <div id="subpane-bs-sol" className={`tab-pane${bienestarSubTab === 'sol' ? ' active' : ''}`}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}>Solicitudes en evaluación — Bienestar Social</div>
              <div className="text-xs text-gray mt-4">Solicitudes que requieren evaluación y firma del evaluador de Bienestar Social</div>
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>N°</th><th>Colaborador</th><th>Área</th><th>Tipo</th>
                    <th>Monto S/.</th><th>F. Solicitud</th><th>Estado</th><th>Cuotas</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-600">ADV-2026-002</td>
                    <td>Díaz Espinoza, Lizzetti</td>
                    <td>Sec. Administración</td>
                    <td>Préstamo personal</td>
                    <td>S/. 2,500</td>
                    <td>10/03/2026</td>
                    <td><span className="badge b-yellow">En revisión — Bienestar</span></td>
                    <td>5 cuotas de S/. 500</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-002')}>Ver detalle</button>
                        <button className="btn btn-primary btn-xs">📝 Evaluar</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sub-pane: Matriz Bienestar */}
        <div id="subpane-bs-matriz" className={`tab-pane${bienestarSubTab === 'matriz' ? ' active' : ''}`}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}>Matriz Préstamos / Adelantos 2026</div>
              <div className="text-xs text-gray mt-4">Registro consolidado — vista Bienestar Social</div>
            </div>
            <div className="header-actions">
              <button className="btn btn-outline btn-sm">📥 Exportar Excel</button>
              <button className="btn btn-gray btn-sm">📄 Imprimir</button>
            </div>
          </div>
          <MatrizTable />
          <div className="text-xs text-gray" style={{ fontStyle: 'italic' }}>Total registros 2026: 9 · Monto total aprobado: S/. 11,600 · Pendientes: 2</div>
        </div>
      </div>

      {/* PANE: Historial */}
      <div id="pane-adv-hist" className={`tab-pane${activeTab === 'hist' ? ' active' : ''}`}>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N°</th><th>Tipo</th><th>Monto S/.</th><th>Fecha solicitud</th>
                  <th>Cuotas</th><th>Mes descuento</th><th>Estado final</th><th>Abono fecha</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-600">ADV-2026-001</td>
                  <td>Adelanto de sueldo</td>
                  <td>S/. 800</td>
                  <td>01/03/2026</td>
                  <td>2 cuotas de S/. 400</td>
                  <td>Mar-26 / Abr-26</td>
                  <td><span className="badge b-green">Aprobado y desembolsado</span></td>
                  <td>05/03/2026</td>
                  <td><button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-001')}>Ver detalle</button></td>
                </tr>
                <tr>
                  <td className="fw-600">ADV-2026-003</td>
                  <td>Adelanto de sueldo</td>
                  <td>S/. 400</td>
                  <td>18/03/2026</td>
                  <td>1 cuota</td>
                  <td>Abr-26</td>
                  <td><span className="badge b-red">Rechazado</span></td>
                  <td>—</td>
                  <td><button className="btn btn-gray btn-xs" onClick={() => openDetalle('ADV-2026-003')}>Ver detalle</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nueva Solicitud */}
      {showNueva && (
        <div className="modal-overlay" onClick={() => setShowNueva(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title" style={{ fontSize: 13, textAlign: 'center', paddingRight: 0 }}>
                  FICHA DE PRÉSTAMO PERSONAL O ADELANTO DE SUELDO
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="text-xs text-gray fw-600">FECHA:</span>
                  <input type="date" className="form-control" defaultValue="2026-03-26" style={{ width: 140, padding: '4px 8px', fontSize: 12 }} />
                </div>
                <button className="modal-close" onClick={() => setShowNueva(false)}>×</button>
              </div>
            </div>
            <div className="modal-body">

              {/* Datos personales */}
              <div className="section-title-sm">DATOS PERSONALES DEL TRABAJADOR</div>
              <table className="inst-grid mb-16">
                <tbody>
                  <tr>
                    <td className="lbl-cell">Nombres y Apellidos</td>
                    <td className="val-cell">Aaron Samuel Nuñez Muñoz</td>
                    <td className="lbl-cell">Fecha de Ingreso</td>
                    <td className="val-cell">15/01/2023</td>
                  </tr>
                  <tr>
                    <td className="lbl-cell">DNI</td>
                    <td className="val-cell">77434028</td>
                    <td className="lbl-cell">Tiempo de Servicio</td>
                    <td className="val-cell">3 años 2 meses</td>
                  </tr>
                  <tr>
                    <td className="lbl-cell">Domicilio Actual</td>
                    <td className="val-cell" colSpan={3}>
                      <input
                        type="text"
                        value={domicilio}
                        onChange={e => setDomicilio(e.target.value)}
                        placeholder="Ingresa tu domicilio actual..."
                        style={{ border: 'none', width: '100%', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl-cell">Área — Puesto</td>
                    <td className="val-cell" colSpan={3}>UN. DE TI — Analista de Sistemas</td>
                  </tr>
                </tbody>
              </table>

              {/* Tipo de solicitud */}
              <div className="section-title-sm">TIPO DE SOLICITUD</div>
              <div className="radio-cards" id="tipo-solicitud-cards">
                <div
                  className={`radio-card${tipoSolicitud === 'prestamo' ? ' selected' : ''}`}
                  onClick={() => setTipoSolicitud('prestamo')}
                >
                  <div className="radio-card-icon">💼</div>
                  <div className="radio-card-label">PRÉSTAMO PERSONAL</div>
                </div>
                <div
                  className={`radio-card${tipoSolicitud === 'adelanto' ? ' selected' : ''}`}
                  onClick={() => setTipoSolicitud('adelanto')}
                >
                  <div className="radio-card-icon">⚡</div>
                  <div className="radio-card-label">ADELANTO DE SUELDO</div>
                </div>
              </div>

              {/* Sección Préstamo */}
              {tipoSolicitud === 'prestamo' && (
                <div id="sec-prestamo-form">
                  <div className="section-title-sm">EVALUACIÓN DE PRÉSTAMO</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Motivo de préstamo <span className="req">*</span></label>
                      <select className="form-control" value={motivoSolicitud} onChange={e => setMotivoSolicitud(e.target.value)}>
                        <option value="">Seleccionar...</option>
                        <option>Salud</option>
                        <option>Educación</option>
                        <option>Vivienda</option>
                        <option>Situación Familiar</option>
                        <option>Personales</option>
                        <option>Otros</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monto solicitado (S/.) <span className="req">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        value={montoSolicitud}
                        onChange={e => setMontoSolicitud(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Inicio de Descuento <span className="req">*</span></label>
                      <input
                        type="month"
                        className="form-control"
                        value={inicioDescuento}
                        onChange={e => setInicioDescuento(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Término de Descuento</label>
                      <input type="month" className="form-control" readOnly value={
                        inicioDescuento && numCuotas && parseInt(numCuotas) > 0
                          ? (() => {
                              const [y, m] = inicioDescuento.split('-').map(Number)
                              const d = new Date(y, m - 1 + parseInt(numCuotas) - 1, 1)
                              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                            })()
                          : ''
                      } />
                    </div>
                    <div className="form-group">
                      <label className="form-label">N° de Cuotas <span className="req">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={12}
                        placeholder="1-12"
                        value={numCuotas}
                        onChange={e => setNumCuotas(e.target.value)}
                      />
                    </div>
                  </div>
                  {cuotasData.length > 0 && (
                    <table className="cuotas-table" id="tabla-cuotas">
                      <thead>
                        <tr><th>CUOTA N°</th><th>MES</th><th>MONTO (S/.)</th></tr>
                      </thead>
                      <tbody>
                        {cuotasData.map(c => (
                          <tr key={c.cuota}>
                            <td>{c.cuota}</td>
                            <td>{c.mes}</td>
                            <td>{c.montoStr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Sección Adelanto */}
              {tipoSolicitud === 'adelanto' && (
                <div id="sec-adelanto-form">
                  <div className="section-title-sm">EVALUACIÓN DE ADELANTO DE SUELDO</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Motivo de adelanto <span className="req">*</span></label>
                      <select className="form-control" value={motivoSolicitud} onChange={e => setMotivoSolicitud(e.target.value)}>
                        <option value="">Seleccionar...</option>
                        <option>Salud</option>
                        <option>Educación</option>
                        <option>Vivienda</option>
                        <option>Familiares</option>
                        <option>Personales</option>
                        <option>Otros</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monto solicitado (S/.) <span className="req">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        value={montoSolicitud}
                        onChange={e => setMontoSolicitud(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mes de Descuento <span className="req">*</span></label>
                    <input
                      type="month"
                      className="form-control"
                      style={{ maxWidth: 200 }}
                      value={mesDescuentoAdelanto}
                      onChange={e => setMesDescuentoAdelanto(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Sustentación */}
              <div className="section-title-sm">SUSTENTACIÓN DE SOLICITUD</div>
              <div className="form-group">
                <label className="form-label">Adjuntar documentos de sustento</label>
                <div className="dropzone">
                  <div className="dropzone-icon">📎</div>
                  <div style={{ fontSize: 13 }}>Arrastra archivos aquí o haz clic para seleccionar</div>
                  <div className="dropzone-text">PDF, DOC, DOCX, PNG, JPG — máx 5MB por archivo</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción del sustento</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Explica brevemente los documentos adjuntos (opcional)..."
                  value={justificacionSolicitud}
                  onChange={e => setJustificacionSolicitud(e.target.value)}
                />
              </div>

              {/* Aviso legal */}
              <div className="legal-block">
                <strong>IMPORTANTE:</strong> La información consignada tiene validez de Declaración Jurada y de carácter confidencial, por lo tanto toda omisión o distorsión de dicha información es absoluta responsabilidad del empleado.
              </div>

              {/* Firmas */}
              <div className="section-title-sm">FIRMAS</div>
              <div className="form-row">
                <div className="firma-card" style={{ flex: 1 }}>
                  <div className="firma-card-title">Firma Evaluador:</div>
                  <div
                    className="firma-zona"
                    onClick={() => setFirmaEvaluadorActivo(true)}
                  >
                    {firmaEvaluadorActivo
                      ? <input
                          type="text"
                          className="firma-input"
                          placeholder="Firma evaluador"
                          value={firmaEvaluador}
                          onChange={e => setFirmaEvaluador(e.target.value)}
                          autoFocus
                          style={{ display: 'block' }}
                        />
                      : <span className="firma-placeholder" style={{ display: firmaEvaluador ? 'none' : undefined }}>
                          {firmaEvaluador || 'Haz clic aquí para firmar'}
                        </span>
                    }
                    {!firmaEvaluadorActivo && firmaEvaluador && (
                      <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{firmaEvaluador}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray mt-8">Bienestar Social</div>
                </div>
                <div className="firma-card" style={{ flex: 1 }}>
                  <div className="firma-card-title">Firma del Trabajador:</div>
                  <div
                    className="firma-zona"
                    onClick={() => setFirmaTrabajadorActivo(true)}
                  >
                    {firmaTrabajadorActivo
                      ? <input
                          type="text"
                          className="firma-input"
                          placeholder="Firma del trabajador"
                          value={firmaTrabajador}
                          onChange={e => setFirmaTrabajador(e.target.value)}
                          autoFocus
                          style={{ display: 'block' }}
                        />
                      : <span className="firma-placeholder" style={{ display: firmaTrabajador ? 'none' : undefined }}>
                          {firmaTrabajador || 'Haz clic aquí para firmar'}
                        </span>
                    }
                    {!firmaTrabajadorActivo && firmaTrabajador && (
                      <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 13 }}>{firmaTrabajador}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray mt-8">Aaron Samuel Nuñez Muñoz</div>
                </div>
              </div>

              {/* Aprobaciones */}
              <div className="section-title-sm">APROBACIONES</div>
              <div className="aprobaciones-grid">
                {[
                  { title: 'V°B° Jefe directo', placeholder: 'Nombre del jefe directo' },
                  { title: 'V°B° Jefe de GDTH', placeholder: 'Nombre del jefe GDTH' },
                  { title: 'V°B° Secretario de Área', placeholder: 'Nombre del secretario' },
                  { title: 'V°B° Sec. Economía y Finanzas', placeholder: 'Nombre del secretario de finanzas' },
                ].map((a, idx) => (
                  <div key={idx} className="aprob-cell">
                    <div className="aprob-title">{a.title}</div>
                    <div className="aprob-zona">
                      <span className="firma-placeholder">Firmar aquí</span>
                    </div>
                    <input
                      className="aprob-nombre"
                      type="text"
                      placeholder={a.placeholder}
                      value={aprobNombres[idx]}
                      onChange={e => setAprobNombres(prev => ({ ...prev, [idx]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {/* Flujo referencial */}
              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 6, padding: '12px 14px', marginTop: 14 }}>
                <div className="text-xs fw-600 text-purple mb-8">Tu solicitud pasará por:</div>
                <div className="stepper">
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>1</div><span className="step-lbl pend" style={{ fontSize: 10 }}>Solicitud</span></div>
                  <div className="step-conn"></div>
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>2</div><span className="step-lbl pend" style={{ fontSize: 10 }}>Bienestar</span></div>
                  <div className="step-conn"></div>
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>3</div><span className="step-lbl pend" style={{ fontSize: 10 }}>Jefatura GDTH</span></div>
                  <div className="step-conn"></div>
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>4</div><span className="step-lbl pend" style={{ fontSize: 10 }}>Sec. Administ.</span></div>
                  <div className="step-conn"></div>
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>5</div><span className="step-lbl pend" style={{ fontSize: 10 }}>Contabilidad</span></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <span className="modal-note">Al enviar, la solicitud pasa a evaluación de Bienestar Social.</span>
              <button className="btn btn-gray" onClick={() => setShowNueva(false)}>Cancelar</button>
              <button className="btn btn-outline">💾 Guardar borrador</button>
              <button className="btn btn-primary" onClick={handleEnviarSolicitud}>📤 Enviar solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetalle && (
        <div className="modal-overlay" onClick={() => setShowDetalle(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Detalle de Solicitud</div>
                <div className="modal-subtitle">{selectedNumero}</div>
              </div>
              <button className="modal-close" onClick={() => setShowDetalle(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Estado */}
              <div style={{ marginBottom: 14 }}>
                {selectedRow?.estado === 'aprobado' && <span className="badge b-green">Aprobado</span>}
                {selectedRow?.estado === 'en_revision' && <span className="badge b-yellow">En revisión — Bienestar</span>}
                {selectedRow?.estado === 'rechazado' && <span className="badge b-red">Rechazado</span>}
                {!selectedRow && <span className="badge b-gray">{selectedNumero}</span>}
              </div>

              {/* Datos */}
              <div className="section-title-sm">DATOS DE LA SOLICITUD</div>
              <div className="inv-grid" style={{ marginBottom: 14 }}>
                {selectedRow ? (
                  <>
                    <div className="lbl-cell">N°</div><div className="val-cell fw-600">{selectedRow.numero}</div>
                    <div className="lbl-cell">Tipo</div><div className="val-cell">{selectedRow.tipo}</div>
                    <div className="lbl-cell">Monto S/.</div><div className="val-cell fw-600">{selectedRow.monto}</div>
                    <div className="lbl-cell">Fecha solicitud</div><div className="val-cell">{selectedRow.fecha}</div>
                    <div className="lbl-cell">Próximo paso</div><div className="val-cell text-gray">{selectedRow.proximo}</div>
                  </>
                ) : (
                  <>
                    <div className="lbl-cell">N°</div><div className="val-cell fw-600">{selectedNumero}</div>
                  </>
                )}
              </div>

              {/* Flujo */}
              <div className="section-title-sm">FLUJO DE APROBACIÓN</div>
              <div className="stepper">
                {selectedRow?.estado === 'aprobado' ? (
                  <>
                    <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
                    <div className="step-conn done"></div>
                    <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Bienestar</span></div>
                    <div className="step-conn done"></div>
                    <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Jefatura GDTH</span></div>
                    <div className="step-conn done"></div>
                    <div className="step"><div className="step-circ cur">⏳</div><span className="step-lbl cur">Sec. Administ.</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Contabilidad</span></div>
                  </>
                ) : selectedRow?.estado === 'rechazado' ? (
                  <>
                    <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
                    <div className="step-conn done"></div>
                    <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Bienestar</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Jefatura GDTH</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Sec. Administ.</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Contabilidad</span></div>
                  </>
                ) : (
                  <>
                    <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
                    <div className="step-conn done"></div>
                    <div className="step"><div className="step-circ cur">⏳</div><span className="step-lbl cur">Bienestar</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Jefatura GDTH</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Sec. Administ.</span></div>
                    <div className="step-conn"></div>
                    <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">Contabilidad</span></div>
                  </>
                )}
              </div>

              {/* Observación si rechazado */}
              {selectedRow?.estado === 'rechazado' && (
                <div style={{ marginTop: 10, background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#92400E' }}>
                  Motivo: No cumple con los requisitos mínimos de tiempo de servicio.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowDetalle(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
