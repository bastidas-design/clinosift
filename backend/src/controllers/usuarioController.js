const Usuario = require('../models/Usuario');

// GET /api/usuarios
exports.listar = async function (req, res, next) {
  try {
    const usuarios = await Usuario.find().sort({ nombre: 1 });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

// GET /api/usuarios/:id
exports.obtener = async function (req, res, next) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

// PUT /api/usuarios/:id
exports.actualizar = async function (req, res, next) {
  try {
    const datos = { nombre: req.body.nombre, email: req.body.email, rol: req.body.rol };
    if (req.body.password) datos.password = req.body.password;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    Object.keys(datos).forEach(function (campo) {
      if (datos[campo] !== undefined) usuario[campo] = datos[campo];
    });

    await usuario.save(); // dispara el pre('save') que re-encripta password si cambio
    res.json(usuario.toJSON());
  } catch (error) {
    next(error);
  }
};

// DELETE /api/usuarios/:id
exports.eliminar = async function (req, res, next) {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
