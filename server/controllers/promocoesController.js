const pool = require('../config/db');

// Listar todas promoções ativas (ou filtradas)
exports.listarPromocoes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM promocoes WHERE ativo = 1 AND data_fim >= CURDATE()`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    res.status(500).json({ mensagem: 'Erro ao listar promoções' });
  }
};

// Criar uma nova promoção
exports.criarPromocao = async (req, res) => {
  const {
    titulo,
    descricao,
    desconto_tipo,
    desconto_valor,
    data_inicio,
    data_fim,
    ativo,
    aplicavel_em,
    marca,
    modelo
  } = req.body;

  // Validação básica já feita via express-validator (na rota)

  try {
    await pool.query(
      `INSERT INTO promocoes 
      (titulo, descricao, desconto_tipo, desconto_valor, data_inicio, data_fim, ativo, aplicavel_em, marca, modelo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        titulo,
        descricao,
        desconto_tipo,
        desconto_valor,
        data_inicio,
        data_fim,
        ativo ? 1 : 0,
        aplicavel_em,
        marca || null,
        modelo || null
      ]
    );

    res.status(201).json({ mensagem: 'Promoção criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    res.status(500).json({ mensagem: 'Erro ao criar promoção' });
  }
};

// Atualizar uma promoção pelo id
exports.atualizarPromocao = async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    descricao,
    desconto_tipo,
    desconto_valor,
    data_inicio,
    data_fim,
    ativo,
    aplicavel_em,
    marca,
    modelo
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE promocoes SET
        titulo = ?,
        descricao = ?,
        desconto_tipo = ?,
        desconto_valor = ?,
        data_inicio = ?,
        data_fim = ?,
        ativo = ?,
        aplicavel_em = ?,
        marca = ?,
        modelo = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        titulo,
        descricao,
        desconto_tipo,
        desconto_valor,
        data_inicio,
        data_fim,
        ativo ? 1 : 0,
        aplicavel_em,
        marca || null,
        modelo || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Promoção não encontrada' });
    }

    res.json({ mensagem: 'Promoção atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar promoção' });
  }
};

// Deletar promoção pelo id
exports.deletarPromocao = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM promocoes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Promoção não encontrada' });
    }
    res.json({ mensagem: 'Promoção deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar promoção:', error);
    res.status(500).json({ mensagem: 'Erro ao deletar promoção' });
  }
};

// Buscar promoção por id
exports.obterPromocaoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM promocoes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Promoção não encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar promoção:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar promoção' });
  }
};

// Exemplo: aplicar desconto no preço (helper)
exports.aplicarDesconto = (precoOriginal, promocao) => {
  if (!promocao || !promocao.ativo) return precoOriginal;

  if (promocao.desconto_tipo === 'percentual') {
    return precoOriginal - (precoOriginal * (promocao.desconto_valor / 100));
  } else if (promocao.desconto_tipo === 'valor_fixo') {
    return precoOriginal - promocao.desconto_valor;
  }

  return precoOriginal;
};
