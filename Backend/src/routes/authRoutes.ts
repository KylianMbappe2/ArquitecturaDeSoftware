import { Router } from 'express';
import { registro, login, verificarAuth } from '../controllers/authController';
import { verificarToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
router.post('/registro', registro);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Público
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/verificar
 * @desc    Verificar token y obtener datos del usuario
 * @access  Privado (requiere token)
 */
router.get('/verificar', verificarToken, verificarAuth);

export default router;