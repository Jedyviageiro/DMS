const express = require('express');
const router = express.Router();
const { listarNotificacoes, marcarNotificacaoLida } = require('../controllers/notificacoesController');
const { autenticarToken, isCliente } = require('../middlewares/authMiddleware');

router.get('/notificacoes', autenticarToken, isCliente, listarNotificacoes);
router.put('/notificacoes/:notificacao_id/lida', autenticarToken, isCliente, marcarNotificacaoLida);

module.exports = router;