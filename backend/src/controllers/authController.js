const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario._id.toString(), nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

// POST /api/usuarios/register
exports.registrar = async function (req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

  try {
    const existente = await Usuario.findOne({ email: req.body.email });
    if (existente) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });

    const usuario = await Usuario.create({
      nombre: req.body.nombre,
      email: req.body.email,
      password: req.body.password,
      rol: req.body.rol || 'paciente'
    });

    const token = firmarToken(usuario);
    res.status(201).json({ usuario: usuario.toJSON(), token: token });
  } catch (error) {
    next(error);
  }
};

// POST /api/usuarios/login
exports.login = async function (req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

  try {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario) return res.status(401).json({ error: 'Credenciales invalidas' });

    const passwordValida = await usuario.compararPassword(req.body.password);
    if (!passwordValida) return res.status(401).json({ error: 'Credenciales invalidas' });

    const token = firmarToken(usuario);
    res.json({ usuario: usuario.toJSON(), token: token });
  } catch (error) {
    next(error);
  }
};

// GET /api/usuarios/me
exports.perfil = function (req, res) {
  res.json({ usuario: req.usuario });
};
