// Backend/src/models/User.ts

import mongoose, { Schema, model, Document } from "mongoose";

export interface IUsuario extends Document {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

const usuarioSchema: Schema = new Schema({
    username: {
      type: String, 
      required: [true, 'El username es obligatorio'],
      unique: true, 
      trim: true, 
      minlength: [3, 'El username debe tener al menos 3 caracteres']
    },
    email: {
      type: String, 
      required: [true, 'El email es obligatorio'],
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    password: {
      type: String, 
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false 
    },
    role: {
      type: String, 
      enum: ['admin', 'user'], 
      default: 'user'
    }
}, {
  timestamps: true
});

// Hook de bcrypt DESACTIVADO para usar contraseñas en texto plano
// SOLO PARA DESARROLLO - En producción siempre hashea las contraseñas
/*
import bcrypt from 'bcrypt';

usuarioSchema.pre<IUsuario>('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
*/
 
export default model<IUsuario>('Usuario', usuarioSchema);