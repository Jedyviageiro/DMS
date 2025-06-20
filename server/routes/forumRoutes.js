const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Forum posts
router.post('/posts', autenticarToken, forumController.criarPost);
router.get('/posts', autenticarToken, forumController.listarPosts);

// Forum replies
router.post('/posts/:post_id/respostas', autenticarToken, forumController.criarResposta);
router.get('/posts/:post_id/respostas', autenticarToken, forumController.listarRespostas);
router.delete('/respostas/:id', autenticarToken, forumController.deleteResposta);
router.post('/usuarios/:id/ban', autenticarToken, forumController.banirUsuario);

module.exports = router; 