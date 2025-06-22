const pool = require('../config/db');

// Create a new forum post
const criarPost = async (req, res) => {
  const { mensagem, imagem_url } = req.body;
  const usuario_id = req.usuario.id;
  if (!mensagem) return res.status(400).json({ mensagem: 'Mensagem é obrigatória' });
  try {
    const [result] = await pool.query(
      'INSERT INTO forum_posts (usuario_id, mensagem, imagem_url) VALUES (?, ?, ?)',
      [usuario_id, mensagem, imagem_url || null]
    );
    res.status(201).json({ id: result.insertId, mensagem: 'Post criado com sucesso' });
  } catch (err) {
    console.error('Erro ao criar post:', err);
    res.status(500).json({ mensagem: 'Erro ao criar post' });
  }
};

// List all forum posts (with user info, reply count, likes/dislikes, and userLiked)
const listarPosts = async (req, res) => {
  const usuario_id = req.usuario.id;
  try {
    const [posts] = await pool.query(
      `SELECT p.id, p.mensagem, p.imagem_url, p.data_postagem, u.id as usuario_id, u.nome as usuario_nome, u.email as usuario_email, u.role as usuario_role,
        (SELECT COUNT(*) FROM forum_respostas r WHERE r.post_id = p.id) as resposta_count,
        p.likes, p.dislikes,
        (SELECT tipo FROM forum_post_likes WHERE post_id = p.id AND usuario_id = ?) as userLiked
       FROM forum_posts p
       JOIN usuarios u ON p.usuario_id = u.id
       ORDER BY p.data_postagem DESC`,
      [usuario_id]
    );
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Erro ao listar posts:', err);
    res.status(500).json({ mensagem: 'Erro ao buscar posts' });
  }
};

// Create a reply to a post
const criarResposta = async (req, res) => {
  const { post_id } = req.params;
  const { resposta, imagem_url } = req.body;
  const usuario_id = req.usuario.id;
  if (!resposta) return res.status(400).json({ mensagem: 'Resposta é obrigatória' });
  try {
    const [result] = await pool.query(
      'INSERT INTO forum_respostas (post_id, usuario_id, resposta, imagem_url) VALUES (?, ?, ?, ?)',
      [post_id, usuario_id, resposta, imagem_url || null]
    );
    res.status(201).json({ id: result.insertId, mensagem: 'Resposta criada com sucesso' });
  } catch (err) {
    console.error('Erro ao criar resposta:', err);
    res.status(500).json({ mensagem: 'Erro ao criar resposta' });
  }
};

// List all replies for a post (with user info, likes/dislikes, and userLiked)
const listarRespostas = async (req, res) => {
  const { post_id } = req.params;
  const usuario_id = req.usuario.id;
  try {
    const [respostas] = await pool.query(
      `SELECT r.id, r.resposta, r.imagem_url, r.data_resposta, u.id as usuario_id, u.nome as usuario_nome, u.email as usuario_email, u.role as usuario_role,
        r.likes, r.dislikes,
        (SELECT tipo FROM forum_resposta_likes WHERE resposta_id = r.id AND usuario_id = ?) as userLiked
       FROM forum_respostas r
       JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.post_id = ?
       ORDER BY r.data_resposta ASC`,
      [usuario_id, post_id]
    );
    res.status(200).json({ respostas });
  } catch (err) {
    console.error('Erro ao listar respostas:', err);
    res.status(500).json({ mensagem: 'Erro ao buscar respostas' });
  }
};

// Delete a forum reply
const deleteResposta = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM forum_respostas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Resposta não encontrada' });
    }
    res.status(200).json({ mensagem: 'Resposta deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar resposta:', err);
    res.status(500).json({ mensagem: 'Erro ao deletar resposta' });
  }
};

// Ban a user (stub)
const banirUsuario = async (req, res) => {
  const { id } = req.params;
  // Implement your ban logic here (e.g., set a 'banned' flag in the usuarios table)
  // For now, just return success
  res.status(200).json({ mensagem: 'Usuário banido com sucesso (stub)' });
};

// Like or dislike a post
const likeOrDislikePost = async (req, res) => {
  const { postId } = req.params;
  const { tipo } = req.body; // 'like' or 'dislike'
  const usuario_id = req.usuario.id;
  if (!['like', 'dislike'].includes(tipo)) {
    return res.status(400).json({ mensagem: 'Tipo inválido' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM forum_post_likes WHERE post_id = ? AND usuario_id = ?',
      [postId, usuario_id]
    );
    if (rows.length > 0) {
      if (rows[0].tipo === tipo) {
        await pool.query('DELETE FROM forum_post_likes WHERE id = ?', [rows[0].id]);
        await pool.query(`UPDATE forum_posts SET ${tipo}s = ${tipo}s - 1 WHERE id = ?`, [postId]);
        return res.json({ mensagem: `${tipo} removido` });
      } else {
        await pool.query('UPDATE forum_post_likes SET tipo = ? WHERE id = ?', [tipo, rows[0].id]);
        await pool.query(`UPDATE forum_posts SET ${rows[0].tipo}s = ${rows[0].tipo}s - 1, ${tipo}s = ${tipo}s + 1 WHERE id = ?`, [postId]);
        return res.json({ mensagem: `Alterado para ${tipo}` });
      }
    } else {
      await pool.query('INSERT INTO forum_post_likes (post_id, usuario_id, tipo) VALUES (?, ?, ?)', [postId, usuario_id, tipo]);
      await pool.query(`UPDATE forum_posts SET ${tipo}s = ${tipo}s + 1 WHERE id = ?`, [postId]);
      return res.json({ mensagem: `${tipo} adicionado` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao processar like/dislike' });
  }
};

// Like or dislike a reply
const likeOrDislikeReply = async (req, res) => {
  const { respostaId } = req.params;
  const { tipo } = req.body; // 'like' or 'dislike'
  const usuario_id = req.usuario.id;
  if (!['like', 'dislike'].includes(tipo)) {
    return res.status(400).json({ mensagem: 'Tipo inválido' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM forum_resposta_likes WHERE resposta_id = ? AND usuario_id = ?',
      [respostaId, usuario_id]
    );
    if (rows.length > 0) {
      if (rows[0].tipo === tipo) {
        await pool.query('DELETE FROM forum_resposta_likes WHERE id = ?', [rows[0].id]);
        await pool.query(`UPDATE forum_respostas SET ${tipo}s = ${tipo}s - 1 WHERE id = ?`, [respostaId]);
        return res.json({ mensagem: `${tipo} removido` });
      } else {
        await pool.query('UPDATE forum_resposta_likes SET tipo = ? WHERE id = ?', [tipo, rows[0].id]);
        await pool.query(`UPDATE forum_respostas SET ${rows[0].tipo}s = ${rows[0].tipo}s - 1, ${tipo}s = ${tipo}s + 1 WHERE id = ?`, [respostaId]);
        return res.json({ mensagem: `Alterado para ${tipo}` });
      }
    } else {
      await pool.query('INSERT INTO forum_resposta_likes (resposta_id, usuario_id, tipo) VALUES (?, ?, ?)', [respostaId, usuario_id, tipo]);
      await pool.query(`UPDATE forum_respostas SET ${tipo}s = ${tipo}s + 1 WHERE id = ?`, [respostaId]);
      return res.json({ mensagem: `${tipo} adicionado` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao processar like/dislike' });
  }
};

// Delete a forum post
const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM forum_respostas WHERE post_id = ?', [id]);
    await pool.query('DELETE FROM forum_post_likes WHERE post_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM forum_posts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Post não encontrado' });
    }
    res.status(200).json({ mensagem: 'Post deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar post:', err);
    res.status(500).json({ mensagem: 'Erro ao deletar post' });
  }
};

module.exports = {
  criarPost,
  listarPosts,
  criarResposta,
  listarRespostas,
  deleteResposta,
  banirUsuario,
  likeOrDislikePost,
  likeOrDislikeReply,
  deletePost
}; 