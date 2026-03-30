import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AsignacionBienes } from './pages/AsignacionBienes'
import { DevolucionBienes } from './pages/DevolucionBienes'
import { PrestamosBienes } from './pages/PrestamosBienes'
import { PrestamosAdelantos } from './pages/PrestamosAdelantos'
import { CajaChica } from './pages/CajaChica'
import { ConsultaDNI } from './pages/ConsultaDNI'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/gestion/asignacion" replace />} />
          <Route path="gestion/asignacion" element={<AsignacionBienes />} />
          <Route path="gestion/devolucion" element={<DevolucionBienes />} />
          <Route path="gestion/prestamos-bienes" element={<PrestamosBienes />} />
          <Route path="gestion/prestamos-adelantos" element={<PrestamosAdelantos />} />
          <Route path="gestion/caja-chica" element={<CajaChica />} />
          <Route path="gestion/consulta-dni" element={<ConsultaDNI />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
