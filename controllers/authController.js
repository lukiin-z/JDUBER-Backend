const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configuração do Nodemailer para enviar e-mails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Defina no arquivo .env
        pass: process.env.EMAIL_PASS  // Defina no arquivo .env
    }
});

// Função para enviar email de redefinição de senha
const sendResetPasswordEmail = async (email, resetToken) => {
    const resetURL = `http://localhost:5000/reset-password?token=${resetToken}`;


    const mailOptions = {
        from: 'Seu Projeto <no-reply@seuprojeto.com>',
        to: email,
        subject: 'Redefinição de Senha',
        html: `<p>Você solicitou a redefinição de sua senha. Clique no link abaixo para redefinir:</p>
               <a href="${resetURL}">Redefinir Senha</a>
               <p>Se você não solicitou isso, ignore este e-mail.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw new Error('Não foi possível enviar o e-mail.');
    }
};

// Função de registro
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuário registrado com sucesso', token });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};

// Função de login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};

// Função de esquecimento de senha
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await sendResetPasswordEmail(email, resetToken);
        res.json({ message: 'E-mail de redefinição de senha enviado.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar sua solicitação.' });
    }
};

// Função para obter dados do usuário
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
    }
};

// Função para atualizar dados do usuário
exports.updateUser = async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar dados' });
    }
};
