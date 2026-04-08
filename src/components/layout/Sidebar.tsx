import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const SUB_ITEMS = [
  { id: 'asignacion', label: 'Asignación de Bienes', path: '/gestion/asignacion' },
  { id: 'devolucion', label: 'Devolución de Bienes', path: '/gestion/devolucion' },
  { id: 'prestamos-bienes', label: 'Préstamos Bienes Tec.', path: '/gestion/prestamos-bienes' },
  { id: 'prestamos-adelantos', label: 'Préstamos y Adelantos', path: '/gestion/prestamos-adelantos' },
  { id: 'caja-chica', label: 'Caja Chica CMP', path: '/gestion/caja-chica' },
  { id: 'consulta-dni', label: 'Consulta por DNI (GDTH)', path: '/gestion/consulta-dni' },
]

export function Sidebar() {
  const location = useLocation()
  const isGestion = location.pathname.startsWith('/gestion')
  const [open, setOpen] = useState(isGestion)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-wrap">
          <div className="logo-circle">CMP</div>
          <div className="logo-text">COLEGIO<br />MÉDICO<br />DEL PERÚ</div>
        </div>
      </div>
      <div className="council-wrap">
        <span className="council-pill">CONSEJO NACIONAL</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-item"><span className="icon">🏠</span> Inicio</div>
        <div className="nav-item"><span className="icon">📰</span> Noticias</div>
        <div className="nav-item"><span className="icon">📱</span> Mis Aplicaciones</div>
        <div className="nav-item"><span className="icon">📋</span> POI</div>

        <div className="nav-expand-header" onClick={() => setOpen(v => !v)}>
          <span className="icon">🗂</span> Gestión de Recursos
          <span className="arrow">{open ? '▴' : '▾'}</span>
        </div>

        {open && (
          <div className="nav-subitems">
            {SUB_ITEMS.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `nav-subitem${isActive ? ' active' : ''}`
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
