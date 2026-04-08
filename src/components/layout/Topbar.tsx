import { Bell, LogOut } from 'lucide-react'
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
    : 'USUARIO'
  const rol = profile ? (ROL_LABEL[profile.rol] ?? profile.rol) : ''
  const initials = profile?.avatar_initials ?? 'U'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-[#6B21A8] h-14 flex items-center px-5 gap-3 flex-shrink-0">
      <span className="text-white font-bold text-[15px] tracking-[1.5px] flex-1">INTRANET</span>
      <Bell size={18} className="text-white/80 cursor-pointer" />
      <div className="w-px h-6 bg-white/20" />
      <div className="text-right">
        <div className="text-white/90 text-[12px] font-semibold leading-tight">{nombreCorto}</div>
        <div className="text-white/60 text-[11px]">{rol}</div>
      </div>
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
        {initials}
      </div>
      <button
        onClick={handleSignOut}
        title="Cerrar sesión"
        className="text-white/70 hover:text-white transition-colors ml-1"
      >
        <LogOut size={16} />
      </button>
    </header>
  )
}
