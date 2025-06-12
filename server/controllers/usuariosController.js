const pool = require('../config/db');

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