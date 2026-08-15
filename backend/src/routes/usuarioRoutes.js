const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');
const { protegerRuta, permitirRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Autenticacion (publicas) ---
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email invalido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol').optional().isIn(['admin', 'medico', 'paciente']).withMessage('Rol invalido')
  ],
  authController.registrar
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  authController.login
);

// --- Rutas protegidas ---
router.get('/me', protegerRuta, authController.perfil);
router.get('/', protegerRuta, permitirRoles('admin'), usuarioController.listar);
router.get('/:id', protegerRuta, permitirRoles('admin'), usuarioController.obtener);
router.put('/:id', protegerRuta, permitirRoles('admin'), usuarioController.actualizar);
router.delete('/:id', protegerRuta, permitirRoles('admin'), usuarioController.eliminar);

module.exports = router;
