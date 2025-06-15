const express = require('express');
const router = express.Router();
const { autenticarToken, isAdmin } = require('../middlewares/authMiddleware');
const {
  listarVeiculos,
  adicionarVeiculo,
  atualizarVeiculo,
  excluirVeiculo
} = require('../controllers/veiculosController');

// Listar veículos (público)
router.get('/veiculos', listarVeiculos);

// Rotas administrativas
router.post('/veiculos', autenticarToken, isAdmin, adicionarVeiculo);
router.put('/veiculos/:id', autenticarToken, isAdmin, atualizarVeiculo);
router.delete('/veiculos/:id', autenticarToken, isAdmin, excluirVeiculo);

module.exports = router;
