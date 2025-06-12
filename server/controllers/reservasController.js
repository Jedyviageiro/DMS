const pool = require('../config/db');
const { enviarConfirmacaoReserva } = require('../services/emailService');

exports.criarPreReserva = async (req, res) => {
  const { veiculo_id } = req.body;
  const usuario_id = req.usuario.id; // Obtido do token JWT

  if (!veiculo_id) {
    return res.status(400).json({ mensagem: 'ID do veículo é obrigatório' });
  }

  try {
    console.log('Usuario ID:', usuario_id); // Log para depuração

    // Verificar se o veículo existe e tem estoque
    const [veiculos] = await pool.query('SELECT * FROM veiculos WHERE id = ? AND estoque > 0', [veiculo_id]);
    if (veiculos.length === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado ou sem estoque' });
    }
    const veiculo = veiculos[0];

    // Verificar se o usuário já tem uma reserva pendente para este veículo
    const [reservas] = await pool.query(
      'SELECT * FROM reservas WHERE usuario_id = ? AND veiculo_id = ? AND status = ?',
      [usuario_id, veiculo_id, 'pendente']
    );
    if (reservas.length > 0) {
      return res.status(400).json({ mensagem: 'Você já tem uma reserva pendente para este veículo' });
    }

    // Obter informações do usuário
    const [usuarios] = await pool.query('SELECT nome, email FROM usuarios WHERE id = ?', [usuario_id]);
    console.log('Resultado da query de usuário:', usuarios); // Log para depuração
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    const usuario = usuarios[0];
    if (!usuario.email) {
      return res.status(400).json({ mensagem: 'E-mail do usuário não está cadastrado' });
    }

    // Criar a pré-reserva
    await pool.query(
      'INSERT INTO reservas (usuario_id, veiculo_id, status) VALUES (?, ?, ?)',
      [usuario_id, veiculo_id, 'pendente']
    );

    // Reduzir o estoque
    await pool.query('UPDATE veiculos SET estoque = estoque - 1 WHERE id = ?', [veiculo_id]);

    // Enviar e-mail de confirmação
    try {
      await enviarConfirmacaoReserva(usuario.email, usuario.nome, veiculo);
    } catch (emailError) {
      // Reverter a reserva e o estoque se o e-mail falhar
      await pool.query('DELETE FROM reservas WHERE usuario_id = ? AND veiculo_id = ? AND status = ?', [usuario_id, veiculo_id, 'pendente']);
      await pool.query('UPDATE veiculos SET estoque = estoque + 1 WHERE id = ?', [veiculo_id]);
      throw emailError;
    }

    res.status(201).json({ mensagem: 'Pré-reserva criada com sucesso. Confirmação enviada por e-mail.' });

  } catch (error) {
    console.error('Erro ao criar pré-reserva:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};