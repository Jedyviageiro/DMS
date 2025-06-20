const pool = require('../config/db');

exports.listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT id, nome, email, telefone, role FROM usuarios');
    res.status(200).json({ usuarios });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ mensagem: 'Erro ao buscar usuários' });
  }
};

exports.atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, role } = req.body;

  if (!nome || !email || !telefone || !role) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
  }

  try {
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
    if (existente.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já está em uso' });
    }

    await pool.query(
      'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, role = ? WHERE id = ?',
      [nome, email, telefone, role, id]
    );

    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao atualizar' });
  }
};

exports.excluirUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao excluir usuário' });
  }
};
