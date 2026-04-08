import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { AsignacionBienes } from './pages/AsignacionBienes'
import { DevolucionBienes } from './pages/DevolucionBienes'
import { PrestamosBienes } from './pages/PrestamosBienes'
import { PrestamosAdelantos } from './pages/PrestamosAdelantos'
import { CajaChica } from './pages/CajaChica'
import { ConsultaDNI } from './pages/ConsultaDNI'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F3FF',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid #E9D5FF',
            borderTop: '3px solid #4A1272',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/gestion/asignacion" replace />} />
            <Route path="gestion/asignacion" element={<AsignacionBienes />} />
            <Route path="gestion/devolucion" element={<DevolucionBienes />} />
            <Route path="gestion/prestamos-bienes" element={<PrestamosBienes />} />
            <Route path="gestion/prestamos-adelantos" element={<PrestamosAdelantos />} />
            <Route path="gestion/caja-chica" element={<CajaChica />} />
            <Route path="gestion/consulta-dni" element={<ConsultaDNI />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
