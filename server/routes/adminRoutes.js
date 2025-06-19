const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticarToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/usuarios', autenticarToken, isAdmin, adminController.listarUsuarios);
router.put('/usuarios/:id', autenticarToken, isAdmin, adminController.atualizarUsuario);
router.delete('/usuarios/:id', autenticarToken, isAdmin, adminController.excluirUsuario);

module.exports = router;
