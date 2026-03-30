import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Home, Newspaper, AppWindow, ClipboardList, ChevronDown, ChevronRight } from 'lucide-react'

const SUB_ITEMS = [
  { id: 'asignacion', label: 'Asignación de Bienes', path: '/gestion/asignacion' },
  { id: 'devolucion', label: 'Devolución de Bienes', path: '/gestion/devolucion' },
  { id: 'prestamos-bienes', label: 'Préstamos Bienes Tec.', path: '/gestion/prestamos-bienes' },
  { id: 'prestamos-adelantos', label: 'Préstamos y Adelantos', path: '/gestion/prestamos-adelantos' },
  { id: 'caja-chica', label: 'Caja Chica Decanato', path: '/gestion/caja-chica' },
  { id: 'consulta-dni', label: 'Consulta por DNI (GDTH)', path: '/gestion/consulta-dni' },
]

export function Sidebar() {
  const location = useLocation()
  const isGestion = location.pathname.startsWith('/gestion')
  const [open, setOpen] = useState(isGestion)

  return (
    <aside className="w-[220px] bg-[#4A1272] flex-shrink-0 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-[18px] pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center font-bold text-[#4A1272] text-[11px] flex-shrink-0">CMP</div>
          <div className="text-white text-[9.5px] font-semibold leading-[1.35] tracking-[0.4px]">COLEGIO<br/>MÉDICO<br/>DEL PERÚ</div>
        </div>
      </div>
      <div className="px-4 py-2">
        <span className="bg-white/20 text-white/90 text-[9px] font-semibold tracking-[1px] px-2.5 py-1 rounded-full">CONSEJO NACIONAL</span>
      </div>

      {/* Nav */}
      <nav className="py-1 flex-1">
        {[
          { icon: <Home size={14} />, label: 'Inicio' },
          { icon: <Newspaper size={14} />, label: 'Noticias' },
          { icon: <AppWindow size={14} />, label: 'Mis Aplicaciones' },
          { icon: <ClipboardList size={14} />, label: 'POI' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5 px-4 py-2.5 text-white/70 text-[13px] cursor-pointer hover:bg-white/10 hover:text-white border-l-[3px] border-transparent transition-colors">
            <span className="w-4 text-center flex-shrink-0">{item.icon}</span>
            {item.label}
          </div>
        ))}

        {/* Gestión de Recursos */}
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-4 py-2.5 text-white text-[13px] font-semibold border-l-[3px] border-white bg-white/10 cursor-pointer select-none"
        >
          <span className="text-[14px] w-4 text-center flex-shrink-0">🗂</span>
          <span className="flex-1">Gestión de Recursos</span>
          {open ? <ChevronDown size={11} className="text-white/60" /> : <ChevronRight size={11} className="text-white/60" />}
        </div>
        {open && (
          <div className="bg-black/15">
            {SUB_ITEMS.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `block pl-10 pr-4 py-2 text-[12px] cursor-pointer transition-colors border-l-[3px]
                  ${isActive
                    ? 'text-white font-medium border-white/55 bg-white/10'
                    : 'text-white/60 border-transparent hover:bg-white/5 hover:text-white/90'}`
                }
              >
                — {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}
