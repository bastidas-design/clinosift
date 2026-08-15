const { validationResult } = require('express-validator');
const Cita = require('../models/Cita');
const Paciente = require('../models/Paciente');
const Medico = require('../models/Medico');

const POPULATE_PACIENTE = { path: 'paciente', select: 'nombre documento telefono' };
const POPULATE_MEDICO = { path: 'medico', select: 'nombre especialidad' };

// GET /api/citas
exports.listar = async function (req, res, next) {
  try {
    const citas = await Cita.find()
      .populate(POPULATE_PACIENTE)
      .populate(POPULATE_MEDICO)
      .sort({ fecha: -1, hora: -1 });
    res.json(citas);
  } catch (error) {
    next(error);
  }
};

// GET /api/citas/:id
exports.obtener = async function (req, res, next) {
  try {
    const cita = await Cita.findById(req.params.id).populate(POPULATE_PACIENTE).populate(POPULATE_MEDICO);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    next(error);
  }
};

// POST /api/citas
exports.crear = async function (req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });

  try {
    const paciente = await Paciente.findById(req.body.paciente);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const medico = await Medico.findById(req.body.medico);
    if (!medico) return res.status(404).json({ error: 'Medico no encontrado' });

    const cruce = await Cita.findOne({
      medico: req.body.medico,
      fecha: req.body.fecha,
      hora: req.body.hora,
      estado: { $ne: 'cancelada' }
    });
    if (cruce) return res.status(409).json({ error: 'El medico ya tiene una cita en ese horario' });

    const cita = await Cita.create({
      paciente: req.body.paciente,
      medico: req.body.medico,
      fecha: req.body.fecha,
      hora: req.body.hora,
      estado: req.body.estado || 'pendiente'
    });

    const citaCompleta = await Cita.findById(cita._id).populate(POPULATE_PACIENTE).populate(POPULATE_MEDICO);
    res.status(201).json(citaCompleta);
  } catch (error) {
    next(error);
  }
};

// PUT /api/citas/:id
exports.actualizar = async function (req, res, next) {
  try {
    const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate(POPULATE_PACIENTE)
      .populate(POPULATE_MEDICO);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/citas/:id
exports.eliminar = async function (req, res, next) {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json({ mensaje: 'Cita eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
