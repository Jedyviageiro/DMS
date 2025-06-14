const express = require('express');
const router = express.Router();
const promocoesController = require('../controllers/promocoesController');
const { autenticarToken, isAdmin } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');

// Middleware para validar dados das promoções
const validarPromocao = [
  body('titulo').notEmpty().withMessage('Título é obrigatório'),
  body('desconto_tipo').isIn(['percentual', 'valor_fixo']).withMessage('Tipo de desconto inválido'),
  body('desconto_valor').isFloat({ gt: 0 }).withMessage('Valor do desconto deve ser maior que zero'),
  body('data_inicio').isISO8601().withMessage('Data de início inválida'),
  body('data_fim').isISO8601().withMessage('Data de fim inválida'),
  body('ativo').isBoolean().withMessage('Ativo deve ser booleano'),
  body('aplicavel_em').isIn(['todos', 'marca', 'modelo']).withMessage('Aplicável em inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    next();
  }
];

// Rotas públicas
router.get('/', promocoesController.listarPromocoes);
router.get('/:id', promocoesController.obterPromocaoPorId);

// Rotas protegidas (só admin)
router.post('/', autenticarToken, isAdmin, validarPromocao, promocoesController.criarPromocao);
router.put('/:id', autenticarToken, isAdmin, validarPromocao, promocoesController.atualizarPromocao);
router.delete('/:id', autenticarToken, isAdmin, promocoesController.deletarPromocao);

module.exports = router;
