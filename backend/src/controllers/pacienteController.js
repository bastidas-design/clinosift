const { validationResult } = require('express-validator');
const Paciente = require('../models/Paciente');
const Usuario = require('../models/Usuario');

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
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    let datos = req.body;

    // Un paciente solo puede editar su propio registro, y solo sus datos de contacto/foto
    if (req.usuario.rol === 'paciente') {
      let documentoUsuario = req.usuario.documento;

      // Sesiones abiertas antes de que el token empezara a incluir "documento":
      // se busca en la base de datos en vez de bloquear el guardado.
      if (!documentoUsuario) {
        const usuario = await Usuario.findById(req.usuario.id);
        documentoUsuario = usuario ? usuario.documento : null;
      }

      if (String(paciente.documento) !== String(documentoUsuario)) {
        return res.status(403).json({ error: 'No tiene permisos para editar este paciente' });
      }
      const permitidos = ['telefono', 'direccion', 'email', 'ciudad', 'fechaNacimiento', 'genero', 'foto'];
      datos = {};
      permitidos.forEach(function (campo) {
        if (req.body[campo] !== undefined) datos[campo] = req.body[campo];
      });
    }

    const actualizado = await Paciente.findByIdAndUpdate(req.params.id, datos, {
      new: true,
      runValidators: true
    });
    res.json(actualizado);
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
