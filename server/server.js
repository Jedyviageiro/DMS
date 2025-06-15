const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // ou o caminho que você usou
const veiculosRoutes = require('./routes/veiculosRoutes'); // Adicionando as rotas de veículos
const reservasRoutes = require('./routes/reservasRoutes'); // Adicionando rotas de reservas
const usuariosRoutes = require('./routes/usuariosRoutes');
const notificacoesRoutes = require('./routes/notificacoesRoutes');
const relatoriosRoutes = require('./routes/relatoriosRoutes');
const promocoesRoutes = require('./routes/promocoesRoutes'); // importe as rotas de promoções

// Load environment variables first
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const app = express();

// Configure CORS
app.use(cors());

// Parse JSON bodies with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', veiculosRoutes);
app.use('/api', reservasRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', notificacoesRoutes);
app.use('/api', relatoriosRoutes);
app.use('/api/promocoes', promocoesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Erro no servidor' });
});

// Porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
