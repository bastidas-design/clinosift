const { validationResult } = require('express-validator');
const Paciente = require('../models/Paciente');

// GET /api/pacientes
exports.listar = async function (req, res, next) {
  try {
    const pacientes = await Paciente.find().sort({ nombre: 1 });
    res.json(pacientes);
  } catch (error) {
    next(error);
  }
};

// GET /api/pacientes/:id
exports.obtener = async function (req, res, next) {
  try {
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error) {
    next(error);
  }
};

// POST /api/pacientes
exports.crear = async function (req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

  try {
    const paciente = await Paciente.create({
      nombre: req.body.nombre,
      documento: req.body.documento,
      edad: req.body.edad,
      telefono: req.body.telefono || null,
      direccion: req.body.direccion || null
    });
    res.status(201).json(paciente);
  } catch (error) {
    next(error);
  }
};

// PUT /api/pacientes/:id
exports.actualizar = async function (req, res, next) {
  try {
    const paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pacientes/:id
exports.eliminar = async function (req, res, next) {
  try {
    const paciente = await Paciente.findByIdAndDelete(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json({ mensaje: 'Paciente eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
