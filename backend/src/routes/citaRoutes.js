const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/citaController');
const { protegerRuta } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protegerRuta);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

router.post(
  '/',
  [
    body('paciente').isMongoId().withMessage('paciente debe ser un ObjectId valido'),
    body('medico').isMongoId().withMessage('medico debe ser un ObjectId valido'),
    body('fecha').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('fecha debe tener formato YYYY-MM-DD'),
    body('hora').matches(/^\d{2}:\d{2}$/).withMessage('hora debe tener formato HH:MM')
  ],
  ctrl.crear
);

router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
