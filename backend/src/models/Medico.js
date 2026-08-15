const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    especialidad: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
      trim: true
    },
    telefono: {
      type: String,
      default: null,
      trim: true
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato valido']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medico', medicoSchema);
