const mongoose = require('mongoose');
const { Schema } = mongoose;

const pacienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    documento: {
      type: String,
      required: [true, 'El documento es obligatorio'],
      unique: true,
      trim: true
    },    edad: {
      type: Number,
      required: [true, 'La edad es obligatoria'],
      min: [0, 'La edad no puede ser negativa'],
      max: [120, 'La edad no es valida']
    },
    telefono: {
      type: String,
      default: null,
      trim: true
    },
    direccion: {
      type: String,
      default: null,
      trim: true
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    ciudad: {
      type: String,
      default: null,
      trim: true
    },
    fechaNacimiento: {
      type: String,
      default: null
    },
    genero: {
      type: String,
      default: null,
      trim: true
    },
    foto: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Paciente', pacienteSchema);
