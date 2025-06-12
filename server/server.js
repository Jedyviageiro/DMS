const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // ou o caminho que você usou
const veiculosRoutes = require('./routes/veiculosRoutes'); // Adicionando as rotas de veículos
const reservasRoutes = require('./routes/reservasRoutes'); // Adicionando rotas de reservas

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', veiculosRoutes); // Adicionando o prefixo /api para as rotas de veículos
app.use('/api', reservasRoutes); // Adicionando prefixo /api para reservas

// Porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
