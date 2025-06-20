const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const veiculosRoutes = require('./routes/veiculosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const notificacoesRoutes = require('./routes/notificacoesRoutes');
const relatoriosRoutes = require('./routes/relatoriosRoutes');
const promocoesRoutes = require('./routes/promocoesRoutes');
const adminRoutes = require('./routes/adminRoutes');
const forumRoutes = require('./routes/forumRoutes');


dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api', veiculosRoutes);
app.use('/api', reservasRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', notificacoesRoutes);
app.use('/api', relatoriosRoutes);
app.use('/api/promocoes', promocoesRoutes);
app.use('/admin', adminRoutes);
app.use('/api/forum', forumRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Erro no servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
