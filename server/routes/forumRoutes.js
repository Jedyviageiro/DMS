const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { autenticarToken } = require('../middlewares/authMiddleware');
const { likeOrDislikePost, likeOrDislikeReply, deletePost } = require('../controllers/forumController');

// Forum posts
router.post('/posts', autenticarToken, forumController.criarPost);
router.get('/posts', autenticarToken, forumController.listarPosts);
router.delete('/posts/:id', autenticarToken, deletePost);

// Forum replies
router.post('/posts/:post_id/respostas', autenticarToken, forumController.criarResposta);
router.get('/posts/:post_id/respostas', autenticarToken, forumController.listarRespostas);
router.delete('/respostas/:id', autenticarToken, forumController.deleteResposta);
router.post('/usuarios/:id/ban', autenticarToken, forumController.banirUsuario);

// Like/dislike posts
router.post('/posts/:postId/like', autenticarToken, likeOrDislikePost);

// Like/dislike replies
router.post('/respostas/:respostaId/like', autenticarToken, likeOrDislikeReply);

module.exports = router; 