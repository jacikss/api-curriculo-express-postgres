const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- ROTAS PARA A ENTIDADE HABILIDADES ---

// 1. Rota POST para cadastrar uma nova habilidade para uma pessoa
router.post('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params;
  const { nome_habilidade, nivel, tipo } = req.body;

  if (!nome_habilidade) {
    return res.status(400).json({ error: 'Nome da habilidade é obrigatório.' });
  }

  try {
    const pessoaCheck = await pool.query('SELECT id FROM pessoas WHERE id = $1', [pessoaId]);
    if (pessoaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada. Não é possível adicionar habilidade.' });
    }

    const result = await pool.query(
      `INSERT INTO habilidades (pessoa_id, nome_habilidade, nivel, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [pessoaId, nome_habilidade, nivel, tipo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar habilidade:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar habilidade.' });
  }
});

// 2. Rota GET para listar todas as habilidades de UMA pessoa específica
router.get('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params;
  try {
    const pessoaCheck = await pool.query('SELECT id FROM pessoas WHERE id = $1', [pessoaId]);
    if (pessoaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }
    const result = await pool.query('SELECT * FROM habilidades WHERE pessoa_id = $1 ORDER BY nome_habilidade ASC', [pessoaId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar habilidades da pessoa:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar habilidades.' });
  }
});

// 3. Rota GET para buscar UMA habilidade específica pelo ID da habilidade
router.get('/detalhe/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM habilidades WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Habilidade não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar habilidade por ID:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar habilidade.' });
    }
});

// 4. Rota PUT para atualizar uma habilidade existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_habilidade, nivel, tipo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE habilidades SET
         nome_habilidade = COALESCE($1, nome_habilidade),
         nivel = COALESCE($2, nivel),
         tipo = COALESCE($3, tipo)
       WHERE id = $4
       RETURNING *`,
      [nome_habilidade, nivel, tipo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habilidade não encontrada para atualização.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar habilidade:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar habilidade.' });
  }
});

// 5. Rota DELETE para remover uma habilidade
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM habilidades WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Habilidade não encontrada para exclusão.' });
    }
    res.status(200).json({ message: 'Habilidade excluída com sucesso!', id: result.rows[0].id });
  } catch (err) {
    console.error('Erro ao excluir habilidade:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir habilidade.' });
  }
});

module.exports = router;