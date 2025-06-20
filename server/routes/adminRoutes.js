const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticarToken, isAdmin } = require('../middlewares/authMiddleware');
<<<<<<< HEAD
const reservasController = require('../controllers/reservasController');
=======
>>>>>>> b8c950df1db816c1bccb1d2262b0f65792127105

router.get('/usuarios', autenticarToken, isAdmin, adminController.listarUsuarios);
router.put('/usuarios/:id', autenticarToken, isAdmin, adminController.atualizarUsuario);
router.delete('/usuarios/:id', autenticarToken, isAdmin, adminController.excluirUsuario);

<<<<<<< HEAD
// Listar todas as reservas (admin)
router.get('/reservas', autenticarToken, isAdmin, reservasController.listarTodasReservas);
// Atualizar status da reserva (admin)
router.put('/reservas/:reserva_id/status', autenticarToken, isAdmin, reservasController.atualizarStatusReserva);

=======
>>>>>>> b8c950df1db816c1bccb1d2262b0f65792127105
module.exports = router;
