const { Pool } = require('pg');
require('dotenv').config(); // Garante que as variáveis de ambiente do .env sejam carregadas

// Configurações de conexão com o banco de dados
const pool = new Pool({
  // connectionString é a forma recomendada quando se usa uma URL completa
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false // Esta linha pode ser necessária dependendo do provedor/versão Node.js
  // }
});

// Testar a conexão (opcional, mas bom para verificar se está tudo certo)
pool.on('connect', () => {
  console.log('📦 Conectado ao banco de dados PostgreSQL!');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco de dados:', err);
  process.exit(-1); // Encerra a aplicação em caso de erro crítico
});

module.exports = pool; // Exporta o objeto 'pool' para ser usado em outras partes da API