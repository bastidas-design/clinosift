const Notificacion = require('../models/Notificacion');

// GET /api/notificaciones
exports.listar = async function (req, res, next) {
  try {
    const notificaciones = await Notificacion.find({ usuario: req.usuario.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const noLeidas = await Notificacion.countDocuments({
      usuario: req.usuario.id,
      leida: false
    });

    res.json({ notificaciones: notificaciones, noLeidas: noLeidas });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notificaciones/:id/leer
exports.marcarLeida = async function (req, res, next) {
  try {
    const notificacion = await Notificacion.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario.id },
      { leida: true },
      { new: true }
    );

    if (!notificacion) {
      return res.status(404).json({ error: 'Notificacion no encontrada' });
    }

    res.json(notificacion);
  } catch (error) {
    next(error);
  }
};

// PUT /api/notificaciones/leer-todas
exports.marcarTodasLeidas = async function (req, res, next) {
  try {
    await Notificacion.updateMany(
      { usuario: req.usuario.id, leida: false },
      { leida: true }
    );

    res.json({ mensaje: 'Notificaciones marcadas como leidas' });
  } catch (error) {
    next(error);
  }
};

// Función interna (no es una ruta): la usan otros controladores, como citaController,
// para generar una notificación cuando pasa algo relevante. Nunca lanza error hacia
// afuera: si falla crear la notificación, no debe tumbar la operación principal (la cita).
exports.crear = async function ({ usuarioId, titulo, mensaje, tipo, citaId }) {
  if (!usuarioId) return null;
  try {
    return await Notificacion.create({
      usuario: usuarioId,
      titulo: titulo,
      mensaje: mensaje,
      tipo: tipo || 'general',
      cita: citaId || null
    });
  } catch (error) {
    console.error('[notificaciones] No se pudo crear la notificacion:', error.message);
    return null;
  }
};
