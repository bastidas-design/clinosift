const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/pacienteController');
const { protegerRuta, permitirRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protegerRuta);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

router.post(
  '/',
  permitirRoles('admin', 'medico'),
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('documento').notEmpty().withMessage('El documento es obligatorio'),
    body('edad').isInt({ min: 0, max: 120 }).withMessage('La edad debe ser un numero valido')
  ],
  ctrl.crear
);

router.put('/:id', permitirRoles('admin', 'medico', 'paciente'), ctrl.actualizar);
router.delete('/:id', permitirRoles('admin'), ctrl.eliminar);

module.exports = router;
