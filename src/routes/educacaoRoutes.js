const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- ROTAS PARA A ENTIDADE EDUCAÇÃO ---

// 1. Rota POST para cadastrar uma nova formação acadêmica para uma pessoa
router.post('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params;
  const { instituicao, curso, grau, data_inicio, data_fim, descricao } = req.body;

  if (!instituicao || !curso || !data_inicio) {
    return res.status(400).json({ error: 'Instituição, curso e data de início são obrigatórios.' });
  }

  try {
    const pessoaCheck = await pool.query('SELECT id FROM pessoas WHERE id = $1', [pessoaId]);
    if (pessoaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada. Não é possível adicionar educação.' });
    }

    const result = await pool.query(
      `INSERT INTO educacao (pessoa_id, instituicao, curso, grau, data_inicio, data_fim, descricao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [pessoaId, instituicao, curso, grau, data_inicio, data_fim, descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar educação:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar educação.' });
  }
});

// 2. Rota GET para listar todas as formações de UMA pessoa específica
router.get('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params;
  try {
    const pessoaCheck = await pool.query('SELECT id FROM pessoas WHERE id = $1', [pessoaId]);
    if (pessoaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }
    const result = await pool.query('SELECT * FROM educacao WHERE pessoa_id = $1 ORDER BY data_inicio DESC', [pessoaId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar educação da pessoa:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar educação.' });
  }
});

// 3. Rota GET para buscar UMA formação específica pelo ID da educação
router.get('/detalhe/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM educacao WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Formação não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar formação por ID:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar formação.' });
    }
});

// 4. Rota PUT para atualizar uma formação existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { instituicao, curso, grau, data_inicio, data_fim, descricao } = req.body;

  try {
    const result = await pool.query(
      `UPDATE educacao SET
         instituicao = COALESCE($1, instituicao),
         curso = COALESCE($2, curso),
         grau = COALESCE($3, grau),
         data_inicio = COALESCE($4, data_inicio),
         data_fim = COALESCE($5, data_fim),
         descricao = COALESCE($6, descricao)
       WHERE id = $7
       RETURNING *`,
      [instituicao, curso, grau, data_inicio, data_fim, descricao, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Formação não encontrada para atualização.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar formação:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar formação.' });
  }
});

// 5. Rota DELETE para remover uma formação
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM educacao WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Formação não encontrada para exclusão.' });
    }
    res.status(200).json({ message: 'Formação excluída com sucesso!', id: result.rows[0].id });
  } catch (err) {
    console.error('Erro ao excluir formação:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir formação.' });
  }
});

module.exports = router;