const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  atualizarUsuario,
  excluirUsuario,
  atualizarDadosPessoais,
  banirUsuario,
} = require('../controllers/usuariosController');

const { autenticarToken, isAdmin, isCliente } = require('../middlewares/authMiddleware');

// Atualizar perfil do usuário logado (cliente)
router.put('/usuarios/perfil', autenticarToken, isCliente, atualizarDadosPessoais);

// Listar usuários (admin)
router.get('/usuarios', autenticarToken, isAdmin, listarUsuarios);

// Atualizar usuário por ID (admin)
router.put('/usuarios/:id', autenticarToken, isAdmin, atualizarUsuario);

// Excluir usuário por ID (admin)
router.delete('/usuarios/:id', autenticarToken, isAdmin, excluirUsuario);

// Banir usuário por ID (admin)
router.post('/usuarios/:id/ban', autenticarToken, isAdmin, banirUsuario);

module.exports = router;
