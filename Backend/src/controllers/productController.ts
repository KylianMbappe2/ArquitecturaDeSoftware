import { Request, Response } from 'express';
import Equipo from '../models/Product';

// Obtener todos los equipos
export const getEquipos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buscar, stockBajo } = req.query;
    let filtro: any = {};

    // Filtro de búsqueda
    if (buscar) {
      filtro.$or = [
        { nombreEquipo: { $regex: buscar, $options: 'i' } },
        { numeroEquipo: { $regex: buscar, $options: 'i' } },
        { observaciones: { $regex: buscar, $options: 'i' } }
      ];
    }

    // Filtro de stock bajo (ejemplo: menos de 10 unidades)
    if (stockBajo === 'true') {
      filtro.stock = { $lt: 10 };
    }

    const equipos = await Equipo.find(filtro).sort({ lastUpdated: -1 });
    res.json(equipos);
  } catch (error: any) {
    console.error('Error en getEquipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
};

// Obtener un equipo por ID
export const getEquipoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const equipo = await Equipo.findById(req.params.id);

    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    res.json(equipo);
  } catch (error: any) {
    console.error('Error en getEquipoById:', error);
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
};

// Crear un nuevo equipo
export const createEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numeroEquipo, nombreEquipo, fechaCompra, stock, observaciones } = req.body;

    // Validar campos obligatorios
    if (!numeroEquipo || !nombreEquipo || !fechaCompra) {
      res.status(400).json({
        error: 'numeroEquipo, nombreEquipo y fechaCompra son obligatorios'
      });
      return;
    }

    // Verificar si el número de equipo ya existe
    const equipoExiste = await Equipo.findOne({ numeroEquipo });
    if (equipoExiste) {
      res.status(409).json({ error: 'El número de equipo ya existe' });
      return;
    }

    // Crear nuevo equipo
    const nuevoEquipo = new Equipo({
      numeroEquipo,
      nombreEquipo,
      fechaCompra,
      stock: stock || 0,
      observaciones: observaciones || ''
    });

    await nuevoEquipo.save();

    res.status(201).json({
      message: 'Equipo creado exitosamente',
      equipo: nuevoEquipo
    });
  } catch (error: any) {
    console.error('Error en createEquipo:', error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
};

// Actualizar un equipo
export const updateEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numeroEquipo, nombreEquipo, fechaCompra, stock, observaciones } = req.body;

    // Verificar que el equipo existe
    const equipoExiste = await Equipo.findById(req.params.id);
    if (!equipoExiste) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    // Si se cambia el número de equipo, verificar que no esté en uso
    if (numeroEquipo && numeroEquipo !== equipoExiste.numeroEquipo) {
      const numeroEnUso = await Equipo.findOne({
        numeroEquipo,
        _id: { $ne: req.params.id }
      });

      if (numeroEnUso) {
        res.status(409).json({ error: 'El número de equipo ya está en uso' });
        return;
      }
    }

    // Actualizar equipo
    const equipoActualizado = await Equipo.findByIdAndUpdate(
      req.params.id,
      {
        numeroEquipo,
        nombreEquipo,
        fechaCompra,
        stock,
        observaciones,
        lastUpdated: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Equipo actualizado exitosamente',
      equipo: equipoActualizado
    });
  } catch (error: any) {
    console.error('Error en updateEquipo:', error);
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
};

// Eliminar un equipo
export const deleteEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const equipo = await Equipo.findByIdAndDelete(req.params.id);

    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    res.json({
      message: 'Equipo eliminado exitosamente',
      equipo: {
        id: equipo._id,
        numeroEquipo: equipo.numeroEquipo,
        nombreEquipo: equipo.nombreEquipo
      }
    });
  } catch (error: any) {
    console.error('Error en deleteEquipo:', error);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
};

// Actualizar solo el stock de un equipo (entrada/salida)
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cantidad, tipo } = req.body; // tipo: 'entrada' o 'salida'

    if (!cantidad || !tipo) {
      res.status(400).json({ error: 'Cantidad y tipo son obligatorios' });
      return;
    }

    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    // Calcular nuevo stock
    let nuevoStock = equipo.stock;
    if (tipo === 'entrada') {
      nuevoStock += cantidad;
    } else if (tipo === 'salida') {
      if (equipo.stock < cantidad) {
        res.status(400).json({ error: 'Stock insuficiente' });
        return;
      }
      nuevoStock -= cantidad;
    } else {
      res.status(400).json({ error: 'Tipo inválido. Usa "entrada" o "salida"' });
      return;
    }

    // Actualizar stock
    equipo.stock = nuevoStock;
    equipo.lastUpdated = new Date();
    await equipo.save();

    res.json({
      message: `${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`,
      equipo: {
        id: equipo._id,
        numeroEquipo: equipo.numeroEquipo,
        nombreEquipo: equipo.nombreEquipo,
        stockAnterior: tipo === 'entrada' ? nuevoStock - cantidad : nuevoStock + cantidad,
        stockActual: nuevoStock,
        cantidad
      }
    });
  } catch (error: any) {
    console.error('Error en updateStock:', error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
};

// Obtener estadísticas de equipos
export const getEstadisticas = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalEquipos = await Equipo.countDocuments();
    const equiposStockBajo = await Equipo.countDocuments({ stock: { $lt: 10 } });
    
    const stockTotal = await Equipo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$stock' }
        }
      }
    ]);

    const equiposSinStock = await Equipo.countDocuments({ stock: 0 });

    res.json({
      totalEquipos,
      equiposStockBajo,
      stockTotal: stockTotal[0]?.total || 0,
      equiposSinStock
    });
  } catch (error: any) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};