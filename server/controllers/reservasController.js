const pool = require('../config/db');
const { enviarConfirmacaoReserva } = require('../services/emailService');

const criarPreReserva = async (req, res) => {
  const { veiculo_id } = req.body;
  const usuario_id = req.usuario.id;
  let connection;

  if (!veiculo_id) {
    return res.status(400).json({ mensagem: 'ID do veículo é obrigatório' });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    console.log('Usuario ID:', usuario_id);

    const [veiculos] = await connection.query('SELECT * FROM veiculos WHERE id = ? AND estoque > 0', [veiculo_id]);
    if (veiculos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensagem: 'Veículo não encontrado ou sem estoque' });
    }
    const veiculo = veiculos[0];

    const [reservas] = await connection.query(
      'SELECT * FROM reservas WHERE usuario_id = ? AND veiculo_id = ? AND status = ?',
      [usuario_id, veiculo_id, 'pendente']
    );
    if (reservas.length > 0) {
      await connection.rollback();
      return res.status(400).json({ mensagem: 'Você já tem uma reserva pendente para este veículo' });
    }

    const [usuarios] = await connection.query('SELECT nome, email FROM usuarios WHERE id = ?', [usuario_id]);
    console.log('Resultado da query de usuário:', usuarios);
    if (usuarios.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    const usuario = usuarios[0];
    if (!usuario.email) {
      await connection.rollback();
      return res.status(400).json({ mensagem: 'E-mail do usuário não está cadastrado' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) {
      await connection.rollback();
      return res.status(400).json({ mensagem: 'E-mail do usuário é inválido' });
    }

    await connection.query(
      'INSERT INTO reservas (usuario_id, veiculo_id, status) VALUES (?, ?, ?)',
      [usuario_id, veiculo_id, 'pendente']
    );

    await connection.query('UPDATE veiculos SET estoque = estoque - 1 WHERE id = ?', [veiculo_id]);

    try {
      await enviarConfirmacaoReserva(usuario.email, usuario.nome, veiculo);
      await connection.commit();
      res.status(201).json({ mensagem: 'Pré-reserva criada com sucesso. Confirmação enviada por e-mail.' });
    } catch (emailError) {
      await connection.rollback();
      throw emailError;
    }

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao criar pré-reserva:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  } finally {
    if (connection) connection.release();
  }
};

const listarReservasCliente = async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const [reservas] = await pool.query(
      `SELECT r.id, r.veiculo_id, r.data_reserva, r.status, 
              v.marca, v.modelo, v.ano, v.preco
       FROM reservas r
       JOIN veiculos v ON r.veiculo_id = v.id
       WHERE r.usuario_id = ?
       ORDER BY r.data_reserva DESC`,
      [usuario_id]
    );

    res.status(200).json({ 
      mensagem: reservas.length === 0 ? 'Nenhuma reserva encontrada' : 'Reservas encontradas com sucesso', 
      reservas 
    });
  } catch (error) {
    console.error('Erro ao listar reservas:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

const cancelarReserva = async (req, res) => {
  const { reserva_id } = req.params;
  const usuario_id = req.usuario.id;
  let connection;

  if (!reserva_id) {
    return res.status(400).json({ mensagem: 'ID da reserva é obrigatório' });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar se a reserva existe e pertence ao usuário
    const [reservas] = await connection.query(
      'SELECT veiculo_id, status FROM reservas WHERE id = ? AND usuario_id = ?',
      [reserva_id, usuario_id]
    );
    if (reservas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensagem: 'Reserva não encontrada ou não pertence ao usuário' });
    }

    const reserva = reservas[0];
    if (reserva.status !== 'pendente') {
      await connection.rollback();
      return res.status(400).json({ mensagem: 'Apenas reservas pendentes podem ser canceladas' });
    }

    // Atualizar o status da reserva para 'cancelada'
    await connection.query(
      'UPDATE reservas SET status = ? WHERE id = ?',
      ['cancelada', reserva_id]
    );

    // Restaurar o estoque do veículo
    await connection.query(
      'UPDATE veiculos SET estoque = estoque + 1 WHERE id = ?',
      [reserva.veiculo_id]
    );

    await connection.commit();
    res.status(200).json({ mensagem: 'Reserva cancelada com sucesso' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  criarPreReserva,
  listarReservasCliente,
  cancelarReserva
};