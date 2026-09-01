const mongoose = require('mongoose');
const { Schema } = mongoose;

const citaSchema = new Schema(
  {
    paciente: {
      type: Schema.Types.ObjectId,
      ref: 'Paciente',
      required: [true, 'La cita debe tener un paciente asociado']
    },
    medico: {
      type: Schema.Types.ObjectId,
      ref: 'Medico',
      required: [true, 'La cita debe tener un medico asociado']
    },
    fecha: {
      type: String,
      required: [true, 'La fecha es obligatoria'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD']
    },
    hora: {
      type: String,
      required: [true, 'La hora es obligatoria'],
      match: [/^\d{2}:\d{2}$/, 'La hora debe tener formato HH:MM']
    },
    motivo: {
      type: String,
      required: [true, 'El motivo de consulta es obligatorio'],
      trim: true
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
      default: 'pendiente'
    }
  },
  { timestamps: true }
);

citaSchema.index({ medico: 1, fecha: 1, hora: 1 });
citaSchema.index({ paciente: 1 });

module.exports = mongoose.model('Cita', citaSchema);