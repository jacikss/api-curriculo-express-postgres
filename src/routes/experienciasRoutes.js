const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Importa o pool de conexão com o banco de dados

// --- ROTAS PARA A ENTIDADE EXPERIÊNCIAS ---

// 1. Rota POST para cadastrar uma nova experiência para uma pessoa
// URL: /experiencias/:pessoaId
router.post('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params; // ID da pessoa a quem a experiência pertence
  const { cargo, empresa, localizacao, data_inicio, data_fim, descricao } = req.body;

  // Validação básica
  if (!cargo || !empresa || !data_inicio) {
    return res.status(400).json({ error: 'Cargo, empresa e data de início são campos obrigatórios.' });
  }

  try {
    // Primeiro, verifica se a pessoa com o pessoaId existe
    const pessoaCheck = await pool.query('SELECT id FROM pessoas WHERE id = $1', [pessoaId]);
    if (pessoaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada. Não é possível adicionar experiência.' });
    }

    const result = await pool.query(
      `INSERT INTO experiencias (pessoa_id, cargo, empresa, localizacao, data_inicio, data_fim, descricao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, // Retorna a experiência cadastrada
      [pessoaId, cargo, empresa, localizacao, data_inicio, data_fim, descricao]
    );
    res.status(201).json(result.rows[0]); // Retorna a experiência criada
  } catch (err) {
    console.error('Erro ao cadastrar experiência:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar experiência.' });
  }
});

// 2. Rota GET para listar todas as experiências de UMA pessoa específica
// URL: /experiencias/:pessoaId
router.get('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params;
  try {
    // Opcional: verificar se a pessoa existe antes de listar as experiências dela
    const pessoaCheck = await pool.query('SELECT id FROM pessoas WHERE id = $1', [pessoaId]);
    if (pessoaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }

    const result = await pool.query('SELECT * FROM experiencias WHERE pessoa_id = $1 ORDER BY data_inicio DESC', [pessoaId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar experiências da pessoa:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar experiências.' });
  }
});

// 3. Rota GET para buscar UMA experiência específica pelo ID da experiência
// URL: /experiencias/detalhe/:id
// Mudei o nome da rota para evitar conflito com a rota GET /experiencias/:pessoaId
router.get('/detalhe/:id', async (req, res) => {
    const { id } = req.params; // ID da experiência
    try {
        const result = await pool.query('SELECT * FROM experiencias WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Experiência não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar experiência por ID:', err);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar experiência.' });
    }
});


// 4. Rota PUT para atualizar uma experiência existente
// URL: /experiencias/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params; // ID da experiência a ser atualizada
  const { cargo, empresa, localizacao, data_inicio, data_fim, descricao } = req.body;

  try {
    const result = await pool.query(
      `UPDATE experiencias SET
         cargo = COALESCE($1, cargo),
         empresa = COALESCE($2, empresa),
         localizacao = COALESCE($3, localizacao),
         data_inicio = COALESCE($4, data_inicio),
         data_fim = COALESCE($5, data_fim),
         descricao = COALESCE($6, descricao)
       WHERE id = $7
       RETURNING *`,
      [cargo, empresa, localizacao, data_inicio, data_fim, descricao, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Experiência não encontrada para atualização.' });
    }
    res.status(200).json(result.rows[0]); // Retorna a experiência atualizada
  } catch (err) {
    console.error('Erro ao atualizar experiência:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar experiência.' });
  }
});

// 5. Rota DELETE para remover uma experiência
// URL: /experiencias/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // ID da experiência a ser excluída
  try {
    const result = await pool.query('DELETE FROM experiencias WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Experiência não encontrada para exclusão.' });
    }
    res.status(200).json({ message: 'Experiência excluída com sucesso!', id: result.rows[0].id });
  } catch (err) {
    console.error('Erro ao excluir experiência:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir experiência.' });
  }
});

module.exports = router; // Exporta o router