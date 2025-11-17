const express = require('express');
const router = express.Router();
const Paciente = require('../models/paciente');

// Login de paciente
router.post('/', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const paciente = await Paciente.findOne({ email, senha });
    if (!paciente) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    // Aqui você pode gerar token se quiser, por enquanto só retorna os dados
    res.json({ message: 'Login bem-sucedido', paciente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

