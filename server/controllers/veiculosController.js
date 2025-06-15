const pool = require('../config/db');

// Listar veículos com filtros
const listarVeiculos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM veiculos');
    const veiculos = rows.map(veiculo => {
      let imagens = [];
      if (veiculo.imagens == null) {
        imagens = [];
      } else if (typeof veiculo.imagens === 'string') {
        // Try to parse as JSON array, fallback to single image
        try {
          if (veiculo.imagens.trim().startsWith('[')) {
            imagens = JSON.parse(veiculo.imagens);
          } else if (veiculo.imagens.startsWith('data:image')) {
            imagens = [veiculo.imagens];
          } else {
            imagens = [];
          }
        } catch (err) {
          // If parsing fails, treat as single image string
          imagens = veiculo.imagens.startsWith('data:image') ? [veiculo.imagens] : [];
        }
      } else {
        imagens = [];
      }
      return { ...veiculo, imagens };
    });
    res.status(200).json({ mensagem: veiculos.length === 0 ? 'Nenhum veículo encontrado' : 'Veículos encontrados com sucesso', veiculos });
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Entrada no estoque (aumenta a quantidade de um veículo)
const entradaEstoque = async (req, res) => {
  const { id } = req.params;
  const { quantidade } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ mensagem: 'Quantidade inválida' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE veiculos SET estoque = estoque + ? WHERE id = ?',
      [quantidade, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }

    res.status(200).json({ mensagem: 'Entrada de estoque realizada com sucesso' });
  } catch (error) {
    console.error('Erro na entrada de estoque:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Saída do estoque (reduz a quantidade de um veículo)
const saidaEstoque = async (req, res) => {
  const { id } = req.params;
  const { quantidade } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ mensagem: 'Quantidade inválida' });
  }

  try {
    const [rows] = await pool.query('SELECT estoque FROM veiculos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }

    const estoqueAtual = rows[0].estoque;

    if (estoqueAtual < quantidade) {
      return res.status(400).json({ mensagem: 'Estoque insuficiente' });
    }

    await pool.query(
      'UPDATE veiculos SET estoque = estoque - ? WHERE id = ?',
      [quantidade, id]
    );

    res.status(200).json({ mensagem: 'Saída de estoque realizada com sucesso' });
  } catch (error) {
    console.error('Erro na saída de estoque:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Adicionar novo veículo (admin)
const adicionarVeiculo = async (req, res) => {
  try {
    const { marca, modelo, ano, preco, combustivel, descricao, estoque } = req.body;
    const [result] = await pool.query(
      'INSERT INTO veiculos (marca, modelo, ano, preco, combustivel, descricao, estoque) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [marca, modelo, ano, preco, combustivel, descricao, estoque]
    );
    res.status(201).json({ mensagem: 'Veículo adicionado com sucesso', veiculo: { id: result.insertId, marca, modelo, ano, preco, combustivel, descricao, estoque } });
  } catch (error) {
    console.error('Erro ao adicionar veículo:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Atualizar veículo existente (admin)
const atualizarVeiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, ano, preco, combustivel, descricao, estoque } = req.body;
    const [result] = await pool.query(
      'UPDATE veiculos SET marca = ?, modelo = ?, ano = ?, preco = ?, combustivel = ?, descricao = ?, estoque = ? WHERE id = ?',
      [marca, modelo, ano, preco, combustivel, descricao, estoque, id]
    );
    res.status(200).json({ mensagem: 'Veículo atualizado com sucesso', veiculo: { id, marca, modelo, ano, preco, combustivel, descricao, estoque } });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Deletar veículo (admin)
const excluirVeiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM veiculos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }

    res.status(200).json({ mensagem: 'Veículo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ mensagem: 'Erro ao deletar veículo' });
  }
};

module.exports = {
  listarVeiculos,
  adicionarVeiculo,
  atualizarVeiculo,
  excluirVeiculo,
  entradaEstoque,
  saidaEstoque
};