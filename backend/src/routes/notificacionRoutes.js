const express = require('express');
const ctrl = require('../controllers/notificacionController');
const { protegerRuta } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protegerRuta, ctrl.listar);
router.put('/leer-todas', protegerRuta, ctrl.marcarTodasLeidas);
router.put('/:id/leer', protegerRuta, ctrl.marcarLeida);

module.exports = router;
