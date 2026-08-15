const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/medicoController');
const { protegerRuta, permitirRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protegerRuta);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

router.post(
  '/',
  permitirRoles('admin'),
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('especialidad').notEmpty().withMessage('La especialidad es obligatoria'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email invalido')
  ],
  ctrl.crear
);

router.put('/:id', permitirRoles('admin'), ctrl.actualizar);
router.delete('/:id', permitirRoles('admin'), ctrl.eliminar);

module.exports = router;
