const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const Paciente = require('../models/Paciente');
const { enviarCorreo } = require('../utils/mailer');

function firmarToken(usuario) {
return jwt.sign(
{
id: usuario._id.toString(),
nombre: usuario.nombre,
email: usuario.email,
rol: usuario.rol,
documento: usuario.documento
},
process.env.JWT_SECRET,
{
expiresIn: process.env.JWT_EXPIRES_IN || '8h'
}
);
}

exports.registrar = async function (req, res, next) {
const errores = validationResult(req);

if (!errores.isEmpty()) {
return res.status(400).json({
errores: errores.array()
});
}

try {
const {
nombre,
tipoDocumento,
documento,
email,
password
} = req.body;

const usuarioPorEmail = await Usuario.findOne({ email });

if (usuarioPorEmail) {
  return res.status(409).json({
    error: 'Ya existe un usuario con ese email'
  });
}

const usuarioPorDocumento = await Usuario.findOne({ documento });

if (usuarioPorDocumento) {
  return res.status(409).json({
    error: 'Ya existe una cuenta con ese numero de documento'
  });
}

const pacienteExistente = await Paciente.findOne({ documento });

if (pacienteExistente) {
  return res.status(409).json({
    error: 'Ya existe un paciente con ese numero de documento'
  });
}

const usuario = await Usuario.create({
  nombre,
  tipoDocumento,
  documento,
  email,
  password,
  rol: 'paciente'
});

const paciente = await Paciente.create({
  nombre,
  documento,
  edad: 0,
  telefono: null,
  direccion: null
});

const token = firmarToken(usuario);

res.status(201).json({
  usuario: usuario.toJSON(),
  paciente,
  token
});

} catch (error) {
next(error);
}
};

exports.login = async function (req, res, next) {
const errores = validationResult(req);

if (!errores.isEmpty()) {
return res.status(400).json({
errores: errores.array()
});
}

try {
const {
tipoDocumento,
documento,
password
} = req.body;

const usuario = await Usuario.findOne({
  tipoDocumento,
  documento
});

if (!usuario) {
  return res.status(401).json({
    error: 'Credenciales invalidas'
  });
}

const passwordValida = await usuario.compararPassword(password);

if (!passwordValida) {
  return res.status(401).json({
    error: 'Credenciales invalidas'
  });
}

const token = firmarToken(usuario);

res.json({
  usuario: usuario.toJSON(),
  token
});

} catch (error) {
next(error);
}
};

exports.perfil = function (req, res) {
res.json({
usuario: req.usuario
});
};

// PUT /api/usuarios/me/password — el usuario autenticado cambia su propia contraseña
exports.cambiarPassword = async function (req, res, next) {
try {
const { passwordActual, passwordNueva } = req.body;

if (!passwordActual || !passwordNueva) {
  return res.status(400).json({ error: 'Debe indicar la contraseña actual y la nueva' });
}

if (passwordNueva.length < 6) {
  return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
}

const usuario = await Usuario.findById(req.usuario.id);

if (!usuario) {
  return res.status(404).json({ error: 'Usuario no encontrado' });
}

const passwordValida = await usuario.compararPassword(passwordActual);

if (!passwordValida) {
  return res.status(401).json({ error: 'La contraseña actual no es correcta' });
}

usuario.password = passwordNueva;
await usuario.save();

res.json({ mensaje: 'Contraseña actualizada correctamente' });
} catch (error) {
next(error);
}
};

const MENSAJE_GENERICO = 'Si el documento existe, enviamos un enlace de recuperación al correo registrado.';

// POST /api/usuarios/olvide-password
// Body: { tipoDocumento, documento }
exports.solicitarRecuperacion = async function (req, res, next) {
try {
const errores = validationResult(req);
if (!errores.isEmpty()) {
  return res.status(400).json({ errores: errores.array() });
}

const { tipoDocumento, documento } = req.body;

if (!tipoDocumento || !documento) {
  return res.status(400).json({ error: 'Debe indicar el tipo y número de documento' });
}

// Siempre respondemos lo mismo, exista o no el documento, para no revelar
// qué documentos están registrados en el sistema.
const usuario = await Usuario.findOne({ tipoDocumento: tipoDocumento, documento: documento });

if (usuario) {
  const tokenPlano = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

  usuario.resetPasswordToken = tokenHash;
  usuario.resetPasswordExpira = new Date(Date.now() + 20 * 60 * 1000); // 20 minutos
  await usuario.save();

  if (!process.env.FRONTEND_URL) {
    console.log('[olvide-password] No hay FRONTEND_URL en el .env; usando http://127.0.0.1:5500/frontend por defecto (ajusta esto a como abres tu frontend).');
  }
  const baseFrontend = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/frontend';
  const enlace = baseFrontend.replace(/\/$/, '') + '/restablecer.html?token=' + tokenPlano;

  try {
    await enviarCorreo({
      to: usuario.email,
      subject: 'Recupera tu contraseña — ClinoSift',
      html:
        '<p>Hola ' + usuario.nombre + ',</p>' +
        '<p>Recibimos una solicitud para restablecer tu contraseña en ClinoSift.</p>' +
        '<p><a href="' + enlace + '">Haz clic aquí para crear una nueva contraseña</a></p>' +
        '<p>Este enlace es válido por 20 minutos. Si tú no solicitaste este cambio, ignora este correo.</p>'
    });
  } catch (errorCorreo) {
    console.error('[olvide-password] No se pudo enviar el correo:', errorCorreo.message);
  }
}

res.json({ mensaje: MENSAJE_GENERICO });
} catch (error) {
next(error);
}
};

// POST /api/usuarios/restablecer-password
// Body: { token, passwordNueva }
exports.restablecerPassword = async function (req, res, next) {
try {
const errores = validationResult(req);
if (!errores.isEmpty()) {
  return res.status(400).json({ errores: errores.array() });
}

const { token, passwordNueva } = req.body;

if (!token || !passwordNueva) {
  return res.status(400).json({ error: 'Solicitud inválida' });
}

if (passwordNueva.length < 6) {
  return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
}

const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

const usuario = await Usuario.findOne({
  resetPasswordToken: tokenHash,
  resetPasswordExpira: { $gt: new Date() }
}).select('+resetPasswordToken +resetPasswordExpira');

if (!usuario) {
  return res.status(400).json({ error: 'El enlace no es válido o ya expiró. Solicita uno nuevo.' });
}

usuario.password = passwordNueva;
usuario.resetPasswordToken = null;
usuario.resetPasswordExpira = null;
await usuario.save();

res.json({ mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
} catch (error) {
next(error);
}
};
