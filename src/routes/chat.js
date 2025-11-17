import express from "express";
import Mensagem from "../models/Mensagem.js";

const router = express.Router();

// 🔹 Histórico de mensagens de uma consulta
router.get("/:consultaId", async (req, res) => {
  try {
    const { consultaId } = req.params;
    const mensagens = await Mensagem.find({ consultaId }).sort({ horario: 1 });
    res.json(mensagens);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar mensagens", error: error.message });
  }
});

export default router;
