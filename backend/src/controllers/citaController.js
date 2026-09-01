const { validationResult } = require('express-validator');
const Cita = require('../models/Cita');
const Paciente = require('../models/Paciente');
const Medico = require('../models/Medico');
const Usuario = require('../models/Usuario');
const notificacionController = require('./notificacionController');

const POPULATE_PACIENTE = { path: 'paciente', select: 'nombre documento telefono' };
const POPULATE_MEDICO = { path: 'medico', select: 'nombre especialidad email' };

// Busca el Usuario (cuenta de acceso) que corresponde a un Paciente o Medico.
// Paciente <-> Usuario se relacionan por documento; Medico <-> Usuario por email,
// que es como ya se vincula el login en el resto del sistema.
async function usuarioDePaciente(pacienteId) {
  const paciente = await Paciente.findById(pacienteId);
  if (!paciente) return null;
  return Usuario.findOne({ documento: paciente.documento });
}

async function usuarioDeMedico(medicoId) {
  const medico = await Medico.findById(medicoId);
  if (!medico || !medico.email) return null;
  return Usuario.findOne({ email: medico.email });
}

const TITULOS_POR_ESTADO = {
  confirmada: 'Tu cita fue confirmada',
  completada: 'Tu cita fue marcada como completada',
  cancelada: 'Tu cita fue cancelada',
  pendiente: 'Tu cita quedó pendiente de confirmación'
};

const TIPOS_POR_ESTADO = {
  confirmada: 'cita_confirmada',
  completada: 'cita_completada',
  cancelada: 'cita_cancelada'
};

async function notificarCambioCita(citaAnterior, citaActual, usuarioQueActua) {
  // Quien actúa nunca se notifica a sí mismo: si actúa el paciente, se notifica al
  // médico, y viceversa.
  const destinatario = usuarioQueActua.rol === 'paciente'
    ? await usuarioDeMedico(citaActual.medico._id || citaActual.medico)
    : await usuarioDePaciente(citaActual.paciente._id || citaActual.paciente);

  if (!destinatario) return;

  const fechaHora = citaActual.fecha + ' a las ' + citaActual.hora;

  if (citaActual.estado !== citaAnterior.estado) {
    await notificacionController.crear({
      usuarioId: destinatario._id,
      titulo: TITULOS_POR_ESTADO[citaActual.estado] || 'Tu cita cambió de estado',
      mensaje: 'La cita del ' + fechaHora + ' ahora está: ' + citaActual.estado + '.',
      tipo: TIPOS_POR_ESTADO[citaActual.estado] || 'general',
      citaId: citaActual._id
    });
    return;
  }

  if (citaActual.fecha !== citaAnterior.fecha || citaActual.hora !== citaAnterior.hora) {
    await notificacionController.crear({
      usuarioId: destinatario._id,
      titulo: 'Tu cita fue reprogramada',
      mensaje: 'La nueva fecha y hora es: ' + fechaHora + '.',
      tipo: 'general',
      citaId: citaActual._id
    });
  }
}

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
      motivo: req.body.motivo,
      estado: req.body.estado || 'pendiente'
    });

    const citaCompleta = await Cita.findById(cita._id).populate(POPULATE_PACIENTE).populate(POPULATE_MEDICO);

    const usuarioMedico = await usuarioDeMedico(medico._id);
    if (usuarioMedico) {
      await notificacionController.crear({
        usuarioId: usuarioMedico._id,
        titulo: 'Nueva cita agendada',
        mensaje: paciente.nombre + ' agendó una cita para el ' + cita.fecha + ' a las ' + cita.hora + '.',
        tipo: 'cita_creada',
        citaId: cita._id
      });
    }

    res.status(201).json(citaCompleta);
  } catch (error) {
    next(error);
  }
};

// PUT /api/citas/:id
exports.actualizar = async function (req, res, next) {
  try {
    const citaAnterior = await Cita.findById(req.params.id);
    if (!citaAnterior) return res.status(404).json({ error: 'Cita no encontrada' });

    const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate(POPULATE_PACIENTE)
      .populate(POPULATE_MEDICO);

    if (req.usuario) {
      notificarCambioCita(citaAnterior, cita, req.usuario).catch(function (error) {
        console.error('[citas] No se pudo generar la notificacion:', error.message);
      });
    }

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
