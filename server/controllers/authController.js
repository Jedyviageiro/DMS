const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// LOGIN
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }

    const user = rows[0];

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// SIGNUP
exports.signup = async (req, res) => {
  const { nome, email, telefone, senha, role } = req.body;

  if (!nome || !email || !senha || !role) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios' });
  }

  try {
    const [existe] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(409).json({ mensagem: 'Email já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    await pool.query(
      'INSERT INTO usuarios (nome, email, telefone, senha, role) VALUES (?, ?, ?, ?, ?)',
      [nome, email, telefone || '', senhaCriptografada, role]
    );

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });

  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};
