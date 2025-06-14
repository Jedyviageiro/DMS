const express = require('express');
const router = express.Router();
const { gerarRelatorioPDF, gerarRelatorioExcel } = require('../controllers/relatoriosController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Apenas usuários autenticados (admin ou cliente)
router.get('/relatorios/pdf', autenticarToken, gerarRelatorioPDF);
router.get('/relatorios/excel', autenticarToken, gerarRelatorioExcel);

module.exports = router;
