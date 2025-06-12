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