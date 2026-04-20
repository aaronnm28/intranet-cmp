import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface PrestamoBienRow {
  id: string
  numero: string
  bien: string
  fecha_solicitud: string
  fecha_devolucion: string
  estado: string
}


const BIENES_DISPONIBLES_PRESTAMO = [
  { id: '1', nombre: 'Laptop HP Pavilion',       codigo: 'CMP-038412', disponibles: 1 },
  { id: '2', nombre: 'Proyector Epson EB-X41',   codigo: 'CMP-038398', disponibles: 2 },
  { id: '3', nombre: 'Tablet Samsung Tab S7',    codigo: 'CMP-038399', disponibles: 1 },
]

type FlujoStep = { paso: string; icono: string; cargo: string; status: 'done'|'active'|'pending'; fecha: string; firmante: string; firmante2?: string; activeLabel?: string }
interface PrestamoBienDetalle {
  n: string; bien: string; marca: string; modelo: string; id_bien: string; qr: string
  fechaSolicitud: string; fechaEntrega: string; fechaDevPactada: string; fechaDevReal: string
  estadoEntrega: string; estado: string; estadoCls: string; colaborador: string; area: string
  motivo: string; direccion: string; obs: string|null; flujo: FlujoStep[]
}

const PRESTAMOS_DATA: Record<string, PrestamoBienDetalle> = {
  'PREST-2026-001': {
    n:'PREST-2026-001', bien:'Laptop HP Pavilion', marca:'HP', modelo:'Pavilion 15', id_bien:'111025',
    qr:'CMP-038390', fechaSolicitud:'05/03/2026', fechaEntrega:'06/03/2026', fechaDevPactada:'12/03/2026',
    fechaDevReal:'12/03/2026', estadoEntrega:'Bueno', estado:'Devuelto — conforme',
    estadoCls:'b-green', colaborador:'Aaron Samuel Nuñez Muñoz', area:'UN. DE TI', motivo:'Uso en evento externo',
    direccion:'Av. Los Álamos 342, Miraflores', obs:null,
    flujo:[
      {paso:'Solicitud registrada', icono:'📋', cargo:'Colaborador — UN. DE TI', status:'done', fecha:'05/03/2026', firmante:'Aaron N.'},
      {paso:'V°B° Jefe UN. DE TI', icono:'✔', cargo:'Jesús Luman — Jefe UN. DE TI', status:'done', fecha:'05/03/2026', firmante:'J. Luman'},
      {paso:'Entrega del bien por Administración', icono:'📦', cargo:'Guissela Palacios Alvarez — Jefa de Administración', status:'done', fecha:'06/03/2026', firmante:'G. Palacios'},
      {paso:'Recepción — firma del colaborador', icono:'🖊', cargo:'Aaron Samuel Nuñez Muñoz — UN. DE TI', status:'done', fecha:'06/03/2026', firmante:'Aaron N.'},
      {paso:'Devolución del bien', icono:'📥', cargo:'Aaron Samuel Nuñez Muñoz — UN. DE TI', status:'done', fecha:'12/03/2026', firmante:'Aaron N.', firmante2:'G. Palacios — Jefa Administración confirmó'}
    ]
  },
  'PREST-2026-002': {
    n:'PREST-2026-002', bien:'Proyector Epson EB-X41', marca:'Epson', modelo:'EB-X41', id_bien:'111028',
    qr:'CMP-038398', fechaSolicitud:'18/03/2026', fechaEntrega:'18/03/2026', fechaDevPactada:'25/03/2026',
    fechaDevReal:'—', estadoEntrega:'Bueno', estado:'En préstamo',
    estadoCls:'b-blue', colaborador:'Aaron Samuel Nuñez Muñoz', area:'UN. DE TI', motivo:'Presentación institucional',
    direccion:'Jr. Huancavelica 472, Of. 301, Lima Centro', obs:null,
    flujo:[
      {paso:'Solicitud registrada', icono:'📋', cargo:'Colaborador — UN. DE TI', status:'done', fecha:'18/03/2026', firmante:'Aaron N.'},
      {paso:'V°B° Jefe UN. DE TI', icono:'✔', cargo:'Jesús Luman — Jefe UN. DE TI', status:'done', fecha:'18/03/2026', firmante:'J. Luman'},
      {paso:'Entrega del bien por Administración', icono:'📦', cargo:'Guissela Palacios Alvarez — Jefa de Administración', status:'done', fecha:'18/03/2026', firmante:'G. Palacios'},
      {paso:'Recepción — firma del colaborador', icono:'🖊', cargo:'Aaron Samuel Nuñez Muñoz — UN. DE TI', status:'done', fecha:'18/03/2026', firmante:'Aaron N.'},
      {paso:'Devolución del bien', icono:'📥', cargo:'Aaron Samuel Nuñez Muñoz — UN. DE TI', status:'active', fecha:'—', firmante:'', activeLabel:'Pendiente — firmar al devolver el bien'}
    ]
  },
  'PREST-2026-003': {
    n:'PREST-2026-003', bien:'Tablet Samsung Tab S7', marca:'Samsung', modelo:'Tab S7', id_bien:'111029',
    qr:'CMP-038399', fechaSolicitud:'22/03/2026', fechaEntrega:'—', fechaDevPactada:'29/03/2026',
    fechaDevReal:'—', estadoEntrega:'—', estado:'Pendiente aprobación',
    estadoCls:'b-yellow', colaborador:'Aaron Samuel Nuñez Muñoz', area:'UN. DE TI', motivo:'Capacitación externa',
    direccion:'Av. La Marina 2000, San Miguel', obs:null,
    flujo:[
      {paso:'Solicitud registrada', icono:'📋', cargo:'Colaborador — UN. DE TI', status:'done', fecha:'22/03/2026', firmante:'Aaron N.'},
      {paso:'V°B° Jefe UN. DE TI', icono:'✔', cargo:'Jesús Luman — Jefe UN. DE TI', status:'active', fecha:'—', firmante:'', activeLabel:'Pendiente aprobación del Jefe TI'},
      {paso:'Entrega del bien por Administración', icono:'📦', cargo:'Guissela Palacios Alvarez — Jefa de Administración', status:'pending', fecha:'—', firmante:''},
      {paso:'Recepción — firma del colaborador', icono:'🖊', cargo:'Aaron Samuel Nuñez Muñoz — UN. DE TI', status:'pending', fecha:'—', firmante:''},
      {paso:'Devolución del bien', icono:'📥', cargo:'Aaron Samuel Nuñez Muñoz — UN. DE TI', status:'pending', fecha:'—', firmante:''}
    ]
  }
}

function estadoBadge(estado: string) {
  if (estado === 'devuelto_conforme') return <span className="badge b-green">Devuelto — conforme</span>
  if (estado === 'en_prestamo')       return <span className="badge b-blue">En préstamo</span>
  if (estado === 'pendiente_aprobacion') return <span className="badge b-red">Pendiente aprobación</span>
  if (estado === 'observado')         return <span className="badge b-yellow">Observado</span>
  return <span className="badge b-gray">{estado}</span>
}

function diffDays(a: string, b: string): number {
  const da = new Date(a)
  const db = new Date(b)
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 0
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}


export function PrestamosBienes() {
  const [data, setData]                   = useState<PrestamoBienRow[]>([])
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState('mis-prestamos')
  const [showNuevo, setShowNuevo]         = useState(false)
  const [showDetalle, setShowDetalle]     = useState(false)
  const [showDevolucion, setShowDevolucion] = useState(false)
  const [selected, setSelected]           = useState<PrestamoBienRow | null>(null)
  const [selectedForDev, setSelectedForDev] = useState<PrestamoBienRow | null>(null)

  const [form, setForm] = useState({
    bien_id: '',
    codigo: '',
    fecha_prestamo: '',
    fecha_devolucion: '',
    direccion: '',
    motivo: '',
  })

  const [devForm, setDevForm] = useState({
    estado: 'Bueno',
    observaciones: '',
    fecha_real: '2026-03-25',
    confirmado: false,
  })

  const [firmaStates, setFirmaStates] = useState<Record<number, string>>({ 0: '', 1: '', 2: '' })
  const [firmaModo, setFirmaModo]     = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false })
  const [prestCorreoEnviado, setPrestCorreoEnviado] = useState<Record<string,boolean>>({})
  const [prestFirmaConfirmada, setPrestFirmaConfirmada] = useState<Record<string,{firmante:string;docAdjunto?:string}>>({})
  const [showPrestCorreoModal, setShowPrestCorreoModal] = useState(false)
  const [showPrestActaModal,   setShowPrestActaModal]   = useState(false)
  const [prestModalInfo, setPrestModalInfo] = useState<{numero:string;bien:string;colaborador:string;esLocador:boolean}>({numero:'',bien:'',colaborador:'',esLocador:false})
  const [detObsTexts, setDetObsTexts] = useState<Record<number,string>>({})
  const [detShowObs,  setDetShowObs]  = useState<Record<number,boolean>>({})
  // Firma interactiva por paso en el modal de detalle (clave: numero_prestamo, valor: {paso: {firmante, fecha}})
  const [detFirmaSteps, setDetFirmaSteps] = useState<Record<string,Record<number,{firmante:string;fecha:string}>>>({})
  const [detFirmaInput, setDetFirmaInput] = useState<Record<string,Record<number,string>>>({})

  // DNI search
  const [colabDni, setColabDni]   = useState('')
  const [colabBuscando, setColabBuscando] = useState(false)
  const [colabInfo, setColabInfo] = useState<{ nombre: string; area: string; puesto: string } | null>(null)
  const [colabErr, setColabErr]   = useState(false)

  const COLAB_MOCK: Record<string, { nombre: string; area: string; puesto: string }> = {
    '77434028': { nombre: 'Aaron Samuel Nuñez Muñoz',            area: 'UN. DE TI',            puesto: 'Analista de TI'                        },
    '72224207': { nombre: 'Julieth Zenina Carbajal Garro',       area: 'UN. DE GDTH',          puesto: 'Jefa de GDTH'                          },
    '46521663': { nombre: 'Jesús Luman Marcos Aragon',           area: 'UN. DE TI',            puesto: 'Jefe de TI'                            },
    '45103078': { nombre: 'Nataly De Rutte Vergara',             area: 'UN. DE PLANIFICACION', puesto: 'Jefa de Planificación'                 },
    '71926735': { nombre: 'Marino Eduardo Espinoza Vega',        area: 'UN. DE PLANIFICACION', puesto: 'Jefa de Planificación'                 },
    '71489337': { nombre: 'Ariana Sarita Alvines Zapata',        area: 'UN. DE GDTH',          puesto: 'Trabajadora Social'                    },
    '45438744': { nombre: 'Hamer Chonlon Escudero',              area: 'UN. DE GDTH',          puesto: 'Analista de Planilla y Compensaciones' },
    '40555090': { nombre: 'Guissela Del Rocio Palacios Alvarez', area: 'UN. DE ADM',           puesto: 'Jefa de Administración'                },
    '48277741': { nombre: 'Anali Jasmin Chafloque Cordova',      area: 'UN. DE ADM',           puesto: 'Asistente Administrativo'              },
    '47272523': { nombre: 'Edwin Jesus Chozo Santisteban',       area: 'UN. DE CONTA',         puesto: 'Contador General'                      },
    '72651020': { nombre: 'Maria del Rosario Rojas Gutierrez',   area: 'UN. DE CONTA',         puesto: 'Sub Contadora'                         },
    '40812969': { nombre: 'Santiago Masaichi Hayashi Delgado',   area: 'UN. DE PATR',          puesto: 'Jefe de Patrimonio'                    },
    '10609810': { nombre: 'David Augusto Cadillo Alfaro',        area: 'UN. DE PATR',          puesto: 'Analista de Activos Muebles'           },
    '43422937': { nombre: 'David Leoncio Salazar Ttito',         area: 'UN. DE PATR',          puesto: 'Supervisor de Activos Muebles'         },
    '46832226': { nombre: 'Percy Antonio Calderón Quispe',       area: 'UN. DE TI',            puesto: 'Locador de Servicios'                  },
  }

  const buscarColab = async () => {
    const dni = colabDni.trim()
    setColabErr(false)
    const mock = COLAB_MOCK[dni]
    if (mock) { setColabInfo(mock); return }
    setColabBuscando(true)
    const { data: row } = await supabase.from('colaboradores').select('nombres,apellidos,area,puesto').eq('dni', dni).maybeSingle()
    if (row) {
      setColabInfo({ nombre: `${row.nombres} ${row.apellidos}`, area: row.area ?? '—', puesto: row.puesto ?? '—' })
    } else {
      setColabInfo(null); setColabErr(true)
    }
    setColabBuscando(false)
  }

  const exceedsDays = form.fecha_prestamo && form.fecha_devolucion
    ? diffDays(form.fecha_prestamo, form.fecha_devolucion) > 15
    : false

  useEffect(() => {
    const load = async () => {
      try {
        const { data: rows } = await supabase.from('prestamos_bienes')
          .select('id,numero,bien_nombre,fecha_solicitud,fecha_devolucion,estado')
          .order('created_at', { ascending: false })
        if (rows && rows.length > 0) {
          setData(rows.map(r => ({ ...r, bien: r.bien_nombre, fecha_devolucion: r.fecha_devolucion ?? '—' })))
        } else {
          // Fallback al mock local cuando Supabase está vacío
          const mockData: PrestamoBienRow[] = Object.values(PRESTAMOS_DATA).map(p => ({
            id: p.n,
            numero: p.n,
            bien: p.bien,
            fecha_solicitud: p.fechaSolicitud,
            fecha_devolucion: p.fechaDevReal !== '—' ? p.fechaDevReal : p.fechaDevPactada,
            estado: p.estado === 'Devuelto — conforme' ? 'devuelto_conforme'
                  : p.estado === 'En préstamo'        ? 'en_prestamo'
                  : 'pendiente_aprobacion',
          }))
          setData(mockData)
        }
      } catch {
        const mockData: PrestamoBienRow[] = Object.values(PRESTAMOS_DATA).map(p => ({
          id: p.n, numero: p.n, bien: p.bien,
          fecha_solicitud: p.fechaSolicitud,
          fecha_devolucion: p.fechaDevReal !== '—' ? p.fechaDevReal : p.fechaDevPactada,
          estado: p.estado === 'Devuelto — conforme' ? 'devuelto_conforme'
                : p.estado === 'En préstamo'        ? 'en_prestamo'
                : 'pendiente_aprobacion',
        }))
        setData(mockData)
      }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleBienSelect = (id: string) => {
    const bien = BIENES_DISPONIBLES_PRESTAMO.find(b => b.id === id)
    setForm(f => ({ ...f, bien_id: id, codigo: bien?.codigo ?? '' }))
  }

  const handleSolicitar = async () => {
    if (!colabInfo) { alert('Busca un colaborador primero'); return }
    const bien = BIENES_DISPONIBLES_PRESTAMO.find(b => b.id === form.bien_id)
    if (!bien) { alert('Selecciona un bien'); return }
    const { count } = await supabase.from('prestamos_bienes').select('*', { count: 'exact', head: true })
    const numero = `PREST-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(3, '0')}`
    const payload = {
      numero,
      colaborador_dni: colabDni.trim(),
      colaborador: colabInfo.nombre,
      bien_nombre: bien.nombre,
      bien_codigo: form.codigo,
      fecha_devolucion: form.fecha_devolucion || null,
      motivo: form.motivo,
      direccion: form.direccion,
      estado: 'pendiente_aprobacion',
    }
    const { data: newRec } = await supabase.from('prestamos_bienes').insert(payload).select().single()
    const nuevo: PrestamoBienRow = {
      id: newRec?.id ?? String(Date.now()),
      numero,
      bien: bien?.nombre ?? 'Bien',
      fecha_solicitud: new Date().toLocaleDateString('es-PE'),
      fecha_devolucion: form.fecha_devolucion || '—',
      estado: 'pendiente_aprobacion',
    }
    setData(prev => [nuevo, ...prev])
    setShowNuevo(false)
    setForm({ bien_id: '', codigo: '', fecha_prestamo: '', fecha_devolucion: '', direccion: '', motivo: '' })
    setFirmaStates({ 0: '', 1: '', 2: '' })
    setFirmaModo({ 0: false, 1: false, 2: false })
  }

  const handleConfirmarDevolucion = async () => {
    if (!selectedForDev || !devForm.confirmado) return
    const { error } = await supabase.from('prestamos_bienes').update({ estado: 'devuelto_conforme' }).eq('id', selectedForDev.id)
    if (error) { alert(`Error: ${error.message}`); return }
    setData(prev => prev.map(p => p.id === selectedForDev.id ? { ...p, estado: 'devuelto_conforme' } : p))
    setShowDevolucion(false)
    setSelectedForDev(null)
    setDevForm({ estado: 'Bueno', observaciones: '', fecha_real: '2026-03-25', confirmado: false })
  }

  const closeNuevo = () => {
    setShowNuevo(false)
    setForm({ bien_id: '', codigo: '', fecha_prestamo: '', fecha_devolucion: '', direccion: '', motivo: '' })
    setFirmaStates({ 0: '', 1: '', 2: '' })
    setFirmaModo({ 0: false, 1: false, 2: false })
    setColabDni(''); setColabInfo(null); setColabErr(false)
  }

  const closeDevolucion = () => {
    setShowDevolucion(false)
    setSelectedForDev(null)
    setDevForm({ estado: 'Bueno', observaciones: '', fecha_real: '2026-03-25', confirmado: false })
  }

  const firmaLabels = [
    { title: 'Firma del Solicitante',        name: 'Aaron Samuel Nuñez Muñoz — Analista de TI' },
    { title: 'V°B° Jefe de TI',             name: 'Jesús Luman Marcos Aragon — Jefe de TI' },
    { title: 'V°B° Jefa de Administración', name: 'Guissela Palacios Alvarez — Jefa de Administración' },
  ]

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <div className="breadcrumb">Gestión de Recursos › <span>Préstamos Bienes Tecnológicos</span></div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Préstamos de Bienes Tecnológicos</div>
          <div className="page-subtitle">Solicita préstamos temporales de equipos disponibles</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowNuevo(true)}>+ Solicitar Préstamo</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        <div className={`tab${activeTab === 'mis-prestamos' ? ' active' : ''}`} onClick={() => setActiveTab('mis-prestamos')}>Mis Préstamos</div>
        <div className={`tab${activeTab === 'area' ? ' active' : ''}`} onClick={() => setActiveTab('area')}>Préstamos del Área</div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>Cargando…</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N° Préstamo</th>
                  <th>Bien</th>
                  <th>Fecha solicitud</th>
                  <th>Fecha devolución</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>No hay registros</td></tr>
                )}
                {data.map(p => (
                  <tr key={p.id}>
                    <td className="fw-600">{p.numero}</td>
                    <td>{p.bien}</td>
                    <td>{p.fecha_solicitud}</td>
                    <td>{p.fecha_devolucion}</td>
                    <td>{estadoBadge(p.estado)}</td>
                    <td>
                      {p.estado === 'en_prestamo' ? (
                        <div className="actions-cell">
                          <button className="btn btn-gray btn-xs" onClick={() => { setSelected(p); setDetObsTexts({}); setDetShowObs({}); setShowDetalle(true) }}>Ver detalle</button>
                          <button className="btn btn-outline btn-xs" onClick={() => { setSelectedForDev(p); setShowDevolucion(true) }}>Registrar devolución</button>
                        </div>
                      ) : (
                        <button className="btn btn-gray btn-xs" onClick={() => { setSelected(p); setDetObsTexts({}); setDetShowObs({}); setShowDetalle(true) }}>Ver detalle</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-gray mt-8" style={{ fontStyle: 'italic' }}>
        📌 Nota de diseño: Rol activo determina tabs visibles — usuario ve sus solicitudes, GDTH/Admin ven bandeja completa.
      </div>

      {/* ════════════════════════════════════════════
          MODAL — Solicitar Préstamo de Bien Tecnológico
          ════════════════════════════════════════════ */}
      {showNuevo && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeNuevo}>
          <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span>Solicitar Préstamo de Bien Tecnológico</span>
              <button className="modal-close" onClick={closeNuevo}>✕</button>
            </div>
            <div className="modal-body">

              {/* DNI Colaborador */}
              <div className="section-title-sm">COLABORADOR SOLICITANTE</div>
              <div className="form-group">
                <label className="form-label">DNI del colaborador <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingresa el DNI"
                    maxLength={8}
                    value={colabDni}
                    onChange={e => { setColabDni(e.target.value); setColabInfo(null); setColabErr(false) }}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={buscarColab}
                    disabled={colabDni.length < 8 || colabBuscando}
                  >
                    🔍 {colabBuscando ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
                {colabErr && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>DNI no encontrado</div>}
              </div>
              {colabInfo && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" readOnly value={colabInfo.nombre} style={{ background: '#F9FAFB' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Área / Puesto</label>
                    <input type="text" className="form-control" readOnly value={`${colabInfo.area} — ${colabInfo.puesto}`} style={{ background: '#F9FAFB' }} />
                  </div>
                </div>
              )}

              {/* Datos del bien */}
              <div className="section-title-sm">DATOS DEL BIEN</div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Bien solicitado <span className="req">*</span></label>
                  <select
                    className="form-control"
                    value={form.bien_id}
                    onChange={e => handleBienSelect(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1">Laptop HP Pavilion (1 disponible)</option>
                    <option value="2">Proyector Epson EB-X41 (2 disponibles)</option>
                    <option value="3">Tablet Samsung Tab S7 (1 disponible)</option>
                    <option value="" disabled style={{ color: '#9CA3AF' }}>Cámara Canon (0 — no disponible)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Código inventariado</label>
                  <input
                    type="text"
                    className="form-control"
                    readOnly
                    value={form.codigo}
                    placeholder="Auto-completado"
                    style={{ background: '#F9FAFB' }}
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="section-title-sm">
                PERÍODO DE PRÉSTAMO <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>(máx. 15 días)</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha de préstamo <span className="req">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fecha_prestamo}
                    onChange={e => setForm(f => ({ ...f, fecha_prestamo: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha estimada de devolución <span className="req">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fecha_devolucion}
                    onChange={e => setForm(f => ({ ...f, fecha_devolucion: e.target.value }))}
                  />
                </div>
              </div>
              {exceedsDays && (
                <div className="banner banner-amber" style={{ marginBottom: 8, fontSize: 12 }}>
                  ⚠ El período supera los 15 días máximos permitidos para préstamos de bienes tecnológicos.
                </div>
              )}

              {/* Destino */}
              <div className="section-title-sm">DATOS DEL DESTINO</div>
              <div className="form-group">
                <label className="form-label">Dirección donde se llevará el bien <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={form.direccion}
                  onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                  placeholder="Ej: Av. Los Álamos 342, Miraflores — domicilio trabajo remoto"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Motivo del préstamo <span className="req">*</span></label>
                <textarea
                  className="form-control"
                  value={form.motivo}
                  onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                  rows={2}
                  placeholder="Describe el uso que darás al equipo (trabajo remoto, evento, capacitación...)"
                />
              </div>

              {/* Aprobador */}
              <div className="form-group">
                <label className="form-label">Jefe de área aprobador</label>
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  value="Jesús Luman — Jefe TI (pre-asignado)"
                  style={{ background: '#F9FAFB' }}
                />
              </div>

              {/* Flujo referencial */}
              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
                <div className="text-xs fw-600 text-purple mb-8">Flujo de aprobación:</div>
                <div className="stepper">
                  <div className="step">
                    <div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>1</div>
                    <span className="step-lbl pend" style={{ fontSize: 10 }}>Tu solicitud</span>
                  </div>
                  <div className="step-conn"></div>
                  <div className="step">
                    <div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>2</div>
                    <span className="step-lbl pend" style={{ fontSize: 10 }}>V°B° Jefe TI</span>
                  </div>
                  <div className="step-conn"></div>
                  <div className="step">
                    <div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>3</div>
                    <span className="step-lbl pend" style={{ fontSize: 10 }}>Entrega Administ.</span>
                  </div>
                  <div className="step-conn"></div>
                  <div className="step">
                    <div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>4</div>
                    <span className="step-lbl pend" style={{ fontSize: 10 }}>Recepción</span>
                  </div>
                  <div className="step-conn"></div>
                  <div className="step">
                    <div className="step-circ pend" style={{ fontSize: 9, width: 22, height: 22 }}>5</div>
                    <span className="step-lbl pend" style={{ fontSize: 10 }}>Devolución</span>
                  </div>
                </div>
              </div>

              {/* Firmas */}
              <div className="section-title-sm">FIRMAS DE SOLICITUD</div>
              <div className="aprobaciones-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                {firmaLabels.map((fl, i) => (
                  <div key={i} className="aprob-cell">
                    <div className="aprob-title">{fl.title}</div>
                    <div
                      className="aprob-zona"
                      onClick={() => setFirmaModo(prev => ({ ...prev, [i]: true }))}
                    >
                      {firmaModo[i] ? (
                        <input
                          type="text"
                          className="firma-input"
                          value={firmaStates[i]}
                          onChange={e => setFirmaStates(prev => ({ ...prev, [i]: e.target.value }))}
                          placeholder="Tu firma"
                          autoFocus
                        />
                      ) : (
                        firmaStates[i]
                          ? <span className="firma-input" style={{ pointerEvents: 'none' }}>{firmaStates[i]}</span>
                          : <span className="firma-placeholder">Firmar aquí</span>
                      )}
                    </div>
                    <div className="text-xs text-gray mt-4">{fl.name}</div>
                  </div>
                ))}
              </div>
              <div className="banner banner-purple" style={{ marginTop: 10, fontSize: 12 }}>
                Las firmas de Recepción y Devolución del bien se registrarán en el Acta de Entrega correspondiente.
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={closeNuevo}>Cancelar</button>
              <button className="btn btn-outline">💾 Guardar borrador</button>
              <button className="btn btn-primary" onClick={handleSolicitar}>📤 Enviar solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          MODAL — Detalle Préstamo Bien Tecnológico
          ════════════════════════════════════════════ */}
      {showDetalle && selected && (() => {
        const d = PRESTAMOS_DATA[selected.numero]
        const flujoDefault: FlujoStep[] = d ? d.flujo : [
          {paso:'Solicitud del Colaborador',         icono:'📋', cargo:'Colaborador',                                              status:'done',    fecha:selected.fecha_solicitud, firmante:'Colaborador'},
          {paso:'V°B° Custodio — Jefe de TI',       icono:'✔',  cargo:'Jesús Luman Marcos Aragon — Jefe de TI',                     status: selected.estado==='pendiente_aprobacion'?'active':'done', fecha:'—', firmante:''},
          {paso:'Administración entrega al colaborador', icono:'📦', cargo:'Guissela Palacios Alvarez — Jefa de Administración',    status:'pending', fecha:'—', firmante:''},
          {paso:'Recepción y firma del colaborador', icono:'🖊',  cargo:'Colaborador',                                              status:'pending', fecha:'—', firmante:''},
          {paso:'Devolución del bien',               icono:'📥', cargo:'Colaborador — valida G. Palacios (Jefa Administración)',     status:'pending', fecha:selected.fecha_devolucion, firmante:'', activeLabel:`Plazo máx. 15 días`},
        ]
        return (
          <div className="modal-overlay" onClick={() => setShowDetalle(false)}>
            <div className="modal-box" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="modal-hdr">
                <div>
                  <span className="modal-title">Préstamo — {selected.bien}</span>
                  <div className="modal-subtitle" style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{selected.numero} · {selected.fecha_solicitud}</div>
                </div>
                <button className="modal-close" onClick={() => setShowDetalle(false)}>×</button>
              </div>
              <div className="modal-body">
                {/* Estado + N° */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  {estadoBadge(selected.estado)}
                  <span className="text-xs text-gray fw-600">{selected.numero}</span>
                </div>
                {/* Datos del registro */}
                <div className="inv-grid" style={{ marginBottom: 16 }}>
                  <div className="inv-field"><div className="lbl">N° Préstamo</div><div className="val fw-600">{d?.n ?? selected.numero}</div></div>
                  <div className="inv-field"><div className="lbl">Colaborador</div><div className="val">{d?.colaborador ?? '—'}</div></div>
                  <div className="inv-field"><div className="lbl">Bien</div><div className="val">{selected.bien}</div></div>
                  <div className="inv-field"><div className="lbl">Marca / Modelo</div><div className="val">{d ? `${d.marca} ${d.modelo}` : '—'}</div></div>
                  <div className="inv-field"><div className="lbl">ID Inventario</div><div className="val"><code>{d?.id_bien ?? '—'}</code></div></div>
                  <div className="inv-field"><div className="lbl">Código QR / Inv.</div><div className="val"><code>{d?.qr ?? '—'}</code></div></div>
                  <div className="inv-field"><div className="lbl">Fecha solicitud</div><div className="val">{selected.fecha_solicitud}</div></div>
                  <div className="inv-field"><div className="lbl">Fecha entrega</div><div className="val">{d?.fechaEntrega ?? '—'}</div></div>
                  <div className="inv-field"><div className="lbl">Dev. pactada</div><div className="val">{selected.fecha_devolucion}</div></div>
                  <div className="inv-field"><div className="lbl">Dev. real</div><div className="val">{d?.fechaDevReal ?? '—'}</div></div>
                  <div className="inv-field"><div className="lbl">Estado al entregar</div><div className="val">{d?.estadoEntrega !== '—' ? <span className="badge b-green">{d?.estadoEntrega}</span> : '—'}</div></div>
                  <div className="inv-field"><div className="lbl">Dirección destino</div><div className="val">{d?.direccion ?? '—'}</div></div>
                  {d?.motivo && <div className="inv-field" style={{ gridColumn: '1/-1' }}><div className="lbl">Motivo</div><div className="val">{d.motivo}</div></div>}
                </div>
                {/* Flujo del proceso */}
                <div className="section-title-sm" style={{ marginTop: 4 }}>FLUJO DEL PROCESO</div>
                {flujoDefault.map((f, i) => {
                  const firmaGuardada = detFirmaSteps[selected.numero]?.[i]
                  // Si el paso anterior tiene firma registrada y este paso era 'pending', avanzarlo a 'active'
                  const prevFirmaGuardada = i > 0 ? detFirmaSteps[selected.numero]?.[i - 1] : null
                  const stepStatus = firmaGuardada
                    ? 'done'
                    : (prevFirmaGuardada && f.status === 'pending')
                      ? 'active'
                      : f.status
                  return (
                  <div key={i} className="flow-step-block">
                    <div className={`flow-step-hdr ${stepStatus}`} style={{ cursor: 'default' }}>
                      <span>{stepStatus === 'done' ? '✔' : stepStatus === 'active' ? '⏳' : '○'} {f.icono} {f.paso}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{f.cargo}</span>
                    </div>
                    {stepStatus === 'done' && (
                      <div className="flow-step-body">
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div>
                            <div className="firma-label" style={{ textAlign: 'left', marginBottom: 4, fontSize: 10, color: '#9CA3AF' }}>Firmado por</div>
                            <div className="firma-box" style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', minWidth: 140 }}>{firmaGuardada?.firmante || f.firmante || '—'}</div>
                            <div className="firma-label" style={{ fontSize: 10, marginTop: 4 }}>{f.cargo}</div>
                          </div>
                          {f.firmante2 && <div>
                            <div className="firma-label" style={{ textAlign: 'left', marginBottom: 4, fontSize: 10, color: '#9CA3AF' }}>Confirmado por</div>
                            <div className="firma-box" style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', minWidth: 140 }}>{f.firmante2}</div>
                          </div>}
                          <div className="inv-field"><div className="lbl">Fecha</div><div className="val">{firmaGuardada?.fecha || f.fecha}</div></div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <button className="btn btn-outline btn-xs" onClick={() => setDetShowObs(p => ({ ...p, [i]: !p[i] }))}>+ Observación</button>
                        </div>
                        {detShowObs[i] && (
                          <div style={{ marginTop: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 12px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', marginBottom: 6 }}>Registrar observación</div>
                            <textarea className="form-control" style={{ fontSize: 12, minHeight: 56 }} placeholder="Escribe la observación..."
                              value={detObsTexts[i] || ''} onChange={e => setDetObsTexts(p => ({ ...p, [i]: e.target.value }))} />
                            <button className="btn btn-sm" style={{ marginTop: 6, background: '#D97706', color: 'white', border: 'none', borderRadius: 5, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
                              onClick={() => setDetShowObs(p => ({ ...p, [i]: false }))}>
                              Guardar observación
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {stepStatus === 'active' && (
                      <div className="flow-step-body">
                        {f.activeLabel && <div className="banner banner-purple" style={{ fontSize: 12, marginBottom: 8 }}>{f.activeLabel}</div>}
                        <div className="form-group" style={{ marginBottom: 8 }}>
                          <label className="form-label" style={{ fontSize: 11 }}>Firma digital — {f.cargo}</label>
                          <div style={{ fontSize:10, color:'#6B21A8', marginBottom:4 }}>✏ Escribe tu nombre completo para firmar y luego haz clic en "Registrar firma"</div>
                          <input type="text" className="form-control"
                            placeholder="Escribe tu nombre completo aquí..."
                            style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 14, color: '#1E1B4B' }}
                            value={detFirmaInput[selected.numero]?.[i] ?? ''}
                            onChange={e => setDetFirmaInput(prev => ({ ...prev, [selected.numero]: { ...(prev[selected.numero] ?? {}), [i]: e.target.value } }))}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            const firma = detFirmaInput[selected.numero]?.[i]
                            if (!firma?.trim()) { alert('Escribe tu firma para continuar'); return }
                            setDetFirmaSteps(prev => ({ ...prev, [selected.numero]: { ...(prev[selected.numero] ?? {}), [i]: { firmante: firma, fecha: new Date().toLocaleDateString('es-PE') } } }))
                          }}>✔ Registrar firma</button>
                          {i === 2 && (
                            prestCorreoEnviado[selected.numero]
                              ? <span className="badge b-green" style={{fontSize:11}}>✅ Correo enviado</span>
                              : <button className="btn btn-sm" style={{background:'#0EA5E9',color:'white',border:'none',borderRadius:6,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                                  onClick={() => {
                                    const esLoc = colabDni === '46832226' || (d?.colaborador?.includes('Percy') ?? false)
                                    setPrestCorreoEnviado(p => ({...p,[selected.numero]:true}))
                                    setPrestModalInfo({numero:selected.numero,bien:selected.bien,colaborador:d?.colaborador??'—',esLocador:esLoc})
                                    if (esLoc) setShowPrestActaModal(true)
                                    else setShowPrestCorreoModal(true)
                                  }}>
                                  📧 Enviar correo para firma
                                </button>
                          )}
                          <button className="btn btn-outline btn-xs" onClick={() => setDetShowObs(p => ({ ...p, [i]: !p[i] }))}>+ Observación</button>
                        </div>
                        {detShowObs[i] && (
                          <div style={{ marginTop: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 12px' }}>
                            <textarea className="form-control" style={{ fontSize: 12, minHeight: 56 }} placeholder="Escribe la observación..."
                              value={detObsTexts[i] || ''} onChange={e => setDetObsTexts(p => ({ ...p, [i]: e.target.value }))} />
                            <button className="btn btn-sm" style={{ marginTop: 6, background: '#D97706', color: 'white', border: 'none', borderRadius: 5, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
                              onClick={() => setDetShowObs(p => ({ ...p, [i]: false }))}>Guardar observación</button>
                          </div>
                        )}
                      </div>
                    )}
                    {f.status === 'pending' && (() => {
                      const correoEnv  = prestCorreoEnviado[selected.numero]
                      const firmaConf  = prestFirmaConfirmada[selected.numero]
                      const esPaso4    = i === 3
                      if (esPaso4 && firmaConf) {
                        return (
                          <div className="flow-step-body">
                            <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-end',marginBottom:8}}>
                              <div>
                                <div style={{fontSize:10,color:'#9CA3AF',marginBottom:4}}>Firmado por (vía correo)</div>
                                <div className="firma-box" style={{fontFamily:'Georgia,serif',fontStyle:'italic',minWidth:140}}>{firmaConf.firmante}</div>
                                <div style={{fontSize:10,color:'#6B7280',marginTop:4}}>{f.cargo}</div>
                              </div>
                              <div className="inv-field"><div className="lbl">Fecha</div><div className="val">{new Date().toLocaleDateString('es-PE')}</div></div>
                            </div>
                            {firmaConf.docAdjunto && (
                              <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:6,padding:'8px 12px',fontSize:11,display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontSize:16}}>📎</span>
                                <div><div style={{fontWeight:700,color:'#15803D'}}>Documento adjunto</div><div>{firmaConf.docAdjunto}</div></div>
                              </div>
                            )}
                          </div>
                        )
                      }
                      if (esPaso4 && correoEnv) {
                        return (
                          <div className="flow-step-body">
                            <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                              <div style={{fontSize:12,fontWeight:600,color:'#1D4ED8',marginBottom:4}}>📧 Esperando confirmación del colaborador</div>
                              <div style={{fontSize:11,color:'#374151'}}>Se envió correo con enlace de confirmación. El paso se habilitará al confirmar.</div>
                            </div>
                            <button className="btn btn-sm" style={{background:'#6B21A8',color:'white',border:'none',borderRadius:6,padding:'5px 14px',fontSize:12,cursor:'pointer'}}
                              onClick={() => {
                                const esLoc = prestModalInfo.esLocador || colabDni==='46832226'
                                setPrestFirmaConfirmada(p => ({...p,[selected.numero]:{firmante:d?.colaborador??'Colaborador',docAdjunto:esLoc?'Proy. Acta de recepción de bien.docx':undefined}}))
                              }}>
                              📲 Simular: Colaborador confirma desde correo
                            </button>
                          </div>
                        )
                      }
                      return (
                        <div className="flow-step-body">
                          <p className="text-xs text-gray" style={{ fontStyle: 'italic' }}>🔒 Pendiente — se habilitará al completar el paso anterior.</p>
                          <button className="btn btn-outline btn-xs" style={{ marginTop: 6 }} onClick={() => setDetShowObs(p => ({ ...p, [i]: !p[i] }))}>+ Observación</button>
                          {detShowObs[i] && (
                            <div style={{ marginTop: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 12px' }}>
                              <textarea className="form-control" style={{ fontSize: 12, minHeight: 56 }} placeholder="Escribe la observación..."
                                value={detObsTexts[i] || ''} onChange={e => setDetObsTexts(p => ({ ...p, [i]: e.target.value }))} />
                              <button className="btn btn-sm" style={{ marginTop: 6, background: '#D97706', color: 'white', border: 'none', borderRadius: 5, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
                                onClick={() => setDetShowObs(p => ({ ...p, [i]: false }))}>Guardar observación</button>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )})}
                {/* Firmas del proceso */}
                {d && (
                  <div style={{ marginTop: 16 }}>
                    <div className="section-title-sm">FIRMAS DEL PROCESO</div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(d.flujo.length, 3)}, 1fr)`, gap: 10, marginTop: 8 }}>
                      {d.flujo.map((f, fi) => {
                        const borderColor = f.status === 'done' ? '#22C55E' : f.status === 'active' ? '#6B21A8' : '#D1D5DB'
                        const bgColor = f.status === 'done' ? '#F0FDF4' : f.status === 'active' ? '#F5F3FF' : '#FAFAFA'
                        return (
                          <div key={fi} className="aprob-cell" style={{ border: `1px solid ${borderColor}`, background: bgColor }}>
                            <div className="aprob-title" style={{ fontSize: 10 }}>{f.paso}</div>
                            {f.status === 'done'
                              ? <div className="firma-box" style={{ minWidth: '100%' }}>{f.firmante}{f.firmante2 && <div style={{ fontSize: 10, color: '#6B7280', marginTop: 3, fontStyle: 'italic' }}>{f.firmante2}</div>}</div>
                              : f.status === 'active'
                              ? <div className="aprob-zona" style={{ minHeight: 40 }}><span className="firma-placeholder" style={{ fontSize: 11 }}>Firmar aquí</span></div>
                              : <div style={{ background: '#F3F4F6', border: '1px dashed #D1D5DB', borderRadius: 4, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, color: '#9CA3AF' }}>Pendiente</span></div>
                            }
                            <div className="text-xs text-gray mt-4">{f.cargo}</div>
                            <div className="text-xs text-gray">{f.fecha}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-gray" onClick={() => setShowDetalle(false)}>Cerrar</button>
                {selected.estado === 'en_prestamo' && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setSelectedForDev(selected); setShowDetalle(false); setShowDevolucion(true) }}>
                    📥 Registrar devolución
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ════════════════════════════════════════════
          MODAL — Registrar Devolución de Préstamo
          ════════════════════════════════════════════ */}
      {showDevolucion && selectedForDev && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeDevolucion}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span>Registrar Devolución — {selectedForDev.numero}</span>
              <button className="modal-close" onClick={closeDevolucion}>✕</button>
            </div>
            <div className="modal-body">

              {/* Summary */}
              <div className="summary-block">
                <div className="summary-row">
                  <span className="summary-lbl">Bien</span>
                  <span className="summary-val">{selectedForDev.bien}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-lbl">Prestado el</span>
                  <span className="summary-val">{selectedForDev.fecha_solicitud}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-lbl">Devolución pactada</span>
                  <span className="summary-val">{selectedForDev.fecha_devolucion}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-lbl">Estado al préstamo</span>
                  <span className="summary-val"><span className="badge b-green">Bueno</span></span>
                </div>
              </div>

              {/* Estado de devolución */}
              <div className="form-group">
                <label className="form-label">Estado de devolución <span className="req">*</span></label>
                <select
                  className="form-control"
                  value={devForm.estado}
                  onChange={e => setDevForm(f => ({ ...f, estado: e.target.value }))}
                >
                  <option>Bueno</option>
                  <option>Regular</option>
                  <option>Malo</option>
                </select>
              </div>

              {/* Observaciones */}
              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  value={devForm.observaciones}
                  onChange={e => setDevForm(f => ({ ...f, observaciones: e.target.value }))}
                  maxLength={350}
                  rows={3}
                  placeholder="Indica si hay daños o faltantes..."
                />
                <div className="form-hint" style={{ textAlign: 'right' }}>{devForm.observaciones.length}/350 caracteres</div>
              </div>

              {/* Fecha real */}
              <div className="form-group">
                <label className="form-label">Fecha real de devolución</label>
                <input
                  type="date"
                  className="form-control"
                  value={devForm.fecha_real}
                  onChange={e => setDevForm(f => ({ ...f, fecha_real: e.target.value }))}
                />
              </div>

              <div className="h-divider"></div>

              {/* Confirmación */}
              <div className="chk-group">
                <input
                  type="checkbox"
                  id="chk-devolucion"
                  checked={devForm.confirmado}
                  onChange={e => setDevForm(f => ({ ...f, confirmado: e.target.checked }))}
                />
                <label htmlFor="chk-devolucion">Confirmo haber devuelto el equipo en las condiciones indicadas</label>
              </div>

              {/* Readonly info */}
              <div className="readonly-row mt-8">
                <div className="readonly-item"><div className="lbl">Nombre</div><div className="val">Aaron Samuel Nuñez Muñoz</div></div>
                <div className="readonly-item"><div className="lbl">DNI</div><div className="val">77434028</div></div>
                <div className="readonly-item"><div className="lbl">Fecha</div><div className="val">25/03/2026</div></div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={closeDevolucion}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmarDevolucion}>Confirmar Devolución</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal correo enviado (genérico) ── */}
      {showPrestCorreoModal && (
        <div className="modal-overlay" onClick={() => setShowPrestCorreoModal(false)}>
          <div className="modal-box" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span>📧 Correo enviado para firma</span>
              <button className="modal-close" onClick={() => setShowPrestCorreoModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{textAlign:'center',padding:'28px 24px'}}>
              <div style={{fontSize:44,marginBottom:10}}>✅</div>
              <div style={{fontSize:14,fontWeight:700,color:'#1E1B4B',marginBottom:8}}>¡Correo enviado exitosamente!</div>
              <div style={{fontSize:12,color:'#6B7280',lineHeight:1.6,marginBottom:14}}>
                Se envió un mensaje al colaborador con el enlace de confirmación de recepción. Al hacer clic en <strong>"Confirmar"</strong>, se registrará automáticamente la firma en el Paso 4.
              </div>
              <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:8,padding:'10px 14px',fontSize:11,color:'#5B21B6',textAlign:'left'}}>
                <div style={{fontWeight:700,marginBottom:4}}>Detalles del envío</div>
                <div>Para: {prestModalInfo.colaborador}</div>
                <div>Préstamo: {prestModalInfo.numero} · {prestModalInfo.bien}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowPrestCorreoModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal acta de recepción para Locador (Percy) ── */}
      {showPrestActaModal && (
        <div className="modal-overlay" onClick={() => setShowPrestActaModal(false)}>
          <div className="modal-box" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span>📧 Correo enviado — Locador de Servicios</span>
              <button className="modal-close" onClick={() => setShowPrestActaModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{textAlign:'center',marginBottom:18}}>
                <div style={{fontSize:40,marginBottom:8}}>✅</div>
                <div style={{fontSize:14,fontWeight:700,color:'#1E1B4B',marginBottom:6}}>¡Correo enviado exitosamente!</div>
                <div style={{fontSize:12,color:'#6B7280',lineHeight:1.6}}>Se envió el mensaje con el <strong>Acta de Recepción de Bien</strong> adjunta. El locador debe completar y adjuntar el documento al confirmar.</div>
              </div>
              <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'#15803D',marginBottom:6}}>📎 Documento adjunto al correo</div>
                <div style={{display:'flex',alignItems:'center',gap:10,background:'white',borderRadius:6,padding:'8px 10px',border:'1px solid #D1FAE5'}}>
                  <span style={{fontSize:22}}>📄</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'#1E1B4B'}}>Proy. Acta de recepción de bien.docx</div>
                    <div style={{fontSize:10,color:'#6B7280'}}>Documento de conformidad para Locadores de Servicios</div>
                  </div>
                </div>
              </div>
              <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'10px 14px',fontSize:11,color:'#1D4ED8'}}>
                <div style={{fontWeight:700,marginBottom:4}}>Instrucciones al locador</div>
                <ol style={{margin:0,paddingLeft:16,lineHeight:1.8}}>
                  <li>Descargar y completar el Acta de Recepción adjunta</li>
                  <li>Hacer clic en <strong>"Confirmar"</strong> en el enlace del correo</li>
                  <li>Adjuntar el acta completada al confirmar</li>
                </ol>
              </div>
              <div style={{marginTop:12,fontSize:11,color:'#9CA3AF',borderTop:'1px solid #F3F4F6',paddingTop:10}}>
                Para: {prestModalInfo.colaborador} · {prestModalInfo.numero}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowPrestActaModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
