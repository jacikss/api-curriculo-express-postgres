const { Pool } = require('pg');

// Configurações de conexão com o banco de dados
const pool = new Pool({
  user: 'postgres',         // Seu usuário do PostgreSQL (geralmente 'postgres')
  host: 'localhost',        // Onde o PostgreSQL está rodando (sua máquina)
  database: 'db_curriculo',// O nome do banco de dados que criamos
  password: 'admin', // A senha que você definiu para o usuário 'postgres'
  port: 5432,               // A porta padrão do PostgreSQL
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