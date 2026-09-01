const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificacionSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true
    },
    titulo: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true
    },
    mensaje: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
      trim: true
    },
    tipo: {
      type: String,
      enum: ['cita_creada', 'cita_confirmada', 'cita_completada', 'cita_cancelada', 'general'],
      default: 'general'
    },
    cita: {
      type: Schema.Types.ObjectId,
      ref: 'Cita',
      default: null
    },
    leida: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notificacion', notificacionSchema);
