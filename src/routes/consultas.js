import express from "express";
import mongoose from "mongoose";
import Consulta from "../models/Consulta.js";
import Medico from "../models/Medico.js";
import Paciente from "../models/Paciente.js";

const router = express.Router();

/**
 * 📅 Solicitar nova consulta
 * POST /api/consultas/solicitar
 */
router.post("/solicitar", async (req, res) => {
  try {
    const { pacienteId, idPaciente, idMedico, horario, especialidade } = req.body;
    const paciente = pacienteId || idPaciente;

    if (!paciente || !idMedico || !horario) {
      return res.status(400).json({
        message: "pacienteId, idMedico e horario são obrigatórios.",
      });
    }

    // ✅ Garante que os IDs são válidos ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(paciente) ||
      !mongoose.Types.ObjectId.isValid(idMedico)
    ) {
      return res.status(400).json({ message: "IDs inválidos." });
    }

    // Verifica se o paciente e o médico existem
    const [pacienteDoc, medicoDoc] = await Promise.all([
      Paciente.findById(paciente).lean(),
      Medico.findById(idMedico).lean(),
    ]);

    if (!pacienteDoc)
      return res.status(404).json({ message: "Paciente não encontrado." });
    if (!medicoDoc)
      return res.status(404).json({ message: "Médico não encontrado." });

    // ==============================
    // ✅ Impedir agendar em dia indisponível
    // ==============================
    // medicoDoc.diasIndisponiveis: array de strings "YYYY-MM-DD"
    const diasIndisponiveis = medicoDoc.diasIndisponiveis || [];

    const dataConsulta = new Date(horario);
    if (Number.isNaN(dataConsulta.getTime())) {
      return res.status(400).json({ message: "Data/Horário inválidos." });
    }

    // Normaliza para "YYYY-MM-DD"
    const diaConsultaStr = dataConsulta.toISOString().slice(0, 10);

    if (diasIndisponiveis.includes(diaConsultaStr)) {
      return res.status(400).json({
        message: "Este dia está indisponível para este médico.",
      });
    }

    // ==============================
    // ✅ Cria a consulta com IDs como ObjectId
    // ==============================
    const consulta = await Consulta.create({
      paciente: new mongoose.Types.ObjectId(paciente),
      medico: new mongoose.Types.ObjectId(idMedico),
      horario,
      especialidade: especialidade || medicoDoc.especialidade || "",
      status: "pendente",
    });

    return res.json({ message: "Solicitação enviada com sucesso!", consulta });
  } catch (err) {
    console.error("❌ Erro ao solicitar consulta:", err);
    return res.status(500).json({ message: "Erro interno ao solicitar consulta" });
  }
});

/**
 * 🩺 Listar consultas de um médico
 * GET /api/consultas/medico/:idMedico
 */
router.get("/medico/:idMedico", async (req, res) => {
  try {
    const { idMedico } = req.params;

    const consultas = await Consulta.find({ medico: idMedico })
      .populate("paciente", "nome email")
      .populate("medico", "nome especialidade")
      .sort({ createdAt: -1 })
      .lean();

    res.json(consultas);
  } catch (err) {
    console.error("Erro ao listar consultas do médico:", err);
    res.status(500).json({ message: "Erro ao listar consultas do médico" });
  }
});

/**
 * 🧑‍⚕️ Listar consultas de um paciente
 * GET /api/consultas/paciente/:idPaciente
 */
router.get("/paciente/:idPaciente", async (req, res) => {
  try {
    const { idPaciente } = req.params;

    const consultas = await Consulta.find({ paciente: idPaciente })
      .populate("paciente", "nome email")
      .populate("medico", "nome especialidade")
      .sort({ createdAt: -1 })
      .lean();

    res.json(consultas);
  } catch (err) {
    console.error("Erro ao listar consultas do paciente:", err);
    res.status(500).json({ message: "Erro ao listar consultas do paciente" });
  }
});

/**
 * ⚙️ Atualizar status da consulta
 * PUT /api/consultas/:id/status
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const permitidos = [
      "pendente",
      "aprovada",
      "rejeitada",
      "concluida",
      "cancelada",
    ];
    if (!permitidos.includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const consulta = await Consulta.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("paciente", "nome email")
      .populate("medico", "nome especialidade");

    if (!consulta)
      return res.status(404).json({ message: "Consulta não encontrada." });

    res.json({ message: "Status atualizado com sucesso!", consulta });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ message: "Erro ao atualizar status da consulta" });
  }
});

/**
 * 🗑️ Deletar consulta
 * DELETE /api/consultas/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const consulta = await Consulta.findByIdAndDelete(req.params.id);
    if (!consulta)
      return res.status(404).json({ message: "Consulta não encontrada." });
    res.json({ message: "Consulta removida com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar consulta:", err);
    res.status(500).json({ message: "Erro ao deletar consulta" });
  }
});

/**
 * 🔍 Listar todas (para debug/admin)
 * GET /api/consultas
 */
router.get("/", async (req, res) => {
  try {
    const todas = await Consulta.find()
      .populate("paciente", "nome email")
      .populate("medico", "nome especialidade")
      .sort({ createdAt: -1 })
      .lean();
    res.json(todas);
  } catch (err) {
    console.error("Erro ao listar todas as consultas:", err);
    res
      .status(500)
      .json({ message: "Erro ao listar todas as consultas" });
  }
});

export default router;
