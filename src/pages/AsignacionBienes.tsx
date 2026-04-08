import { useState, useEffect } from 'react'
import { solicitudesAsignacionService } from '../services/db'
import type { SolicitudAsignacion, EstadoSolicitud, TipoBien } from '../types'

const MOCK_DATA: SolicitudAsignacion[] = [
  { id: '1', numero: 'SOL-2026-001', bien_nombre: 'Laptop', tipo: 'computo', fecha_solicitud: '10/03/2026', estado: 'en_revision', created_at: '' },
  { id: '2', numero: 'SOL-2026-002', bien_nombre: 'Silla ergonómica', tipo: 'mobiliario', fecha_solicitud: '08/03/2026', estado: 'aprobado', created_at: '' },
  { id: '3', numero: 'SOL-2026-003', bien_nombre: 'Teléfono IP', tipo: 'comunicaciones', fecha_solicitud: '05/03/2026', estado: 'observado', created_at: '' },
  { id: '4', numero: 'SOL-2026-004', bien_nombre: 'Monitor 24"', tipo: 'computo', fecha_solicitud: '01/03/2026', estado: 'entregado_pendiente', created_at: '' },
]

const COLABS: Record<string, { nombre: string; apellido: string; puesto: string; subarea: string; consejo: string; initials: string }> = {
  '77434028': { nombre: 'Aaron Samuel', apellido: 'Nuñez Muñoz', puesto: 'Analista de Sistemas', subarea: 'Tecnología de Información', consejo: 'Consejo Nacional', initials: 'AN' },
  '45231089': { nombre: 'Carlos', apellido: 'Pérez Ramos', puesto: 'Analista Contable', subarea: 'UN. DE GDTH', consejo: 'Consejo Nacional', initials: 'CP' },
  '32187654': { nombre: 'Ana María', apellido: 'Flores Vega', puesto: 'Asistente Administrativa', subarea: 'SEC. ADMINISTRACIÓN', consejo: 'Consejo Nacional', initials: 'FA' },
}


const DISPONIBILIDAD_BIENES = [
  { id: '111025', qr: 'CMP-038395', icono: '💻', nombre: 'Laptop', marca: 'HP EliteBook 840', condicion: 'Nuevo', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'HP-00-2025-111025' },
  { id: '111026', qr: 'CMP-038396', icono: '🖥️', nombre: 'Monitor', marca: 'Samsung 27" S27A', condicion: 'En Uso', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'SAM-00-2024-111026' },
  { id: '111027', qr: 'CMP-038397', icono: '🖨️', nombre: 'Impresora', marca: 'Epson L3150', condicion: 'En Uso', disponibilidad: 'revision' as const, area: 'UN. DE TI', serie: 'EPS-00-2023-111027' },
  { id: '111028', qr: 'CMP-038398', icono: '📽️', nombre: 'Proyector', marca: 'Epson EB-X51', condicion: 'En Uso', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'EPS-00-2024-111028' },
  { id: '111029', qr: 'CMP-038399', icono: '📱', nombre: 'Tablet', marca: 'Samsung Tab S7', condicion: 'Nuevo', disponibilidad: 'disponible' as const, area: 'UN. DE TI', serie: 'SAM-00-2025-111029' },
]

const DISPONIBILIDAD_ACCESORIOS = [
  { id: '20261114', nombre: 'Teclado Inalámbrico', marca: 'Logitech', subarea: 'UN. DE TI', estado: 'bueno' as const, disponibilidad: 'disponible' as const },
  { id: '20261115', nombre: 'Mouse Inalámbrico', marca: 'Logitech', subarea: 'UN. DE TI', estado: 'bueno' as const, disponibilidad: 'disponible' as const },
  { id: '20261116', nombre: 'Hub USB 4 puertos', marca: 'Anker', subarea: 'ADMINISTRACION', estado: 'bueno' as const, disponibilidad: 'disponible' as const },
  { id: '20261117', nombre: 'Webcam HD', marca: 'Logitech', subarea: 'COMUNICACIONES', estado: 'bueno' as const, disponibilidad: 'asignado' as const },
  { id: '20261118', nombre: 'Auriculares', marca: 'Sony', subarea: 'UN. DE GDTH', estado: 'regular' as const, disponibilidad: 'revision' as const },
]

function estadoBadge(estado: EstadoSolicitud) {
  const map: Record<EstadoSolicitud, { cls: string; label: string }> = {
    en_revision: { cls: 'b-yellow', label: 'En revisión' },
    aprobado: { cls: 'b-green', label: 'Aprobado' },
    observado: { cls: 'b-yellow', label: 'Observado' },
    rechazado: { cls: 'b-red', label: 'Rechazado' },
    entregado_pendiente: { cls: 'b-red', label: 'Pendiente conformidad' },
    completado: { cls: 'b-green', label: 'Completado' },
  }
  const cfg = map[estado] ?? { cls: 'b-gray', label: estado }
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}

function stepperForEstado(estado: EstadoSolicitud) {
  const steps = ['Solicitud', 'Revisión', 'Aprobación', 'Entrega']
  const idx = ({ en_revision: 1, observado: 1, aprobado: 2, rechazado: 2, entregado_pendiente: 3, completado: 4 } as Record<string, number>)[estado] ?? 0
  return steps.map((label, i) => ({
    label,
    status: i < idx ? 'done' : i === idx ? 'cur' : 'pend',
  }))
}

const labelTipo: Record<TipoBien, string> = {
  computo: 'Cómputo', mobiliario: 'Mobiliario', comunicaciones: 'Comunicaciones', vehiculo: 'Vehículo', otro: 'Otro',
}

/* ── Simple toast ── */
function useSimpleToast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const show = (m: string) => { setMsg(m); setVisible(true); setTimeout(() => setVisible(false), 3000) }
  return { msg, visible, show }
}

export function AsignacionBienes() {
  const [data, setData] = useState<SolicitudAsignacion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tab-mis')
  const [showNueva, setShowNueva] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [showConformidad, setShowConformidad] = useState(false)
  const [showDisponibilidad, setShowDisponibilidad] = useState(false)
  const [selected, setSelected] = useState<SolicitudAsignacion | null>(null)
  const toast = useSimpleToast()

  const [form, setForm] = useState({ tipo: '' as TipoBien | '', bien: '', justificacion: '', prioridad: 'normal' })
  const [modalTab, setModalTab] = useState<'bienes' | 'accesorios' | 'disponibles'>('bienes')
  const [dniSearch, setDniSearch] = useState('')
  const [colaboradorEncontrado, setColaboradorEncontrado] = useState<{ nombre: string; apellido: string; puesto: string; subarea: string; consejo: string; initials: string } | null>(null)
  const [dniNotFound, setDniNotFound] = useState(false)
  const [bienNombre, setBienNombre] = useState('')
  const [tipoBien, setTipoBien] = useState('computo')
  const [dispTab, setDispTab] = useState<'bienes' | 'accesorios'>('bienes')
  const [dispBienSeleccionado, setDispBienSeleccionado] = useState<typeof DISPONIBILIDAD_BIENES[0] | null>(null)

  useEffect(() => {
    solicitudesAsignacionService.getAll()
      .then(rows => { if (rows && rows.length > 0) setData(rows as SolicitudAsignacion[]); else setData(MOCK_DATA) })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false))
  }, [])

  const handleBuscarColab = () => {
    const found = COLABS[dniSearch.trim()]
    if (found) {
      setColaboradorEncontrado(found)
      setDniNotFound(false)
    } else {
      setColaboradorEncontrado(null)
      setDniNotFound(true)
    }
  }

  const handleSave = async () => {
    const nueva: SolicitudAsignacion = {
      id: String(Date.now()),
      numero: `SOL-2026-${String(data.length + 1).padStart(3, '0')}`,
      bien_nombre: bienNombre || form.bien || 'Bien sin especificar',
      tipo: (tipoBien || form.tipo || 'otro') as TipoBien,
      fecha_solicitud: new Date().toLocaleDateString('es-PE'),
      estado: 'en_revision',
      created_at: new Date().toISOString(),
    }
    try {
      await solicitudesAsignacionService.create({ ...nueva, justificacion: form.justificacion })
    } catch {
      // ignore, use local
    }
    setData(prev => [nueva, ...prev])
    setShowNueva(false)
    setForm({ tipo: '', bien: '', justificacion: '', prioridad: 'normal' })
    setModalTab('bienes')
    setDniSearch('')
    setColaboradorEncontrado(null)
    setDniNotFound(false)
    setBienNombre('')
    setTipoBien('computo')
    toast.show('Solicitud enviada correctamente.')
  }

  const handleConformidad = () => {
    if (selected) {
      setData(prev => prev.map(x => x.id === selected.id ? { ...x, estado: 'completado' } : x))
    }
    setShowConformidad(false)
    setShowDetalle(false)
    toast.show('Conformidad registrada. Solicitud completada.')
  }

  const tabs = [
    { id: 'tab-mis', label: 'Mis Solicitudes' },
    { id: 'tab-pendientes', label: 'Pendientes de Aprobación' },
    { id: 'tab-historial-a', label: 'Historial' },
  ]

  const filtered = data.filter(s => {
    if (activeTab === 'tab-mis') return ['en_revision', 'observado', 'aprobado', 'entregado_pendiente'].includes(s.estado)
    if (activeTab === 'tab-pendientes') return s.estado === 'aprobado'
    return s.estado === 'completado' || s.estado === 'rechazado'
  })

  const todayStr = new Date().toLocaleDateString('es-PE')

  /* ── Stepper renderer ── */
  const renderStepper = (estado: EstadoSolicitud) => {
    const steps = stepperForEstado(estado)
    const icons: Record<string, string> = { done: '✔', cur: '⏳', pend: '○' }
    return (
      <div className="stepper">
        {steps.map((s, i) => (
          <span key={s.label} style={{ display: 'contents' }}>
            <div className="step">
              <div className={`step-circ ${s.status}`}>{icons[s.status]}</div>
              <span className={`step-lbl ${s.status}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`step-conn${s.status === 'done' ? ' done' : ''}`}></div>}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* ── MAIN SCREEN ── */}
      <div className="breadcrumb">Gestión de Recursos › <span>Asignación de Bienes</span></div>
      <div className="page-header">
        <div>
          <div className="page-title">Asignación de Bienes</div>
          <div className="page-subtitle">Solicitud y seguimiento de bienes para colaboradores</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowDisponibilidad(true)}>🔍 Consultar disponibilidad</button>
          <button className="btn btn-primary" onClick={() => setShowNueva(true)}>+ Nueva Solicitud</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <div
            key={t.id}
            className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
          Cargando...
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>N° Solicitud</th>
                  <th>Bien solicitado</th>
                  <th>Tipo</th>
                  <th>Fecha solicitud</th>
                  <th>Fecha de entrega</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No hay registros</td></tr>
                )}
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="fw-600">{s.numero}</td>
                    <td>{s.bien_nombre}</td>
                    <td><span className="badge b-gray">{labelTipo[s.tipo]}</span></td>
                    <td>{s.fecha_solicitud}</td>
                    <td className="text-gray">{['aprobado', 'entregado_pendiente', 'completado'].includes(s.estado) ? '—' : '—'}</td>
                    <td>{estadoBadge(s.estado)}</td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-gray btn-xs"
                          onClick={() => { setSelected(s); setShowDetalle(true) }}
                        >
                          Ver detalle
                        </button>
                        {s.estado === 'observado' && (
                          <button className="btn btn-outline btn-xs" onClick={() => toast.show('Acción de subsanación registrada.')}>
                            Subsanar
                          </button>
                        )}
                        {s.estado === 'entregado_pendiente' && (
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => { setSelected(s); setShowConformidad(true) }}
                          >
                            Firmar conformidad
                          </button>
                        )}
                      </div>
                    </td>
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
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — Nueva Solicitud de Asignación de Bien
          ══════════════════════════════════════════════════ */}
      {showNueva && (
        <div className="modal-overlay" onClick={() => setShowNueva(false)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span>Nueva Solicitud de Asignación de Bien</span>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Rol: Administración — Asignación a colaborador</div>
              </div>
              <button className="modal-close" onClick={() => setShowNueva(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* BUSCAR COLABORADOR */}
              <div className="section-title-sm">BUSCAR COLABORADOR</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">DNI del colaborador <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingresa el DNI"
                    maxLength={8}
                    value={dniSearch}
                    onChange={e => setDniSearch(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    onKeyDown={e => { if (e.key === 'Enter') handleBuscarColab() }}
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleBuscarColab}>🔍 Buscar</button>
                <button className="btn btn-gray btn-sm" onClick={() => { setDniSearch(''); setColaboradorEncontrado(null); setDniNotFound(false) }}>Limpiar</button>
              </div>
              <div className="text-xs text-gray" style={{ marginTop: 6, marginBottom: 10 }}>
                DNIs de prueba: <strong>45231089</strong> · <strong>77434028</strong> · <strong>32187654</strong>
              </div>

              {dniNotFound && (
                <div style={{ marginBottom: 10, fontSize: 12, color: '#EF4444', fontWeight: 600 }}>DNI no encontrado</div>
              )}

              {colaboradorEncontrado && (
                <div className="colab-found" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div className="profile-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                      {colaboradorEncontrado.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>{colaboradorEncontrado.nombre} {colaboradorEncontrado.apellido}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{colaboradorEncontrado.puesto} · {colaboradorEncontrado.subarea}</div>
                    </div>
                    <span className="badge b-green">✓ Encontrado</span>
                  </div>
                  <div className="colab-grid">
                    <div className="colab-field"><div className="lbl">Nombre(s)</div><div className="val">{colaboradorEncontrado.nombre}</div></div>
                    <div className="colab-field"><div className="lbl">Apellido(s)</div><div className="val">{colaboradorEncontrado.apellido}</div></div>
                    <div className="colab-field"><div className="lbl">Puesto</div><div className="val">{colaboradorEncontrado.puesto}</div></div>
                    <div className="colab-field"><div className="lbl">Sub-Área</div><div className="val">{colaboradorEncontrado.subarea}</div></div>
                    <div className="colab-field" style={{ gridColumn: '1/-1' }}><div className="lbl">Consejo Regional</div><div className="val">{colaboradorEncontrado.consejo}</div></div>
                  </div>
                </div>
              )}

              <div className="h-divider"></div>

              {/* MODAL TABS */}
              <div className="modal-tabs">
                <div
                  className={`modal-tab${modalTab === 'bienes' ? ' active' : ''}`}
                  onClick={() => setModalTab('bienes')}
                >📦 Bienes</div>
                <div
                  className={`modal-tab${modalTab === 'accesorios' ? ' active' : ''}`}
                  onClick={() => setModalTab('accesorios')}
                >🔌 Accesorios</div>
                <div
                  className={`modal-tab${modalTab === 'disponibles' ? ' active' : ''}`}
                  onClick={() => setModalTab('disponibles')}
                >📋 Bienes y Accesorios Disponibles</div>
              </div>

              {/* PANE: BIENES */}
              {modalTab === 'bienes' && (
                <div className="modal-tab-pane active">
                  <div className="form-group">
                    <label className="form-label">Tipo de bien <span style={{ color: '#EF4444' }}>*</span></label>
                    <select
                      className="form-select"
                      value={tipoBien}
                      onChange={e => setTipoBien(e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="computo">Cómputo</option>
                      <option value="mobiliario">Mobiliario o Móvil</option>
                      <option value="comunicaciones">Comunicaciones</option>
                    </select>
                    <div className="form-hint">El tipo determina el área responsable del custodio</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bien a asignar <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Laptop HP EliteBook 840"
                      value={bienNombre}
                      onChange={e => setBienNombre(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Justificación / Motivo <span style={{ color: '#EF4444' }}>*</span></label>
                    <textarea
                      className="form-input"
                      placeholder="Explica el motivo de la asignación..."
                      value={form.justificacion}
                      onChange={e => setForm(f => ({ ...f, justificacion: e.target.value }))}
                      style={{ minHeight: 70, resize: 'vertical' }}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Área Funcional <span className="text-xs text-gray">(autocompletado según custodio del bien)</span></label>
                      <input type="text" className="form-input" value="UN. DE TI" readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sede</label>
                      <select className="form-select">
                        <option value="malecon">Sede Malecón de la Reserva</option>
                        <option value="28julio">Sede 28 de Julio</option>
                        <option value="miraflores">Sede Miraflores</option>
                      </select>
                      <div className="form-hint">La sede corresponde a la ubicación del bien</div>
                    </div>
                  </div>
                  {tipoBien === 'computo' && (
                    <div className="banner banner-blue" style={{ marginBottom: 10 }}>
                      💻 Esta solicitud será revisada por SEC. DE ADMINISTRACION y derivada a UN. DE TI para verificar disponibilidad en inventario.
                    </div>
                  )}
                  <div className="h-divider"></div>
                  <div className="section-title-sm">FLUJO DE APROBACIÓN Y FIRMAS</div>
                  <div className="banner banner-purple" style={{ marginBottom: 12, fontSize: 12 }}>
                    📋 Al enviar la solicitud se activará el flujo. Cada etapa requiere firma digital del responsable.
                  </div>
                  <div className="stepper" style={{ margin: '10px 0 6px' }}>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>1</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Admin<br />registra</span>
                    </div>
                    <div className="step-conn"></div>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>2</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Área<br />valida</span>
                    </div>
                    <div className="step-conn"></div>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>3</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Admin<br />entrega</span>
                    </div>
                    <div className="step-conn"></div>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>4</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Colaborador<br />firma</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray" style={{ marginTop: 8, fontStyle: 'italic' }}>
                    Selecciona el tipo de bien para ver el área responsable de validación.
                  </div>
                </div>
              )}

              {/* PANE: ACCESORIOS */}
              {modalTab === 'accesorios' && (
                <div className="modal-tab-pane active">
                  <div className="form-group">
                    <label className="form-label">Tipo de accesorio <span style={{ color: '#EF4444' }}>*</span></label>
                    <select className="form-select">
                      <option value="">Seleccionar...</option>
                      <option>Periférico de entrada</option>
                      <option>Periférico de salida</option>
                      <option>Conectividad</option>
                      <option>Audio / Video</option>
                      <option>Almacenamiento</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Accesorio a asignar <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" className="form-input" placeholder="Ej: Teclado inalámbrico Logitech" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Justificación / Motivo <span style={{ color: '#EF4444' }}>*</span></label>
                    <textarea className="form-input" placeholder="Explica el motivo de la asignación..." style={{ minHeight: 70, resize: 'vertical' }} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Sub-Área</label>
                      <input type="text" className="form-input" value="UN. DE TI" readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sede</label>
                      <input type="text" className="form-input" value="Sede Malecón de la Reserva" readOnly />
                    </div>
                  </div>
                  <div className="h-divider"></div>
                  <div className="section-title-sm">FLUJO DE APROBACIÓN Y FIRMAS</div>
                  <div className="banner banner-purple" style={{ marginBottom: 12, fontSize: 12 }}>
                    📋 Al enviar la solicitud se activará el flujo. Cada etapa requiere firma digital del responsable.
                  </div>
                  <div className="stepper" style={{ margin: '10px 0 6px' }}>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>1</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Admin<br />registra</span>
                    </div>
                    <div className="step-conn"></div>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>2</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Área<br />valida</span>
                    </div>
                    <div className="step-conn"></div>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>3</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Admin<br />entrega</span>
                    </div>
                    <div className="step-conn"></div>
                    <div className="step">
                      <div className="step-circ pend" style={{ fontSize: 10, width: 24, height: 24 }}>4</div>
                      <span className="step-lbl pend" style={{ fontSize: 10, textAlign: 'center', maxWidth: 55 }}>Colaborador<br />firma</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray" style={{ marginTop: 8, fontStyle: 'italic' }}>Registro → Validación → Entrega → Conformidad</div>
                </div>
              )}

              {/* PANE: BIENES Y ACCESORIOS DISPONIBLES */}
              {modalTab === 'disponibles' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-teal" style={{ marginBottom: 12 }}>⚡ Información sincronizada con el inventario del <strong>Portal CMP</strong> — stock en tiempo real.</div>
                  <div className="sub-tabs">
                    <div className={`sub-tab${dispTab === 'bienes' ? ' active' : ''}`} onClick={() => setDispTab('bienes')}>📦 Bienes</div>
                    <div className={`sub-tab${dispTab === 'accesorios' ? ' active' : ''}`} onClick={() => setDispTab('accesorios')}>🔌 Accesorios</div>
                  </div>

                  {dispTab === 'bienes' && (
                    <div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                        Haz clic en un bien para seleccionarlo para la solicitud.
                      </div>
                      <div>
                        {DISPONIBILIDAD_BIENES.map(b => (
                          <div
                            key={b.id}
                            className="bien-card"
                            onClick={() => { setBienNombre(`${b.nombre} ${b.marca}`); setModalTab('bienes'); toast.show(`✓ Bien seleccionado: ${b.nombre}`) }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="bien-card-icon">{b.icono}</div>
                            <div className="bien-card-info">
                              <div className="bien-card-title">{b.nombre} — {b.marca}</div>
                              <div className="bien-card-sub">ID: {b.id} · QR: {b.qr} · Condición: {b.condicion}</div>
                            </div>
                            <span className={`badge ${b.disponibilidad === 'disponible' ? 'b-green' : 'b-yellow'}`}>
                              {b.disponibilidad === 'disponible' ? 'Disponible' : 'En revisión'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dispTab === 'accesorios' && (
                    <div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>Accesorios disponibles registrados en sistema</div>
                      <div className="table-wrap">
                        <table>
                          <thead className="thead-orange">
                            <tr>
                              <th>ID</th><th>Nombre</th><th>Marca</th><th>Sub Área</th><th>Estado</th><th>Disponibilidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {DISPONIBILIDAD_ACCESORIOS.map(a => (
                              <tr key={a.id}>
                                <td>{a.id}</td>
                                <td>{a.nombre}</td>
                                <td>{a.marca}</td>
                                <td>{a.subarea}</td>
                                <td><span className={`badge ${a.estado === 'bueno' ? 'b-green' : 'b-yellow'}`}>{a.estado === 'bueno' ? 'Bueno' : 'Regular'}</span></td>
                                <td>
                                  <span className={`badge ${a.disponibilidad === 'disponible' ? 'b-green' : a.disponibilidad === 'asignado' ? 'b-blue' : 'b-yellow'}`}>
                                    {a.disponibilidad === 'disponible' ? 'Disponible' : a.disponibilidad === 'asignado' ? 'Asignado' : 'En revisión'}
                                  </span>
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

            </div>
            <div className="modal-footer">
              <span className="modal-note">Los campos marcados con <span style={{ color: '#EF4444' }}>*</span> son obligatorios</span>
              <button className="btn btn-gray" onClick={() => setShowNueva(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Enviar Solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — Detalle Solicitud
          ══════════════════════════════════════════════════ */}
      {showDetalle && selected && (
        <div className="modal-overlay" onClick={() => setShowDetalle(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Detalle Solicitud — {selected.numero}</div>
                <div className="modal-subtitle">Bien: {selected.bien_nombre}</div>
              </div>
              <button className="modal-close" onClick={() => setShowDetalle(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Estado bar */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#6B7280', marginRight: 8 }}>Estado actual:</span>
                {estadoBadge(selected.estado)}
              </div>

              {/* Stepper */}
              {renderStepper(selected.estado)}

              <div className="section-title-sm" style={{ marginTop: 16 }}>DATOS DE LA SOLICITUD</div>
              <div className="inv-grid" style={{ marginBottom: 6 }}>
                {[
                  { label: 'N° Solicitud', value: selected.numero },
                  { label: 'Bien', value: selected.bien_nombre },
                  { label: 'Tipo', value: labelTipo[selected.tipo] },
                  { label: 'Fecha solicitud', value: selected.fecha_solicitud },
                  { label: 'Prioridad', value: 'Normal' },
                  { label: 'Área solicitante', value: 'UN. DE TI' },
                  { label: 'Observación', value: (selected as SolicitudAsignacion & { observacion?: string }).observacion ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="inv-field">
                    <div className="lbl">{label}</div>
                    <div className="val">{value}</div>
                  </div>
                ))}
              </div>

              <div className="section-title-sm" style={{ marginTop: 18 }}>FLUJO DE APROBACIÓN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                {(() => {
                  const e = selected.estado
                  const steps: { paso: number; rol: string; descripcion: string; nombre: string; fecha: string | null; status: 'done' | 'current' | 'pending' }[] = [
                    { paso: 1, rol: 'Solicitud registrada', descripcion: 'Administración registra la solicitud de asignación', nombre: 'SEC. ADMINISTRACIÓN', fecha: selected.fecha_solicitud, status: 'done' },
                    { paso: 2, rol: 'Área custodio entrega bien', descripcion: 'El área que custodia el bien lo entrega a Administración', nombre: 'UN. DE TI', fecha: ['aprobado', 'entregado_pendiente', 'completado'].includes(e) ? '11/03/2026' : null, status: ['aprobado', 'entregado_pendiente', 'completado'].includes(e) ? 'done' : e === 'observado' ? 'current' : 'pending' },
                    { paso: 3, rol: 'Administración entrega bien al colaborador', descripcion: 'Administración hace entrega física del bien al colaborador', nombre: 'SEC. ADMINISTRACIÓN', fecha: ['entregado_pendiente', 'completado'].includes(e) ? '13/03/2026' : null, status: ['entregado_pendiente', 'completado'].includes(e) ? 'done' : ['aprobado'].includes(e) ? 'current' : 'pending' },
                    { paso: 4, rol: 'Colaborador firma conformidad', descripcion: 'El colaborador firma el acta de recepción y conformidad', nombre: 'Colaborador receptor', fecha: e === 'completado' ? '15/03/2026' : null, status: e === 'completado' ? 'done' : e === 'entregado_pendiente' ? 'current' : 'pending' },
                  ]
                  return steps.map(step => (
                    <div
                      key={step.paso}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', background: 'white', border: `1px solid ${step.status === 'done' ? '#BBF7D0' : step.status === 'current' ? '#6B21A8' : '#E5E7EB'}`,
                        borderRadius: 7,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B21A8' }}>Paso {step.paso} — {step.rol}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{step.descripcion}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{step.nombre}{step.fecha ? ` · ${step.fecha}` : ''}</div>
                      </div>
                      <div>
                        {step.status === 'done'
                          ? <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>✓ Firmado</span>
                          : step.status === 'current'
                            ? <span style={{ fontSize: 11, fontWeight: 600, color: '#D97706' }}>⏳ Pendiente</span>
                            : <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>○ En espera</span>}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray btn-sm" onClick={() => setShowDetalle(false)}>Cerrar</button>
              {selected.estado === 'entregado_pendiente' && (
                <button className="btn btn-primary btn-sm" onClick={() => { setShowDetalle(false); setShowConformidad(true) }}>
                  ✔ Firmar conformidad
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — Conformidad de Entrega
          ══════════════════════════════════════════════════ */}
      {showConformidad && selected && (
        <div className="modal-overlay" onClick={() => setShowConformidad(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span>Acta de Conformidad de Entrega — {selected.numero}</span>
              <button className="modal-close" onClick={() => setShowConformidad(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="summary-block">
                <div className="summary-row"><span className="summary-lbl">Bien</span><span className="summary-val">{selected.bien_nombre}</span></div>
                <div className="summary-row"><span className="summary-lbl">Código QR</span><span className="summary-val"><code>CMP-038401</code></span></div>
                <div className="summary-row"><span className="summary-lbl">Estado</span><span className="summary-val"><span className="badge b-green">Bueno</span></span></div>
                <div className="summary-row"><span className="summary-lbl">Área</span><span className="summary-val">UN. DE TI</span></div>
                <div className="summary-row"><span className="summary-lbl">Fecha entrega</span><span className="summary-val">{todayStr}</span></div>
                <div className="summary-row"><span className="summary-lbl">Entregado por</span><span className="summary-val">Administración</span></div>
              </div>
              <div className="acta-text">
                "Yo, Aaron Samuel Nuñez Muñoz, identificado con DNI 77434028, declaro haber recibido el bien descrito en conformidad, en las condiciones indicadas, comprometiéndome a su uso responsable y devolución en caso corresponda."
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input type="text" className="form-input" value="Aaron Samuel Nuñez Muñoz" readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">DNI</label>
                  <input type="text" className="form-input" value="77434028" readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input type="text" className="form-input" value="Analista de Sistemas" readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de firma</label>
                  <input type="text" className="form-input" value={todayStr} readOnly />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <span className="modal-note">Esta acción registra tu conformidad. Podrás descargar el PDF desde Historial.</span>
              <button className="btn btn-gray" onClick={() => setShowConformidad(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConformidad}>✔ Confirmar y Firmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — Consultar Disponibilidad
          ══════════════════════════════════════════════════ */}
      {showDisponibilidad && (
        <div className="modal-overlay" onClick={() => { setShowDisponibilidad(false); setDispBienSeleccionado(null); setDispTab('bienes') }}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#0DA882' }}>▦</span> Disponibilidad de Bienes y Accesorios
                  <span className="badge b-green" style={{ fontSize: 10 }}>⚡ API Intranet</span>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Stock en tiempo real — Portal CMP</div>
              </div>
              <button className="modal-close" onClick={() => { setShowDisponibilidad(false); setDispBienSeleccionado(null); setDispTab('bienes') }}>✕</button>
            </div>
            <div style={{ padding: '0 20px', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex' }}>
                <div
                  className={`modal-tab${dispTab === 'bienes' ? ' active' : ''}`}
                  style={{ padding: '10px 18px', fontSize: 13, cursor: 'pointer' }}
                  onClick={() => { setDispTab('bienes'); setDispBienSeleccionado(null) }}
                >📦 Bienes</div>
                <div
                  className={`modal-tab${dispTab === 'accesorios' ? ' active' : ''}`}
                  style={{ padding: '10px 18px', fontSize: 13, cursor: 'pointer' }}
                  onClick={() => setDispTab('accesorios')}
                >🔌 Accesorios</div>
              </div>
            </div>
            <div className="modal-body">
              {/* Tab Bienes */}
              {dispTab === 'bienes' && !dispBienSeleccionado && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Bienes disponibles registrados en almacén</span>
                    <span className="badge b-green">4 disponibles</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-teal">
                        <tr>
                          <th>ID</th><th>Código QR</th><th>Descripción</th><th>Marca</th><th>Condición</th><th>Disponibilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DISPONIBILIDAD_BIENES.map(b => (
                          <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setDispBienSeleccionado(b)}>
                            <td>{b.id}</td>
                            <td>{b.qr}</td>
                            <td>{b.nombre}</td>
                            <td>{b.marca}</td>
                            <td>{b.condicion}</td>
                            <td>
                              <span className={`badge ${b.disponibilidad === 'disponible' ? 'b-green' : 'b-yellow'}`}>
                                {b.disponibilidad === 'disponible' ? 'Disponible' : 'En revisión'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detalle bien seleccionado */}
              {dispTab === 'bienes' && dispBienSeleccionado && (
                <div className="bien-detail-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>{dispBienSeleccionado.nombre} — {dispBienSeleccionado.marca}</div>
                    <button className="btn btn-gray btn-xs" onClick={() => setDispBienSeleccionado(null)}>× Cerrar ficha</button>
                  </div>
                  <div className="foto-grid">
                    <div className="foto-placeholder"><span>{dispBienSeleccionado.icono}</span><small>Vista frontal</small></div>
                    <div className="foto-placeholder"><span>{dispBienSeleccionado.icono}</span><small>Vista lateral / detalle</small></div>
                  </div>
                  <div className="inv-grid">
                    {[
                      { label: 'ID Inventario', value: dispBienSeleccionado.id },
                      { label: 'Código QR', value: dispBienSeleccionado.qr },
                      { label: 'Condición', value: dispBienSeleccionado.condicion },
                      { label: 'Área custodio', value: dispBienSeleccionado.area },
                      { label: 'N° Serie', value: dispBienSeleccionado.serie },
                      { label: 'Disponibilidad', value: dispBienSeleccionado.disponibilidad === 'disponible' ? 'Disponible' : 'En revisión' },
                    ].map(f => (
                      <div key={f.label} className="inv-field">
                        <div className="lbl">{f.label}</div>
                        <div className="val">{f.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setBienNombre(`${dispBienSeleccionado.nombre} ${dispBienSeleccionado.marca}`)
                        setShowDisponibilidad(false)
                        setDispBienSeleccionado(null)
                        setShowNueva(true)
                        toast.show(`✓ Bien seleccionado: ${dispBienSeleccionado.nombre}`)
                      }}
                    >
                      ✔ Seleccionar para solicitud
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Accesorios */}
              {dispTab === 'accesorios' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Accesorios disponibles registrados en sistema</span>
                    <span className="badge b-green">3 disponibles</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-orange">
                        <tr>
                          <th>ID</th><th>Nombre</th><th>Marca</th><th>Sub Área</th><th>Estado</th><th>DNI Asignado</th><th>Disponibilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DISPONIBILIDAD_ACCESORIOS.map(a => (
                          <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{a.nombre}</td>
                            <td>{a.marca}</td>
                            <td>{a.subarea}</td>
                            <td><span className={`badge ${a.estado === 'bueno' ? 'b-green' : 'b-yellow'}`}>{a.estado === 'bueno' ? 'Bueno' : 'Regular'}</span></td>
                            <td className="text-gray">{a.disponibilidad === 'asignado' ? '77434030' : '—'}</td>
                            <td>
                              <span className={`badge ${a.disponibilidad === 'disponible' ? 'b-green' : a.disponibilidad === 'asignado' ? 'b-blue' : 'b-yellow'}`}>
                                {a.disponibilidad === 'disponible' ? 'Disponible' : a.disponibilidad === 'asignado' ? 'Asignado' : 'En revisión'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => { setShowDisponibilidad(false); setDispBienSeleccionado(null); setDispTab('bienes') }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Simple toast notification ── */}
      {toast.visible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#1E1B4B', color: 'white',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,.18)', zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
