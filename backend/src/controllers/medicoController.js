const { validationResult } = require('express-validator');
const Medico = require('../models/Medico');

// GET /api/medicos
exports.listar = async function (req, res, next) {
  try {
    const medicos = await Medico.find().sort({ nombre: 1 });
    res.json(medicos);
  } catch (error) {
    next(error);
  }
};

// GET /api/medicos/:id
exports.obtener = async function (req, res, next) {
  try {
    const medico = await Medico.findById(req.params.id);
    if (!medico) return res.status(404).json({ error: 'Medico no encontrado' });
    res.json(medico);
  } catch (error) {
    next(error);
  }
};

// POST /api/medicos
exports.crear = async function (req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

  try {
    const medico = await Medico.create({
      nombre: req.body.nombre,
      especialidad: req.body.especialidad,
      telefono: req.body.telefono || null,
      email: req.body.email || null
    });
    res.status(201).json(medico);
  } catch (error) {
    next(error);
  }
};

// PUT /api/medicos/:id
exports.actualizar = async function (req, res, next) {
  try {
    const medico = await Medico.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!medico) return res.status(404).json({ error: 'Medico no encontrado' });
    res.json(medico);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/medicos/:id
exports.eliminar = async function (req, res, next) {
  try {
    const medico = await Medico.findByIdAndDelete(req.params.id);
    if (!medico) return res.status(404).json({ error: 'Medico no encontrado' });
    res.json({ mensaje: 'Medico eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
