import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Importar rutas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import equipoRoutes from './routes/equipoRoutes'; // AGREGAR ESTA LÍNEA

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ==================== RUTAS ====================

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API Sistema de Gestión de Inventario - SIPE',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      equipos: '/api/equipos'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/equipos', equipoRoutes); // CAMBIAR ESTA LÍNEA

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== MANEJO DE ERRORES ====================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== INICIAR SERVIDOR ====================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════╗');
      console.log('║                                        ║');
      console.log(`║   Servidor corriendo en puerto ${PORT}  ║`);
      console.log('║                                        ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log('Endpoints disponibles:');
      console.log(`  - http://localhost:${PORT}/`);
      console.log(`  - http://localhost:${PORT}/api/auth/login`);
      console.log(`  - http://localhost:${PORT}/api/auth/registro`);
      console.log(`  - http://localhost:${PORT}/api/usuarios`);
      console.log(`  - http://localhost:${PORT}/api/productos`);
      console.log(`  - http://localhost:${PORT}/api/equipos`);
      console.log('');
      console.log('Base de datos: SistemaGestor');
      console.log('');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

startServer();

export default app;