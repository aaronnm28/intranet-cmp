import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Data ──────────────────────────────────────────────────────────────────────
type FlujoStatus = 'done' | 'active' | 'pending' | 'rejected'
interface FlujoStep { paso: number; label: string; actor: string; status: FlujoStatus; fecha: string; firmante: string; cargo: string }
interface Solicitud {
  n: string; bien: string; tipo: string; fecha: string; fechaEntrega: string
  areaEncargada: string; estado: string; estadoCls: string
  colaborador: string; dni: string; puesto: string; subArea: string; motivo: string
  observacion?: string; flujo: FlujoStep[]
}

const SOLICITUDES: Record<string, Solicitud> = {
  'SOL-2026-001': {
    n:'SOL-2026-001', bien:'Laptop HP EliteBook 840', tipo:'Cómputo',
    fecha:'10/03/2026', fechaEntrega:'—', areaEncargada:'TI', estado:'En revisión', estadoCls:'b-yellow',
    colaborador:'Aaron Samuel Nuñez Muñoz', dni:'77434028', puesto:'Analista de Sistemas', subArea:'UN. DE TI',
    motivo:'Reposición de equipo de cómputo por falla técnica del equipo anterior.',
    flujo:[
      {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:'10/03/2026',firmante:'Lizzetti Díaz E.',cargo:'Sec. Administración'},
      {paso:2,label:'UN. DE TI — Validación y entrega del bien',actor:'UN. DE TI',status:'active',fecha:'—',firmante:'',cargo:'Jefe UN. DE TI'},
      {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'pending',fecha:'—',firmante:'',cargo:'Sec. Administración'},
      {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'pending',fecha:'—',firmante:'',cargo:'Aaron Samuel Nuñez Muñoz'},
    ],
  },
  'SOL-2026-002': {
    n:'SOL-2026-002', bien:'Silla ergonómica', tipo:'Mobiliario',
    fecha:'08/03/2026', fechaEntrega:'13/03/2026', areaEncargada:'Administración', estado:'Aprobado', estadoCls:'b-green',
    colaborador:'Carlos Pérez Ramos', dni:'45231089', puesto:'Analista Contable', subArea:'Contabilidad',
    motivo:'Necesidad de silla ergonómica por indicación médica documentada.',
    flujo:[
      {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:'08/03/2026',firmante:'Lizzetti Díaz E.',cargo:'Sec. Administración'},
      {paso:2,label:'Administración — Validación y entrega del bien',actor:'Administración',status:'done',fecha:'10/03/2026',firmante:'Pedro Salas Q.',cargo:'Jefe de Administración'},
      {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'done',fecha:'12/03/2026',firmante:'Lizzetti Díaz E.',cargo:'Sec. Administración'},
      {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'done',fecha:'12/03/2026',firmante:'Carlos Pérez Ramos',cargo:'Analista Contable'},
    ],
  },
  'SOL-2026-003': {
    n:'SOL-2026-003', bien:'Teléfono IP', tipo:'Comunicaciones',
    fecha:'05/03/2026', fechaEntrega:'—', areaEncargada:'Comunicaciones', estado:'Observado', estadoCls:'b-yellow',
    colaborador:'María Torres Huamán', dni:'32187654', puesto:'Especialista GDTH', subArea:'UN. DE GDTH',
    motivo:'Reposición de teléfono IP dañado por falla eléctrica.',
    observacion:'El área de Comunicaciones solicita especificación técnica del modelo requerido. Adjuntar ficha técnica del equipo.',
    flujo:[
      {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:'05/03/2026',firmante:'Lizzetti Díaz E.',cargo:'Sec. Administración'},
      {paso:2,label:'Comunicaciones — Validación del bien',actor:'Comunicaciones',status:'rejected',fecha:'07/03/2026',firmante:'Observado',cargo:'Área Comunicaciones'},
      {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'pending',fecha:'—',firmante:'',cargo:'Sec. Administración'},
      {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'pending',fecha:'—',firmante:'',cargo:'María Torres Huamán'},
    ],
  },
}

const COLABS: Record<string, { nombre:string; apellido:string; puesto:string; subarea:string; consejo:string; initials:string }> = {
  '77434028': {nombre:'Aaron Samuel',apellido:'Nuñez Muñoz',puesto:'Analista de Sistemas',subarea:'Tecnología de Información',consejo:'Consejo Nacional',initials:'AN'},
  '45231089': {nombre:'Carlos',apellido:'Pérez Ramos',puesto:'Analista Contable',subarea:'UN. DE GDTH',consejo:'Consejo Nacional',initials:'CP'},
  '32187654': {nombre:'Ana María',apellido:'Flores Vega',puesto:'Asistente Administrativa',subarea:'SEC. ADMINISTRACIÓN',consejo:'Consejo Nacional',initials:'FA'},
}

const BIENES_DISP = [
  {id:'111025',icon:'💻',title:'Laptop — HP EliteBook 840',sub:'ID: 111025 · QR: CMP-038395 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038395',marca:'HP',modelo:'EliteBook 840',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'HP-00-2025-111025'},
  {id:'111026',icon:'🖥',title:'Monitor — Samsung 27" S27A',sub:'ID: 111026 · QR: CMP-038396 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038396',marca:'Samsung',modelo:'27" S27A',estado:'Bueno',condicion:'En Uso',area:'UN. DE TI',serie:'SAM-00-2024-111026'},
  {id:'111027',icon:'🖨',title:'Impresora — Epson L3150',sub:'ID: 111027 · QR: CMP-038397 · Condición: En Uso',badge:'b-yellow',badgeTxt:'En revisión',qr:'CMP-038397',marca:'Epson',modelo:'L3150',estado:'Regular',condicion:'En Uso',area:'UN. DE TI',serie:'EPS-00-2023-111027'},
  {id:'111028',icon:'📽',title:'Proyector — Epson EB-X51',sub:'ID: 111028 · QR: CMP-038398 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038398',marca:'Epson',modelo:'EB-X51',estado:'Bueno',condicion:'En Uso',area:'UN. DE TI',serie:'EPS-00-2024-111028'},
  {id:'111029',icon:'📱',title:'Tablet — Samsung Tab S7',sub:'ID: 111029 · QR: CMP-038399 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038399',marca:'Samsung',modelo:'Tab S7',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'SAM-00-2025-111029'},
]

const ACCS_DISP = [
  {id:'20261114',nombre:'Teclado Inalámbrico',marca:'Logitech',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'20261115',nombre:'Mouse Inalámbrico',marca:'Logitech',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'20261116',nombre:'Hub USB 4 puertos',marca:'Anker',area:'ADMINISTRACION',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'20261117',nombre:'Webcam HD',marca:'Logitech',area:'COMUNICACIONES',estado:'b-green',estadoTxt:'Bueno',disp:'b-blue',dispTxt:'Asignado'},
  {id:'20261118',nombre:'Auriculares',marca:'Sony',area:'UN. DE GDTH',estado:'b-yellow',estadoTxt:'Regular',disp:'b-yellow',dispTxt:'En revisión'},
]

const BIENES_ASIG = [
  {id:'111030',icon:'💻',title:'Laptop — Dell Latitude 5420',sub:'ID: 111030 · QR: CMP-038401 · Condición: En Uso',qr:'CMP-038401',marca:'Dell',modelo:'Latitude 5420',estado:'En Uso',condicion:'Bueno',area:'UN. DE TI',serie:'DELL-00-2024-111030'},
  {id:'111031',icon:'🖥️',title:'Monitor — LG 24" 24MK430H',sub:'ID: 111031 · QR: CMP-038402 · Condición: En Uso',qr:'CMP-038402',marca:'LG',modelo:'24MK430H',estado:'En Uso',condicion:'Bueno',area:'UN. DE TI',serie:'LG-00-2023-111031'},
  {id:'111032',icon:'📱',title:'Teléfono IP — Fanvil X4U',sub:'ID: 111032 · QR: CMP-038403 · Condición: Bueno',qr:'CMP-038403',marca:'Fanvil',modelo:'X4U',estado:'Bueno',condicion:'Bueno',area:'UN. DE TI',serie:'FAN-00-2024-111032'},
]
const ACCS_ASIG = [
  {id:'20261110',nombre:'Teclado HP K1500',marca:'HP',area:'SEC. DE ADMINISTRACION',subarea:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno'},
  {id:'20261111',nombre:'Mouse Logitech M185',marca:'Logitech',area:'SEC. DE ADMINISTRACION',subarea:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno'},
  {id:'20261112',nombre:'Auriculares Jabra',marca:'Jabra',area:'SEC. DE ADMINISTRACION',subarea:'UN. DE TI',estado:'b-yellow',estadoTxt:'Regular'},
]
const REASI_ROWS = [
  {id:'111030',desc:'Laptop Dell Latitude 5420',tipo:'Bien',qr:'CMP-038401',estado:'Asignado'},
  {id:'111031',desc:'Monitor LG 24" 24MK430H',tipo:'Bien',qr:'CMP-038402',estado:'Asignado'},
  {id:'111032',desc:'Teléfono IP Fanvil X4U',tipo:'Bien',qr:'CMP-038403',estado:'Asignado'},
  {id:'20261110',desc:'Teclado HP K1500',tipo:'Accesorio',qr:'2026_ADM_0003',estado:'Asignado'},
  {id:'20261111',desc:'Mouse Logitech M185',tipo:'Accesorio',qr:'2026_ADM_0004',estado:'Asignado'},
  {id:'20261112',desc:'Auriculares Jabra',tipo:'Accesorio',qr:'2026_ADM_0005',estado:'Asignado'},
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function stepIcon(s: FlujoStatus) { return s==='done'?'✔':s==='active'?'⏳':s==='rejected'?'✕':'○' }
function stepCls(s: FlujoStatus)  { return s==='done'?'done':s==='active'?'cur':s==='rejected'?'cur':'pend' }

// ── Toast simple ──────────────────────────────────────────────────────────────
function useToast() {
  const [msg,setMsg] = useState('')
  const [vis,setVis] = useState(false)
  const show = (m:string) => { setMsg(m); setVis(true); setTimeout(()=>setVis(false),2500) }
  const el = vis ? <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1E1B4B',color:'white',padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,.25)',whiteSpace:'nowrap'}}>{msg}</div> : null
  return {show,el}
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AsignacionBienes() {
  const toast = useToast()

  // main tabs
  const [tab, setTab] = useState<'mis'|'pendientes'|'historial'>('mis')

  // modals
  const [showNueva,       setShowNueva]       = useState(false)
  const [showDetalle,     setShowDetalle]     = useState(false)
  const [showConformidad, setShowConformidad] = useState(false)
  const [showDisp,        setShowDisp]        = useState(false)
  const [showReporte,     setShowReporte]     = useState(false)

  // detalle
  const [detSol, setDetSol] = useState<Solicitud|null>(null)
  const [detFirmas, setDetFirmas] = useState<Record<number,string>>({})

  // nueva solicitud modal
  const [nsTab,      setNsTab]      = useState<'bienes'|'accesorios'|'disponibles'|'asignaciones'|'reasignaciones'>('bienes')
  const [nsDni,      setNsDni]      = useState('')
  const [nsColab,    setNsColab]    = useState<typeof COLABS[string]|null>(null)
  const [nsDniErr,   setNsDniErr]   = useState(false)
  const [nsTipoBien, setNsTipoBien] = useState('')
  const [nsBienNom,  setNsBienNom]  = useState('')
  const [nsBienJust, setNsBienJust] = useState('')
  // disponibles sub-tab
  const [nsdTab,     setNsdTab]     = useState<'bienes'|'accs'>('bienes')
  const [nsdDetalle, setNsdDetalle] = useState<typeof BIENES_DISP[0]|null>(null)
  const [selBienes,  setSelBienes]  = useState<Set<string>>(new Set())
  const [selAccs,    setSelAccs]    = useState<Set<string>>(new Set())
  // asignaciones sub-tab
  const [nsaTab,     setNsaTab]     = useState<'bienes'|'accs'>('bienes')
  const [nsaDetalle, setNsaDetalle] = useState<typeof BIENES_ASIG[0]|null>(null)
  // reasignaciones
  const [reasigSel,  setReasigSel]  = useState<typeof REASI_ROWS[0]|null>(null)

  // disponibilidad modal
  const [dispTab, setDispTab] = useState<'bienes'|'accs'>('bienes')

  // solicitudes desde supabase
  const [solicitudesDB, setSolicitudesDB] = useState<Array<{id:string;numero:string;bien_nombre:string;tipo:string;fecha_solicitud:string;estado:string;colaborador:string;area_encargada:string}>>([])

  useEffect(() => {
    supabase
      .from('solicitudes_asignacion')
      .select('id,numero,bien_nombre,tipo,fecha_solicitud,estado,colaborador,area_encargada')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data && data.length > 0) setSolicitudesDB(data) })
  }, [])

  // flujo info
  const flujoAreaMap: Record<string,string> = { computo:'UN. DE TI', mobiliario:'Administración', comunicaciones:'Comunicaciones' }

  async function buscarColab() {
    const dni = nsDni.trim()
    // primero mock local
    const mock = COLABS[dni]
    if (mock) { setNsColab(mock); setNsDniErr(false); return }
    // luego Supabase
    const { data } = await supabase.from('colaboradores').select('*').eq('dni', dni).maybeSingle()
    if (data) {
      setNsColab({ nombre: data.nombres, apellido: data.apellidos, puesto: data.puesto ?? '—', subarea: data.area ?? '—', consejo: 'Consejo Nacional', initials: (data.nombres[0] + data.apellidos[0]).toUpperCase() })
      setNsDniErr(false)
    } else {
      setNsColab(null); setNsDniErr(true)
    }
  }

  function toggleBien(id:string) {
    setSelBienes(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s })
  }
  function toggleAcc(id:string) {
    setSelAccs(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s })
  }

  function openDetalle(id:string) {
    const d = SOLICITUDES[id]
    if (d) { setDetSol(d); setDetFirmas({}); setShowDetalle(true) }
  }

  function registrarFirma(paso:number) {
    const val = detFirmas[paso]
    if (!val?.trim()) { toast.show('Escribe tu firma antes de registrar'); return }
    toast.show(`Firma registrada en Paso ${paso}`)
  }

  async function enviarSolicitud() {
    if (!nsColab) { toast.show('Busca un colaborador primero'); return }
    if (nsTab==='bienes' && !nsBienNom.trim()) { toast.show('Completa el nombre del bien'); return }
    // Generar número correlativo
    const { count } = await supabase.from('solicitudes_asignacion').select('*', { count: 'exact', head: true })
    const num = `SOL-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(3, '0')}`
    const payload = {
      numero: num,
      colaborador_dni: nsDni.trim(),
      colaborador: `${nsColab.nombre} ${nsColab.apellido}`,
      bien_nombre: nsBienNom || (selBienes.size > 0 ? [...selBienes].join(', ') : 'Sin especificar'),
      tipo: nsTipoBien || 'computo',
      area_encargada: flujoAreaMap[nsTipoBien] ?? 'Administración',
      puesto: nsColab.puesto,
      sub_area: nsColab.subarea,
      motivo: nsBienJust,
      estado: 'En revisión',
    }
    const { data: newRec, error } = await supabase.from('solicitudes_asignacion').insert(payload).select().single()
    if (error) {
      toast.show(`Error: ${error.message}`)
      return
    }
    if (newRec) {
      setSolicitudesDB(prev => [{ id: newRec.id, numero: newRec.numero, bien_nombre: newRec.bien_nombre, tipo: newRec.tipo, fecha_solicitud: newRec.fecha_solicitud ?? new Date().toLocaleDateString('es-PE'), estado: newRec.estado, colaborador: newRec.colaborador, area_encargada: newRec.area_encargada }, ...prev])
    }
    toast.show(`✓ Solicitud ${num} enviada correctamente`)
    setShowNueva(false)
    setNsDni(''); setNsColab(null); setNsBienNom(''); setNsBienJust(''); setNsTipoBien('')
  }

  function generarPDF() {
    const w = window.open('','_blank','width=820,height:920')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte Asignaciones CMP</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:0;background:#525659;display:flex;flex-direction:column;align-items:center;padding:20px 0}
      .toolbar{background:#3d3d3d;color:white;width:794px;display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-radius:4px 4px 0 0;font-size:13px;font-weight:500;margin-top:20px;box-sizing:border-box}
      .toolbar button{background:#6B21A8;color:white;border:none;border-radius:4px;padding:5px 12px;font-size:12px;cursor:pointer}
      .pdf{background:white;width:794px;min-height:1123px;padding:40px 48px;box-shadow:0 4px 20px rgba(0,0,0,.4);margin-bottom:16px;box-sizing:border-box}
      h2{font-size:18px;font-weight:700;color:#1E1B4B;margin:0 0 4px}
      .sub{font-size:11px;color:#6B7280;margin-bottom:20px;padding-bottom:12px;border-bottom:1.5px solid #E5E7EB}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}
      th,td{border:1px solid #D1D5DB;padding:6px 8px;text-align:left}
      th{background:#F3F4F6;font-weight:600}
      .logo-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
      .logo{font-weight:900;font-size:18px;color:#4A1272;border:2px solid #4A1272;border-radius:6px;padding:4px 10px}
      .org{font-size:10px;color:#6B7280;text-align:right}
      .aprob-zona{min-height:44px;display:flex;flex-direction:column;justify-content:center;padding:4px 6px;border:1px solid #E5E7EB;border-radius:5px}
      .f-done{font-family:Georgia,serif;font-style:italic;color:#1E1B4B;font-size:12px}
      .f-pend{font-family:Georgia,serif;font-style:italic;color:#991B1B;font-size:12px}
      .f-wait{font-family:Georgia,serif;font-style:italic;color:#6B7280;font-size:12px}
      .f-meta{font-size:10px;color:#6B7280;margin-top:1px}
      @media print{body{background:white;padding:0}.toolbar{display:none}.pdf{box-shadow:none;padding:20mm}}
    </style></head><body>
    <div class="toolbar"><span>📄 Reporte de Asignaciones — Intranet CMP</span><button onclick="window.print()">🖨 Imprimir / Guardar PDF</button></div>
    <div class="pdf">
      <div class="logo-row"><span class="logo">CMP</span><div class="org">Colegio Médico del Perú<br>Consejo Nacional</div></div>
      <h2>Reporte de Asignaciones</h2>
      <div class="sub">Colaborador: Aaron Samuel Nuñez Muñoz · DNI: 77434028 · Área: UN. DE TI<br>Generado el ${new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'})} · Sistema Intranet CMP</div>
      <p style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px">📦 Bienes Asignados</p>
      <table>
        <thead><tr><th>ID</th><th>Descripción</th><th>QR</th><th>Condición</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
        <tbody>
          <tr><td>111030</td><td>Laptop Dell Latitude 5420</td><td>CMP-038401</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>111031</td><td>Monitor LG 24" 24MK430H</td><td>CMP-038402</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>111032</td><td>Teléfono IP Fanvil X4U</td><td>CMP-038403</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-pend">Pendiente</span><div class="f-meta">—</div></div></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:12px;font-weight:600;color:#374151;margin:16px 0 8px">🔌 Accesorios Asignados</p>
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Estado</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
        <tbody>
          <tr><td>2026_ADM_0003</td><td>Teclado HP K1500</td><td>HP</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>2026_ADM_0004</td><td>Mouse Logitech M185</td><td>Logitech</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>2026_ADM_0005</td><td>Auriculares Jabra</td><td>Jabra</td><td>Regular</td>
            <td><div class="aprob-zona"><span class="f-wait">En espera</span><div class="f-meta">—</div></div></td>
            <td><div class="aprob-zona"><span class="f-wait">En espera</span><div class="f-meta">—</div></div></td>
          </tr>
        </tbody>
      </table>
    </div></body></html>`)
    w.document.close()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {toast.el}

      {/* ── PANTALLA PRINCIPAL ── */}
      <div className="breadcrumb">Gestión de Recursos › <span>Asignación de Bienes</span></div>
      <div className="page-header">
        <div>
          <div className="page-title">Asignación de Bienes</div>
          <div className="page-subtitle">Solicitud y seguimiento de bienes para colaboradores</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowDisp(true)}>🔍 Consultar disponibilidad</button>
          <button className="btn btn-primary" onClick={() => setShowNueva(true)}>+ Nueva Solicitud</button>
        </div>
      </div>

      <div className="tabs">
        {(['mis','pendientes','historial'] as const).map(t => (
          <div key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t==='mis'?'Mis Solicitudes':t==='pendientes'?'Pendientes de Aprobación':'Historial'}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Solicitud</th><th>Bien solicitado</th><th>Tipo</th>
                <th>Fecha solicitud</th><th>Fecha de entrega</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesDB.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No hay solicitudes registradas</td></tr>
              )}
              {solicitudesDB.map(s => (
                <tr key={s.id}>
                  <td className="fw-600">{s.numero}</td>
                  <td>{s.bien_nombre}</td>
                  <td><span className="badge b-gray">{s.tipo}</span></td>
                  <td>{s.fecha_solicitud ?? '—'}</td>
                  <td className="text-gray">—</td>
                  <td><span className={`badge ${s.estado==='Aprobado'?'b-green':s.estado==='Rechazado'?'b-red':s.estado==='Observado'?'b-yellow':'b-yellow'}`}>{s.estado}</span></td>
                  <td><div className="actions-cell"><button className="btn btn-gray btn-xs" onClick={() => toast.show(`Detalle: ${s.numero}`)}>Ver detalle</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <div className="banner banner-purple">
            📋 Para solicitudes de bienes de cómputo, TI verificará disponibilidad. Para comunicaciones, el área de Comunicaciones gestionará el equipamiento.
          </div>
        </div>
      </div>
      <div className="text-xs text-gray mt-8" style={{fontStyle:'italic'}}>📌 Nota de diseño: Rol activo determina tabs visibles — usuario ve sus solicitudes, GDTH/Admin ven bandeja completa.</div>

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Nueva Solicitud
         ══════════════════════════════════════════════════════════════ */}
      {showNueva && (
        <div className="modal-overlay" onClick={() => setShowNueva(false)}>
          <div className="modal-box" style={{maxWidth:680}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">Nueva Solicitud de Asignación de Bien</span>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Rol: Administración — Asignación a colaborador</div>
              </div>
              <button className="modal-close" onClick={() => setShowNueva(false)}>×</button>
            </div>
            <div className="modal-body">

              {/* Buscar colaborador */}
              <div className="section-title-sm">BUSCAR COLABORADOR</div>
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{flex:1}}>
                  <label className="form-label">DNI del colaborador <span className="req">*</span></label>
                  <input type="text" className="form-control" placeholder="Ingresa el DNI" maxLength={8}
                    value={nsDni} onChange={e => setNsDni(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && buscarColab()} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={buscarColab}>🔍 Buscar</button>
                <button className="btn btn-gray btn-sm" onClick={() => { setNsDni(''); setNsColab(null); setNsDniErr(false) }}>Limpiar</button>
              </div>
              <div className="search-hint mt-8 mb-12">DNIs de prueba: <strong>45231089</strong> · <strong>77434028</strong> · <strong>32187654</strong></div>

              {nsDniErr && <div className="banner banner-amber mb-12">⚠ No se encontró colaborador con ese DNI.</div>}

              {nsColab && (
                <div className="colab-found mb-12">
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:34,height:34,background:'#6B21A8',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700,flexShrink:0}}>{nsColab.initials}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#1E1B4B'}}>{nsColab.nombre} {nsColab.apellido}</div>
                      <div style={{fontSize:11,color:'#6B7280'}}>{nsColab.puesto} · {nsColab.subarea}</div>
                    </div>
                    <span className="badge b-green">✓ Encontrado</span>
                  </div>
                  <div className="colab-grid">
                    <div className="colab-field"><div className="lbl">Nombre(s)</div><div className="val">{nsColab.nombre}</div></div>
                    <div className="colab-field"><div className="lbl">Apellido(s)</div><div className="val">{nsColab.apellido}</div></div>
                    <div className="colab-field"><div className="lbl">Puesto</div><div className="val">{nsColab.puesto}</div></div>
                    <div className="colab-field"><div className="lbl">Sub-Área</div><div className="val">{nsColab.subarea}</div></div>
                    <div className="colab-field" style={{gridColumn:'1/-1'}}><div className="lbl">Consejo Regional</div><div className="val">{nsColab.consejo}</div></div>
                  </div>
                </div>
              )}

              <div className="h-divider" />

              {/* Modal tabs */}
              <div className="modal-tabs">
                {([['bienes','📦 Bienes'],['accesorios','🔌 Accesorios'],['disponibles','📋 Bienes y Accesorios Disponibles'],['asignaciones','🔒 Asignaciones'],['reasignaciones','🔒 Reasignaciones']] as const).map(([t,lbl]) => (
                  <div key={t}
                    className={`modal-tab${nsTab===t?' active':''}${(t==='asignaciones'||t==='reasignaciones')&&!nsColab?' tab-locked':''}`}
                    onClick={() => { if ((t==='asignaciones'||t==='reasignaciones') && !nsColab) { toast.show('Busca un colaborador primero'); return } setNsTab(t) }}
                    title={(t==='asignaciones'||t==='reasignaciones')&&!nsColab?'Busca un colaborador primero':undefined}
                  >{lbl}</div>
                ))}
              </div>

              {/* PANE: Bienes */}
              {nsTab==='bienes' && (
                <div className="modal-tab-pane active">
                  <div className="form-group">
                    <label className="form-label">Tipo de bien <span className="req">*</span></label>
                    <select className="form-control" value={nsTipoBien} onChange={e => setNsTipoBien(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="computo">Cómputo</option>
                      <option value="mobiliario">Mobiliario o Móvil</option>
                      <option value="comunicaciones">Comunicaciones</option>
                    </select>
                    <div className="form-hint">El tipo determina el área responsable del custodio</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bien a asignar <span className="req">*</span></label>
                    <input type="text" className="form-control" placeholder="Ej: Laptop HP EliteBook 840"
                      value={nsBienNom} onChange={e => setNsBienNom(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Justificación / Motivo <span className="req">*</span></label>
                    <textarea className="form-control" placeholder="Explica el motivo de la asignación..." value={nsBienJust} onChange={e => setNsBienJust(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Área Funcional <span className="text-xs text-gray">(autocompletado)</span></label>
                      <input type="text" className="form-control" value={flujoAreaMap[nsTipoBien]||'UN. DE TI'} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sede</label>
                      <select className="form-control">
                        <option>Sede Malecón de la Reserva</option>
                        <option>Sede 28 de Julio</option>
                        <option>Sede Miraflores</option>
                      </select>
                    </div>
                  </div>
                  {nsTipoBien==='computo' && <div className="banner banner-blue">💻 Esta solicitud será revisada por SEC. DE ADMINISTRACION y derivada a UN. DE TI para verificar disponibilidad en inventario.</div>}
                  <div className="h-divider" />
                  <div className="section-title-sm">FLUJO DE APROBACIÓN Y FIRMAS</div>
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📋 Al enviar la solicitud se activará el flujo. Cada etapa requiere firma digital del responsable.</div>
                  <div className="stepper" style={{margin:'10px 0 6px'}}>
                    {[['1','Admin\nregistra'],['2',flujoAreaMap[nsTipoBien]||'Área\nvalida'],['3','Admin\nentrega'],['4','Colaborador\nfirma']].map(([n,lbl],i,a) => (
                      <><div key={n} className="step"><div className="step-circ pend" style={{fontSize:10,width:24,height:24}}>{n}</div><span className="step-lbl pend" style={{fontSize:10,textAlign:'center',maxWidth:55}}>{lbl}</span></div>{i<a.length-1&&<div className="step-conn"/>}</>
                    ))}
                  </div>
                  {!nsTipoBien && <div className="text-xs text-gray mt-8" style={{fontStyle:'italic'}}>Selecciona el tipo de bien para ver el área responsable de validación.</div>}
                </div>
              )}

              {/* PANE: Accesorios */}
              {nsTab==='accesorios' && (
                <div className="modal-tab-pane active">
                  <div className="form-group">
                    <label className="form-label">Tipo de accesorio <span className="req">*</span></label>
                    <select className="form-control"><option value="">Seleccionar...</option><option>Periférico de entrada</option><option>Periférico de salida</option><option>Conectividad</option><option>Audio / Video</option><option>Almacenamiento</option></select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Accesorio a asignar <span className="req">*</span></label>
                    <input type="text" className="form-control" placeholder="Ej: Teclado inalámbrico Logitech" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Justificación / Motivo <span className="req">*</span></label>
                    <textarea className="form-control" placeholder="Explica el motivo de la asignación..." />
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Sub-Área</label><input type="text" className="form-control" value="UN. DE TI" readOnly /></div>
                    <div className="form-group"><label className="form-label">Sede</label><input type="text" className="form-control" value="Sede Malecón de la Reserva" readOnly /></div>
                  </div>
                  <div className="h-divider" />
                  <div className="section-title-sm">FLUJO DE APROBACIÓN Y FIRMAS</div>
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📋 Al enviar la solicitud se activará el flujo. Cada etapa requiere firma digital del responsable.</div>
                  <div className="stepper" style={{margin:'10px 0 6px'}}>
                    {['Admin\nregistra','Área\nvalida','Admin\nentrega','Colaborador\nfirma'].map((lbl,i,a) => (
                      <><div key={i} className="step"><div className="step-circ pend" style={{fontSize:10,width:24,height:24}}>{i+1}</div><span className="step-lbl pend" style={{fontSize:10,textAlign:'center',maxWidth:55}}>{lbl}</span></div>{i<a.length-1&&<div className="step-conn"/>}</>
                    ))}
                  </div>
                  <div className="text-xs text-gray mt-8" style={{fontStyle:'italic'}}>Registro → Validación → Entrega → Conformidad</div>
                </div>
              )}

              {/* PANE: Disponibles */}
              {nsTab==='disponibles' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-teal" style={{marginBottom:12}}>⚡ Información sincronizada con el inventario del <strong>Portal CMP</strong> — stock en tiempo real.</div>
                  <div className="sub-tabs">
                    <div className={`sub-tab${nsdTab==='bienes'?' active':''}`} onClick={() => { setNsdTab('bienes'); setNsdDetalle(null) }}>📦 Bienes</div>
                    <div className={`sub-tab${nsdTab==='accs'?' active':''}`} onClick={() => { setNsdTab('accs'); setNsdDetalle(null) }}>🔌 Accesorios</div>
                  </div>

                  {nsdTab==='bienes' && (
                    <>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
                        <div style={{fontSize:12,color:'#6B7280'}}>Haz clic en un bien para ver su ficha. Usa el checkbox para selección múltiple.</div>
                        {selBienes.size>0 && <span className="badge b-purple">{selBienes.size} bien(es) seleccionado(s)</span>}
                      </div>
                      {selBienes.size>0 && (
                        <button className="btn btn-primary btn-sm mb-8" onClick={() => { toast.show(`✓ ${selBienes.size} bien(es) agregado(s) a la solicitud`); setSelBienes(new Set()) }}>
                          → Agregar a solicitud Bienes ({selBienes.size})
                        </button>
                      )}
                      <div id="nsd-bienes-list">
                        {BIENES_DISP.map(b => (
                          <div key={b.id} className={`bien-card${nsdDetalle?.id===b.id?' selected':''}`} onClick={() => setNsdDetalle(nsdDetalle?.id===b.id?null:b)} style={{position:'relative'}}>
                            <input type="checkbox" style={{position:'absolute',top:8,right:8,width:16,height:16,accentColor:'#6B21A8',cursor:'pointer',zIndex:2}}
                              checked={selBienes.has(b.id)} onClick={e => { e.stopPropagation(); toggleBien(b.id) }} onChange={() => {}} />
                            <div className="bien-card-icon">{b.icon}</div>
                            <div className="bien-card-info"><div className="bien-card-title">{b.title}</div><div className="bien-card-sub">{b.sub}</div></div>
                            <span className={`badge ${b.badge}`}>{b.badgeTxt}</span>
                          </div>
                        ))}
                      </div>
                      {nsdDetalle && (
                        <div className="bien-detail-card">
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#1E1B4B'}}>Ficha del Bien</div>
                            <button className="btn btn-gray btn-xs" onClick={() => setNsdDetalle(null)}>× Cerrar ficha</button>
                          </div>
                          <div className="foto-grid">
                            <div className="foto-placeholder"><span>{nsdDetalle.icon}</span><small>Vista frontal</small></div>
                            <div className="foto-placeholder"><span>{nsdDetalle.icon}</span><small>Vista lateral / detalle</small></div>
                          </div>
                          <div className="inv-grid">
                            <div className="inv-field"><div className="lbl">ID</div><div className="val fw-600">{nsdDetalle.id}</div></div>
                            <div className="inv-field"><div className="lbl">Código QR</div><div className="val"><code>{nsdDetalle.qr}</code></div></div>
                            <div className="inv-field"><div className="lbl">Marca</div><div className="val">{nsdDetalle.marca}</div></div>
                            <div className="inv-field"><div className="lbl">Modelo</div><div className="val">{nsdDetalle.modelo}</div></div>
                            <div className="inv-field"><div className="lbl">Estado</div><div className="val">{nsdDetalle.estado}</div></div>
                            <div className="inv-field"><div className="lbl">Condición</div><div className="val">{nsdDetalle.condicion}</div></div>
                            <div className="inv-field"><div className="lbl">Área</div><div className="val">{nsdDetalle.area}</div></div>
                            <div className="inv-field"><div className="lbl">N° Serie</div><div className="val">{nsdDetalle.serie}</div></div>
                          </div>
                          <div style={{marginTop:12}}>
                            <button className="btn btn-primary btn-sm" onClick={() => { setNsBienNom(`${nsdDetalle.title}`); setNsTab('bienes'); toast.show(`✓ Bien seleccionado: ${nsdDetalle.title}`) }}>✔ Seleccionar para solicitud</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {nsdTab==='accs' && (
                    <>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                        <div style={{fontSize:12,color:'#6B7280'}}>Accesorios disponibles registrados en sistema</div>
                        {selAccs.size>0 && <span className="badge b-purple">{selAccs.size} accesorio(s) seleccionado(s)</span>}
                      </div>
                      {selAccs.size>0 && (
                        <button className="btn btn-primary btn-sm mb-8" onClick={() => { toast.show(`✓ ${selAccs.size} accesorio(s) agregado(s)`); setSelAccs(new Set()) }}>
                          → Agregar a solicitud Accesorios ({selAccs.size})
                        </button>
                      )}
                      <div className="table-wrap">
                        <table>
                          <thead className="thead-orange"><tr><th style={{width:32}}></th><th>ID</th><th>Nombre</th><th>Marca</th><th>Sub Área</th><th>Estado</th><th>Disponibilidad</th></tr></thead>
                          <tbody>
                            {ACCS_DISP.map(a => (
                              <tr key={a.id}>
                                <td><input type="checkbox" style={{accentColor:'#6B21A8'}} checked={selAccs.has(a.id)} onChange={() => toggleAcc(a.id)} /></td>
                                <td>{a.id}</td><td>{a.nombre}</td><td>{a.marca}</td><td>{a.area}</td>
                                <td><span className={`badge ${a.estado}`}>{a.estadoTxt}</span></td>
                                <td><span className={`badge ${a.disp}`}>{a.dispTxt}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PANE: Asignaciones */}
              {nsTab==='asignaciones' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📌 Bienes y accesorios actualmente asignados al colaborador buscado.</div>
                  <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowReporte(true)}>📊 Generar Reporte</button>
                  </div>
                  <div className="sub-tabs">
                    <div className={`sub-tab${nsaTab==='bienes'?' active':''}`} onClick={() => { setNsaTab('bienes'); setNsaDetalle(null) }}>📦 Bienes asignados</div>
                    <div className={`sub-tab${nsaTab==='accs'?' active':''}`} onClick={() => setNsaTab('accs')}>🔌 Accesorios asignados</div>
                  </div>
                  {nsaTab==='bienes' && (
                    <>
                      <div style={{fontSize:12,color:'#6B7280',marginBottom:10}}>Bienes asignados al colaborador — haz clic para ver ficha</div>
                      {BIENES_ASIG.map(b => (
                        <div key={b.id} className="bien-card" onClick={() => setNsaDetalle(nsaDetalle?.id===b.id?null:b)}>
                          <div className="bien-card-icon">{b.icon}</div>
                          <div className="bien-card-info"><div className="bien-card-title">{b.title}</div><div className="bien-card-sub">{b.sub}</div></div>
                          <span className="badge b-purple">Asignado</span>
                        </div>
                      ))}
                      {nsaDetalle && (
                        <div className="bien-detail-card">
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#1E1B4B'}}>Ficha del Bien</div>
                            <button className="btn btn-gray btn-xs" onClick={() => setNsaDetalle(null)}>× Cerrar ficha</button>
                          </div>
                          <div className="foto-grid">
                            <div className="foto-placeholder"><span>{nsaDetalle.icon}</span><small>Vista frontal</small></div>
                            <div className="foto-placeholder"><span>{nsaDetalle.icon}</span><small>Vista lateral / detalle</small></div>
                          </div>
                          <div className="inv-grid">
                            <div className="inv-field"><div className="lbl">ID</div><div className="val fw-600">{nsaDetalle.id}</div></div>
                            <div className="inv-field"><div className="lbl">Código QR</div><div className="val"><code>{nsaDetalle.qr}</code></div></div>
                            <div className="inv-field"><div className="lbl">Marca</div><div className="val">{nsaDetalle.marca}</div></div>
                            <div className="inv-field"><div className="lbl">Modelo</div><div className="val">{nsaDetalle.modelo}</div></div>
                            <div className="inv-field"><div className="lbl">Estado</div><div className="val">{nsaDetalle.estado}</div></div>
                            <div className="inv-field"><div className="lbl">Condición</div><div className="val">{nsaDetalle.condicion}</div></div>
                            <div className="inv-field"><div className="lbl">Área</div><div className="val">{nsaDetalle.area}</div></div>
                            <div className="inv-field"><div className="lbl">N° Serie</div><div className="val">{nsaDetalle.serie}</div></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {nsaTab==='accs' && (
                    <div className="table-wrap">
                      <table>
                        <thead className="thead-orange"><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Área</th><th>SubÁrea</th><th>Estado</th></tr></thead>
                        <tbody>
                          {ACCS_ASIG.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.nombre}</td><td>{a.marca}</td><td>{a.area}</td><td>{a.subarea}</td><td><span className={`badge ${a.estado}`}>{a.estadoTxt}</span></td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PANE: Reasignaciones */}
              {nsTab==='reasignaciones' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>🔄 Bienes y accesorios asignados al colaborador. Selecciona un registro para reasignar o dar de baja.</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span className="text-xs text-gray">{reasigSel?`Seleccionado: ${reasigSel.desc}`:'Selecciona un registro para habilitar acciones'}</span>
                    <button className={`btn btn-primary btn-sm${!reasigSel?' btn-disabled':''}`} disabled={!reasigSel} onClick={() => toast.show('Abriendo configuración de reasignación...')}>🔄 Reasignar / Quitar asignación</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-orange"><tr><th style={{width:32}}></th><th>ID</th><th>Descripción</th><th>Tipo</th><th>Código QR</th><th>Estado</th></tr></thead>
                      <tbody>
                        {REASI_ROWS.map(r => (
                          <tr key={r.id} className="reasi-row" onClick={() => setReasigSel(reasigSel?.id===r.id?null:r)} style={{cursor:'pointer',background:reasigSel?.id===r.id?'#F5F3FF':''}}>
                            <td><input type="radio" name="reasi-sel" style={{accentColor:'#6B21A8'}} checked={reasigSel?.id===r.id} onChange={() => {}} /></td>
                            <td className="fw-600">{r.id}</td><td>{r.desc}</td><td>{r.tipo}</td><td><code>{r.qr}</code></td>
                            <td><span className="badge b-purple">{r.estado}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
            <div className="modal-footer">
              <span className="modal-note">Los campos marcados con <span style={{color:'#EF4444'}}>*</span> son obligatorios</span>
              <button className="btn btn-gray" onClick={() => setShowNueva(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={enviarSolicitud}>Enviar Solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Detalle Solicitud
         ══════════════════════════════════════════════════════════════ */}
      {showDetalle && detSol && (
        <div className="modal-overlay" onClick={() => setShowDetalle(false)}>
          <div className="modal-box" style={{maxWidth:620}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Solicitud {detSol.n}</div>
                <div className="modal-subtitle">{detSol.bien} · {detSol.tipo}</div>
              </div>
              <button className="modal-close" onClick={() => setShowDetalle(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Estado bar */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:12}}>
                <div><span className="text-xs text-gray">Estado: </span><span className={`badge ${detSol.estadoCls}`}>{detSol.estado}</span></div>
                <div style={{fontSize:12,color:'#6B7280'}}>{detSol.n} · {detSol.fecha} · Área: <strong>{detSol.areaEncargada}</strong></div>
              </div>

              {/* Stepper */}
              <div className="stepper" style={{marginBottom:16}}>
                {detSol.flujo.map((s,i) => (
                  <>{i>0&&<div key={`c${i}`} className={`step-conn${detSol.flujo[i-1].status==='done'?' done':''}`}/>}
                  <div key={s.paso} className="step">
                    <div className={`step-circ ${stepCls(s.status)}`} style={s.status==='rejected'?{background:'#FEE2E2',borderColor:'#EF4444',color:'#EF4444'}:{}}>{stepIcon(s.status)}</div>
                    <span className={`step-lbl ${stepCls(s.status)}`} style={{fontSize:10,textAlign:'center',maxWidth:58}}>{'Registro\nValidación\nEntrega\nConformidad'.split('\n')[i]}</span>
                  </div></>
                ))}
              </div>

              {/* Datos */}
              <div className="section-title-sm">DATOS DE LA SOLICITUD</div>
              <div className="inv-grid" style={{marginBottom:6}}>
                <div className="inv-field"><div className="lbl">N° Solicitud</div><div className="val fw-600">{detSol.n}</div></div>
                <div className="inv-field"><div className="lbl">Fecha solicitud</div><div className="val">{detSol.fecha}</div></div>
                <div className="inv-field"><div className="lbl">Bien solicitado</div><div className="val">{detSol.bien}</div></div>
                <div className="inv-field"><div className="lbl">Tipo</div><div className="val">{detSol.tipo}</div></div>
                <div className="inv-field"><div className="lbl">Fecha de entrega</div><div className="val">{detSol.fechaEntrega||'—'}</div></div>
                <div className="inv-field"><div className="lbl">Área encargada</div><div className="val fw-600 text-purple">{detSol.areaEncargada}</div></div>
                <div className="inv-field"><div className="lbl">Estado</div><div className="val"><span className={`badge ${detSol.estadoCls}`}>{detSol.estado}</span></div></div>
                <div className="inv-field"><div className="lbl">Colaborador</div><div className="val">{detSol.colaborador}</div></div>
                <div className="inv-field"><div className="lbl">DNI</div><div className="val">{detSol.dni}</div></div>
                <div className="inv-field"><div className="lbl">Puesto</div><div className="val">{detSol.puesto}</div></div>
                <div className="inv-field"><div className="lbl">Sub-Área</div><div className="val">{detSol.subArea}</div></div>
                <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl">Motivo</div><div className="val">{detSol.motivo}</div></div>
                {detSol.observacion && <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl" style={{color:'#92400E'}}>Observación</div><div className="val" style={{color:'#92400E'}}>{detSol.observacion}</div></div>}
              </div>

              {/* Flujo */}
              <div className="section-title-sm" style={{marginTop:18}}>FLUJO DE APROBACIÓN</div>
              {detSol.flujo.map((s,i) => (
                <div key={s.paso} className="flow-step-block">
                  <div className={`flow-step-hdr ${s.status==='done'?'done':s.status==='active'?'active':s.status==='rejected'?'rejected':'pending'}`}>
                    <div className="text-sm fw-600">{s.status==='done'?'✅':s.status==='active'?'⏳':s.status==='rejected'?'❌':'🔒'} Paso {s.paso}: {s.label}</div>
                    <span className="text-xs text-gray">{s.fecha}</span>
                  </div>
                  {s.status==='done' && (
                    <div className="flow-step-body">
                      <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-end'}}>
                        <div>
                          <div className="firma-label" style={{textAlign:'left',marginBottom:4}}>Firmado por</div>
                          <div className="firma-box">{s.firmante}</div>
                          <div className="firma-label">{s.cargo}</div>
                        </div>
                        <div className="inv-field"><div className="lbl">Fecha</div><div className="val">{s.fecha}</div></div>
                      </div>
                    </div>
                  )}
                  {s.status==='active' && (
                    <div className="flow-step-body">
                      <div className="form-group" style={{marginBottom:8}}>
                        <label className="form-label" style={{fontSize:11}}>Firma digital — {s.cargo}</label>
                        <input type="text" className="form-control" placeholder="Escribe aquí tu firma..."
                          style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:14,color:'#1E1B4B'}}
                          value={detFirmas[i]||''} onChange={e => setDetFirmas(p=>({...p,[i]:e.target.value}))} />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => registrarFirma(i)}>✔ Registrar firma</button>
                    </div>
                  )}
                  {s.status==='rejected' && (
                    <div className="flow-step-body">
                      <div className="banner" style={{background:'#FEF2F2',color:'#991B1B',border:'1px solid #FCA5A5',fontSize:12}}>
                        ❌ Observado por {s.actor} el {s.fecha}.<br/>{detSol.observacion||'Requiere subsanación antes de continuar.'}
                      </div>
                    </div>
                  )}
                  {s.status==='pending' && (
                    <div className="flow-step-body"><p className="text-xs text-gray" style={{fontStyle:'italic'}}>🔒 Pendiente — se habilitará al completar el paso anterior.</p></div>
                  )}
                </div>
              ))}

              {/* Firmas grid */}
              <div style={{marginTop:16}}>
                <div className="section-title-sm">FIRMAS DEL PROCESO</div>
                <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(detSol.flujo.length,4)},1fr)`,gap:10,marginTop:8}}>
                  {detSol.flujo.map(s => (
                    <div key={s.paso}>
                      <div style={{fontSize:10,color:'#6B7280',marginBottom:4,fontWeight:600}}>{s.label.split('—')[0].trim()}</div>
                      <div className="aprob-cell">
                        <div className="aprob-zona">
                          {s.status==='done'
                            ? <><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:13}}>{s.firmante}</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>{s.cargo}</div><div style={{fontSize:10,color:'#6B7280'}}>{s.fecha}</div></>
                            : s.status==='active'
                              ? <><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#991B1B',fontSize:13}}>Pendiente</span><div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>—</div></>
                              : <><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#6B7280',fontSize:13}}>En espera</span><div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>—</div></>
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray btn-sm" onClick={() => setShowDetalle(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Conformidad
         ══════════════════════════════════════════════════════════════ */}
      {showConformidad && (
        <div className="modal-overlay" onClick={() => setShowConformidad(false)}>
          <div className="modal-box" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span className="modal-title">Acta de Conformidad de Entrega — SOL-2026-004</span>
              <button className="modal-close" onClick={() => setShowConformidad(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="summary-block">
                <div className="summary-row"><span className="summary-lbl">Bien</span><span className="summary-val">Monitor 24" LG 24MK430H</span></div>
                <div className="summary-row"><span className="summary-lbl">Código QR</span><span className="summary-val"><code>CMP-038401</code></span></div>
                <div className="summary-row"><span className="summary-lbl">Estado</span><span className="summary-val"><span className="badge b-green">Bueno</span></span></div>
                <div className="summary-row"><span className="summary-lbl">Área</span><span className="summary-val">UN. DE TI</span></div>
                <div className="summary-row"><span className="summary-lbl">Fecha entrega</span><span className="summary-val">15/03/2026</span></div>
                <div className="summary-row"><span className="summary-lbl">Entregado por</span><span className="summary-val">Administración</span></div>
              </div>
              <div className="acta-text">
                "Yo, Aaron Samuel Nuñez Muñoz, identificado con DNI 77434028, declaro haber recibido el bien descrito en conformidad, en las condiciones indicadas, comprometiéndome a su uso responsable y devolución en caso corresponda."
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Nombre completo</label><input type="text" className="form-control" value="Aaron Samuel Nuñez Muñoz" readOnly /></div>
                <div className="form-group"><label className="form-label">DNI</label><input type="text" className="form-control" value="77434028" readOnly /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Cargo</label><input type="text" className="form-control" value="Analista de Sistemas" readOnly /></div>
                <div className="form-group"><label className="form-label">Fecha de firma</label><input type="text" className="form-control" value="25/03/2026" readOnly /></div>
              </div>
            </div>
            <div className="modal-footer">
              <span className="modal-note">Esta acción registra tu conformidad. Podrás descargar el PDF desde Historial.</span>
              <button className="btn btn-gray" onClick={() => setShowConformidad(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { toast.show('✓ Conformidad firmada y registrada'); setShowConformidad(false) }}>✔ Confirmar y Firmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Consultar Disponibilidad
         ══════════════════════════════════════════════════════════════ */}
      {showDisp && (
        <div className="modal-overlay" onClick={() => setShowDisp(false)}>
          <div className="modal-box" style={{maxWidth:680}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title" style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{color:'#0DA882'}}>▦</span> Disponibilidad de Bienes y Accesorios
                  <span className="badge b-teal" style={{fontSize:10}}>⚡ API Intranet</span>
                </div>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Stock en tiempo real — Portal CMP</div>
              </div>
              <button className="modal-close" onClick={() => setShowDisp(false)}>×</button>
            </div>
            <div style={{padding:'0 20px',borderBottom:'1px solid #E5E7EB'}}>
              <div style={{display:'flex'}}>
                <div className={`modal-tab${dispTab==='bienes'?' active':''}`} onClick={() => setDispTab('bienes')}>📦 Bienes</div>
                <div className={`modal-tab${dispTab==='accs'?' active':''}`} onClick={() => setDispTab('accs')}>🔌 Accesorios</div>
              </div>
            </div>
            <div className="modal-body">
              {dispTab==='bienes' && (
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:12,color:'#64748B'}}>Bienes disponibles registrados en almacén</span>
                    <span className="badge b-green">4 disponibles</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-teal"><tr><th>ID</th><th>Código QR</th><th>Descripción</th><th>Marca</th><th>Modelo</th><th>Estado</th><th>Condición</th><th>Disponibilidad</th></tr></thead>
                      <tbody>
                        <tr><td>111025</td><td>CMP-038395</td><td>Laptop</td><td>HP</td><td>EliteBook 840</td><td><span className="badge b-green">Bueno</span></td><td>Nuevo</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>111026</td><td>CMP-038396</td><td>Monitor</td><td>Samsung</td><td>27" S27A</td><td><span className="badge b-green">Bueno</span></td><td>En Uso</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>111027</td><td>CMP-038397</td><td>Impresora</td><td>Epson</td><td>L3150</td><td><span className="badge b-yellow">Regular</span></td><td>En Uso</td><td><span className="badge b-yellow">En revisión</span></td></tr>
                        <tr><td>111028</td><td>CMP-038398</td><td>Proyector</td><td>Epson</td><td>EB-X51</td><td><span className="badge b-green">Bueno</span></td><td>En Uso</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>111029</td><td>CMP-038399</td><td>Tablet</td><td>Samsung</td><td>Tab S7</td><td><span className="badge b-green">Bueno</span></td><td>Nuevo</td><td><span className="badge b-green">Disponible</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {dispTab==='accs' && (
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:12,color:'#64748B'}}>Accesorios disponibles registrados en sistema</span>
                    <span className="badge b-green">3 disponibles</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-orange"><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Sub Área</th><th>Estado</th><th>DNI Asignado</th><th>Disponibilidad</th></tr></thead>
                      <tbody>
                        <tr><td>20261114</td><td>Teclado Inalámbrico</td><td>Logitech</td><td>UN. DE TI</td><td><span className="badge b-green">Bueno</span></td><td className="text-gray">—</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>20261115</td><td>Mouse Inalámbrico</td><td>Logitech</td><td>UN. DE TI</td><td><span className="badge b-green">Bueno</span></td><td className="text-gray">—</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>20261116</td><td>Hub USB 4 puertos</td><td>Anker</td><td>ADMINISTRACION</td><td><span className="badge b-green">Bueno</span></td><td className="text-gray">—</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>20261117</td><td>Webcam HD</td><td>Logitech</td><td>COMUNICACIONES</td><td><span className="badge b-green">Bueno</span></td><td className="fw-600">77434030</td><td><span className="badge b-blue">Asignado</span></td></tr>
                        <tr><td>20261118</td><td>Auriculares</td><td>Sony</td><td>UN. DE GDTH</td><td><span className="badge b-yellow">Regular</span></td><td className="text-gray">—</td><td><span className="badge b-yellow">En revisión</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowDisp(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Reporte de Asignaciones
         ══════════════════════════════════════════════════════════════ */}
      {showReporte && (
        <div className="modal-overlay" onClick={() => setShowReporte(false)}>
          <div className="modal-box" style={{maxWidth:700}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">Reporte de Asignaciones</span>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Bienes y accesorios asignados al colaborador</div>
              </div>
              <button className="modal-close" onClick={() => setShowReporte(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{background:'#F5F3FF',border:'1.5px solid #6B21A8',borderRadius:8,padding:'14px 18px',marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1E1B4B',marginBottom:4}}>Aaron Samuel Nuñez Muñoz</div>
                <div style={{fontSize:12,color:'#6B7280'}}>DNI: 77434028 · Cargo: Analista de Sistemas · Área: UN. DE TI</div>
              </div>
              <p style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8}}>📦 Bienes Asignados</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Descripción</th><th>QR</th><th>Condición</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
                  <tbody>
                    {[{id:'111030',desc:'Laptop Dell Latitude 5420',qr:'CMP-038401',cond:'Bueno',custFirma:true,colabFirma:true},
                      {id:'111031',desc:'Monitor LG 24"',qr:'CMP-038402',cond:'Bueno',custFirma:true,colabFirma:true},
                      {id:'111032',desc:'Teléfono IP Fanvil X4U',qr:'CMP-038403',cond:'Bueno',custFirma:true,colabFirma:false}].map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td><td>{r.desc}</td><td><code>{r.qr}</code></td><td>{r.cond}</td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.custFirma?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>G. Palacios</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Jefa UN. Administración · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#991B1B',fontSize:12}}>Pendiente</span>}
                        </div></div></td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.colabFirma?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>Aaron N.</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Analista de Sistemas · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#991B1B',fontSize:12}}>Pendiente</span>}
                        </div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{fontSize:12,fontWeight:600,color:'#374151',margin:'16px 0 8px'}}>🔌 Accesorios Asignados</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Estado</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
                  <tbody>
                    {[{id:'2026_ADM_0003',nom:'Teclado HP K1500',marca:'HP',est:'Bueno',c:true,col:true},
                      {id:'2026_ADM_0004',nom:'Mouse Logitech M185',marca:'Logitech',est:'Bueno',c:true,col:true},
                      {id:'2026_ADM_0005',nom:'Auriculares Jabra',marca:'Jabra',est:'Regular',c:false,col:false}].map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td><td>{r.nom}</td><td>{r.marca}</td><td>{r.est}</td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.c?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>G. Palacios</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Jefa UN. Administración · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#6B7280',fontSize:12}}>En espera</span>}
                        </div></div></td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.col?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>Aaron N.</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Analista de Sistemas · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#6B7280',fontSize:12}}>En espera</span>}
                        </div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowReporte(false)}>Cerrar</button>
              <button className="btn btn-outline" onClick={() => { const w=window.open('','_blank');if(w){w.document.write('<html><body>'+document.querySelector('.modal-body')?.innerHTML+'</body></html>');w.print()} }}>🖨 Imprimir</button>
              <button className="btn btn-primary" onClick={generarPDF}>📄 Generar PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
