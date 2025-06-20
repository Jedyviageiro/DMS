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

// List all forum posts (with user info and reply count)
const listarPosts = async (req, res) => {
  try {
    const [posts] = await pool.query(
      `SELECT p.id, p.mensagem, p.imagem_url, p.data_postagem, u.id as usuario_id, u.nome as usuario_nome, u.email as usuario_email, u.role as usuario_role,
        (SELECT COUNT(*) FROM forum_respostas r WHERE r.post_id = p.id) as resposta_count
       FROM forum_posts p
       JOIN usuarios u ON p.usuario_id = u.id
       ORDER BY p.data_postagem DESC`
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

// List all replies for a post (with user info)
const listarRespostas = async (req, res) => {
  const { post_id } = req.params;
  try {
    const [respostas] = await pool.query(
      `SELECT r.id, r.resposta, r.imagem_url, r.data_resposta, u.id as usuario_id, u.nome as usuario_nome, u.email as usuario_email, u.role as usuario_role
       FROM forum_respostas r
       JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.post_id = ?
       ORDER BY r.data_resposta ASC`,
      [post_id]
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

module.exports = {
  criarPost,
  listarPosts,
  criarResposta,
  listarRespostas,
  deleteResposta,
  banirUsuario
}; 