const express = require('express');
const router = express.Router();
const { listarVeiculos } = require('../controllers/veiculosController');
const { autenticarToken, isCliente } = require('../middlewares/authMiddleware'); // Ajuste o caminho se o arquivo de middlewares tiver outro nome

// Endpoint para listar veículos com filtros, restrito a clientes logados
router.get('/veiculos', autenticarToken, isCliente, listarVeiculos);

module.exports = router;