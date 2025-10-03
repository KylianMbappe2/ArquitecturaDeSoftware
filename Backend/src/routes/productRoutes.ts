import { Router } from 'express';
import {
  getEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  updateStock,
  getEstadisticas
} from '../controllers/productController';
import { verificarToken, soloAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/equipos/estadisticas
 * @desc    Obtener estadísticas generales de equipos
 * @access  Privado (requiere token)
 */
router.get('/estadisticas', verificarToken, getEstadisticas);

/**
 * @route   GET /api/equipos
 * @desc    Obtener todos los equipos (con filtros opcionales)
 * @access  Privado (requiere token)
 * @query   buscar - Buscar por nombre, número o observaciones
 * @query   stockBajo - Filtrar equipos con stock bajo (true/false)
 */
router.get('/', verificarToken, getEquipos);

/**
 * @route   GET /api/equipos/:id
 * @desc    Obtener un equipo por ID
 * @access  Privado (requiere token)
 */
router.get('/:id', verificarToken, getEquipoById);

/**
 * @route   POST /api/equipos
 * @desc    Crear un nuevo equipo
 * @access  Privado (requiere token y ser admin)
 */
router.post('/', verificarToken, soloAdmin, createEquipo);

/**
 * @route   PUT /api/equipos/:id
 * @desc    Actualizar un equipo
 * @access  Privado (requiere token y ser admin)
 */
router.put('/:id', verificarToken, soloAdmin, updateEquipo);

/**
 * @route   PATCH /api/equipos/:id/stock
 * @desc    Actualizar solo el stock de un equipo (entrada/salida)
 * @access  Privado (requiere token)
 * @body    cantidad - Número de unidades
 * @body    tipo - 'entrada' o 'salida'
 */
router.patch('/:id/stock', verificarToken, updateStock);

/**
 * @route   DELETE /api/equipos/:id
 * @desc    Eliminar un equipo
 * @access  Privado (requiere token y ser admin)
 */
router.delete('/:id', verificarToken, soloAdmin, deleteEquipo);

export default router;