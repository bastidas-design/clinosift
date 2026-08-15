function manejadorErrores(err, req, res, next) {
  console.error(err);

  // Errores de validacion de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map(function (e) { return e.message; });
    return res.status(400).json({ error: 'Error de validacion', detalles: mensajes });
  }

  // Errores de duplicado (indice unico)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: 'Ya existe un registro con ese ' + campo });
  }

  // Errores de ObjectId invalido
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Identificador invalido: ' + err.value });
  }

  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
}

module.exports = manejadorErrores;
