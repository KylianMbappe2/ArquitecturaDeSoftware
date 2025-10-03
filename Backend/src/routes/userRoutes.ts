import { Router } from 'express';
import { 
  getUsuarios, 
  getUsuarioById, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} from '../controllers/userController';
import { verificarToken, soloAdmin, soloUsuarioOAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/usuarios
 * @desc    Obtener todos los usuarios
 * @access  Privado (requiere token y ser admin)
 */
router.get('/', verificarToken, soloAdmin, getUsuarios);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener un usuario por ID
 * @access  Privado (requiere token y ser el mismo usuario o admin)
 */
router.get('/:id', verificarToken, soloUsuarioOAdmin, getUsuarioById);

/**
 * @route   POST /api/usuarios
 * @desc    Crear un nuevo usuario
 * @access  Privado (requiere token y ser admin)
 */
router.post('/', verificarToken, soloAdmin, createUsuario);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar un usuario
 * @access  Privado (requiere token y ser el mismo usuario o admin)
 */
router.put('/:id', verificarToken, soloUsuarioOAdmin, updateUsuario);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Eliminar un usuario
 * @access  Privado (requiere token y ser admin)
 */
router.delete('/:id', verificarToken, soloAdmin, deleteUsuario);

export default router;