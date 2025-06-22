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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensagem: 'E-mail inválido' });
  }

  const telefoneRegex = /^\d{9,15}$/;
  if (!telefoneRegex.test(telefone)) {
    return res.status(400).json({ mensagem: 'Telefone inválido (deve conter entre 9 e 15 dígitos)' });
  }

  if (!['admin', 'cliente'].includes(role)) {
    return res.status(400).json({ mensagem: 'Role inválida' });
  }

  try {
    const [existingEmails] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
    if (existingEmails.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já está em uso por outro usuário' });
    }

    await pool.query(
      'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, role = ? WHERE id = ?',
      [nome, email, telefone, role, id]
    );

    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
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

exports.atualizarDadosPessoais = async (req, res) => {
  const { nome, email, telefone } = req.body;
  const usuario_id = req.usuario.id;

  if (!nome || !email || !telefone) {
    return res.status(400).json({ mensagem: 'Nome, e-mail e telefone são obrigatórios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensagem: 'E-mail inválido' });
  }

  const telefoneRegex = /^\d{9,15}$/;
  if (!telefoneRegex.test(telefone)) {
    return res.status(400).json({ mensagem: 'Telefone inválido (deve conter entre 9 e 15 dígitos)' });
  }

  try {
    const [existingEmails] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, usuario_id]);
    if (existingEmails.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já está em uso por outro usuário' });
    }

    await pool.query(
      'UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, email, telefone, usuario_id]
    );

    res.status(200).json({ mensagem: 'Dados pessoais atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar dados pessoais:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

exports.banirUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE usuarios SET banned = 1 WHERE id = ?', [id]);
    res.status(200).json({ mensagem: 'Usuário banido com sucesso' });
  } catch (err) {
    console.error('Erro ao banir usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao banir usuário' });
  }
};
