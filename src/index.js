const express = require('express');
const app = express();

const pool = require('./config/db');

const pessoasRoutes = require('./routes/pessoasRoutes');
const experienciasRoutes = require('./routes/experienciasRoutes');
const educacaoRoutes = require('./routes/educacaoRoutes');
const habilidadesRoutes = require('./routes/habilidadesRoutes'); // <-- Adicionada

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de currículos online! Funcionando! ✅');
});

app.get('/db-status', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).send('Conexão com o banco de dados bem-sucedida! 🎉');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    res.status(500).send('Erro ao conectar ao banco de dados. 😞');
  }
});

app.use('/pessoas', pessoasRoutes);
app.use('/experiencias', experienciasRoutes);
app.use('/educacao', educacaoRoutes);
app.use('/habilidades', habilidadesRoutes); // <-- Adicionada

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n--- Servidor rodando em http://localhost:${PORT} ---\n`);
});
