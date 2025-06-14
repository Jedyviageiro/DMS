const pool = require('../config/db');

// Listar veículos com filtros
exports.listarVeiculos = async (req, res) => {
  const { marca, precoMin, precoMax, combustivel } = req.query;

  try {
    // Montar a query base
    let query = 'SELECT * FROM veiculos WHERE 1=1';
    const params = [];

    // Filtro por marca (case-insensitive)
    if (marca) {
      query += ' AND LOWER(marca) LIKE LOWER(?)';
      params.push(`%${marca}%`);
    }

    // Filtro por faixa de preço
    if (precoMin) {
      query += ' AND preco >= ?';
      params.push(precoMin);
    }
    if (precoMax) {
      query += ' AND preco <= ?';
      params.push(precoMax);
    }

    // Filtro por combustível
    if (combustivel) {
      query += ' AND combustivel = ?';
      params.push(combustivel);
    }

    // Executar a query
    const [rows] = await pool.query(query, params);

    // Verificar se há resultados
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhum veículo encontrado' });
    }

    // Retornar os veículos encontrados
    res.json({
      mensagem: 'Veículos encontrados com sucesso',
      veiculos: rows
    });

  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};
// Entrada no estoque (aumenta a quantidade de um veículo)
exports.entradaEstoque = async (req, res) => {
  const { id } = req.params; // ID do veículo passado na URL
  const { quantidade } = req.body; // Quantidade a ser adicionada no corpo da requisição

  // Valida se a quantidade é válida
  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ mensagem: 'Quantidade inválida' });
  }

  try {
    // Atualiza o campo estoque somando a quantidade informada
    const [result] = await pool.query(
      'UPDATE veiculos SET estoque = estoque + ? WHERE id = ?',
      [quantidade, id]
    );

    // Verifica se o veículo existe
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }

    // Sucesso
    res.status(200).json({ mensagem: 'Entrada de estoque realizada com sucesso' });
  } catch (error) {
    console.error('Erro na entrada de estoque:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Saída do estoque (reduz a quantidade de um veículo)
exports.saidaEstoque = async (req, res) => {
  const { id } = req.params; // ID do veículo passado na URL
  const { quantidade } = req.body; // Quantidade a ser removida

  // Valida se a quantidade é válida
  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ mensagem: 'Quantidade inválida' });
  }

  try {
    // Primeiro busca o estoque atual do veículo
    const [rows] = await pool.query('SELECT estoque FROM veiculos WHERE id = ?', [id]);

    // Verifica se o veículo foi encontrado
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }

    const estoqueAtual = rows[0].estoque;

    // Verifica se há estoque suficiente para remover
    if (estoqueAtual < quantidade) {
      return res.status(400).json({ mensagem: 'Estoque insuficiente' });
    }

    // Atualiza o estoque subtraindo a quantidade informada
    await pool.query(
      'UPDATE veiculos SET estoque = estoque - ? WHERE id = ?',
      [quantidade, id]
    );

    // Sucesso
    res.status(200).json({ mensagem: 'Saída de estoque realizada com sucesso' });
  } catch (error) {
    console.error('Erro na saída de estoque:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};
