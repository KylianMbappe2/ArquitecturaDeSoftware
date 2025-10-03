import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplitScreenLogin from './components/auth/LoginForm';
import Inventario from './pages/Inventario';
import Tienda from './pages/Tienda';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplitScreenLogin />} />
        <Route
          path="/tienda"
          element={
            <Layout>
              <Tienda />
            </Layout>
          }
        />
        <Route
          path="/inventario"
          element={
            <Layout>
              <Inventario />
            </Layout>
          }
        />
        {/* Redirigir cualquier otra ruta a tienda */}
        <Route path="*" element={<Navigate to="/tienda" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;