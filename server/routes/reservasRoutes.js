const express = require('express');
const router = express.Router();
const { criarPreReserva } = require('../controllers/reservasController');
const { autenticarToken, isCliente } = require('../middlewares/authMiddleware');

router.post('/reservas', autenticarToken, isCliente, criarPreReserva);

module.exports = router;