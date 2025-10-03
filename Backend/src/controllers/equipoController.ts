// Backend/src/controllers/equipoController.ts

import { Request, Response } from 'express';
import Equipo from '../models/Equipo';

export const obtenerEquipos = async (req: Request, res: Response): Promise<void> => {
  try {
    const equipos = await Equipo.find().sort({ createdAt: -1 });
    res.json(equipos);
  } catch (error: any) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
};

export const obtenerEquipoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const equipo = await Equipo.findById(id);

    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    res.json(equipo);
  } catch (error: any) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
};

export const crearEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numeroEquipo, nombreEquipo, fechaCompra, stock, observaciones } = req.body;

    if (!numeroEquipo || !nombreEquipo || !fechaCompra || stock === undefined) {
      res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
      return;
    }

    const equipoExiste = await Equipo.findOne({ numeroEquipo });
    if (equipoExiste) {
      res.status(409).json({ error: 'Ya existe un equipo con ese número' });
      return;
    }

    const nuevoEquipo = new Equipo({
      numeroEquipo,
      nombreEquipo,
      fechaCompra,
      stock,
      observaciones: observaciones || ''
    });

    await nuevoEquipo.save();
    console.log('Equipo creado:', nuevoEquipo.numeroEquipo);

    res.status(201).json({
      message: 'Equipo creado exitosamente',
      equipo: nuevoEquipo
    });
  } catch (error: any) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
};

export const actualizarEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { numeroEquipo, nombreEquipo, fechaCompra, stock, observaciones } = req.body;

    const equipo = await Equipo.findById(id);
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    if (numeroEquipo && numeroEquipo !== equipo.numeroEquipo) {
      const equipoExiste = await Equipo.findOne({ numeroEquipo });
      if (equipoExiste) {
        res.status(409).json({ error: 'Ya existe un equipo con ese número' });
        return;
      }
    }

    equipo.numeroEquipo = numeroEquipo || equipo.numeroEquipo;
    equipo.nombreEquipo = nombreEquipo || equipo.nombreEquipo;
    equipo.fechaCompra = fechaCompra || equipo.fechaCompra;
    equipo.stock = stock !== undefined ? stock : equipo.stock;
    equipo.observaciones = observaciones !== undefined ? observaciones : equipo.observaciones;
    equipo.lastUpdated = new Date();

    await equipo.save();

    res.json({
      message: 'Equipo actualizado exitosamente',
      equipo
    });
  } catch (error: any) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
};

export const eliminarEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const equipo = await Equipo.findByIdAndDelete(id);

    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    res.json({
      message: 'Equipo eliminado exitosamente',
      equipo
    });
  } catch (error: any) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
};

export const actualizarStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      res.status(400).json({ error: 'Stock inválido' });
      return;
    }

    const equipo = await Equipo.findById(id);
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    equipo.stock = stock;
    equipo.lastUpdated = new Date();
    await equipo.save();

    res.json({
      message: 'Stock actualizado exitosamente',
      equipo
    });
  } catch (error: any) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
};