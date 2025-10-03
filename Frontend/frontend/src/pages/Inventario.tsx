import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, X, Save, Calendar, AlertTriangle, TrendingUp, FileText, Download, Bell } from 'lucide-react';
import { useDarkMode } from '../components/Layout';
interface Equipo {
  _id?: string;
  numeroEquipo: string;
  nombreEquipo: string;
  fechaCompra: string;
  stock: number;
  observaciones: string;
  lastUpdated?: string;
}

interface Notificacion {
  id: string;
  mensaje: string;
  tipo: 'warning' | 'success';
}

const Inventario = () => {
  const { darkMode } = useDarkMode();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [equipoActual, setEquipoActual] = useState<Equipo | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mesExportar, setMesExportar] = useState('');
  const [anioExportar, setAnioExportar] = useState(new Date().getFullYear().toString());
  const [stockAgregar, setStockAgregar] = useState(0);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const STOCK_MINIMO = 10;

  const [formData, setFormData] = useState<Equipo>({
    numeroEquipo: '',
    nombreEquipo: '',
    fechaCompra: '',
    stock: 0,
    observaciones: ''
  });

  useEffect(() => {
    cargarEquipos();
  }, []);

  useEffect(() => {
    verificarStockBajo();
  }, [equipos]);

  const verificarStockBajo = () => {
    const equiposBajos = equipos.filter(eq => eq.stock <= STOCK_MINIMO && eq.stock > 0);
    const nuevasNotificaciones: Notificacion[] = equiposBajos.map(eq => ({
      id: eq._id!,
      mensaje: `Stock bajo en ${eq.nombreEquipo}: ${eq.stock} unidades`,
      tipo: 'warning'
    }));
    setNotificaciones(nuevasNotificaciones);
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
        setEquipos(data);
      } else {
        const error = await response.json();
        alert('Error al cargar equipos: ' + error.error);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      alert('Error de conexión al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormData({
      numeroEquipo: '',
      nombreEquipo: '',
      fechaCompra: '',
      stock: 0,
      observaciones: ''
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (equipo: Equipo) => {
    setModoEdicion(true);
    setEquipoActual(equipo);
    setFormData({
      numeroEquipo: equipo.numeroEquipo,
      nombreEquipo: equipo.nombreEquipo,
      fechaCompra: equipo.fechaCompra.split('T')[0],
      stock: equipo.stock,
      observaciones: equipo.observaciones
    });
    setModalAbierto(true);
  };

  const abrirModalStock = (equipo: Equipo) => {
    setEquipoActual(equipo);
    setStockAgregar(0);
    setModalStock(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEquipoActual(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  const guardarEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = modoEdicion 
        ? `http://localhost:3000/api/equipos/${equipoActual?._id}`
        : 'http://localhost:3000/api/equipos';
      
      const method = modoEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await cargarEquipos();
        cerrarModal();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      alert('Error al guardar equipo');
    }
  };

  const agregarStock = async () => {
    if (!equipoActual || stockAgregar <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const nuevoStock = equipoActual.stock + stockAgregar;

      const response = await fetch(`http://localhost:3000/api/equipos/${equipoActual._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...equipoActual,
          stock: nuevoStock
        })
      });

      if (response.ok) {
        await cargarEquipos();
        setModalStock(false);
        alert(`Stock actualizado: ${equipoActual.stock} → ${nuevoStock}`);
      }
    } catch (error) {
      console.error('Error al agregar stock:', error);
      alert('Error al agregar stock');
    }
  };

  const eliminarEquipo = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/equipos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await cargarEquipos();
      }
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportarPDF = () => {
    if (!mesExportar || !anioExportar) {
      alert('Por favor selecciona mes y año');
      return;
    }

    const equiposFiltrados = equipos.filter(equipo => {
      const fecha = new Date(equipo.fechaCompra);
      return fecha.getMonth() + 1 === parseInt(mesExportar) && 
             fecha.getFullYear() === parseInt(anioExportar);
    });

    if (equiposFiltrados.length === 0) {
      alert('No hay equipos para ese mes/año');
      return;
    }

    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Equipos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #2563EB; text-align: center; }
          .info { text-align: center; margin-bottom: 30px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2563EB; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte de Inventario de Equipos</h1>
        <div class="info">
          <p><strong>Mes:</strong> ${new Date(parseInt(anioExportar), parseInt(mesExportar) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
          <p><strong>Total de equipos:</strong> ${equiposFiltrados.length}</p>
          <p><strong>Stock total:</strong> ${equiposFiltrados.reduce((sum, eq) => sum + eq.stock, 0)} unidades</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre</th>
              <th>Fecha Compra</th>
              <th>Stock</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${equiposFiltrados.map(equipo => `
              <tr>
                <td>${equipo.numeroEquipo}</td>
                <td>${equipo.nombreEquipo}</td>
                <td>${formatearFecha(equipo.fechaCompra)}</td>
                <td>${equipo.stock}</td>
                <td>${equipo.observaciones || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
          <p>Sistema de Gestión de Inventario - SIPE</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
      }, 500);
    }

    setModalExportar(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Notificaciones */}
      {notificaciones.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className={`border-l-4 rounded-lg p-4 shadow-sm ${
            darkMode 
              ? 'bg-amber-900/30 border-amber-600' 
              : 'bg-amber-50 border-amber-400'
          }`}>
            <div className="flex items-start gap-3">
              <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>Alertas de Stock Bajo</h3>
                <div className="space-y-1">
                  {notificaciones.map(notif => (
                    <p key={notif.id} className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>{notif.mensaje}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-xl shadow-md">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Inventario de Equipos</h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gestiona tu inventario de forma eficiente</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModalExportar(true)}
              className={`flex items-center gap-2 border px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200'
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              Exportar PDF
            </button>
            <button
              onClick={abrirModalNuevo}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Agregar Equipo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`rounded-xl p-6 shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Equipos</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{equipos.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-6 shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock Total</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {equipos.reduce((sum, eq) => sum + eq.stock, 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-6 shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock Bajo</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {equipos.filter(eq => eq.stock <= STOCK_MINIMO).length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-6 shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {equipos.length > 0 ? Math.round(equipos.reduce((sum, eq) => sum + eq.stock, 0) / equipos.length) : 0}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Equipos */}
      <div className="max-w-7xl mx-auto">
        {equipos.length === 0 ? (
          <div className={`text-center py-20 rounded-xl border shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <Package className={`w-20 h-20 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-xl font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No hay equipos registrados</p>
            <p className={`mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Comienza agregando tu primer equipo</p>
          </div>
        ) : (
          <div className={`rounded-xl border shadow-sm overflow-hidden ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Header de la tabla */}
            <div className={`grid grid-cols-12 gap-4 p-4 border-b ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`col-span-2 font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Número</div>
              <div className={`col-span-3 font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</div>
              <div className={`col-span-2 font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Compra</div>
              <div className={`col-span-1 font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock</div>
              <div className={`col-span-2 font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estado</div>
              <div className={`col-span-2 font-semibold text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Acciones</div>
            </div>

            {/* Filas de equipos */}
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {equipos.map((equipo) => (
                <div
                  key={equipo._id}
                  className={`grid grid-cols-12 gap-4 p-4 transition-colors group ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-2 flex items-center">
                    <span className="bg-blue-100 px-3 py-1 rounded-lg text-blue-700 text-sm font-semibold">
                      {equipo.numeroEquipo}
                    </span>
                  </div>
                  
                  <div className="col-span-3 flex flex-col justify-center">
                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{equipo.nombreEquipo}</p>
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{equipo.observaciones || 'Sin observaciones'}</p>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatearFecha(equipo.fechaCompra)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <span className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{equipo.stock}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    {equipo.stock <= STOCK_MINIMO ? (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        Stock Bajo
                      </span>
                    ) : equipo.stock <= 30 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        Stock Medio
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        Stock Alto
                      </span>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => abrirModalStock(equipo)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                      title="Agregar Stock"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => abrirModalEditar(equipo)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => eliminarEquipo(equipo._id!)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Stock */}
      {modalStock && equipoActual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-md w-full p-8 shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Agregar Stock</h2>
              <button
                onClick={() => setModalStock(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="mb-6">
              <div className={`rounded-lg p-4 border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Equipo</p>
                <p className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{equipoActual.nombreEquipo}</p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stock actual: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{equipoActual.stock}</span> unidades
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cantidad a Agregar
                </label>
                <input
                  type="number"
                  value={stockAgregar}
                  onChange={(e) => setStockAgregar(parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-lg px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0"
                  min="1"
                />
              </div>

              {stockAgregar > 0 && (
                <div className={`border rounded-lg p-4 ${
                  darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Nuevo stock total:</p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {equipoActual.stock} + {stockAgregar} = {equipoActual.stock + stockAgregar}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalStock(false)}
                  className={`flex-1 border px-6 py-3 rounded-xl font-semibold transition-all ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarStock}
                  disabled={stockAgregar <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Equipo */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-2xl w-full p-8 shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {modoEdicion ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}
              </h2>
              <button
                onClick={cerrarModal}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <form onSubmit={guardarEquipo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Equipo
                  </label>
                  <input
                    type="text"
                    name="numeroEquipo"
                    value={formData.numeroEquipo}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="EQ-001"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  name="nombreEquipo"
                  value={formData.nombreEquipo}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Laptop Dell XPS"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="fechaCompra"
                  value={formData.fechaCompra}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Descripción del equipo..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className={`flex-1 border px-6 py-3 rounded-xl font-semibold transition-all ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
                >
                  <Save className="w-5 h-5" />
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Exportar PDF */}
      {modalExportar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-md w-full p-8 shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Exportar a PDF</h2>
              <button
                onClick={() => setModalExportar(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mes
                </label>
                <select
                  value={mesExportar}
                  onChange={(e) => setMesExportar(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Seleccionar mes</option>
                  <option value="1">Enero</option>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Año
                </label>
                <input
                  type="number"
                  value={anioExportar}
                  onChange={(e) => setAnioExportar(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="2025"
                  required
                  min="2000"
                  max="2100"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalExportar(false)}
                  className={`flex-1 border px-6 py-3 rounded-xl font-semibold transition-all ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={exportarPDF}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;