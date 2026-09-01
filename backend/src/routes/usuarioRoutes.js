const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');
const { protegerRuta, permitirRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
'/register',
[
body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
body('tipoDocumento')
.isIn(['cedula', 'tarjeta', 'pasaporte'])
.withMessage('Tipo de documento invalido'),
body('documento').notEmpty().withMessage('El documento es obligatorio'),
body('email').isEmail().withMessage('Email invalido'),
body('password')
.isLength({ min: 6 })
.withMessage('La contraseña debe tener al menos 6 caracteres')
],
authController.registrar
);

router.post(
'/login',
[
body('tipoDocumento')
.isIn(['cedula', 'tarjeta', 'pasaporte'])
.withMessage('Tipo de documento invalido'),
body('documento').notEmpty().withMessage('El documento es obligatorio'),
body('password').notEmpty().withMessage('La contraseña es obligatoria')
],
authController.login
);

router.post(
'/olvide-password',
[
body('tipoDocumento')
.isIn(['cedula', 'tarjeta', 'pasaporte'])
.withMessage('Tipo de documento invalido'),
body('documento').notEmpty().withMessage('El documento es obligatorio')
],
authController.solicitarRecuperacion
);

router.post(
'/restablecer-password',
[
body('token').notEmpty().withMessage('Token invalido'),
body('passwordNueva')
.isLength({ min: 6 })
.withMessage('La contraseña debe tener al menos 6 caracteres')
],
authController.restablecerPassword
);

router.get('/me', protegerRuta, authController.perfil);

router.put('/me/password', protegerRuta, authController.cambiarPassword);

router.get(
'/',
protegerRuta,
permitirRoles('admin'),
usuarioController.listar
);

router.get(
'/',
protegerRuta,
permitirRoles('admin'),
usuarioController.obtener
);

router.put(
'/',
protegerRuta,
permitirRoles('admin'),
usuarioController.actualizar
);

router.delete(
'/',
protegerRuta,
permitirRoles('admin'),
usuarioController.eliminar
);

module.exports = router;
