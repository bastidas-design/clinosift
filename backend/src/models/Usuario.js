const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const usuarioSchema = new Schema(
{
nombre: {
type: String,
required: [true, 'El nombre es obligatorio'],
trim: true
},

tipoDocumento: {
  type: String,
  required: [true, 'El tipo de documento es obligatorio'],
  enum: {
    values: ['cedula', 'tarjeta', 'pasaporte'],
    message: 'Tipo de documento invalido'
  }
},

documento: {
  type: String,
  required: [true, 'El documento es obligatorio'],
  unique: true,
  trim: true
},

email: {
  type: String,
  required: [true, 'El email es obligatorio'],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato valido']
},

password: {
  type: String,
  required: [true, 'La contraseña es obligatoria'],
  minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
},

rol: {
  type: String,
  required: true,
  enum: {
    values: ['admin', 'medico', 'paciente'],
    message: 'El rol debe ser admin, medico o paciente'
  },
  default: 'paciente'
},

resetPasswordToken: {
  type: String,
  default: null,
  select: false
},

resetPasswordExpira: {
  type: Date,
  default: null,
  select: false
}

},
{
timestamps: true
}
);

usuarioSchema.pre('save', async function (next) {
if (!this.isModified('password')) {
return next();
}

const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);

next();
});

usuarioSchema.methods.compararPassword = async function (passwordPlano) {
return bcrypt.compare(passwordPlano, this.password);
};

usuarioSchema.set('toJSON', {
transform: function (doc, ret) {
delete ret.password;
return ret;
}
});

module.exports = mongoose.model('Usuario', usuarioSchema);
