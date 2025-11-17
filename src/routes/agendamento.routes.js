const express = require("express");
const router = express.Router();
const Agendamento = require("../models/Agendamento"); // Corrigido o caminho

// ================================
// Criar agendamento
// ================================
router.post("/", async (req, res) => {
  try {
    const { pacienteId, profissional, data } = req.body;

    // Validação básica
    if (!pacienteId || !profissional || !data) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios ausentes: pacienteId, profissional ou data." });
    }

    // Impedir data passada
    const dataConsulta = new Date(data);
    const agora = new Date();
    if (isNaN(dataConsulta.getTime())) {
      return res.status(400).json({ error: "Data inválida." });
    }
    if (dataConsulta < agora) {
      return res.status(400).json({ error: "Não é possível agendar em uma data passada." });
    }

    // Criar novo agendamento
    const novoAgendamento = new Agendamento({
      pacienteId,
      profissional,
      data: dataConsulta,
      confirmado: true,
    });

    await novoAgendamento.save();

    res.status(201).json({
      message: "Consulta agendada com sucesso!",
      agendamento: novoAgendamento,
    });
  } catch (err) {
    console.error("❌ Erro ao agendar consulta:", err);
    res.status(500).json({ error: "Erro interno ao agendar consulta." });
  }
});

// ================================
// Buscar agendamentos de um paciente
// ================================
router.get("/:pacienteId", async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({
      pacienteId: req.params.pacienteId,
    });
    res.json(agendamentos);
  } catch (err) {
    console.error("❌ Erro ao buscar agendamentos:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos." });
  }
});

module.exports = router;
