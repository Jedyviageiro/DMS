const express = require('express');
const router = express.Router();
const { atualizarDadosPessoais } = require('../controllers/usuariosController');
const { autenticarToken, isCliente } = require('../middlewares/authMiddleware');

router.put('/usuarios/perfil', autenticarToken, isCliente, atualizarDadosPessoais);

module.exports = router;