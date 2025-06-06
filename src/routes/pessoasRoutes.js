const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Importa o pool de conexão com o banco de dados

// --- ROTAS PARA A ENTIDADE PESSOAS ---

// 1. Rota GET para listar todas as pessoas (currículos)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pessoas:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar pessoas.' });
  }
});

// 2. Rota GET para buscar uma pessoa específica pelo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Pega o ID da URL
  try {
    const result = await pool.query('SELECT * FROM pessoas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pessoa não encontrada.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar pessoa por ID:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar pessoa.' });
  }
});

// 3. Rota POST para cadastrar uma nova pessoa
router.post('/', async (req, res) => {
  const { nome, sobrenome, email, telefone, cidade, estado, pais, link_linkedin, link_github, resumo } = req.body; // Pega os dados do corpo da requisição

  // Validação básica (exemplo: email é obrigatório)
  if (!nome || !sobrenome || !email) {
    return res.status(400).json({ error: 'Nome, sobrenome e email são campos obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pessoas (nome, sobrenome, email, telefone, cidade, estado, pais, link_linkedin, link_github, resumo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`, // RETURNING * retorna a pessoa cadastrada
      [nome, sobrenome, email, telefone, cidade, estado, pais, link_linkedin, link_github, resumo]
    );
    res.status(201).json(result.rows[0]); // Retorna a pessoa criada com status 201 (Created)
  } catch (err) {
    console.error('Erro ao cadastrar pessoa:', err);
    // Erro comum: email duplicado (UNIQUE constraint)
    if (err.code === '23505') { // Código de erro para unique_violation no PostgreSQL
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar pessoa.' });
  }
});

// 4. Rota PUT para atualizar uma pessoa existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, sobrenome, email, telefone, cidade, estado, pais, link_linkedin, link_github, resumo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pessoas SET
         nome = COALESCE($1, nome),
         sobrenome = COALESCE($2, sobrenome),
         email = COALESCE($3, email),
         telefone = COALESCE($4, telefone),
         cidade = COALESCE($5, cidade),
         estado = COALESCE($6, estado),
         pais = COALESCE($7, pais),
         link_linkedin = COALESCE($8, link_linkedin),
         link_github = COALESCE($9, link_github),
         resumo = COALESCE($10, resumo)
       WHERE id = $11
       RETURNING *`,
      [nome, sobrenome, email, telefone, cidade, estado, pais, link_linkedin, link_github, resumo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pessoa não encontrada para atualização.' });
    }
    res.status(200).json(result.rows[0]); // Retorna a pessoa atualizada
  } catch (err) {
    console.error('Erro ao atualizar pessoa:', err);
    if (err.code === '23505') { // Erro de email duplicado em atualização
      return res.status(409).json({ error: 'Email já cadastrado para outra pessoa.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar pessoa.' });
  }
});

// 5. Rota DELETE para remover uma pessoa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pessoas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pessoa não encontrada para exclusão.' });
    }
    res.status(200).json({ message: 'Pessoa excluída com sucesso!', id: result.rows[0].id });
  } catch (err) {
    console.error('Erro ao excluir pessoa:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir pessoa.' });
  }
});

module.exports = router; // Exporta o router para ser usado no index.js