import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/User';

// Obtener todos los usuarios
export const getUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await Usuario.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(usuarios);
  } catch (error: any) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
export const getUsuarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error: any) {
    console.error('Error en getUsuarioById:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Crear un nuevo usuario (solo admin)
export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // Validar campos obligatorios
    if (!username || !email || !password) {
      res.status(400).json({ 
        error: 'Username, email y password son obligatorios' 
      });
      return;
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (usuarioExiste) {
      res.status(409).json({ 
        error: 'El email o username ya está registrado' 
      });
      return;
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await nuevoUsuario.save();

    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role
      }
    });
  } catch (error: any) {
    console.error('Error en createUsuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar un usuario
export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;
    const userId = req.params.id;

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Preparar objeto de actualización
    const actualizacion: any = {};

    // Actualizar username si se proporciona
    if (username) {
      const usernameExiste = await Usuario.findOne({ 
        username, 
        _id: { $ne: userId } 
      });

      if (usernameExiste) {
        res.status(409).json({ error: 'El username ya está en uso' });
        return;
      }

      actualizacion.username = username;
    }

    // Actualizar email si se proporciona
    if (email) {
      const emailExiste = await Usuario.findOne({ 
        email, 
        _id: { $ne: userId } 
      });

      if (emailExiste) {
        res.status(409).json({ error: 'El email ya está en uso' });
        return;
      }

      actualizacion.email = email;
    }

    // Actualizar password si se proporciona
    if (password) {
      const salt = await bcrypt.genSalt(10);
      actualizacion.password = await bcrypt.hash(password, salt);
    }

    // Actualizar role si se proporciona (solo admin puede cambiar roles)
    if (role && req.userRole === 'admin') {
      actualizacion.role = role;
    }

    // Si no hay nada que actualizar
    if (Object.keys(actualizacion).length === 0) {
      res.status(400).json({ error: 'No hay datos para actualizar' });
      return;
    }

    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      userId,
      actualizacion,
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error: any) {
    console.error('Error en updateUsuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar un usuario
export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ 
      message: 'Usuario eliminado exitosamente',
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email
      }
    });
  } catch (error: any) {
    console.error('Error en deleteUsuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};