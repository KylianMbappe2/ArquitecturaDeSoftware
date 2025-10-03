// Backend/src/models/Equipo.ts

import { Schema, model, Document, models } from 'mongoose';

export interface IEquipo extends Document {
  numeroEquipo: string;
  nombreEquipo: string;
  fechaCompra: Date;
  stock: number;
  observaciones: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const equipoSchema = new Schema({
  numeroEquipo: {
    type: String,
    required: [true, 'El número de equipo es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true
  },
  nombreEquipo: {
    type: String,
    required: [true, 'El nombre del equipo es obligatorio'],
    trim: true
  },
  fechaCompra: {
    type: Date,
    required: [true, 'La fecha de compra es obligatoria']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  observaciones: {
    type: String,
    trim: true,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Verifica si el modelo ya existe antes de crearlo
export default models.Equipo || model<IEquipo>('Equipo', equipoSchema);