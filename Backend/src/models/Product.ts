import mongoose, { Schema, Document } from 'mongoose';

// Interface para tipar el documento de Equipo
export interface IEquipo extends Document {
  numeroEquipo: string;
  nombreEquipo: string;
  fechaCompra: Date;
  stock: number;
  observaciones: string;
  lastUpdated: Date;
}

// Schema de Equipo
const equipoSchema: Schema = new Schema({
  numeroEquipo: {
    type: String,
    required: [true, 'El número de equipo es obligatorio'],
    unique: true,
    trim: true
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
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  observaciones: {
    type: String,
    default: '',
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar lastUpdated antes de guardar
equipoSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Middleware para actualizar lastUpdated antes de actualizar
equipoSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

// Exportar el modelo
export default mongoose.model<IEquipo>('Equipo', equipoSchema);