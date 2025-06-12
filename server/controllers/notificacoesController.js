const pool = require('../config/db');

exports.listarNotificacoes = async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const [notificacoes] = await pool.query(
      'SELECT id, mensagem, lida, data_criacao FROM notificacoes WHERE usuario_id = ? ORDER BY data_criacao DESC',
      [usuario_id]
    );

    const naoLidas = notificacoes.filter(n => !n.lida).length;

    res.status(200).json({
      mensagem: 'Notificações encontradas com sucesso',
      notificacoes,
      naoLidas
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

exports.marcarNotificacaoLida = async (req, res) => {
  const { notificacao_id } = req.params;
  const usuario_id = req.usuario.id;

  if (!notificacao_id) {
    return res.status(400).json({ mensagem: 'ID da notificação é obrigatório' });
  }

  try {
    const [notificacoes] = await pool.query(
      'SELECT id FROM notificacoes WHERE id = ? AND usuario_id = ?',
      [notificacao_id, usuario_id]
    );
    if (notificacoes.length === 0) {
      return res.status(404).json({ mensagem: 'Notificação não encontrada ou não pertence ao usuário' });
    }

    await pool.query(
      'UPDATE notificacoes SET lida = TRUE WHERE id = ?',
      [notificacao_id]
    );

    res.status(200).json({ mensagem: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};