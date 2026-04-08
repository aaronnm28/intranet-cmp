import { useAuth } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  gdth: 'GDTH',
  custodio: 'Custodio',
  contabilidad: 'Contabilidad',
  colaborador: 'Colaborador',
}

export function Topbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const nombreCorto = profile
    ? profile.nombres.split(' ')[0].toUpperCase() + ' ' + profile.apellidos.split(' ')[0].toUpperCase()
    : '—'
  const rol = profile ? (ROL_LABEL[profile.rol] ?? profile.rol) : '—'
  const initials = profile?.avatar_initials ?? '—'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <span className="topbar-title">INTRANET</span>
      <span className="topbar-icon">🔔</span>
      <div className="topbar-divider" />
      <div className="topbar-userinfo">
        <div className="topbar-name">{nombreCorto}</div>
        <div className="topbar-role">{rol}</div>
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
