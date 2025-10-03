// Backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario, { IUsuario } from '../models/User';

// ==================== REGISTRO DE NUEVO USUARIO ====================
export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    console.log('📝 Intento de registro:', { username, email, role });

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email y password son obligatorios' });
      return;
    }

    const usuarioExiste = await Usuario.findOne({ $or: [{ email }, { username }] });
    if (usuarioExiste) {
      console.log('⚠️ Usuario ya existe:', usuarioExiste.email);
      res.status(409).json({ error: 'El email o username ya está registrado' });
      return;
    }

    // ⚠️ SIN HASH - Guardamos la contraseña en texto plano (solo desarrollo)
    const nuevoUsuario = new Usuario({
      username,
      email,
      password, // Guardado en texto plano
      role: role || 'user'
    });

    await nuevoUsuario.save();

    console.log('✅ Usuario registrado exitosamente:', nuevoUsuario.email);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: { 
        id: nuevoUsuario._id, 
        username: nuevoUsuario.username, 
        email: nuevoUsuario.email, 
        role: nuevoUsuario.role 
      }
    });
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// ==================== LOGIN DE USUARIO ====================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Intento de login para:', email);
    console.log('📦 Datos recibidos:', { email, password: password ? '***' : 'vacío' });

    if (!email || !password) {
      console.log('⚠️ Campos faltantes');
      res.status(400).json({ error: 'Email y password son obligatorios' });
      return;
    }
    
    // Buscar usuario con contraseña (select: false en el modelo requiere +password)
    const usuario: IUsuario | null = await Usuario.findOne({ email }).select('+password');
    
    console.log('👤 Usuario encontrado:', usuario ? 'SÍ ✅' : 'NO ❌');
    
    if (!usuario) {
      console.log('❌ Usuario no existe en la base de datos');
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    console.log('🔑 Comparando contraseñas en texto plano...');
    console.log('   - Password ingresado:', password);
    console.log('   - Password en BD:', usuario.password);

    // ⚠️ COMPARACIÓN DIRECTA - Sin bcrypt (solo desarrollo)
    const passwordValido = password === usuario.password;
    
    console.log('✅ Password válido:', passwordValido ? 'SÍ ✅' : 'NO ❌');

    if (!passwordValido) {
      console.log('❌ Contraseña incorrecta');
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Generar token JWT
    const secret = process.env.JWT_SECRET || 'tu_secreto_de_respaldo_para_desarrollo';
    const token = jwt.sign(
      { id: usuario._id, role: usuario.role }, 
      secret, 
      { expiresIn: '24h' }
    );

    console.log('🎉 Login exitoso para:', usuario.email);

    res.json({
      message: 'Login exitoso',
      token,
      usuario: { 
        id: usuario._id, 
        username: usuario.username, 
        email: usuario.email, 
        role: usuario.role 
      }
    });
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ==================== VERIFICAR TOKEN ====================
export const verificarAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await Usuario.findById((req as any).userId);
    
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        role: usuario.role,
        createdAt: usuario.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Error al verificar autenticación:', error);
    res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};