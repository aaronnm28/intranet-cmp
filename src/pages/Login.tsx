import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      // Fetch profile — fallback to email-derived data so cmp_session is always set
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('nombres,apellidos,rol,area')
          .eq('id', user.id)
          .single()
        const session = profile ?? {
          nombres: user.user_metadata?.nombres ?? user.email?.split('@')[0] ?? 'Usuario',
          apellidos: user.user_metadata?.apellidos ?? '',
          rol: user.user_metadata?.rol ?? 'colaborador',
          area: user.user_metadata?.area ?? 'CMP',
        }
        localStorage.setItem('cmp_session', JSON.stringify(session))
      }
      window.location.href = '/gestion/asignacion'
    } catch {
      setError('Correo o contraseña incorrectos. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f3f0f7 0%, #e8e0f0 40%, #f8f6fb 100%)' }}>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-[5px] flex items-center justify-center flex-shrink-0"
            style={{ background: '#4A1272' }}
          >
            <span style={{ color: 'white', fontSize: 8, fontWeight: 800, letterSpacing: '0.5px' }}>CMP</span>
          </div>
          <span style={{ color: '#4A1272', fontSize: 13, fontWeight: 600 }}>
            Intranet Colegio Médico del Perú
          </span>
        </div>
      </header>

      {/* Decorative blobs */}
      <div className="absolute" style={{
        bottom: '-60px', left: '-80px',
        width: 340, height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #c4b5d8 0%, #a78bc4 60%, transparent 100%)',
        opacity: 0.45,
      }} />
      <div className="absolute" style={{
        bottom: '60px', left: '40px',
        width: 180, height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #d8cce8 0%, #b99fd4 70%, transparent 100%)',
        opacity: 0.4,
      }} />
      <div className="absolute" style={{
        top: '-40px', right: '-60px',
        width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #e0d4f0 0%, #c9b3e0 70%, transparent 100%)',
        opacity: 0.35,
      }} />

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div
          className="w-full"
          style={{
            maxWidth: 400,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(74,18,114,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            padding: '40px 40px 36px',
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-7">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 3px 10px rgba(217,119,6,0.35)' }}
            >
              <span style={{ color: 'white', fontWeight: 900, fontSize: 14, letterSpacing: '0.5px' }}>CMP</span>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#1E1B4B', letterSpacing: '1.2px', lineHeight: 1.3 }}>COLEGIO MÉDICO</div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#1E1B4B', letterSpacing: '1.2px', lineHeight: 1.3 }}>DEL PERÚ</div>
            </div>
          </div>

          {/* Titles */}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            Iniciar Sesión
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
            Ingresa tu acceso y contraseña para ingresar.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="aaronm@cmp.org.pe"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  border: '1px solid #D1D5DB',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 14,
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#4A1272')}
                onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    border: '1px solid #D1D5DB',
                    borderRadius: 8,
                    padding: '10px 56px 10px 12px',
                    fontSize: 14,
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4A1272')}
                  onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#4A1272',
                    padding: 0,
                  }}
                >
                  {showPwd ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                color: '#991B1B',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#7c4a9e' : '#4A1272',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '11px',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                letterSpacing: '0.2px',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Forgot password */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a
              href="#"
              style={{ fontSize: 13, color: '#4A1272', textDecoration: 'none' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = 'underline')}
              onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = 'none')}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
