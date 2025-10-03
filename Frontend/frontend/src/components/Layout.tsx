import { createContext, useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Moon, Sun } from 'lucide-react';

// Crear el Context para compartir el dark mode
const DarkModeContext = createContext<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}>({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Hook personalizado para usar el dark mode en otros componentes
export const useDarkMode = () => useContext(DarkModeContext);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia de tema al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Navbar */}
        <nav className={`border-b shadow-sm transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xl font-bold ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    SIPE
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/tienda"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isActive('/tienda')
                        ? 'bg-blue-600 text-white shadow-md'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Tienda
                  </Link>
                  <Link
                    to="/inventario"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isActive('/inventario')
                        ? 'bg-blue-600 text-white shadow-md'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Inventario
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Toggle Dark Mode */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                  title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {usuario.username}
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    darkMode
                      ? 'bg-red-900/50 hover:bg-red-900/70 text-red-300'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <div>{children}</div>
      </div>
    </DarkModeContext.Provider>
  );
};

export default Layout;