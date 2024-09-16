const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

// Inicializa o app Express
const app = express();

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());
app.use(cors()); // Adiciona CORS

// Conectar ao MongoDB
connectDB();

// Servir os arquivos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas de autenticação
app.use('/api/auth', require('./routes/authRoutes'));

// Rotas de coleta e entrega
app.use('/api', require('./routes/coletaRoutes'));

// Teste de conexão com o serviço de e-mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Erro ao conectar com o serviço de e-mail:', error);
    } else {
        console.log('Conexão com o serviço de e-mail estabelecida com sucesso:', success);
    }
});

// Rota para servir a página principal (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota para servir a página de redefinição de senha (reset-password.html)
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reset-password.html'));
});

// Porta do servidor - Pegando a porta que o Google Cloud define
const PORT = process.env.PORT || 8080;

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota de teste de conexão do servidor
app.get('/test', (req, res) => {
    res.send('Backend rodando corretamente!');
});
