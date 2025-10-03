const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// URI do MongoDB
const uri = "mongodb+srv://lucasduarterocha11_db_user:duduartim64@cluster0.eoripif.mongodb.net/agendai?retryWrites=true&w=majority&appName=Cluster0";

// Conexão com o MongoDB
mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB conectado com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// Rotas (ajustadas para dentro de src/routes)
app.use('/pacientes', require('./src/routes/pacientes'));
app.use('/login', require('./src/routes/login'));
app.use('/agendamento', require('./src/routes/agendamento.routes'));

// Rota raiz de teste
app.get('/', (req, res) => {
  res.send('Servidor rodando e conectado ao MongoDB!');
});

// Health Check (para Render)
app.get('/healthz', (req, res) => res.send('OK'));

// Porta dinâmica para Render ou fallback local
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
