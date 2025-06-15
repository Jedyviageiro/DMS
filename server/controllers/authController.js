const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Create admin user
const createAdminUser = async () => {
  try {
    const email = 'admin.novo2@dms.com';
    const senha = '12345678910';
    const nome = 'Admin';
    const role = 'admin';

    // Check if admin already exists
    const [existing] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with non-hashed password for now
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
      [nome, email, senha, role]
    );

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Call createAdminUser when the server starts
createAdminUser();

// LOGIN
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }

    const user = rows[0];
    let senhaCorreta = false;

    // Try direct comparison first (for non-hashed passwords)
    if (senha === user.senha) {
      senhaCorreta = true;
    } else {
      // If direct comparison fails, try bcrypt
      try {
        senhaCorreta = await bcrypt.compare(senha, user.senha);
      } catch (error) {
        console.error('Error comparing passwords:', error);
      }
    }

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

    // Ensure role is either 'admin' or 'cliente'
    const userRole = role === 'admin' ? 'admin' : 'cliente';

    await pool.query(
      'INSERT INTO usuarios (nome, email, telefone, senha, role) VALUES (?, ?, ?, ?, ?)',
      [nome, email, telefone || '', senhaCriptografada, userRole]
    );

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });

  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};
