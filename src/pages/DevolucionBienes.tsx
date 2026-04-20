import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Devolucion } from '../types'

// ─── Firma intranet helpers ────────────────────────────────────────────────────

function FirmaDone({ nombre, cargo, fecha }: { nombre: string; cargo: string; fecha: string }) {
  return (
    <div style={{ minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 6px', border: '1px solid #E5E7EB', borderRadius: 5, background: '#F9FAFB' }}>
      <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#1E1B4B', fontSize: 11 }}>{nombre}</span>
      <div style={{ fontSize: 9, color: '#6B7280', marginTop: 2 }}>{cargo}</div>
      <div style={{ fontSize: 9, color: '#6B7280' }}>{fecha}</div>
    </div>
  )
}
function FirmaPendiente() {
  return (
    <div style={{ minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 6px', border: '1px dashed #FECACA', borderRadius: 5, background: '#FFF8F8' }}>
      <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#991B1B', fontSize: 11 }}>Pendiente</span>
      <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>—</div>
    </div>
  )
}
function FirmaEspera() {
  return (
    <div style={{ minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 6px', border: '1px dashed #D1D5DB', borderRadius: 5, background: '#F9FAFB' }}>
      <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', color: '#6B7280', fontSize: 11 }}>En espera</span>
      <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>—</div>
    </div>
  )
}

// ─── Data constants ────────────────────────────────────────────────────────────


const COLABORADORES: Record<string, { nombre: string; area: string; cargo: string; sede: string }> = {
  '77434028': { nombre: 'Aaron Samuel Nuñez Muñoz',        area: 'UN. DE TI',            cargo: 'Analista de TI',                        sede: 'SEDE 28 DE JULIO' },
  '72224207': { nombre: 'Julieth Zenina Carbajal Garro',   area: 'UN. DE GDTH',          cargo: 'Jefa de GDTH',                          sede: 'SEDE 28 DE JULIO' },
  '46521663': { nombre: 'Jesús Luman Marcos Aragon',       area: 'UN. DE TI',            cargo: 'Jefe de TI',                            sede: 'SEDE 28 DE JULIO' },
  '45103078': { nombre: 'Nataly De Rutte Vergara',         area: 'UN. DE PLANIFICACION', cargo: 'Jefa de Planificación',                 sede: 'SEDE 28 DE JULIO' },
  '71926735': { nombre: 'Marino Eduardo Espinoza Vega',    area: 'UN. DE PLANIFICACION', cargo: 'Jefa de Planificación',                 sede: 'SEDE 28 DE JULIO' },
  '71489337': { nombre: 'Ariana Sarita Alvines Zapata',    area: 'UN. DE GDTH',          cargo: 'Trabajadora Social',                    sede: 'SEDE 28 DE JULIO' },
  '45438744': { nombre: 'Hamer Chonlon Escudero',          area: 'UN. DE GDTH',          cargo: 'Analista de Planilla y Compensaciones', sede: 'SEDE 28 DE JULIO' },
  '40555090': { nombre: 'Guissela Del Rocio Palacios Alvarez', area: 'UN. DE ADM',       cargo: 'Jefa de Administración',                sede: 'SEDE 28 DE JULIO' },
  '48277741': { nombre: 'Anali Jasmin Chafloque Cordova',  area: 'UN. DE ADM',           cargo: 'Asistente Administrativo',              sede: 'SEDE 28 DE JULIO' },
  '47272523': { nombre: 'Edwin Jesus Chozo Santisteban',   area: 'UN. DE CONTA',         cargo: 'Contador General',                      sede: 'SEDE 28 DE JULIO' },
  '72651020': { nombre: 'Maria del Rosario Rojas Gutierrez', area: 'UN. DE CONTA',       cargo: 'Sub Contadora',                         sede: 'SEDE 28 DE JULIO' },
  '40812969': { nombre: 'Santiago Masaichi Hayashi Delgado', area: 'UN. DE PATR',        cargo: 'Jefe de Patrimonio',                    sede: 'SEDE 28 DE JULIO' },
  '10609810': { nombre: 'David Augusto Cadillo Alfaro',    area: 'UN. DE PATR',          cargo: 'Analista de Activos Muebles',           sede: 'SEDE 28 DE JULIO' },
  '43422937': { nombre: 'David Leoncio Salazar Ttito',     area: 'UN. DE PATR',          cargo: 'Supervisor de Activos Muebles',         sede: 'SEDE 28 DE JULIO' },
}

const BIENES_DEVOLUCION = [
  { id: '111030', desc: 'Laptop Dell Latitude 5420',  codigo: 'CMP-038401', marca: 'Dell',      modelo: 'Latitude 5420',  serie: 'SN20241001', custodio: 'Jesús Luman Marcos Aragon — Jefe de TI',              estado: 'bueno',   devolucion: 'pendiente' },
  { id: '111031', desc: 'Monitor LG 24" 24MK430H',   codigo: 'CMP-038402', marca: 'LG',        modelo: '24MK430H',       serie: 'SN20231002', custodio: 'Jesús Luman Marcos Aragon — Jefe de TI',              estado: 'bueno',   devolucion: 'pendiente' },
  { id: '200201', desc: 'Silla ergonómica',           codigo: 'CMP-ART-041', marca: 'Ergosit', modelo: 'Modelo A',       serie: '—',          custodio: 'Guissela Palacios Alvarez — Jefa de Administración', estado: 'regular', devolucion: 'observado' },
]

const ACCESORIOS_DEVOLUCION = [
  { id: '2026_ADM_0001', nombre: 'Teclado HP', marca: 'HP', modelo: 'K1500', serie: 'SN20220301', codigo: '2026_ADM_0001', estado: 'bueno' },
  { id: '2026_ADM_0002', nombre: 'USB Kingston', marca: 'Kingston', modelo: 'DataTraveler 32GB', serie: 'SN20230102', codigo: '2026_ADM_0002', estado: 'bueno' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estadoBadge(estado: string) {
  if (estado === 'en_proceso') return <span className="badge b-yellow">En proceso</span>
  if (estado === 'observado') return <span className="badge b-yellow">Con observaciones</span>
  if (estado === 'bloqueado') return <span className="badge b-red">Bloqueado</span>
  if (estado === 'completado') return <span className="badge b-green">Completado</span>
  return <span className="badge b-gray">{estado}</span>
}

function semaforoDot(estado: string) {
  if (estado === 'completado') return <span className="sem sem-g"></span>
  if (estado === 'en_proceso' || estado === 'bloqueado') return <span className="sem sem-r"></span>
  if (estado === 'observado') return <span className="sem sem-y"></span>
  return <span className="sem sem-r"></span>
}

function getInitials(nombre: string) {
  const parts = nombre.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0]?.substring(0, 2).toUpperCase() ?? 'XX'
}

// ─── Modal: Registrar Salida ───────────────────────────────────────────────────

interface ModalRegistrarSalidaProps {
  onClose: () => void
  onRegistrar: (nueva: Devolucion) => void
}

function ModalRegistrarSalida({ onClose, onRegistrar }: ModalRegistrarSalidaProps) {
  const [form, setForm] = useState({ dni: '', tipo_salida: 'cese', fecha_efectiva: '', motivo: '', notificar: true })
  const [buscando, setBuscando] = useState(false)
  const [colaboradorInfo, setColaboradorInfo] = useState<{ nombre: string; area: string; cargo: string; sede: string } | null>(null)
  const [notifConfirmada, setNotifConfirmada] = useState(false)

  const buscarColaborador = async () => {
    setBuscando(true)
    const mock = COLABORADORES[form.dni]
    if (mock) { setColaboradorInfo(mock); setBuscando(false); return }
    const { data } = await supabase.from('colaboradores').select('nombres,apellidos,area,puesto,sede').eq('dni', form.dni).maybeSingle()
    if (data) {
      setColaboradorInfo({ nombre: `${data.nombres} ${data.apellidos}`, area: data.area ?? '—', cargo: data.puesto ?? '—', sede: data.sede ?? '—' })
    } else {
      setColaboradorInfo(null)
    }
    setBuscando(false)
  }

  const handleRegistrar = async () => {
    if (!colaboradorInfo) return
    const payload = {
      colaborador_dni: form.dni,
      colaborador_nombre: colaboradorInfo.nombre,
      area: colaboradorInfo.area,
      tipo_salida: form.tipo_salida,
      fecha_inicio: form.fecha_efectiva || new Date().toLocaleDateString('es-PE'),
      estado: 'en_proceso',
      bienes_count: 0,
    }
    const { data: newRec, error } = await supabase.from('devoluciones').insert(payload).select().single()
    if (error) { alert(`Error al guardar: ${error.message}`); return }
    const nueva: Devolucion = {
      id: newRec?.id ?? String(Date.now()),
      colaborador_dni: form.dni,
      colaborador_nombre: colaboradorInfo.nombre,
      area: colaboradorInfo.area,
      tipo_salida: form.tipo_salida as Devolucion['tipo_salida'],
      fecha_inicio: form.fecha_efectiva || new Date().toLocaleDateString('es-PE'),
      estado: 'en_proceso',
      bienes_count: 0,
      created_at: new Date().toISOString(),
    }
    // Obs 10 — Notificación a todas las áreas involucradas
    if (form.notificar) {
      setNotifConfirmada(true)
      // Simula envío; en producción llamaría a un servicio de notificaciones
      setTimeout(() => { onRegistrar(nueva) }, 1800)
    } else {
      onRegistrar(nueva)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <span className="modal-title">Registrar Salida de Personal</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* DNI search */}
          <div className="form-group">
            <label className="form-label">DNI del colaborador <span style={{ color: '#EF4444' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-control"
                id="salida-dni"
                placeholder="Ingresa el DNI"
                style={{ flex: 1 }}
                value={form.dni}
                maxLength={8}
                onChange={e => { setForm(f => ({ ...f, dni: e.target.value })); setColaboradorInfo(null) }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={buscarColaborador}
                disabled={form.dni.length < 8 || buscando}
              >
                🔍 {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Colaborador found */}
          {colaboradorInfo && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombres y apellidos</label>
                  <input type="text" className="form-control" readOnly value={colaboradorInfo.nombre} />
                </div>
                <div className="form-group">
                  <label className="form-label">Área</label>
                  <input type="text" className="form-control" readOnly value={colaboradorInfo.area} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input type="text" className="form-control" readOnly value={colaboradorInfo.cargo} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sede</label>
                  <input type="text" className="form-control" readOnly value={colaboradorInfo.sede} />
                </div>
              </div>
            </div>
          )}

          {/* Tipo + Fecha */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de salida <span style={{ color: '#EF4444' }}>*</span></label>
              <select
                className="form-control"
                value={form.tipo_salida}
                onChange={e => setForm(f => ({ ...f, tipo_salida: e.target.value }))}
              >
                <option value="">Seleccionar...</option>
                <option value="renuncia">Renuncia voluntaria</option>
                <option value="cese">Cese</option>
                <option value="no_renovacion">No renovación</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha efectiva de cese <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="date"
                className="form-control"
                value={form.fecha_efectiva}
                onChange={e => setForm(f => ({ ...f, fecha_efectiva: e.target.value }))}
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="form-group">
            <label className="form-label">Motivo adicional</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Opcional — información adicional..."
              value={form.motivo}
              onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
            />
          </div>

          {/* Checkbox — Obs 10 */}
          <div className="chk-group">
            <input
              type="checkbox"
              id="chk-notificar-salida"
              checked={form.notificar}
              onChange={e => setForm(f => ({ ...f, notificar: e.target.checked }))}
            />
            <label htmlFor="chk-notificar-salida">Notificar automáticamente a todas las áreas involucradas en la devolución</label>
          </div>
          {form.notificar && (
            <div className="banner" style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', fontSize:12, color:'#4A1272', marginTop:8 }}>
              📨 Se enviará notificación a: <strong>UN. DE TI · Administración · Comunicaciones · GDTH · Contabilidad · Patrimonio</strong> — informando la salida del colaborador y activando el proceso de devolución en cada área.
            </div>
          )}

          {/* Confirmación de notificación enviada — Obs 10 */}
          {notifConfirmada && (
            <div className="banner" style={{ background:'#ECFDF5', border:'1px solid #6EE7B7', color:'#065F46', marginTop:10 }}>
              ✅ Notificaciones enviadas a todas las áreas. Cerrando y registrando proceso...
            </div>
          )}

          {/* Banner */}
          <div className="banner banner-purple mt-12">
            Al registrar la salida se creará automáticamente el proceso de devolución con todos los bienes asignados al colaborador, consultados desde el módulo Activos y Bienes.
            <br /><span className="badge b-teal" style={{ marginTop: 8, display: 'inline-flex' }}>⚡ API — Activos y Bienes</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-gray" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleRegistrar} disabled={!colaboradorInfo}>Registrar y Crear Proceso</button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Acta de Devolución ─────────────────────────────────────────────────

interface ActaBien {
  id: string
  nombre: string
  codigo: string
  marca: string
  modelo: string
  serie: string
}

interface ColaboradorActa {
  nombre: string; dni: string; area: string; cargo: string; sede: string
}

interface ModalActaDevolucionProps {
  bien: ActaBien
  colaborador: ColaboradorActa
  onClose: () => void
  onFirmar: () => void
}

function ModalActaDevolucion({ bien, colaborador, onClose, onFirmar }: ModalActaDevolucionProps) {
  const [notifEnviada, setNotifEnviada] = useState(false)
  const [colaboradorFirmado, setColaboradorFirmado] = useState(false)
  const [aceptado, setAceptado] = useState(false)
  const [firmaEntregaVal, setFirmaEntregaVal] = useState('')
  const [firmaEntregaDone, setFirmaEntregaDone] = useState(false)
  const hoy = new Date()
  const dd = String(hoy.getDate()).padStart(2,'0')
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const mes = meses[hoy.getMonth()]
  const anio = hoy.getFullYear()
  const fechaHoy = `${dd}/${String(hoy.getMonth()+1).padStart(2,'0')}/${anio}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700, maxHeight:'92vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <div>
            <div className="acta-logo-hdr">
              <div className="acta-logo-circle">CMP</div>
              <div>
                <div className="modal-title" style={{ fontSize: 13, paddingRight: 0 }}>ACTA DE ENTREGA Y DEVOLUCIÓN DE BIENES</div>
                <div className="modal-subtitle">Documento oficial CMP — tiene validez de conformidad</div>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Encabezado del acta */}
          <div className="acta-date-line">
            En la fecha
            <input type="text" className="inp-dd" placeholder="DD" defaultValue={dd} />
            de
            <input type="text" className="inp-mes" placeholder="mes" defaultValue={mes} />
            del
            <input type="text" className="inp-anio" placeholder="YYYY" defaultValue={String(anio)} />
            se realiza la
            <select>
              <option>Devolución</option>
              <option>Entrega</option>
            </select>
            de los bienes solicitados.
          </div>

          {/* Sección 1 — datos del colaborador del registro de salida (Obs 4) */}
          <div className="section-title-sm">Sección 1: INFORMACIÓN DEL USUARIO</div>
          <table className="inst-grid">
            <tbody>
              <tr>
                <td className="lbl-cell">Nombres y Apellidos</td>
                <td className="val-cell">{colaborador.nombre}</td>
                <td className="lbl-cell">Sede</td>
                <td className="val-cell">{colaborador.sede}</td>
              </tr>
              <tr>
                <td className="lbl-cell">DNI</td>
                <td className="val-cell">{colaborador.dni}</td>
                <td className="lbl-cell">Puesto</td>
                <td className="val-cell">{colaborador.cargo}</td>
              </tr>
              <tr>
                <td className="lbl-cell">Área</td>
                <td className="val-cell" colSpan={3}>{colaborador.area}</td>
              </tr>
            </tbody>
          </table>

          {/* Sección 2 */}
          <div className="section-title-sm">Sección 2: INFORMACIÓN DEL BIEN</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="acta-table" id="acta-bien-table">
              <thead>
                <tr>
                  <th>CANT</th>
                  <th>CÓDIGO PATRIMONIAL</th>
                  <th>DESCRIPCIÓN DEL BIEN</th>
                  <th>MARCA</th>
                  <th>MODELO</th>
                  <th>N° DE SERIE</th>
                  <th>ESTADO*</th>
                  <th>OBSERVACIÓN</th>
                  <th>RECIBE**</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="number" defaultValue={1} style={{ width: 40 }} /></td>
                  <td><input type="text" defaultValue={bien.codigo} /></td>
                  <td><input type="text" defaultValue={bien.nombre} /></td>
                  <td><input type="text" defaultValue={bien.marca} /></td>
                  <td><input type="text" defaultValue={bien.modelo} /></td>
                  <td><input type="text" defaultValue={bien.serie} /></td>
                  <td>
                    <select>
                      <option>MB</option>
                      <option>B</option>
                      <option>R</option>
                      <option>M</option>
                    </select>
                  </td>
                  <td><input type="text" placeholder="—" /></td>
                  <td>
                    <select className="form-control" style={{ fontSize: 10, padding: '2px 4px', minWidth: 150 }}>
                      <option>UN. DE TI</option>
                      <option>UN. DE ADMINISTRACION</option>
                      <option>UN. DE COMUN. E IMAGEN INSTI.</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline btn-xs mt-8">+ Agregar fila</button>
          <div className="text-xs text-gray mt-8">*Estado: Muy Bueno (MB) / Bueno (B) / Regular (R) / Malo (M)</div>
          <div className="text-xs text-gray mb-12">**Recibe: cómputo → UN. DE TI, bienes muebles → UN. DE ADMINISTRACION, comunicaciones → UN. DE COMUN. E IMAGEN INSTI.</div>

          {/* Responsabilidades + Párrafo de aceptación (Obs 9) */}
          <div className="resp-block">
            <strong>Responsabilidades y aceptación del trabajador:</strong>
            <ul>
              <li>Proteger y conservar los bienes otorgados durante el tiempo de uso.</li>
              <li>Darles el uso exclusivo para el cual han sido asignados, conforme a las políticas institucionales.</li>
              <li>Responsabilizarse de la existencia física, permanencia y conservación de los bienes a su cargo.</li>
              <li>Tomar las medidas necesarias para prevenir pérdidas, hurto, robo y deterioro.</li>
              <li><strong>En caso de pérdida, hurto o daño irreparable:</strong> el colaborador asume la responsabilidad económica del bien según su valor de reposición al momento del evento, pudiendo aplicarse descuento en planilla o liquidación según la normativa vigente del CMP.</li>
              <li><strong>En caso de daño parcial:</strong> el área custodio evaluará el estado del bien y determinará si corresponde observación, reparación a cargo del colaborador o aceptación con descargo documentado.</li>
              <li>La firma de este documento tiene carácter de Declaración Jurada y otorga conformidad expresa de las condiciones establecidas.</li>
            </ul>
          </div>

          {/* Firma vía correo electrónico (Obs 8) */}
          <div className="banner banner-purple" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>📧 Firma digital por notificación de correo</div>
            La aceptación y firma final de entrega/devolución de bienes y accesorios se realiza mediante una notificación enviada al correo institucional del colaborador (<strong>{colaborador.nombre}</strong>). Al aceptar el correo, el colaborador registra su conformidad en el sistema.
          </div>

          {notifEnviada ? (
            <div className="banner" style={{ background:'#ECFDF5', border:'1px solid #6EE7B7', color:'#065F46', marginBottom:14 }}>
              ✅ Notificación enviada al correo del colaborador el {dd}/{meses.indexOf(mes)+1 < 10 ? '0'+(meses.indexOf(mes)+1) : meses.indexOf(mes)+1}/{anio}. En espera de aceptación.
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <input type="checkbox" id="chk-acepto" checked={aceptado} onChange={e => setAceptado(e.target.checked)} />
                <label htmlFor="chk-acepto" style={{ fontSize:12, color:'#374151' }}>
                  Confirmo que los datos del acta son correctos y autorizo el envío de la notificación de firma al colaborador
                </label>
              </div>
              <button
                className="btn btn-primary btn-sm"
                disabled={!aceptado}
                style={!aceptado ? { opacity:0.5, cursor:'not-allowed' } : {}}
                onClick={() => { setNotifEnviada(true); setColaboradorFirmado(true) }}
              >
                📧 Enviar notificación de firma al colaborador
              </button>
            </div>
          )}

          {/* Grid firmas del acta */}
          <div className="section-title-sm">FIRMAS DEL ACTA</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {/* Responsable que entrega — firma interactiva */}
            <div className="aprob-cell">
              <div className="aprob-title">Responsable que entrega</div>
              {firmaEntregaDone ? (
                <FirmaDone nombre={firmaEntregaVal} cargo="Administración CMP" fecha={fechaHoy} />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe aquí tu firma..."
                    style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:13, color:'#1E1B4B' }}
                    value={firmaEntregaVal}
                    onChange={e => setFirmaEntregaVal(e.target.value)}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ alignSelf:'flex-start' }}
                    disabled={!firmaEntregaVal.trim()}
                    onClick={() => { if (firmaEntregaVal.trim()) setFirmaEntregaDone(true) }}
                  >✔ Registrar firma</button>
                </div>
              )}
              <div className="text-xs text-gray mt-4">Administración CMP</div>
            </div>
            {/* Colaborador — firma automática al enviar notificación */}
            <div className="aprob-cell">
              <div className="aprob-title">Colaborador — firma por correo</div>
              {colaboradorFirmado ? (
                <FirmaDone nombre={colaborador.nombre} cargo={colaborador.cargo} fecha={fechaHoy} />
              ) : notifEnviada ? (
                <div className="aprob-zona" style={{ background:'#F5F3FF', border:'1px dashed #6B21A8' }}>
                  <span style={{ fontSize:11, color:'#6B21A8', fontStyle:'italic' }}>⏳ Pendiente de aceptación por correo</span>
                </div>
              ) : (
                <FirmaPendiente />
              )}
              <div className="text-xs text-gray mt-4">{colaborador.nombre}</div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <span className="modal-note">Ambas firmas son requeridas para registrar la devolución.</span>
          <button className="btn btn-gray" onClick={onClose}>Cancelar</button>
          <button className="btn btn-outline">💾 Guardar borrador</button>
          <button className="btn btn-primary" onClick={onFirmar} disabled={!firmaEntregaDone || !colaboradorFirmado} style={(!firmaEntregaDone || !colaboradorFirmado)?{opacity:0.5,cursor:'not-allowed'}:{}}>
            ✔ Registrar devolución
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Ver Observación ────────────────────────────────────────────────────

interface ModalVerObsProps {
  bienId: string
  onClose: () => void
}

function ModalVerObs({ bienId, onClose }: ModalVerObsProps) {
  const datos: Record<string, { tipo: string; estado: string; autor: string; fecha: string; detalle: string }> = {
    '200201': {
      tipo: 'Bien mueble',
      estado: 'Regular',
      autor: 'Jesús Luman Marcos Aragon',
      fecha: '27/03/2026',
      detalle: 'La silla ergonómica presenta desgaste visible en el tapizado y uno de los apoyabrazos muestra fisuras. Se recomienda evaluar si procede descuento o aceptación con observación firmada.',
    },
  }
  const obs = datos[bienId] ?? { tipo: '—', estado: '—', autor: '—', fecha: '—', detalle: '—' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <span className="modal-title">Observación — <span id="obs-bien-nombre">Bien {bienId}</span></span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="summary-block">
            <div className="summary-row"><span className="summary-lbl">ID Bien</span><span className="summary-val">{bienId}</span></div>
            <div className="summary-row"><span className="summary-lbl">Tipo</span><span className="summary-val">{obs.tipo}</span></div>
            <div className="summary-row"><span className="summary-lbl">Estado físico</span><span className="summary-val">{obs.estado}</span></div>
            <div className="summary-row"><span className="summary-lbl">Registrado por</span><span className="summary-val">{obs.autor}</span></div>
            <div className="summary-row"><span className="summary-lbl">Fecha</span><span className="summary-val">{obs.fecha}</span></div>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Detalle de la observación</label>
            <div style={{ background: '#FFF7ED', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
              {obs.detalle}
            </div>
          </div>
          <div className="banner banner-amber" style={{ marginBottom: 0 }}>
            ⚠ Para continuar el proceso, el colaborador debe subsanar o el área responsable debe validar el bien antes de registrar la devolución.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-gray" onClick={onClose}>Cerrar</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>📨 Notificar colaborador</button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>✔ Marcar subsanado</button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Reporte Devolución ─────────────────────────────────────────────────

interface ModalReporteDevolucionProps {
  onClose: () => void
}

function ModalReporteDevolucion({ onClose }: ModalReporteDevolucionProps) {
  const tdStyle = { border: '1px solid #E5E7EB', padding: 7 }
  const thStyle = { border: '1px solid #E5E7EB', padding: 7, textAlign: 'left' as const }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <div>
            <span className="modal-title">Reporte de Devolución de Bienes</span>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Detalle completo con flujo de firmas y observaciones</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Encabezado colaborador */}
          <div style={{ border: '1.5px solid #6B21A8', borderRadius: 8, padding: '14px 18px', marginBottom: 16, background: '#F5F3FF' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E1B4B', marginBottom: 4 }}>Carlos Pérez Ramos</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>DNI: 45231089 · Cargo: Analista Contable · Área: UN. DE TI</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Fecha de cese: 31/03/2026 · Sede: Malecón de la Reserva</div>
          </div>

          {/* Sección 1 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F3F4F6', borderRadius: 6, padding: '8px 12px', marginBottom: 8, borderLeft: '4px solid #F59E0B' }}>
              📦 SECCIÓN 1 — Bienes a devolver
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#FEF9EE' }}>
                  <th style={thStyle}>ID</th><th style={thStyle}>Descripción</th><th style={thStyle}>Código QR</th>
                  <th style={thStyle}>Estado físico</th><th style={thStyle}>Validación Custodio</th>
                  <th style={thStyle}>Validación Colaborador</th><th style={thStyle}>Validación GDTH</th><th style={thStyle}>Devolución</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>111030</td><td style={tdStyle}>Laptop Dell Latitude 5420</td><td style={tdStyle}>CMP-038401</td>
                  <td style={tdStyle}>Bueno</td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaDone nombre="J. Luman" cargo="Jesús Luman Marcos Aragon — Jefe de TI" fecha="01/04/2026" /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaPendiente /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, color: '#D97706' }}>☐ Pendiente</td>
                </tr>
                <tr>
                  <td style={tdStyle}>111031</td><td style={tdStyle}>Monitor LG 24" 24MK430H</td><td style={tdStyle}>CMP-038402</td>
                  <td style={tdStyle}>Bueno</td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaDone nombre="J. Luman" cargo="Jesús Luman Marcos Aragon — Jefe de TI" fecha="01/04/2026" /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaPendiente /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, color: '#D97706' }}>☐ Pendiente</td>
                </tr>
                <tr>
                  <td style={tdStyle}>200201</td><td style={tdStyle}>Silla ergonómica</td><td style={tdStyle}>CMP-ART-041</td>
                  <td style={tdStyle}>Regular</td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaDone nombre="G. Palacios" cargo="Jefa UN. Administración — ⚠ Obs." fecha="01/04/2026" /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaPendiente /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, color: '#EF4444' }}>⚠ Observado</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sección 2 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F3F4F6', borderRadius: 6, padding: '8px 12px', marginBottom: 8, borderLeft: '4px solid #10B981' }}>
              🔌 SECCIÓN 2 — Accesorios a devolver
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F0FDF4' }}>
                  <th style={thStyle}>ID</th><th style={thStyle}>Nombre</th><th style={thStyle}>Marca</th>
                  <th style={thStyle}>Estado físico</th><th style={thStyle}>Validación Custodio</th>
                  <th style={thStyle}>Validación Colaborador</th><th style={thStyle}>Validación GDTH</th><th style={thStyle}>Devolución</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>2026_ADM_0001</td><td style={tdStyle}>Teclado HP K1500</td><td style={tdStyle}>HP</td>
                  <td style={tdStyle}>Bueno</td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaPendiente /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, color: '#D97706' }}>☐ Pendiente</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2026_ADM_0002</td><td style={tdStyle}>USB Kingston DataTraveler</td><td style={tdStyle}>Kingston</td>
                  <td style={tdStyle}>Bueno</td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaPendiente /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, padding: 5 }}><FirmaEspera /></td>
                  <td style={{ ...tdStyle, color: '#D97706' }}>☐ Pendiente</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sección 3 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F3F4F6', borderRadius: 6, padding: '8px 12px', marginBottom: 8, borderLeft: '4px solid #10B981' }}>
              📦 SECCIÓN 3 — Préstamos Bienes Tecnológicos
            </div>
            <div style={{ padding: 10, background: '#F9FAFB', borderRadius: 6, fontSize: 12, color: '#6B7280', fontStyle: 'italic', textAlign: 'center' }}>Sin préstamos de bienes tecnológicos activos para este colaborador.</div>
          </div>

          {/* Sección 4 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F3F4F6', borderRadius: 6, padding: '8px 12px', marginBottom: 8, borderLeft: '4px solid #10B981' }}>
              💰 SECCIÓN 4 — Préstamos y Adelantos de Sueldo
            </div>
            <div style={{ padding: 10, background: '#F9FAFB', borderRadius: 6, fontSize: 12, color: '#6B7280', fontStyle: 'italic', textAlign: 'center' }}>Sin préstamos ni adelantos con saldo pendiente.</div>
          </div>

          {/* Sección 5 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', background: '#F3F4F6', borderRadius: 6, padding: '8px 12px', marginBottom: 8, borderLeft: '4px solid #10B981' }}>
              🏧 SECCIÓN 5 — Caja Chica
            </div>
            <div style={{ padding: 10, background: '#F9FAFB', borderRadius: 6, fontSize: 12, color: '#6B7280', fontStyle: 'italic', textAlign: 'center' }}>Colaborador no designado como responsable de Caja Chica.</div>
          </div>

          {/* Resumen global */}
          <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', marginBottom: 6 }}>Resumen de estado global</div>
            <div style={{ fontSize: 12, color: '#374151' }}>Estado: <strong style={{ color: '#EF4444' }}>Proceso incompleto</strong> — 5 ítems de 5 pendientes (0%)</div>
            <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>Generado el: 06/04/2026 · Por: Sistema — Portal CMP Intranet</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-gray" onClick={onClose}>Cerrar</button>
          <button className="btn btn-outline">🖨 Imprimir</button>
          <button className="btn btn-primary">📄 Generar PDF</button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail View ───────────────────────────────────────────────────────────────

interface DetailViewProps {
  devolucion: Devolucion
  onBack: () => void
}

function DetailView({ devolucion, onBack }: DetailViewProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bienes: true,
    accesorios: true,
    prestamos_tec: true,
    adelantos: true,
    caja_chica: true,
  })
  const [showActa, setShowActa] = useState(false)
  const [actaBien, setActaBien] = useState<ActaBien | null>(null)
  const [showVerObs, setShowVerObs] = useState(false)
  const [verObsId, setVerObsId] = useState('')
  const [showReporte, setShowReporte] = useState(false)

  // Obs 4 — data real del colaborador desde Supabase
  const [bienesColab, setBienesColab] = useState<typeof BIENES_DEVOLUCION>([])
  const [accsColab, setAccsColab] = useState<typeof ACCESORIOS_DEVOLUCION>([])
  const [prestamosColab, setPrestamosColab] = useState<Array<{id:string;bien:string;fecha_devolucion:string;estado:string}>>([])
  const [adelantosColab, setAdelantosColab] = useState<Array<{id:string;numero:string;tipo:string;monto:number;estado:string}>>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setDataLoading(true)
      try {
        // Bienes asignados al colaborador
        const { data: bienesDB } = await supabase.from('solicitudes_asignacion')
          .select('id,bien_nombre,tipo')
          .eq('colaborador_dni', devolucion.colaborador_dni)
          .eq('estado', 'Aprobado')
        if (bienesDB && bienesDB.length > 0) {
          setBienesColab(bienesDB.map((b, i) => ({
            id: String(i+1), desc: b.bien_nombre, codigo: `CMP-${String(i+1).padStart(6,'0')}`,
            marca: '—', modelo: '—', serie: '—',
            custodio: ['computo', 'comunicaciones', 'cómputo', 'tecnologia', 'tecnología'].includes((b.tipo??'').toLowerCase())
              ? 'Jesús Luman Marcos Aragon — Jefe de TI'
              : 'Guissela Palacios Alvarez — Jefa de Administración',
            estado: 'bueno', devolucion: 'pendiente',
          })))
        } else {
          setBienesColab(BIENES_DEVOLUCION)
        }
        // Préstamos bienes tecnológicos
        const { data: prestDB } = await supabase.from('prestamos_bienes')
          .select('id,bien_nombre,fecha_devolucion,estado')
          .eq('colaborador_dni', devolucion.colaborador_dni)
          .not('estado', 'eq', 'devuelto_conforme')
        if (prestDB) setPrestamosColab(prestDB.map(p => ({ id:p.id, bien:p.bien_nombre, fecha_devolucion:p.fecha_devolucion??'—', estado:p.estado })))
        // Préstamos y adelantos
        const { data: advDB } = await supabase.from('solicitudes_adelanto')
          .select('id,numero,tipo,monto,estado')
          .eq('colaborador', devolucion.colaborador_nombre)
          .in('estado', ['en_revision','aprobado'])
        if (advDB) setAdelantosColab(advDB)
      } catch { setBienesColab(BIENES_DEVOLUCION); setAccsColab(ACCESORIOS_DEVOLUCION) }
      finally { setDataLoading(false) }
    }
    load()
  }, [devolucion.colaborador_dni, devolucion.colaborador_nombre])

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const openActaDevolucion = (id: string, nombre: string, codigo: string, marca: string, modelo: string, serie: string) => {
    setActaBien({ id, nombre, codigo, marca, modelo, serie })
    setShowActa(true)
  }

  const openVerObsDev = (id: string) => {
    setVerObsId(id)
    setShowVerObs(true)
  }

  const initials = getInitials(devolucion.colaborador_nombre)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        Gestión de Recursos &rsaquo; <span className="bc-link" onClick={onBack}>Devolución de Bienes</span> &rsaquo; DNI {devolucion.colaborador_dni}
      </div>

      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn btn-gray btn-sm" onClick={onBack}>← Regresar</button>
      </div>

      {/* Profile card */}
      <div className="profile-card" style={{ marginBottom: 18 }}>
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{devolucion.colaborador_nombre}</div>
          <div className="profile-meta">{devolucion.area} · DNI {devolucion.colaborador_dni}</div>
          <div className="profile-tags">
            <span className="tag-pill">Fecha cese: {devolucion.fecha_inicio}</span>
            <span className="badge b-red" style={{ fontSize: 11 }}>🔴 {devolucion.bienes_count} bienes pendientes de devolución</span>
          </div>
        </div>
      </div>

      {/* Sección 1: Bienes */}
      <div className="section-block">
        <div className="section-block-hdr" onClick={() => toggleSection('bienes')}>
          <span className="section-block-title">
            <span className="sem sem-y"></span> Bienes a devolver <span className="text-xs text-gray">(custodio: TI / ADMINISTRACIÓN)</span>
          </span>
          <div className="flex-row">
            <span className="badge b-red">3 pendientes</span>
            <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openSections.bienes ? '▴' : '▾'}</span>
          </div>
        </div>
        {openSections.bienes && (
          <div className="section-block-body">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Descripción</th><th>Código QR</th><th>Custodio</th>
                  <th>Estado actual</th><th>Semáforo</th><th>Devolución</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(bienesColab.length > 0 ? bienesColab : BIENES_DEVOLUCION).map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.desc}</td>
                    <td><code>{b.codigo}</code></td>
                    <td>{b.custodio}</td>
                    <td>
                      {b.estado === 'bueno'
                        ? <span className="badge b-green">Bueno</span>
                        : <span className="badge b-yellow">Regular</span>}
                    </td>
                    <td>
                      {b.estado === 'bueno'
                        ? <span className="sem sem-y"></span>
                        : <span className="sem sem-r"></span>}
                    </td>
                    <td style={b.devolucion === 'pendiente' ? { color: '#991B1B', fontWeight: 600 } : { color: '#92400E', fontWeight: 600 }}>
                      {b.devolucion === 'pendiente' ? '☐ Pendiente' : '⚠ Observado'}
                    </td>
                    <td>
                      {b.devolucion === 'observado' ? (
                        <div className="actions-cell">
                          <button className="btn btn-gray btn-xs" onClick={() => openVerObsDev(b.id)}>Ver obs.</button>
                          <button className="btn btn-outline btn-xs" onClick={() => openActaDevolucion(b.id, b.desc, b.codigo, b.marca, b.modelo, b.serie)}>Registrar devolución</button>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-xs" onClick={() => openActaDevolucion(b.id, b.desc, b.codigo, b.marca, b.modelo, b.serie)}>Registrar devolución</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección 2: Accesorios */}
      <div className="section-block">
        <div className="section-block-hdr" onClick={() => toggleSection('accesorios')}>
          <span className="section-block-title">
            <span className="sem sem-g"></span> Accesorios a devolver <span className="text-xs text-gray">(custodio: ADMINISTRACIÓN)</span>
          </span>
          <div className="flex-row">
            <span className="badge b-red">2 pendientes</span>
            <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openSections.accesorios ? '▴' : '▾'}</span>
          </div>
        </div>
        {openSections.accesorios && (
          <div className="section-block-body">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Marca</th><th>Estado</th><th>Semáforo</th><th>Devolución</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(accsColab.length > 0 ? accsColab : ACCESORIOS_DEVOLUCION).map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.nombre}</td>
                    <td>{a.marca}</td>
                    <td><span className="badge b-green">Bueno</span></td>
                    <td><span className="sem sem-y"></span></td>
                    <td style={{ color: '#991B1B', fontWeight: 600 }}>☐ Pendiente</td>
                    <td>
                      <button className="btn btn-primary btn-xs" onClick={() => openActaDevolucion(a.id, a.nombre, a.codigo, a.marca, a.modelo, a.serie)}>Registrar devolución</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección 3: Préstamos Bienes Tecnológicos */}
      <div className="section-block">
        <div className="section-block-hdr" onClick={() => toggleSection('prestamos_tec')}>
          <span className="section-block-title">
            <span className="sem sem-g"></span> Préstamos Bienes Tecnológicos <span className="text-xs text-gray">(custodio: TI)</span>
          </span>
          <div className="flex-row">
            <span className="badge b-gray">Sin registros activos</span>
            <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openSections.prestamos_tec ? '▴' : '▾'}</span>
          </div>
        </div>
        {openSections.prestamos_tec && (
          <div className="section-block-body">
            {dataLoading ? (
              <div className="text-xs text-gray" style={{ padding:'12px 0', fontStyle:'italic' }}>Cargando...</div>
            ) : prestamosColab.length > 0 ? (
              <table>
                <thead><tr><th>ID</th><th>Bien</th><th>Fecha dev. pactada</th><th>Estado</th></tr></thead>
                <tbody>
                  {prestamosColab.map(p => (
                    <tr key={p.id}>
                      <td className="fw-600">{p.id.slice(-6)}</td>
                      <td>{p.bien}</td>
                      <td>{p.fecha_devolucion}</td>
                      <td><span className={`badge ${p.estado==='en_prestamo'?'b-blue':'b-yellow'}`}>{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state-sm">
                <div style={{ fontSize: 24, marginBottom: 6 }}>📦</div>
                <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>Sin préstamos de bienes tecnológicos activos</div>
                <div className="text-xs text-gray">No se registran préstamos de equipos pendientes de devolución para este colaborador.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección 4: Préstamos y Adelantos */}
      <div className="section-block">
        <div className="section-block-hdr" onClick={() => toggleSection('adelantos')}>
          <span className="section-block-title">
            <span className="sem sem-g"></span> Préstamos y Adelantos de Sueldo <span className="text-xs text-gray">(GDTH)</span>
          </span>
          <div className="flex-row">
            <span className="badge b-gray">Sin registros</span>
            <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openSections.adelantos ? '▴' : '▾'}</span>
          </div>
        </div>
        {openSections.adelantos && (
          <div className="section-block-body">
            {dataLoading ? (
              <div className="text-xs text-gray" style={{ padding:'12px 0', fontStyle:'italic' }}>Cargando...</div>
            ) : adelantosColab.length > 0 ? (
              <table>
                <thead><tr><th>N°</th><th>Tipo</th><th>Monto S/.</th><th>Estado</th></tr></thead>
                <tbody>
                  {adelantosColab.map(a => (
                    <tr key={a.id}>
                      <td className="fw-600">{a.numero}</td>
                      <td>{a.tipo==='adelanto'?'Adelanto de sueldo':'Préstamo personal'}</td>
                      <td>S/. {Number(a.monto).toLocaleString('es-PE')}</td>
                      <td><span className={`badge ${a.estado==='aprobado'?'b-green':'b-yellow'}`}>{a.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state-sm">
                <div style={{ fontSize: 24, marginBottom: 6 }}>💰</div>
                <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>Sin préstamos ni adelantos pendientes</div>
                <div className="text-xs text-gray">No se registran préstamos o adelantos de sueldo con saldo pendiente para este colaborador.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección 5: Caja Chica */}
      <div className="section-block">
        <div className="section-block-hdr" onClick={() => toggleSection('caja_chica')}>
          <span className="section-block-title">
            <span className="sem sem-g"></span> Caja Chica <span className="text-xs text-gray">(Contabilidad)</span>
          </span>
          <div className="flex-row">
            <span className="badge b-gray">No designado</span>
            <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>{openSections.caja_chica ? '▴' : '▾'}</span>
          </div>
        </div>
        {openSections.caja_chica && (
          <div className="section-block-body">
            <div className="empty-state-sm">
              <div style={{ fontSize: 24, marginBottom: 6 }}>🏧</div>
              <div className="text-sm fw-600" style={{ color: '#374151', marginBottom: 4 }}>No designado como responsable de Caja Chica</div>
              <div className="text-xs text-gray">El colaborador no figura entre los 6 responsables de caja chica. No aplica proceso de liquidación.</div>
            </div>
          </div>
        )}
      </div>

      {/* Panel footer */}
      <div className="panel-footer">
        <div className="flex-between mb-8">
          <span className="text-sm fw-600">Estado global: 0 de 5 ítems devueltos</span>
          <span className="text-xs text-gray">0%</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{ width: '0%' }}></div></div>
        <div className="flex-row mt-12" style={{ flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-gray btn-sm" onClick={onBack}>← Regresar</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowReporte(true)}>📊 Generar Reporte</button>
          <button className="btn btn-outline btn-sm">📄 Emitir acta parcial</button>
          <button className="btn btn-disabled btn-sm" title="Completa todas las devoluciones primero">✔ Emitir conformidad final</button>
          <span className="badge b-api" style={{ marginLeft: 'auto' }}>⚡ API — Datos desde Activos y Bienes</span>
        </div>
      </div>

      <div className="text-xs text-gray mt-8" style={{ fontStyle: 'italic' }}>📌 Nota de diseño: Datos consumidos vía API REST desde Activos y Bienes (.NET 9) — GET /api/bienes/{'{dni}'}</div>

      {/* Modals */}
      {showActa && actaBien && (
        <ModalActaDevolucion
          bien={actaBien}
          colaborador={{
            nombre: devolucion.colaborador_nombre,
            dni: devolucion.colaborador_dni,
            area: devolucion.area,
            cargo: COLABORADORES[devolucion.colaborador_dni]?.cargo ?? '—',
            sede: COLABORADORES[devolucion.colaborador_dni]?.sede ?? '—',
          }}
          onClose={() => setShowActa(false)}
          onFirmar={() => setShowActa(false)}
        />
      )}
      {showVerObs && (
        <ModalVerObs
          bienId={verObsId}
          onClose={() => setShowVerObs(false)}
        />
      )}
      {showReporte && (
        <ModalReporteDevolucion onClose={() => setShowReporte(false)} />
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function DevolucionBienes() {
  const [data, setData] = useState<Devolucion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'activos' | 'historial'>('activos')
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selected, setSelected] = useState<Devolucion | null>(null)
  const [showModalSalida, setShowModalSalida] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('devoluciones')
          .select('id,colaborador_dni,colaborador_nombre,area,tipo_salida,fecha_inicio,estado,bienes_count,created_at')
          .order('created_at', { ascending: false })
        if (data && data.length > 0) setData(data as Devolucion[])
        else setData([])
      } catch { setData([]) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleVerProceso = (d: Devolucion) => {
    setSelected(d)
    setView('detail')
  }

  const handleBack = () => {
    setView('list')
    setSelected(null)
  }

  const handleRegistrar = (nueva: Devolucion) => {
    setData(prev => [nueva, ...prev])
    setShowModalSalida(false)
  }

  const filtered = data.filter(d => {
    if (activeTab === 'activos') return ['en_proceso', 'observado', 'bloqueado'].includes(d.estado)
    return d.estado === 'completado'
  })

  // ── Detail view ──
  if (view === 'detail' && selected) {
    return <DetailView devolucion={selected} onBack={handleBack} />
  }

  // ── List view ──
  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">Gestión de Recursos &rsaquo; <span>Devolución de Bienes</span></div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Devolución de Bienes por Salida de Personal</div>
          <div className="page-subtitle">Seguimiento de devoluciones por cese o renuncia</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModalSalida(true)}>+ Registrar Salida de Personal</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab${activeTab === 'activos' ? ' active' : ''}`}
          onClick={() => setActiveTab('activos')}
        >
          Procesos Activos
        </div>
        <div
          className={`tab${activeTab === 'historial' ? ' active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial de Devoluciones
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '4px solid #6B21A8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Colaborador</th>
                  <th>Área</th>
                  <th>Fecha cese</th>
                  <th>Bienes pendientes</th>
                  <th>Estado proceso</th>
                  <th>Semáforo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No hay registros</td></tr>
                )}
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td><span className="link" onClick={() => handleVerProceso(d)}>{d.colaborador_dni}</span></td>
                    <td className="fw-600">{d.colaborador_nombre}</td>
                    <td>{d.area}</td>
                    <td>{d.fecha_inicio}</td>
                    <td>{d.bienes_count} bienes</td>
                    <td>{estadoBadge(d.estado)}</td>
                    <td>{semaforoDot(d.estado)}</td>
                    <td>
                      <button className="btn btn-outline btn-xs" onClick={() => handleVerProceso(d)}>Ver proceso</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <span className="text-xs text-gray">🟢 Completado &nbsp;&nbsp; 🟡 Observado &nbsp;&nbsp; 🔴 Pendiente / Bloqueado</span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray mt-8" style={{ fontStyle: 'italic' }}>📌 Nota de diseño: Rol activo determina tabs visibles — usuario ve sus solicitudes, GDTH/Admin ven bandeja completa.</div>

      {/* Modal Registrar Salida */}
      {showModalSalida && (
        <ModalRegistrarSalida
          onClose={() => setShowModalSalida(false)}
          onRegistrar={handleRegistrar}
        />
      )}
    </div>
  )
}
