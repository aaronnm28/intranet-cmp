import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface MisSolicitudRow {
  id: string
  numero: string
  tipo: string
  monto: string
  fecha: string
  estado: string
  proximo: string
}


const MATRIZ_DATA = [
  { n: 1, area: 'UN. DE TI', puesto: 'Analista Sistemas', nombre: 'NUÑEZ MUÑOZ, Aaron Samuel', dni: '77434028', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 800', fecha: '01/03/2026', cuotas: 2, mes_descuento: 'Mar-26 / Abr-26\n(S/ 400 c/u)', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: '05/03/2026', documento: 'ADV-2026-001' },
  { n: 2, area: 'SEC. DE ADMINISTRACION', puesto: 'Secretaria Administrativa', nombre: 'DÍAZ ESPINOZA, Lizzetti', dni: '45123890', tipo: 'prestamo', motivo: 'SALUD', monto: 'S/ 2,500', fecha: '10/03/2026', cuotas: 5, mes_descuento: 'Abr-26 a Ago-26\n(S/ 500 c/u)', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: 'pendiente', documento: 'ADV-2026-002' },
  { n: 3, area: 'UN. DE TI', puesto: 'Analista Sistemas', nombre: 'NUÑEZ MUÑOZ, Aaron Samuel', dni: '77434028', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 400', fecha: '18/03/2026', cuotas: 1, mes_descuento: 'Abr-26', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: 'rechazado', documento: 'ADV-2026-003' },
  { n: 4, area: 'UN. DE GDTH', puesto: 'Analista RR.HH.', nombre: 'TORRES HUAMÁN, María', dni: '32145678', tipo: 'adelanto', motivo: 'FAMILIARES', monto: 'S/ 1,200', fecha: '15/02/2026', cuotas: 1, mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: 'en_proceso', documento: 'ADV-2026-004' },
  { n: 5, area: 'SEC. DE ECONOMIA Y FINANZAS', puesto: 'Economista', nombre: 'SALAS QUISPE, Pedro', dni: '56789012', tipo: 'prestamo', motivo: 'VIVIENDA', monto: 'S/ 3,000', fecha: '05/01/2026', cuotas: 6, mes_descuento: 'Feb-26 a Jul-26\n(S/ 500 c/u)', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: '10/01/2026', documento: '' },
  { n: 6, area: 'FONDO DE BIEN.SOCIAL DEL MED.', puesto: 'Técnica Enfermería', nombre: 'VEGA RÍOS, Carmen', dni: '67890123', tipo: 'adelanto', motivo: 'SALUD', monto: 'S/ 600', fecha: '20/02/2026', cuotas: 1, mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: '25/02/2026', documento: '' },
  { n: 7, area: 'SEMEFA', puesto: 'Técnico Especialista', nombre: 'LIMA CASTRO, Jorge', dni: '78901234', tipo: 'adelanto', motivo: 'EDUCACIÓN', monto: 'S/ 400', fecha: '10/02/2026', cuotas: 1, mes_descuento: 'Mar-26', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: '15/02/2026', documento: '' },
  { n: 8, area: 'DECANATO', puesto: 'Asistente Decanato', nombre: 'RÍOS PALOMINO, Ana', dni: '89012345', tipo: 'prestamo', motivo: 'SITUACIÓN FAMILIAR', monto: 'S/ 2,000', fecha: '03/03/2026', cuotas: 4, mes_descuento: 'Abr-26 a Jul-26\n(S/ 500 c/u)', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: '08/03/2026', documento: '' },
  { n: 9, area: 'UN. DE ADMINISTRACION', puesto: 'Asistente Administrativo', nombre: 'GÓMEZ VARGAS, Luis', dni: '90123456', tipo: 'adelanto', motivo: 'PERSONALES', monto: 'S/ 800', fecha: '25/01/2026', cuotas: 1, mes_descuento: 'Feb-26', aprueba: 'Jefa GDTH — Julieth Z. Carbajal', abono_fecha: '29/01/2026', documento: '' },
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
  const [misSolicitudes, setMisSolicitudes] = useState<MisSolicitudRow[]>([])
  const [activeTab, setActiveTab] = useState('mis')
  const [gdthSubTab, setGdthSubTab] = useState('sol')
  const [bienestarSubTab, setBienestarSubTab] = useState('sol')
  const [showNueva, setShowNueva] = useState(false)          // Modal "Nueva Ficha" (ficha completa)
  const [showNuevaSol, setShowNuevaSol] = useState(false)   // Modal "Nueva Solicitud" simplificado (Obs 6)
  const [showDetalle, setShowDetalle] = useState(false)
  const [showEvalGDTH, setShowEvalGDTH] = useState(false)   // Modal Evaluación GDTH (Obs 7)
  const [selectedNumero, setSelectedNumero] = useState('')
  const [selectedGDTHRow, setSelectedGDTHRow] = useState<typeof MATRIZ_DATA[0]|null>(null)

  // GDTH bandeja — espeja misSolicitudes + solicitudes de otros colaboradores
  const [gdthBandeja, setGdthBandeja] = useState<(MisSolicitudRow & {colaborador?:string;area?:string})[]>([])

  // 8-step flow tracking per solicitud number — persistido en localStorage
  type AdvStep = { status: 'done'|'active'|'pending'; firmante: string; fecha: string }
  const [advFlow, setAdvFlow] = useState<Record<string, AdvStep[]>>(() => {
    try { const s = localStorage.getItem('cmp_adv_flow'); return s ? JSON.parse(s) as Record<string, AdvStep[]> : {} } catch { return {} }
  })
  const [advFirmaInput, setAdvFirmaInput] = useState<Record<string, string>>({})
  const [advFichaEnabled, setAdvFichaEnabled] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem('cmp_adv_ficha_enabled'); return s ? JSON.parse(s) as Record<string, boolean> : {} } catch { return {} }
  })
  const [advFichaSubmitted, setAdvFichaSubmitted] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem('cmp_adv_ficha_submitted'); return s ? JSON.parse(s) as Record<string, boolean> : {} } catch { return {} }
  })
  const [advDesembolsoFile, setAdvDesembolsoFile] = useState<Record<string, string>>(() => {
    try { const s = localStorage.getItem('cmp_adv_desembolso'); return s ? JSON.parse(s) as Record<string, string> : {} } catch { return {} }
  })

  // Nueva Solicitud simplificada (Obs 6)
  const [nssDni, setNssDni] = useState('')
  const [nssColab, setNssColab] = useState<{nombre:string;area:string;puesto:string}|null>(null)
  const [nssDniErr, setNssDniErr] = useState(false)
  const [nssBuscando, setNssBuscando] = useState(false)
  const [nssTipo, setNssTipo] = useState<'prestamo'|'adelanto'>('prestamo')
  const [nssMonto, setNssMonto] = useState('')
  const [nssSustentoFile, setNssSustentoFile] = useState('')
  const [nssSustentoPreview, setNssSustentoPreview] = useState(false)
  const [nssTipoSolicitud, setNssTipoSolicitud] = useState('')
  const [nssMotivo, setNssMotivo] = useState('')

  // Evaluación GDTH (Obs 7)
  const [evalDni, setEvalDni] = useState('')
  const [evalColab, setEvalColab] = useState<{nombre:string;area:string;puesto:string;subarea?:string;salario?:string;inicio?:string;fin?:string;vigencia?:string}|null>(null)
  const [evalDniErr, setEvalDniErr] = useState(false)
  const [evalBuscando, setEvalBuscando] = useState(false)
  const [evalResultado, setEvalResultado] = useState('')
  const [evalMontoAprobado, setEvalMontoAprobado] = useState('')
  const [evalMontoEditable, setEvalMontoEditable] = useState(false)
  const [evalCuotas, setEvalCuotas] = useState('')

  // Nueva solicitud form state (ficha completa — movida al detalle Obs 6)
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

  // Guardar estado del flujo en localStorage cuando cambie
  useEffect(() => { localStorage.setItem('cmp_adv_flow', JSON.stringify(advFlow)) }, [advFlow])
  useEffect(() => { localStorage.setItem('cmp_adv_ficha_enabled', JSON.stringify(advFichaEnabled)) }, [advFichaEnabled])
  useEffect(() => { localStorage.setItem('cmp_adv_ficha_submitted', JSON.stringify(advFichaSubmitted)) }, [advFichaSubmitted])
  useEffect(() => { localStorage.setItem('cmp_adv_desembolso', JSON.stringify(advDesembolsoFile)) }, [advDesembolsoFile])

  useEffect(() => {
    const load = async () => {
      try {
        const { data: rows } = await supabase.from('solicitudes_adelanto')
          .select('id,numero,tipo,monto,motivo,cuotas,estado,fecha_solicitud,colaborador')
          .order('created_at', { ascending: false })
        if (rows && rows.length > 0) {
          let areaCache: Record<string, string> = {}
          try { const ac = localStorage.getItem('cmp_adv_area'); if (ac) areaCache = JSON.parse(ac) } catch {}
          const mapped = rows.map(r => ({
            id: r.id,
            numero: r.numero,
            tipo: r.tipo === 'adelanto' ? 'Adelanto de sueldo' : 'Préstamo personal',
            monto: `S/. ${Number(r.monto).toLocaleString('es-PE')}`,
            fecha: r.fecha_solicitud ?? '—',
            estado: r.estado,
            proximo: r.estado === 'aprobado' ? 'Desembolso realizado' : 'J. Carbajal — GDTH: Evaluación',
            colaborador: r.colaborador ?? '—',
            area: areaCache[r.numero] ?? '—',
          }))
          setMisSolicitudes(mapped)
          setGdthBandeja(mapped)
          // Inicializar flujo de 8 pasos para solicitudes que aún no tienen flujo en localStorage
          setAdvFlow(prev => {
            const updated = { ...prev }
            rows.forEach(r => {
              if (!updated[r.numero]) {
                updated[r.numero] = [
                  { status: 'done', firmante: r.colaborador ?? 'Colaborador', fecha: r.fecha_solicitud ?? new Date().toLocaleDateString('es-PE') },
                  { status: 'active', firmante: '', fecha: '' },
                  { status: 'pending', firmante: '', fecha: '' },
                  { status: 'pending', firmante: '', fecha: '' },
                  { status: 'pending', firmante: '', fecha: '' },
                  { status: 'pending', firmante: '', fecha: '' },
                  { status: 'pending', firmante: '', fecha: '' },
                  { status: 'pending', firmante: '', fecha: '' },
                ]
              }
            })
            return updated
          })
        }
      } catch { /* mantiene mock */ }
    }
    load()
  }, [])

  const handleEnviarSolicitud = async () => {
    const monto = parseFloat(montoSolicitud)
    if (!monto || monto <= 0) { alert('Ingresa un monto válido'); return }
    const { count } = await supabase.from('solicitudes_adelanto').select('*', { count: 'exact', head: true })
    const numero = `ADV-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(3, '0')}`
    const payload = {
      numero,
      tipo: tipoSolicitud,
      monto,
      motivo: motivoSolicitud,
      cuotas: tipoSolicitud === 'prestamo' ? parseInt(numCuotas) || 1 : 1,
      estado: 'en_revision',
      colaborador: 'Colaborador',
    }
    const { data: newRec, error } = await supabase.from('solicitudes_adelanto').insert(payload).select().single()
    if (error) { alert(`Error: ${error.message}`); return }
    if (newRec) {
      setMisSolicitudes(prev => [{
        id: newRec.id, numero, tipo: tipoSolicitud === 'adelanto' ? 'Adelanto de sueldo' : 'Préstamo personal',
        monto: `S/. ${monto.toLocaleString('es-PE')}`, fecha: new Date().toLocaleDateString('es-PE'),
        estado: 'en_revision', proximo: 'Evaluación Bienestar',
      }, ...prev])
    }
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

  const COLAB_MOCK_ADV: Record<string,{nombre:string;area:string;puesto:string;subarea:string;salario:string;inicio:string;fin:string}> = {
    '77434028': {nombre:'Aaron Samuel Nuñez Muñoz',     area:'UN. DE TI',   puesto:'Analista de TI',          subarea:'UN. DE TI',   salario:'S/. 3,200',inicio:'2023-01-15',fin:'2026-12-31'},
    '72224207': {nombre:'Julieth Zenina Carbajal Garro',area:'UN. DE GDTH', puesto:'Jefa de GDTH',             subarea:'UN. DE GDTH', salario:'S/. 5,800',inicio:'2020-03-01',fin:'2026-12-31'},
    '46521663': {nombre:'Jesús Luman Marcos Aragon',    area:'UN. DE TI',   puesto:'Jefe de TI',               subarea:'UN. DE TI',   salario:'S/. 6,500',inicio:'2019-06-15',fin:'2026-12-31'},
    '45103078': {nombre:'Nataly De Rutte Vergara',      area:'UN. DE PLAN', puesto:'Jefa de Planificación',    subarea:'UN. DE PLAN', salario:'S/. 5,200',inicio:'2021-02-01',fin:'2026-06-30'},
    '45438744': {nombre:'Hamer Chonlon Escudero',       area:'UN. DE GDTH', puesto:'Analista de Planilla',     subarea:'UN. DE GDTH', salario:'S/. 3,800',inicio:'2022-07-01',fin:'2026-12-31'},
    '40555090': {nombre:'Guissela Palacios Alvarez',    area:'UN. DE ADM',  puesto:'Jefa de Administración',   subarea:'UN. DE ADM',  salario:'S/. 6,200',inicio:'2018-09-01',fin:'2026-12-31'},
  }

  function calcularVigencia(fin: string): string {
    const hoy = new Date()
    const finDate = new Date(fin)
    if (isNaN(finDate.getTime())) return '—'
    const diffMs = finDate.getTime() - hoy.getTime()
    if (diffMs <= 0) return 'Contrato vencido'
    const diffDias = Math.floor(diffMs / (1000*60*60*24))
    const meses = Math.floor(diffDias / 30)
    const dias = diffDias % 30
    return meses > 0 ? `${meses} mes(es) y ${dias} día(s)` : `${dias} día(s)`
  }

  async function buscarColabNSS() {
    setNssDniErr(false); setNssColab(null); setNssBuscando(true)
    const mock = COLAB_MOCK_ADV[nssDni.trim()]
    if (mock) { setNssColab(mock); setNssBuscando(false); return }
    const { data } = await supabase.from('colaboradores').select('nombres,apellidos,area,puesto').eq('dni', nssDni.trim()).maybeSingle()
    if (data) setNssColab({ nombre:`${data.nombres} ${data.apellidos}`, area:data.area??'—', puesto:data.puesto??'—' })
    else setNssDniErr(true)
    setNssBuscando(false)
  }

  async function buscarColabEval() {
    setEvalDniErr(false); setEvalColab(null); setEvalBuscando(true)
    const mock = COLAB_MOCK_ADV[evalDni.trim()]
    if (mock) {
      setEvalColab({ ...mock, vigencia: calcularVigencia(mock.fin) })
      setEvalBuscando(false); return
    }
    const { data } = await supabase.from('colaboradores').select('nombres,apellidos,area,puesto').eq('dni', evalDni.trim()).maybeSingle()
    if (data) setEvalColab({ nombre:`${data.nombres} ${data.apellidos}`, area:data.area??'—', puesto:data.puesto??'—', vigencia:'—' })
    else setEvalDniErr(true)
    setEvalBuscando(false)
  }

  const evalMontoNum = parseFloat(evalMontoAprobado.replace(/[^0-9.]/g,''))
  const evalCuotasData = evalResultado==='Aprobado' && evalMontoNum>0 && parseInt(evalCuotas)>0
    ? calcularCuotas(evalMontoNum, parseInt(evalCuotas))
    : []

  const selectedRow = misSolicitudes.find(r => r.numero === selectedNumero) ?? null

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
          <button className="btn btn-primary" onClick={() => setShowNuevaSol(true)}>+ Nueva Solicitud</button>
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
                {misSolicitudes.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No hay solicitudes registradas</td></tr>
                )}
                {misSolicitudes.map(s => (
                  <tr key={s.id}>
                    <td className="fw-600">{s.numero}</td>
                    <td>{s.tipo}</td>
                    <td>{s.monto}</td>
                    <td>{s.fecha}</td>
                    <td><span className={`badge ${s.estado==='aprobado'?'b-green':s.estado==='rechazado'?'b-red':'b-yellow'}`}>{s.estado==='aprobado'?'Aprobado':s.estado==='rechazado'?'Rechazado':'En revisión'}</span></td>
                    <td className="text-sm text-gray">{s.proximo}</td>
                    <td><button className="btn btn-gray btn-xs" onClick={() => openDetalle(s.numero)}>Ver detalle</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div className="text-xs text-gray mt-4">Todas las solicitudes recibidas — J. Carbajal (Jefa de GDTH) realiza la evaluación inicial de cada solicitud</div>
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
                        <button className="btn btn-gray btn-xs" onClick={() => { const row = MATRIZ_DATA.find(r=>r.documento==='ADV-2026-004')??null; setSelectedGDTHRow(row); setEvalDni(''); setEvalColab(null); setEvalResultado(''); setEvalMontoAprobado(row?.monto??''); setEvalCuotas(''); setShowEvalGDTH(true) }}>Ver detalle</button>
                      </div>
                    </td>
                  </tr>
                  {gdthBandeja.map(s => (
                    <tr key={s.id}>
                      <td className="fw-600">{s.numero}</td>
                      <td>{s.colaborador ?? '—'}</td>
                      <td>{s.area ?? '—'}</td>
                      <td>{s.tipo}</td>
                      <td>{s.monto}</td>
                      <td>{s.fecha}</td>
                      <td><span className="badge b-yellow">Nueva — Pendiente evaluación</span></td>
                      <td className="text-sm text-gray">—</td>
                      <td>
                        <button className="btn btn-gray btn-xs" onClick={() => { setSelectedNumero(s.numero); setShowDetalle(true) }}>Ver detalle</button>
                      </td>
                    </tr>
                  ))}
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

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Nueva Solicitud Préstamo/Adelanto (simplificado, Obs 6)
         ══════════════════════════════════════════════════════════════ */}
      {showNuevaSol && (
        <div className="modal-overlay" onClick={() => setShowNuevaSol(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Nueva Solicitud Préstamo/Adelanto</div>
                <div className="modal-subtitle">Completa los datos para registrar tu solicitud</div>
              </div>
              <button className="modal-close" onClick={() => setShowNuevaSol(false)}>×</button>
            </div>
            <div className="modal-body">

              {/* Buscar colaborador */}
              <div className="section-title-sm">BUSCAR COLABORADOR</div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <label className="form-label">DNI del colaborador <span className="req">*</span></label>
                  <input type="text" className="form-control" placeholder="Ingresa el DNI" maxLength={8}
                    value={nssDni} onChange={e => { setNssDni(e.target.value); setNssColab(null); setNssDniErr(false) }}
                    onKeyDown={e => e.key==='Enter' && buscarColabNSS()} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={buscarColabNSS} disabled={nssDni.length < 8 || nssBuscando}>
                  🔍 {nssBuscando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {nssDniErr && <div className="banner banner-amber mb-12">⚠ No se encontró colaborador con ese DNI.</div>}
              {nssColab && (
                <div className="colab-found mb-12">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, background:'#6B21A8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700 }}>
                      {nssColab.nombre.split(' ').map(w=>w[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1E1B4B' }}>{nssColab.nombre}</div>
                      <div style={{ fontSize:11, color:'#6B7280' }}>{nssColab.puesto} · {nssColab.area}</div>
                    </div>
                    <span className="badge b-green">✓ Encontrado</span>
                  </div>
                </div>
              )}

              <div className="h-divider" />

              {/* Tipo: Préstamo / Adelanto */}
              <div className="section-title-sm">TIPO</div>
              <div className="radio-cards" style={{ marginBottom:16 }}>
                <div className={`radio-card${nssTipo==='prestamo'?' selected':''}`} onClick={() => setNssTipo('prestamo')}>
                  <div className="radio-card-icon">💼</div>
                  <div className="radio-card-label">PRÉSTAMO</div>
                </div>
                <div className={`radio-card${nssTipo==='adelanto'?' selected':''}`} onClick={() => setNssTipo('adelanto')}>
                  <div className="radio-card-icon">⚡</div>
                  <div className="radio-card-label">ADELANTO DE SUELDO</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Monto solicitado (S/.) <span className="req">*</span></label>
                  <input type="number" className="form-control" placeholder="0.00" value={nssMonto} onChange={e => setNssMonto(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de solicitud <span className="req">*</span></label>
                  <select className="form-control" value={nssTipoSolicitud} onChange={e => setNssTipoSolicitud(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    <option value="campana">Préstamo por campaña</option>
                    <option value="regular">Préstamo regular</option>
                    <option value="adelanto">Adelanto de sueldo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo <span className="req">*</span></label>
                <select className="form-control" value={nssMotivo} onChange={e => setNssMotivo(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  <option value="escolaridad">Escolaridad</option>
                  <option value="salud">Salud</option>
                  <option value="educacion">Educación</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sustento (documentos)</label>
                <div className="dropzone" style={{ cursor:'pointer' }}
                  onClick={() => document.getElementById('nss-file-input')?.click()}>
                  <div className="dropzone-icon">📎</div>
                  {nssSustentoFile
                    ? <div style={{ fontWeight:600, color:'#1E1B4B', fontSize:13 }}>✔ {nssSustentoFile}</div>
                    : <>
                        <div style={{ fontSize:13 }}>Arrastra archivos aquí o haz clic para seleccionar</div>
                        <div className="dropzone-text">PDF, DOC, DOCX, PNG, JPG — máx 5MB por archivo</div>
                      </>
                  }
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display:'none' }} id="nss-file-input"
                    onChange={e => { setNssSustentoFile(e.target.files?.[0]?.name ?? ''); setNssSustentoPreview(false) }} />
                </div>
                {nssSustentoFile && (
                  <div style={{ marginTop:8 }}>
                    <button className="btn btn-gray btn-xs" onClick={() => setNssSustentoPreview(p => !p)}>
                      {nssSustentoPreview ? '× Cerrar vista previa' : '👁 Vista previa'}
                    </button>
                    {nssSustentoPreview && (
                      <div style={{ marginTop:8, border:'1.5px solid #DDD6FE', borderRadius:6, background:'#F9F8FF', padding:24, textAlign:'center', minHeight:100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ fontSize:40, marginBottom:6 }}>📄</div>
                        <div style={{ fontSize:13, color:'#6B21A8', fontWeight:600 }}>{nssSustentoFile}</div>
                        <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>Vista previa del documento adjunto</div>
                        <div style={{ fontSize:10, color:'#C4B5FD', marginTop:2 }}>El visor real estará disponible en producción</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowNuevaSol(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={async () => {
                if (!nssColab) { alert('Busca un colaborador primero'); return }
                const monto = parseFloat(nssMonto)
                if (!monto || monto <= 0) { alert('Ingresa un monto válido'); return }
                const { count } = await supabase.from('solicitudes_adelanto').select('*', { count:'exact', head:true })
                const numero = `ADV-${new Date().getFullYear()}-${String((count??0)+1).padStart(3,'0')}`
                const { data: newRec, error } = await supabase.from('solicitudes_adelanto').insert({
                  numero, tipo: nssTipo, monto, motivo: nssMotivo, cuotas: 1, estado:'en_revision',
                  colaborador: nssColab.nombre,
                }).select().single()
                if (error) { alert(`Error: ${error.message}`); return }
                // Guardar área en localStorage para persistirla al recargar
                try {
                  const areaCache: Record<string,string> = JSON.parse(localStorage.getItem('cmp_adv_area') ?? '{}')
                  areaCache[numero] = nssColab?.area ?? '—'
                  localStorage.setItem('cmp_adv_area', JSON.stringify(areaCache))
                } catch {}
                const nuevaRow = { id: newRec?.id ?? String(Date.now()), numero,
                  tipo: nssTipo==='adelanto'?'Adelanto de sueldo':'Préstamo personal',
                  monto: `S/. ${monto.toLocaleString('es-PE')}`,
                  fecha: new Date().toLocaleDateString('es-PE'),
                  estado: 'en_revision', proximo: 'J. Carbajal — GDTH: Evaluación',
                  colaborador: nssColab?.nombre, area: nssColab?.area }
                setMisSolicitudes(prev => [nuevaRow, ...prev])
                setGdthBandeja(prev => [nuevaRow, ...prev])
                // Inicializar flujo de 8 pasos: Paso 1 done, Paso 2 active, 3-8 pending
                setAdvFlow(prev => ({ ...prev, [numero]: [
                  { status:'done',    firmante: nssColab?.nombre ?? 'Colaborador', fecha: new Date().toLocaleDateString('es-PE') },
                  { status:'active',  firmante:'', fecha:'' },
                  { status:'pending', firmante:'', fecha:'' },
                  { status:'pending', firmante:'', fecha:'' },
                  { status:'pending', firmante:'', fecha:'' },
                  { status:'pending', firmante:'', fecha:'' },
                  { status:'pending', firmante:'', fecha:'' },
                  { status:'pending', firmante:'', fecha:'' },
                ]}))
                setShowNuevaSol(false); setNssDni(''); setNssColab(null); setNssMonto(''); setNssMotivo(''); setNssTipoSolicitud('')
                setNssSustentoFile(''); setNssSustentoPreview(false)
              }}>📤 Enviar solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Nueva Ficha Préstamo/Adelanto (ficha completa, Obs 6)
         ══════════════════════════════════════════════════════════════ */}
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
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>3</div><span className="step-lbl pend" style={{ fontSize: 10 }}>J. Carbajal — GDTH</span></div>
                  <div className="step-conn"></div>
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>4</div><span className="step-lbl pend" style={{ fontSize: 10 }}>G. Palacios — Adm.</span></div>
                  <div className="step-conn"></div>
                  <div className="step"><div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>5</div><span className="step-lbl pend" style={{ fontSize: 10 }}>E. Chozo — Conta.</span></div>
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

              {/* Flujo de 8 pasos (para solicitudes nuevas con advFlow) o stepper legado */}
              <div className="section-title-sm">FLUJO DE APROBACIÓN</div>
              {advFlow[selectedNumero] ? (() => {
                const FLOW_DEFS = [
                  { label: 'Colaborador — Genera solicitud',           actor: 'Colaborador' },
                  { label: 'J. Carbajal — GDTH: Evaluación',           actor: 'Julieth Z. Carbajal Garro — Jefa de GDTH' },
                  { label: 'Bienestar — Remitir formato al colaborador',actor: 'Bienestar Social' },
                  { label: 'Colaborador — Completa Nueva Ficha',        actor: 'Colaborador' },
                  { label: 'Bienestar — Valida adecuado llenado',       actor: 'Bienestar Social' },
                  { label: 'GDTH — Solicitar Validación de Sec. Adm.',  actor: 'J. Carbajal — Jefa de GDTH' },
                  { label: 'Sec. Administración — Aprobación y firma',  actor: 'Guissela Palacios Alvarez — Jefa de Administración' },
                  { label: 'Contabilidad — Desembolso y comprobante',   actor: 'Edwin J. Chozo Santisteban — Contador General' },
                ]
                const steps = advFlow[selectedNumero]
                const firmaInput = advFirmaInput[selectedNumero] ?? ''
                return (
                  <div style={{ marginTop: 8 }}>
                    {FLOW_DEFS.map((def, i) => {
                      const s = steps[i]
                      if (!s) return null
                      return (
                        <div key={i} className="flow-step-block" style={{ marginBottom: 8 }}>
                          <div className={`flow-step-hdr ${s.status}`}>
                            <span>{s.status==='done'?'✔':s.status==='active'?'⏳':'○'} Paso {i+1}: {def.label}</span>
                            <span style={{ fontSize:11, color:'#9CA3AF' }}>{def.actor}</span>
                          </div>
                          {s.status === 'done' && (
                            <div className="flow-step-body">
                              <div style={{ display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-end' }}>
                                <div>
                                  <div style={{ fontSize:10, color:'#9CA3AF', marginBottom:4 }}>Firmado por</div>
                                  <div className="firma-box" style={{ fontFamily:'Georgia,serif', fontStyle:'italic', minWidth:140 }}>{s.firmante || def.actor}</div>
                                  <div style={{ fontSize:10, color:'#6B7280', marginTop:4 }}>{def.actor}</div>
                                </div>
                                <div className="inv-field"><div className="lbl">Fecha</div><div className="val">{s.fecha}</div></div>
                              </div>
                            </div>
                          )}
                          {s.status === 'active' && (
                            <div className="flow-step-body">
                              {/* Paso 3: Bienestar remite formato */}
                              {i === 2 && (
                                <div className="banner banner-purple" style={{ fontSize:12, marginBottom:8 }}>
                                  📋 Bienestar valida el resultado de la evaluación GDTH. Al "Remitir formato" se habilita el botón "+Nueva Ficha" para el colaborador.
                                </div>
                              )}
                              {/* Paso 6: GDTH Solicitar Validación */}
                              {i === 5 && (
                                <div className="banner banner-purple" style={{ fontSize:12, marginBottom:8 }}>
                                  📤 Al enviar, se solicitará la validación de Sec. de Administración para continuar.
                                </div>
                              )}
                              {/* Paso 8: Contabilidad adjunta comprobante */}
                              {i === 7 && (
                                <div style={{ marginBottom:8 }}>
                                  <label className="form-label" style={{ fontSize:11 }}>Adjuntar comprobante de desembolso</label>
                                  <div className="dropzone" style={{ cursor:'pointer', padding:'12px 16px' }}
                                    onClick={() => document.getElementById(`adv-desebolso-file-${selectedNumero}`)?.click()}>
                                    <div style={{ fontSize:13 }}>{advDesembolsoFile[selectedNumero] ? `✔ ${advDesembolsoFile[selectedNumero]}` : '📎 Seleccionar comprobante'}</div>
                                    <input type="file" id={`adv-desebolso-file-${selectedNumero}`} accept=".pdf,.jpg,.png" style={{ display:'none' }}
                                      onChange={e => setAdvDesembolsoFile(prev => ({ ...prev, [selectedNumero]: e.target.files?.[0]?.name ?? '' }))} />
                                  </div>
                                </div>
                              )}
                              <div className="form-group" style={{ marginBottom:8 }}>
                                <label className="form-label" style={{ fontSize:11 }}>Firma digital — {def.actor}</label>
                                <input type="text" className="form-control"
                                  placeholder="Escribe aquí tu firma..."
                                  style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:14, color:'#1E1B4B' }}
                                  value={firmaInput}
                                  onChange={e => setAdvFirmaInput(prev => ({ ...prev, [selectedNumero]: e.target.value }))}
                                />
                              </div>
                              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => {
                                  if (!firmaInput.trim()) { alert('Escribe tu firma para continuar'); return }
                                  if (i === 7 && !advDesembolsoFile[selectedNumero]) { alert('Adjunta el comprobante de desembolso'); return }
                                  const newSteps = steps.map((st, si) => {
                                    if (si === i) return { ...st, status:'done' as const, firmante: firmaInput, fecha: new Date().toLocaleDateString('es-PE') }
                                    if (si === i+1 && steps[si].status === 'pending') return { ...st, status:'active' as const }
                                    return st
                                  })
                                  setAdvFlow(prev => ({ ...prev, [selectedNumero]: newSteps }))
                                  setAdvFirmaInput(prev => ({ ...prev, [selectedNumero]: '' }))
                                  // Paso 3 done → habilitar Nueva Ficha
                                  if (i === 2) setAdvFichaEnabled(prev => ({ ...prev, [selectedNumero]: true }))
                                  // Paso 8 done → finalizado
                                  if (i === 7) setMisSolicitudes(prev => prev.map(r => r.numero===selectedNumero ? {...r, estado:'aprobado', proximo:'Desembolso realizado'} : r))
                                }}>
                                  {i === 2 ? '📤 Remitir formato' : i === 5 ? '📨 Solicitar Validación' : i === 7 ? '✔ Registrar desembolso' : '✔ Registrar firma'}
                                </button>
                              </div>
                            </div>
                          )}
                          {s.status === 'pending' && (
                            <div className="flow-step-body">
                              {/* Paso 4 - colaborador completa ficha (si fue habilitado) */}
                              {i === 3 && advFichaEnabled[selectedNumero] && !advFichaSubmitted[selectedNumero] && (
                                <div>
                                  <div className="banner banner-purple" style={{ fontSize:12, marginBottom:8 }}>✅ Formato habilitado — el colaborador puede completar su ficha.</div>
                                  <button className="btn btn-primary btn-sm" onClick={() => {
                                    setAdvFichaSubmitted(prev => ({ ...prev, [selectedNumero]: true }))
                                    const newSteps = steps.map((st, si) => {
                                      if (si === 3) return { ...st, status:'done' as const, firmante:'Colaborador', fecha: new Date().toLocaleDateString('es-PE') }
                                      if (si === 4) return { ...st, status:'active' as const }
                                      return st
                                    })
                                    setAdvFlow(prev => ({ ...prev, [selectedNumero]: newSteps }))
                                  }}>📄 Completar Nueva Ficha (simulado)</button>
                                </div>
                              )}
                              {!(i === 3 && advFichaEnabled[selectedNumero] && !advFichaSubmitted[selectedNumero]) && (
                                <p className="text-xs text-gray" style={{ fontStyle:'italic' }}>🔒 Pendiente — se habilitará al completar el paso anterior.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {/* Firmas del proceso */}
                    <div style={{ marginTop:16 }}>
                      <div className="section-title-sm">FIRMAS DEL PROCESO</div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:8 }}>
                        {FLOW_DEFS.map((def, i) => {
                          const s = steps[i]
                          const borderColor = s?.status==='done'?'#22C55E':s?.status==='active'?'#6B21A8':'#D1D5DB'
                          const bgColor = s?.status==='done'?'#F0FDF4':s?.status==='active'?'#F5F3FF':'#FAFAFA'
                          return (
                            <div key={i} className="aprob-cell" style={{ border:`1px solid ${borderColor}`, background:bgColor }}>
                              <div className="aprob-title" style={{ fontSize:9 }}>Paso {i+1}</div>
                              <div className="aprob-zona">
                                {s?.status==='done'
                                  ? <><span style={{ fontFamily:'Georgia,serif', fontStyle:'italic', color:'#1E1B4B', fontSize:12 }}>{s.firmante || '—'}</span><div style={{ fontSize:9, color:'#6B7280', marginTop:2 }}>{s.fecha}</div></>
                                  : s?.status==='active'
                                    ? <span style={{ fontFamily:'Georgia,serif', fontStyle:'italic', color:'#991B1B', fontSize:11 }}>En proceso</span>
                                    : <span style={{ fontFamily:'Georgia,serif', fontStyle:'italic', color:'#6B7280', fontSize:11 }}>En espera</span>
                                }
                              </div>
                              <div style={{ fontSize:9, color:'#9CA3AF', marginTop:4 }}>{def.actor.split('—')[0].trim()}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* Si el paso 8 está done → mostrar comprobante */}
                    {steps[7]?.status === 'done' && advDesembolsoFile[selectedNumero] && (
                      <div style={{ marginTop:12, background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:6, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:18 }}>📎</span>
                        <div>
                          <div style={{ fontWeight:700, color:'#15803D', fontSize:12 }}>Comprobante de desembolso</div>
                          <div style={{ fontSize:11 }}>{advDesembolsoFile[selectedNumero]}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })() : (
                /* Stepper legado para solicitudes sin advFlow */
                <div className="stepper" style={{ marginBottom:12 }}>
                  {selectedRow?.estado === 'aprobado' ? (
                    <>
                      <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
                      <div className="step-conn done"></div>
                      <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Bienestar</span></div>
                      <div className="step-conn done"></div>
                      <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">J. Carbajal — GDTH</span></div>
                      <div className="step-conn done"></div>
                      <div className="step"><div className="step-circ cur">⏳</div><span className="step-lbl cur">G. Palacios — Adm.</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">E. Chozo — Conta.</span></div>
                    </>
                  ) : selectedRow?.estado === 'rechazado' ? (
                    <>
                      <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">J. Carbajal — GDTH</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">G. Palacios — Adm.</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">E. Chozo — Conta.</span></div>
                    </>
                  ) : (
                    <>
                      <div className="step"><div className="step-circ done">✔</div><span className="step-lbl done">Solicitud</span></div>
                      <div className="step-conn done"></div>
                      <div className="step"><div className="step-circ cur">⏳</div><span className="step-lbl cur">Bienestar</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">J. Carbajal — GDTH</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">G. Palacios — Adm.</span></div>
                      <div className="step-conn"></div>
                      <div className="step"><div className="step-circ pend">○</div><span className="step-lbl pend">E. Chozo — Conta.</span></div>
                    </>
                  )}
                </div>
              )}

              {/* Observación si rechazado */}
              {selectedRow?.estado === 'rechazado' && (
                <div style={{ marginTop: 10, background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#92400E' }}>
                  Motivo: No cumple con los requisitos mínimos de tiempo de servicio.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowDetalle(false)}>Cerrar</button>
              {(() => {
                const fichaEnabled = selectedRow?.estado === 'aprobado' || !!advFichaEnabled[selectedNumero]
                return (
                  <button
                    className="btn btn-primary btn-sm"
                    style={!fichaEnabled ? {opacity:0.45,cursor:'not-allowed'} : {}}
                    disabled={!fichaEnabled}
                    title={!fichaEnabled ? 'Disponible cuando Bienestar remita el formato (Paso 3)' : undefined}
                    onClick={() => { if (fichaEnabled) { setShowDetalle(false); setShowNueva(true) } }}
                  >
                    📄 +Nueva Ficha Préstamo/Adelanto
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Evaluación GDTH (Obs 7)
         ══════════════════════════════════════════════════════════════ */}
      {showEvalGDTH && selectedGDTHRow && (
        <div className="modal-overlay" onClick={() => setShowEvalGDTH(false)}>
          <div className="modal" style={{ maxWidth: 680, maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Evaluación GDTH — {selectedGDTHRow.documento}</div>
                <div className="modal-subtitle">{selectedGDTHRow.nombre} · DNI: {selectedGDTHRow.dni}</div>
              </div>
              <button className="modal-close" onClick={() => setShowEvalGDTH(false)}>×</button>
            </div>
            <div className="modal-body">

              {/* Datos del solicitante */}
              <div className="section-title-sm">DATOS DE LA SOLICITUD</div>
              <div className="inv-grid" style={{ marginBottom:14 }}>
                <div className="inv-field"><div className="lbl">N° Documento</div><div className="val fw-600">{selectedGDTHRow.documento}</div></div>
                <div className="inv-field"><div className="lbl">Colaborador</div><div className="val">{selectedGDTHRow.nombre}</div></div>
                <div className="inv-field"><div className="lbl">DNI</div><div className="val">{selectedGDTHRow.dni}</div></div>
                <div className="inv-field"><div className="lbl">Área</div><div className="val">{selectedGDTHRow.area}</div></div>
                <div className="inv-field"><div className="lbl">Puesto</div><div className="val">{selectedGDTHRow.puesto}</div></div>
                <div className="inv-field"><div className="lbl">Tipo</div><div className="val"><span className={`badge ${selectedGDTHRow.tipo==='adelanto'?'b-purple':'b-blue'}`}>{selectedGDTHRow.tipo==='adelanto'?'ADELANTO DE SUELDO':'PRÉSTAMO PERSONAL'}</span></div></div>
                <div className="inv-field"><div className="lbl">Motivo</div><div className="val">{selectedGDTHRow.motivo}</div></div>
                <div className="inv-field"><div className="lbl">Monto solicitado</div><div className="val fw-600">{selectedGDTHRow.monto}</div></div>
                <div className="inv-field"><div className="lbl">Fecha solicitud</div><div className="val">{selectedGDTHRow.fecha}</div></div>
                <div className="inv-field"><div className="lbl">Cuotas</div><div className="val">{selectedGDTHRow.cuotas}</div></div>
                <div className="inv-field"><div className="lbl">Mes de descuento</div><div className="val">{selectedGDTHRow.mes_descuento}</div></div>
                <div className="inv-field"><div className="lbl">Aprueba</div><div className="val">{selectedGDTHRow.aprueba}</div></div>
              </div>

              <div className="h-divider" />

              {/* Bloque Evaluación — búsqueda por DNI del colaborador */}
              <div className="section-title-sm">EVALUACIÓN</div>
              <div className="banner banner-purple" style={{ marginBottom:12, fontSize:12 }}>
                🔍 Busca al colaborador por DNI para ver su información contractual antes de evaluar
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <label className="form-label">DNI del colaborador <span className="req">*</span></label>
                  <input type="text" className="form-control" placeholder="Ingresa el DNI" maxLength={8}
                    value={evalDni} onChange={e => { setEvalDni(e.target.value); setEvalColab(null); setEvalDniErr(false) }}
                    onKeyDown={e => e.key==='Enter' && buscarColabEval()} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={buscarColabEval} disabled={evalDni.length<8||evalBuscando}>
                  🔍 {evalBuscando?'Buscando...':'Buscar'}
                </button>
              </div>
              {evalDniErr && <div className="banner banner-amber mb-8">⚠ No se encontró colaborador con ese DNI.</div>}
              {evalColab && (
                <div className="inv-grid" style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
                  <div className="inv-field"><div className="lbl">Colaborador</div><div className="val fw-600">{evalColab.nombre}</div></div>
                  <div className="inv-field"><div className="lbl">Área</div><div className="val">{evalColab.area}</div></div>
                  <div className="inv-field"><div className="lbl">Puesto</div><div className="val">{evalColab.puesto}</div></div>
                  {evalColab.subarea && <div className="inv-field"><div className="lbl">Sub-Área</div><div className="val">{evalColab.subarea}</div></div>}
                  {evalColab.salario && <div className="inv-field"><div className="lbl">Salario</div><div className="val fw-600">{evalColab.salario}</div></div>}
                  {evalColab.inicio && <div className="inv-field"><div className="lbl">Inicio contrato</div><div className="val">{new Date(evalColab.inicio).toLocaleDateString('es-PE')}</div></div>}
                  {evalColab.fin && <div className="inv-field"><div className="lbl">Fin contrato</div><div className="val">{new Date(evalColab.fin).toLocaleDateString('es-PE')}</div></div>}
                  {evalColab.vigencia && <div className="inv-field"><div className="lbl">Vigencia restante</div><div className="val fw-600" style={{ color:'#1E1B4B' }}>{evalColab.vigencia}</div></div>}
                </div>
              )}

              <div className="h-divider" />

              {/* Bloque Resultado */}
              <div className="section-title-sm">RESULTADO</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Resultado <span className="req">*</span></label>
                  <select className="form-control" value={evalResultado} onChange={e => setEvalResultado(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monto Aprobado (S/.) <span className="req">*</span></label>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <input type="text" className="form-control" value={evalMontoAprobado}
                      readOnly={!evalMontoEditable}
                      style={{ background: evalMontoEditable ? undefined : '#F9FAFB' }}
                      onChange={e => setEvalMontoAprobado(e.target.value)} />
                    <button className="btn btn-outline btn-xs" onClick={() => setEvalMontoEditable(p=>!p)}
                      title={evalMontoEditable ? 'Bloquear monto' : 'Editar monto'}>
                      {evalMontoEditable ? '🔒' : '✏️'}
                    </button>
                  </div>
                  <div className="form-hint">Monto jalado de la solicitud — editable si se aprueba un monto menor</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">N° de Cuotas</label>
                  <select className="form-control" value={evalCuotas} onChange={e => setEvalCuotas(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {Array.from({length:12},(_,i)=><option key={i+1} value={String(i+1)}>{i+1} cuota{i>0?'s':''}</option>)}
                  </select>
                </div>
              </div>

              {/* Cronograma de pagos */}
              {evalCuotasData.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div className="section-title-sm">CRONOGRAMA DE PAGOS</div>
                  <table className="cuotas-table">
                    <thead><tr><th>CUOTA N°</th><th>MES</th><th>MONTO (S/.)</th></tr></thead>
                    <tbody>
                      {evalCuotasData.map(c => (
                        <tr key={c.cuota}><td>{c.cuota}</td><td>{c.mes}</td><td>{c.montoStr}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowEvalGDTH(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={!evalResultado}
                style={!evalResultado?{opacity:0.5,cursor:'not-allowed'}:{}}
                onClick={() => {
                  if (!evalResultado) { alert('Selecciona un resultado'); return }
                  alert(`✓ ${evalResultado === 'Aprobado' ? 'Préstamo/Adelanto generado' : 'Solicitud rechazada'} correctamente`)
                  setShowEvalGDTH(false)
                }}
              >
                ✔ Generar Préstamo/Adelanto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
