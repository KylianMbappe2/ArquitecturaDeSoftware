// Backend/src/routes/equipoRoutes.ts

import { Router } from 'express';
import {
  obtenerEquipos,
  obtenerEquipoPorId,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  actualizarStock
} from '../controllers/equipoController';
import { verificarToken } from '../middleware/auth';

const router = Router();

router.use(verificarToken); // CAMBIO AQUÍ: de auth a verificarToken

router.get('/', obtenerEquipos);
router.get('/:id', obtenerEquipoPorId);
router.post('/', crearEquipo);
router.put('/:id', actualizarEquipo);
router.patch('/:id/stock', actualizarStock);
router.delete('/:id', eliminarEquipo);

export default router;