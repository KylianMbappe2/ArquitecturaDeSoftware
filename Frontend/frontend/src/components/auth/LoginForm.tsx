import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function ModernLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const API_URL = 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = '/tienda';
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Lado Izquierdo - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Efectos de fondo sutiles */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo y título */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SIPE</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Bienvenido
            </h1>
            <p className="text-gray-400 text-lg">
              Inicia sesión para continuar
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-5">
            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput('')}
                  placeholder="tu@email.com"
                  className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 
                    focus:outline-none focus:bg-white/10 transition-all duration-300
                    ${focusedInput === 'email' ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/10'}
                  `}
                  disabled={loading}
                />
                <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300
                  ${focusedInput === 'email' ? 'text-blue-500' : 'text-gray-500'}
                `} />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 
                    focus:outline-none focus:bg-white/10 transition-all duration-300
                    ${focusedInput === 'password' ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/10'}
                  `}
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Lock className={`w-5 h-5 transition-colors duration-300
                    ${focusedInput === 'password' ? 'text-blue-500' : 'text-gray-500'}
                  `} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Recordar y Olvidé contraseña */}
            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" 
                />
                <span className="ml-2 text-gray-400 group-hover:text-white transition-colors">
                  Recordarme
                </span>
              </label>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Botón de Login */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                text-white font-semibold py-4 rounded-xl transition-all duration-300 
                shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:-translate-y-0.5 active:translate-y-0
                flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 
                border border-white/10 rounded-xl transition-all duration-300 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                  Google
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 
                border border-white/10 rounded-xl transition-all duration-300 group">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path className="text-white" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                  GitHub
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            ¿No tienes cuenta?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Crear cuenta
            </a>
          </p>
        </div>
      </div>

      {/* Lado Derecho - Hero Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-black
        items-center justify-center p-12 relative overflow-hidden border-l border-white/5">
        
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 max-w-lg">
          {/* Icono principal */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="text-center text-white space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              Gestión de Inventario
              <br />
              <span className="text-blue-200">Reimaginada</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Sistema inteligente para controlar tu inventario con elegancia y eficiencia
            </p>
          </div>

          {/* Features */}
          <div className="mt-16 space-y-4">
            {[
              { icon: '✓', title: 'Control en tiempo real', desc: 'Monitorea tu inventario al instante' },
              { icon: '✓', title: 'Reportes avanzados', desc: 'Analíticas detalladas y exportables' },
              { icon: '✓', title: 'Interfaz intuitiva', desc: 'Diseño moderno y fácil de usar' }
            ].map((feature, i) => (
              <div 
                key={i}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10
                  hover:bg-white/15 transition-all duration-300 transform hover:translate-x-2"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-blue-100">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-16 text-center">
            <p className="text-blue-200 text-sm">
              Confiado por más de 100+ empresas
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}