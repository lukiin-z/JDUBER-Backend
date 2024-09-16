const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/authMiddleware');
const { coletarDados } = require('../controllers/coletaController');

// Rota protegida para coleta de dados
router.post('/coleta', authMiddleware, async (req, res, next) => {
    try {
        console.log('Função coletarDados foi chamada');
        await coletarDados(req, res, next);
    } catch (error) {
        console.error('Erro na coleta de dados:', error);
        res.status(500).json({ message: 'Erro ao coletar dados.' });
    }
});

// Rota protegida para entrega de dados
router.post('/entrega', authMiddleware, async (req, res) => {
    try {
        console.log('Função entrega foi chamada');
        res.json({ message: 'Entrega iniciada com sucesso!' });
    } catch (error) {
        console.error('Erro ao iniciar entrega:', error);
        res.status(500).json({ message: 'Erro ao iniciar entrega.' });
    }
});

module.exports = router;
