import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SistemaGestor';
    
    await mongoose.connect(mongoURI);
    
    console.log('Conectado a MongoDB exitosamente');
    console.log(`Base de datos: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(' Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log(' MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error(' Error en MongoDB:', err);
});