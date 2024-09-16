const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rotas
exports.authMiddleware = async (req, res, next) => {
    let token;

    // Verifica se o header contém um token e se começa com 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai o token do header
            token = req.headers.authorization.split(' ')[1];

            // Log para verificar o token recebido
            console.log('Token recebido:', req.headers.authorization);

            // Verifica e decodifica o token JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Log para verificar o conteúdo do token decodificado
            console.log('Token decodificado:', decoded);

            // Pega os dados do usuário com base no ID decodificado do token
            req.user = await User.findById(decoded.id).select('-password');

            // Se o usuário existir, passa para a próxima função
            if (!req.user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Log de sucesso
            console.log('Usuário autenticado:', req.user);

            next(); // Continua para a próxima função (rota)
        } catch (error) {
            console.error('Erro de autenticação:', error);
            return res.status(401).json({ message: 'Não autorizado, token inválido' });
        }
    } else {
        return res.status(401).json({ message: 'Não autorizado, token ausente' });
    }
};
