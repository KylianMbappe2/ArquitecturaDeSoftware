import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const mongoURI = 'mongodb://localhost:27017/SistemaGestor';

mongoose.connect(mongoURI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

interface Usuario {
  email: string;
  newPassword: string;
}

async function updatePasswords(): Promise<void> {
  try {
    const usuarios: Usuario[] = [
      { email: 'Jonathansan944@gmail.com', newPassword: '123456' },
      { email: 'user1@correo.com', newPassword: 'user123' }
    ];

    for (const user of usuarios) {
      const hashedPassword = await bcrypt.hash(user.newPassword, 10);
      
      const result = await mongoose.connection.collection('usuarios').updateOne(
        { email: user.email },
        { $set: { password: hashedPassword } }
      );

      if (result.modifiedCount > 0) {
        console.log(`Password actualizado para ${user.email}`);
      } else {
        console.log(`Usuario no encontrado: ${user.email}`);
      }
    }

    console.log('\nProceso completado');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePasswords();