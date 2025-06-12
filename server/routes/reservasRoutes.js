const express = require('express');
const router = express.Router();
const { criarPreReserva, listarReservasCliente, cancelarReserva } = require('../controllers/reservasController');
const { autenticarToken, isCliente } = require('../middlewares/authMiddleware');

router.post('/reservas', autenticarToken, isCliente, criarPreReserva);
router.get('/reservas', autenticarToken, isCliente, listarReservasCliente);
router.delete('/reservas/:reserva_id', autenticarToken, isCliente, cancelarReserva);

module.exports = router;