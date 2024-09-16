const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { register, login, forgotPassword } = require('../controllers/authController');

// Rota para registrar novos usuários
router.post('/register', register);

// Rota para login
router.post('/login', login);

// Rota para esqueci a senha
router.post('/forgot-password', forgotPassword);

// Rota para redefinir a senha
router.post('/reset-password', async (req, res) => {
    const { password } = req.body;
    const token = req.query.token; // O token vem da URL

    try {
        // Decodifica e verifica o token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verifica se o token ainda é válido
        if (!decoded) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        // Encontra o usuário pelo ID armazenado no token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Criptografa a nova senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Atualiza a senha do usuário
        user.password = hashedPassword;
        await user.save();

        return res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return res.status(400).json({ message: 'Erro ao redefinir senha. Token inválido ou expirado.' });
    }
});

module.exports = router;
