// Local: controllers/coletaController.js
exports.coletarDados = (req, res) => {
    try {
        console.log('Dentro da função coletarDados'); // Verifica se entrou na função
        console.log('Dados recebidos:', req.body); // Verifica os dados recebidos
        
        res.status(200).json({
            success: true,
            message: 'Dados coletados com sucesso',
            dados: req.body,
        });
    } catch (error) {
        console.error('Erro ao coletar dados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao coletar dados',
        });
    }
};
