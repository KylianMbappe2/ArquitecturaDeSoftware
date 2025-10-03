import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, Package, CheckCircle, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useDarkMode } from '../components/Layout';

interface Equipo {
  _id?: string;
  numeroEquipo: string;
  nombreEquipo: string;
  fechaCompra: string;
  stock: number;
  observaciones: string;
}

interface ItemCarrito {
  equipo: Equipo;
  cantidad: number;
}

interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'warning' | 'success' | 'error';
}

const Tienda = () => {
  const { darkMode } = useDarkMode();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [itemAgregandose, setItemAgregandose] = useState<string | null>(null);

  const STOCK_MINIMO = 10;

  useEffect(() => {
    cargarEquipos();
  }, []);

  const mostrarNotificacion = (mensaje: string, tipo: 'warning' | 'success' | 'error') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(notif => notif.id !== id));
    }, 5000);
  };

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No estás autenticado. Por favor inicia sesión nuevamente.');
        window.location.href = '/';
        return;
      }

      const response = await fetch('http://localhost:3000/api/equipos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const equiposDisponibles = data.filter((eq: Equipo) => eq.stock > 0);
        setEquipos(equiposDisponibles);

        const equiposStockBajo = equiposDisponibles.filter((eq: Equipo) => eq.stock <= STOCK_MINIMO);
        if (equiposStockBajo.length > 0) {
          mostrarNotificacion(
            `⚠️ ${equiposStockBajo.length} equipo(s) con stock bajo`,
            'warning'
          );
        }
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (equipo: Equipo) => {
    const itemExistente = carrito.find(item => item.equipo._id === equipo._id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < equipo.stock) {
        setItemAgregandose(equipo._id!);
        setTimeout(() => setItemAgregandose(null), 600);
        
        setCarrito(carrito.map(item =>
          item.equipo._id === equipo._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
        mostrarNotificacion(`Agregado: ${equipo.nombreEquipo}`, 'success');
      } else {
        mostrarNotificacion('No hay suficiente stock disponible', 'error');
      }
    } else {
      setItemAgregandose(equipo._id!);
      setTimeout(() => setItemAgregandose(null), 600);
      
      setCarrito([...carrito, { equipo, cantidad: 1 }]);
      mostrarNotificacion(`Agregado: ${equipo.nombreEquipo}`, 'success');
    }
  };

  const aumentarCantidad = (equipoId: string) => {
    const item = carrito.find(i => i.equipo._id === equipoId);
    if (item && item.cantidad < item.equipo.stock) {
      setCarrito(carrito.map(i => {
        if (i.equipo._id === equipoId) {
          return { ...i, cantidad: i.cantidad + 1 };
        }
        return i;
      }));
    }
  };

  const disminuirCantidad = (equipoId: string) => {
    setCarrito(carrito.map(item => {
      if (item.equipo._id === equipoId && item.cantidad > 1) {
        return { ...item, cantidad: item.cantidad - 1 };
      }
      return item;
    }).filter(item => item.cantidad > 0));
  };

  const eliminarDelCarrito = (equipoId: string) => {
    setCarrito(carrito.filter(item => item.equipo._id !== equipoId));
    mostrarNotificacion('Equipo eliminado del carrito', 'success');
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    mostrarNotificacion('Carrito vaciado', 'success');
  };

  const procesarCompra = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setProcesando(true);

    try {
      const token = localStorage.getItem('token');
      const equiposConStockBajo: string[] = [];

      for (const item of carrito) {
        const nuevoStock = item.equipo.stock - item.cantidad;
        
        await fetch(`http://localhost:3000/api/equipos/${item.equipo._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...item.equipo,
            stock: nuevoStock
          })
        });

        if (nuevoStock <= STOCK_MINIMO && nuevoStock > 0) {
          equiposConStockBajo.push(item.equipo.nombreEquipo);
        }
      }

      setCarrito([]);
      setModalConfirmacion(false);
      setCarritoAbierto(false);
      await cargarEquipos();
      
      mostrarNotificacion('Salida procesada exitosamente', 'success');
      
      if (equiposConStockBajo.length > 0) {
        setTimeout(() => {
          equiposConStockBajo.forEach(nombre => {
            mostrarNotificacion(`⚠️ Stock bajo: ${nombre}`, 'warning');
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error al procesar la salida:', error);
      mostrarNotificacion('Error al procesar la salida', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // Skeleton Loader
  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-16 h-16 rounded-xl animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className="flex-1">
              <div className={`h-10 rounded-lg w-64 animate-pulse mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-96 animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`rounded-xl p-6 border animate-pulse ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`h-4 rounded w-32 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-8 rounded w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>

          <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`flex gap-4 py-4 border-b last:border-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className={`h-12 w-24 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`h-4 rounded w-48 animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-3 rounded w-32 animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-950/30 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'
    }`}>
      {/* Notificaciones Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl transform transition-all ${
              darkMode 
                ? notif.tipo === 'success'
                  ? 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-700'
                  : notif.tipo === 'warning'
                  ? 'bg-gradient-to-r from-amber-900/90 to-orange-900/90 border-amber-700'
                  : 'bg-gradient-to-r from-red-900/90 to-pink-900/90 border-red-700'
                : notif.tipo === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                : notif.tipo === 'warning'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}
            style={{
              animation: 'slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}
          >
            <div className={`p-2 rounded-lg ${
              darkMode
                ? notif.tipo === 'success'
                  ? 'bg-green-800'
                  : notif.tipo === 'warning'
                  ? 'bg-amber-800'
                  : 'bg-red-800'
                : notif.tipo === 'success'
                ? 'bg-green-100'
                : notif.tipo === 'warning'
                ? 'bg-amber-100'
                : 'bg-red-100'
            }`}>
              {notif.tipo === 'success' ? (
                <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
              ) : notif.tipo === 'warning' ? (
                <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`} />
              ) : (
                <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${
                darkMode
                  ? notif.tipo === 'success'
                    ? 'text-green-100'
                    : notif.tipo === 'warning'
                    ? 'text-amber-100'
                    : 'text-red-100'
                  : notif.tipo === 'success'
                  ? 'text-green-900'
                  : notif.tipo === 'warning'
                  ? 'text-amber-900'
                  : 'text-red-900'
              }`}>
                {notif.mensaje}
              </p>
            </div>
            <button
              onClick={() => setNotificaciones(prev => prev.filter(n => n.id !== notif.id))}
              className={`transition-colors p-1 rounded ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Package className="w-8 h-8 text-white relative z-10" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${
                darkMode 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
              }`}>
                Tienda de Equipos
              </h1>
              <p className={`mt-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Sparkles className="w-4 h-4 text-blue-500" />
                Selecciona equipos para procesar salida
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <ShoppingCart className="w-5 h-5" />
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border group ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-blue-950/50 border-blue-900/50'
              : 'bg-gradient-to-br from-white to-blue-50/50 border-blue-100/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Equipos Disponibles</p>
                <p className={`text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{equipos.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border group ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-green-950/50 border-green-900/50'
              : 'bg-gradient-to-br from-white to-green-50/50 border-green-100/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Carrito</p>
                <p className={`text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{totalItems}</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border group ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-amber-950/50 border-amber-900/50'
              : 'bg-gradient-to-br from-white to-amber-50/50 border-amber-100/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock Bajo</p>
                <p className={`text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {equipos.filter(eq => eq.stock <= STOCK_MINIMO).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Equipos */}
      <div className="max-w-7xl mx-auto">
        {equipos.length === 0 ? (
          <div className={`text-center py-32 rounded-2xl border-2 border-dashed shadow-sm ${
            darkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-300'
          }`}>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <Package className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No hay equipos disponibles</p>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Todos los equipos están sin stock</p>
          </div>
        ) : (
          <div className={`rounded-2xl border shadow-lg overflow-hidden ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`grid grid-cols-12 gap-4 p-5 border-b-2 ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-blue-950/30 border-gray-700' 
                : 'bg-gradient-to-r from-gray-50 to-blue-50/30 border-gray-200'
            }`}>
              <div className={`col-span-2 font-bold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Número</div>
              <div className={`col-span-3 font-bold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</div>
              <div className={`col-span-2 font-bold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock</div>
              <div className={`col-span-2 font-bold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estado</div>
              <div className={`col-span-3 font-bold text-sm uppercase tracking-wide text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Acciones</div>
            </div>

            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {equipos.map((equipo, index) => {
                const enCarrito = carrito.find(item => item.equipo._id === equipo._id);
                const cantidadEnCarrito = enCarrito?.cantidad || 0;
                const stockDisponible = equipo.stock - cantidadEnCarrito;
                const isAnimating = itemAgregandose === equipo._id;
                
                return (
                  <div
                    key={equipo._id}
                    className={`grid grid-cols-12 gap-4 p-5 transition-all duration-200 ${
                      darkMode
                        ? `hover:bg-gradient-to-r hover:from-blue-950/30 hover:to-transparent ${isAnimating ? 'bg-green-950/30 scale-[1.02]' : ''}`
                        : `hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent ${isAnimating ? 'bg-green-50/50 scale-[1.02]' : ''}`
                    }`}
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="col-span-2 flex items-center">
                      <span className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-xl text-blue-700 text-sm font-bold shadow-sm">
                        {equipo.numeroEquipo}
                      </span>
                    </div>
                    
                    <div className="col-span-3 flex flex-col justify-center">
                      <p className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{equipo.nombreEquipo}</p>
                      <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{equipo.observaciones || 'Sin descripción'}</p>
                    </div>
                    
                    <div className="col-span-2 flex flex-col justify-center">
                      <p className={`font-bold text-xl ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{stockDisponible}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>unidades</p>
                      {cantidadEnCarrito > 0 && (
                        <p className="text-green-600 text-xs font-bold mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {cantidadEnCarrito} en carrito
                        </p>
                      )}
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      {stockDisponible <= STOCK_MINIMO ? (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200 shadow-sm">
                          <AlertCircle className="w-3 h-3" />
                          Stock Bajo
                        </span>
                      ) : stockDisponible <= 30 ? (
                        <span className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200 shadow-sm">
                          Stock Medio
                        </span>
                      ) : (
                        <span className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 shadow-sm">
                          Stock Alto
                        </span>
                      )}
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-end gap-3">
                      {cantidadEnCarrito > 0 && (
                        <div className={`flex items-center gap-1 border rounded-xl shadow-sm ${
                          darkMode 
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
                        }`}>
                          <button
                            onClick={() => disminuirCantidad(equipo._id!)}
                            className={`p-2 transition-all rounded-l-xl active:scale-95 ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-white/80'
                            }`}
                          >
                            <Minus className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                          </button>
                          <span className={`w-10 text-center font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {cantidadEnCarrito}
                          </span>
                          <button
                            onClick={() => aumentarCantidad(equipo._id!)}
                            disabled={cantidadEnCarrito >= equipo.stock}
                            className={`p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-r-xl active:scale-95 ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-white/80'
                            }`}
                          >
                            <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => agregarAlCarrito(equipo)}
                        disabled={stockDisponible <= 0}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Panel del Carrito */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className={`w-full max-w-md h-full shadow-2xl flex flex-col animate-slideInRight ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Mi Carrito</h2>
                  <p className="text-blue-100 text-sm">{totalItems} items seleccionados</p>
                </div>
              </div>
              <button
                onClick={() => setCarritoAbierto(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 ${
              darkMode 
                ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                : 'bg-gradient-to-b from-gray-50 to-white'
            }`}>
              {carrito.length === 0 ? (
                <div className="text-center py-32">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}>
                    <ShoppingCart className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tu carrito está vacío</p>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Agrega equipos para continuar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item, index) => (
                    <div
                      key={item.equipo._id}
                      className={`rounded-2xl p-5 border shadow-md hover:shadow-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.equipo.nombreEquipo}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.equipo.numeroEquipo}</p>
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(item.equipo._id!)}
                          className={`p-2 rounded-lg text-red-600 transition-all active:scale-95 ${
                            darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 border rounded-xl shadow-sm ${
                          darkMode 
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
                        }`}>
                          <button
                            onClick={() => disminuirCantidad(item.equipo._id!)}
                            className={`p-3 transition-all rounded-l-xl active:scale-95 ${
                              darkMode ? 'hover:bg-gray-500' : 'hover:bg-white/80'
                            }`}
                          >
                            <Minus className={`w-4 h-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
                          </button>
                          <span className={`w-12 text-center font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => aumentarCantidad(item.equipo._id!)}
                            disabled={item.cantidad >= item.equipo.stock}
                            className={`p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-r-xl active:scale-95 ${
                              darkMode ? 'hover:bg-gray-500' : 'hover:bg-white/80'
                            }`}
                          >
                            <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Disponible</p>
                          <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.equipo.stock}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className={`border-t-2 p-6 space-y-4 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                }`}>
                  <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Items:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{totalItems}</span>
                </div>
                <button
                  onClick={() => setModalConfirmacion(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Procesar Salida
                </button>
                <button
                  onClick={vaciarCarrito}
                  className={`w-full border-2 py-3 rounded-xl font-semibold transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200 hover:border-gray-500' 
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Vaciar Carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`rounded-3xl max-w-md w-full p-8 shadow-2xl transform animate-scaleIn ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AlertCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Confirmar Salida</h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Se procesará la salida de <span className="font-bold text-blue-600">{totalItems}</span> items
              </p>
            </div>

            <div className={`rounded-2xl p-5 mb-6 max-h-60 overflow-y-auto border ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-700 to-blue-950/30 border-gray-600' 
                : 'bg-gradient-to-br from-gray-50 to-blue-50/30 border-gray-200'
            }`}>
              {carrito.map((item) => (
                <div key={item.equipo._id} className={`flex justify-between py-3 border-b last:border-0 ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.equipo.nombreEquipo}</span>
                  <span className="font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-lg">x{item.cantidad}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalConfirmacion(false)}
                disabled={procesando}
                className={`flex-1 border-2 px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={procesarCompra}
                disabled={procesando}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
              >
                {procesando ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInBounce {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          50% {
            transform: translateX(-10px);
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Tienda;