const jwt = require('jsonwebtoken');

// Use a mesma chave usada no login
const secret = process.env.JWT_SECRET 

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido' });

  jwt.verify(token, secret, (err, usuario) => {
    if (err) return res.status(403).json({ mensagem: 'Token inválido' });

    req.usuario = usuario; // payload do token
    next();
  });
}

// Middleware para verificar se é ADMIN
function isAdmin(req, res, next) {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso restrito ao administrador' });
  }
  next();
}

// Middleware para verificar se é CLIENTE
function isCliente(req, res, next) {
  if (req.usuario.role !== 'cliente') {
    return res.status(403).json({ mensagem: 'Acesso restrito ao cliente' });
  }
  next();
}

module.exports = {
  autenticarToken,
  isAdmin,
  isCliente
};
