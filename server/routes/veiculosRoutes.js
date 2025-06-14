const express = require('express');
const router = express.Router();
const { listarVeiculos, entradaEstoque, saidaEstoque } = require('../controllers/veiculosController');
const { autenticarToken, isCliente } = require('../middlewares/authMiddleware');

// Endpoint para listar veículos com filtros, restrito a clientes logados
router.get('/veiculos', autenticarToken, isCliente, listarVeiculos);

// Rotas para entrada e saída de veículos, protegidas por autenticação
router.patch('/veiculos/:id/entrada', autenticarToken, entradaEstoque);
router.patch('/veiculos/:id/saida', autenticarToken, saidaEstoque);

module.exports = router;
