const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticarToken, isAdmin } = require('../middlewares/authMiddleware');
const reservasController = require('../controllers/reservasController');

router.get('/usuarios', autenticarToken, isAdmin, adminController.listarUsuarios);
router.put('/usuarios/:id', autenticarToken, isAdmin, adminController.atualizarUsuario);
router.delete('/usuarios/:id', autenticarToken, isAdmin, adminController.excluirUsuario);

// Listar todas as reservas (admin)
router.get('/reservas', autenticarToken, isAdmin, reservasController.listarTodasReservas);
// Atualizar status da reserva (admin)
router.put('/reservas/:reserva_id/status', autenticarToken, isAdmin, reservasController.atualizarStatusReserva);
// Marcar reserva como paga (admin)
router.patch('/reservas/:reserva_id/pago', autenticarToken, isAdmin, reservasController.marcarReservaComoPaga);

module.exports = router;
