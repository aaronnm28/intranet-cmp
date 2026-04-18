import { useAuth } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  gdth: 'GDTH',
  custodio: 'Custodio',
  contabilidad: 'Contabilidad',
  colaborador: 'Colaborador',
}

/** Mapeo email CMP → datos reales del colaborador (fallback cuando Supabase no devuelve el colaborador_id) */
const EMAIL_TO_COLAB: Record<string, { nombre: string; puesto: string }> = {
  'aaron.nunez@cmp.org.pe':       { nombre: 'Aaron Samuel Nuñez Muñoz',       puesto: 'Analista de TI' },
  'jesus.luman@cmp.org.pe':       { nombre: 'Jesús Luman Marcos Aragon',       puesto: 'Jefe de TI' },
  'guissela.palacios@cmp.org.pe': { nombre: 'Guissela Palacios Alvarez',       puesto: 'Jefa de Administración' },
  'julieth.carbajal@cmp.org.pe':  { nombre: 'Julieth Z. Carbajal Garro',       puesto: 'Jefa de GDTH' },
  'anibal.chafloque@cmp.org.pe':  { nombre: 'Anali J. Chafloque Cordova',      puesto: 'Asistente Administrativo' },
  'percy.calderon@cmp.org.pe':    { nombre: 'Percy Antonio Calderón Quispe',   puesto: 'Locador de Servicios' },
  'enrique.chozo@cmp.org.pe':     { nombre: 'Enrique Chozo Alvarado',          puesto: 'Analista Contable' },
}

interface Notif {
  id: number
  tipo: 'warning' | 'info' | 'success' | 'error'
  titulo: string
  texto: string
  fecha: string
  leida: boolean
}

const MOCK_NOTIFS: Notif[] = [
  {
    id: 1, tipo: 'warning', leida: false,
    titulo: 'Bienes pendientes de devolución',
    texto: 'Aaron S. Nuñez tiene bienes por devolver: Laptop Dell Latitude, Monitor LG 24".',
    fecha: '17/04/2026',
  },
  {
    id: 2, tipo: 'info', leida: false,
    titulo: 'Firma pendiente — SOL-2026-001',
    texto: 'Jefe UN. DE TI: Se requiere V°B° para validar la entrega del bien solicitado.',
    fecha: '10/04/2026',
  },
  {
    id: 3, tipo: 'warning', leida: false,
    titulo: 'Correo enviado para firma',
    texto: 'Se envió solicitud de conformidad a percy.calderon@cmp.pe para firma del Acta de Recepción.',
    fecha: '16/04/2026',
  },
  {
    id: 4, tipo: 'success', leida: true,
    titulo: 'PREST-2026-002 — En préstamo',
    texto: 'Proyector Epson EB-X41 en préstamo activo. Devolución pactada: 25/03/2026.',
    fecha: '18/03/2026',
  },
  {
    id: 5, tipo: 'info', leida: true,
    titulo: 'SOL-2026-003 Observada',
    texto: 'Teléfono IP — Área de Comunicaciones solicita especificación técnica. Adjuntar ficha técnica.',
    fecha: '07/03/2026',
  },
  {
    id: 6, tipo: 'error', leida: false,
    titulo: 'Devolución vencida — PREST-2026-002',
    texto: 'La devolución del Proyector Epson EB-X41 venció el 25/03/2026. Regularizar a la brevedad.',
    fecha: '26/03/2026',
  },
]

const TIPO_COLOR: Record<string, string> = {
  warning: '#D97706',
  info: '#6B21A8',
  success: '#15803D',
  error: '#DC2626',
}
const TIPO_BG: Record<string, string> = {
  warning: '#FFFBEB',
  info: '#F5F3FF',
  success: '#F0FDF4',
  error: '#FEF2F2',
}
const TIPO_ICON: Record<string, string> = {
  warning: '⚠',
  info: '🔔',
  success: '✅',
  error: '🚨',
}

export function Topbar() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS)
  const panelRef = useRef<HTMLDivElement>(null)

  // Buscar datos reales del colaborador por email
  const colabPorEmail = user?.email ? EMAIL_TO_COLAB[user.email] : undefined

  const nombreCompleto = colabPorEmail
    ? colabPorEmail.nombre
    : profile
      ? profile.nombres + ' ' + profile.apellidos
      : '—'

  const nombreCorto = colabPorEmail
    ? colabPorEmail.nombre.split(' ').slice(0, 2).join(' ')   // "Aaron Samuel"
    : profile
      ? profile.nombres.split(' ')[0] + ' ' + profile.apellidos.split(' ')[0]
      : '—'

  const puesto = colabPorEmail
    ? colabPorEmail.puesto
    : profile
      ? (ROL_LABEL[profile.rol] ?? profile.rol)
      : '—'

  const initials = nombreCompleto !== '—'
    ? nombreCompleto.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : (profile?.avatar_initials ?? '—')

  const unread = notifs.filter(n => !n.leida).length

  function marcarLeida(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }
  function marcarTodasLeidas() {
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
  }

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <span className="topbar-title">INTRANET</span>

      {/* ── Campana de notificaciones ── */}
      <div ref={panelRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative', padding: '4px 8px', borderRadius: 8,
            color: notifOpen ? 'white' : 'rgba(255,255,255,.85)',
            fontSize: 18, lineHeight: 1, transition: 'color .15s',
          }}
          title="Notificaciones"
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
          onMouseOut={e => { if (!notifOpen) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.85)' }}
        >
          🔔
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 2,
              background: '#EF4444', color: 'white',
              fontSize: 9, fontWeight: 700, borderRadius: 10,
              padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: 1.4,
            }}>
              {unread}
            </span>
          )}
        </button>

        {/* Nombre y puesto — a la derecha de la campana */}
        <span style={{ color: 'rgba(255,255,255,.9)', fontSize: 12, marginLeft: 6, verticalAlign: 'middle', fontWeight: 500 }}>
          {nombreCompleto} · <span style={{ opacity: .75, fontWeight: 400 }}>{puesto}</span>
        </span>

        {/* Panel de notificaciones */}
        {notifOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: -60,
            width: 380, maxHeight: 480, overflowY: 'auto',
            background: 'white', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            border: '1px solid #E5E7EB', zIndex: 9999,
          }}>
            {/* Header del panel */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #F3F4F6',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>
                Notificaciones
                {unread > 0 && <span style={{ marginLeft: 6, background: '#6B21A8', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 10 }}>{unread} nuevas</span>}
              </div>
              {unread > 0 && (
                <button onClick={marcarTodasLeidas} style={{ fontSize: 11, color: '#6B21A8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            {notifs.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                No hay notificaciones
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => marcarLeida(n.id)}
                  style={{
                    display: 'flex', gap: 10, padding: '12px 16px',
                    borderBottom: '1px solid #F9FAFB',
                    background: n.leida ? 'white' : TIPO_BG[n.tipo],
                    cursor: 'pointer', transition: 'background .15s',
                  }}
                  onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
                  onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = n.leida ? 'white' : TIPO_BG[n.tipo])}
                >
                  <div style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>{TIPO_ICON[n.tipo]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: TIPO_COLOR[n.tipo], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n.titulo}
                      </div>
                      {!n.leida && <div style={{ width: 7, height: 7, borderRadius: '50%', background: TIPO_COLOR[n.tipo], flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{n.texto}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>{n.fecha}</div>
                  </div>
                </div>
              ))
            )}

            <div style={{ padding: '8px 16px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
              <button style={{ fontSize: 11, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setNotifOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="topbar-divider" />
      <div className="topbar-userinfo">
        <div className="topbar-name">{nombreCorto}</div>
        <div className="topbar-role">{puesto}</div>
      </div>
      <div className="topbar-avatar">{initials}</div>
      <button
        onClick={handleSignOut}
        title="Cerrar sesión"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)', fontSize: 16, padding: '4px 6px', borderRadius: 6, marginLeft: 4, transition: 'color .15s' }}
        onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
        onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.7)')}
      >
        ⏏
      </button>
    </header>
  )
}
