import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Medico from "../models/Medico.js";
import Consulta from "../models/Consulta.js";
import Paciente from "../models/Paciente.js";

const router = express.Router();

// ==========================
// CADASTRO DE MÉDICO
// ==========================
router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, crm, especialidade, senha } = req.body;

    const existe = await Medico.findOne({ email });
    if (existe)
      return res.status(400).json({ message: "Email já cadastrado." });

    const hashed = await bcrypt.hash(senha, 10);
    const novoMedico = await Medico.create({
      nome,
      email,
      crm,
      especialidade,
      senha: hashed,
    });

    res.json({ message: "Médico cadastrado com sucesso", medico: novoMedico });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao cadastrar médico", error: error.message });
  }
});

// ==========================
// LOGIN DE MÉDICO
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const medico = await Medico.findOne({ email });

    if (!medico)
      return res.status(404).json({ message: "Médico não encontrado" });

    const senhaOk = await bcrypt.compare(senha, medico.senha);
    if (!senhaOk)
      return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign({ id: medico._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login bem-sucedido",
      medico: {
        id: medico._id,
        nome: medico.nome,
        email: medico.email,
        especialidade: medico.especialidade,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro no login do médico", error: error.message });
  }
});

// ==========================
// BUSCAR MÉDICOS (nome, especialidade ou email)
// ==========================
router.get("/buscar", async (req, res) => {
  try {
    let { query } = req.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res
        .status(400)
        .json({ message: "Informe o nome ou especialidade." });
    }

    query = query.trim();

    const medicos = await Medico.find({
      $or: [
        { nome: { $regex: new RegExp(query, "i") } },
        { especialidade: { $regex: new RegExp(query, "i") } },
        { email: { $regex: new RegExp(query, "i") } },
      ],
    }).select("nome especialidade email crm");

    if (!medicos || medicos.length === 0) {
      return res.status(404).json({ message: "Nenhum médico encontrado." });
    }

    res.json(medicos);
  } catch (err) {
    console.error("❌ Erro ao buscar médicos:", err.message);
    res.status(500).json({ message: "Erro interno ao buscar médicos." });
  }
});

// ==========================
// LISTAR CONSULTAS PENDENTES DO MÉDICO
// ==========================
router.get("/pendentes", async (req, res) => {
  try {
    const consultas = await Consulta.find({ status: "pendente" })
      .populate("paciente", "nome email")
      .populate("medico", "nome especialidade")
      .lean();

    res.json(consultas);
  } catch (error) {
    console.error("Erro ao listar consultas pendentes:", error.message);
    res.status(500).json({ message: "Erro ao buscar consultas pendentes" });
  }
});

// ==========================
// APROVAR CONSULTA
// ==========================
router.put("/consulta/:id/aprovar", async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await Consulta.findByIdAndUpdate(
      id,
      { status: "aprovada" },
      { new: true }
    );
    if (!consulta)
      return res.status(404).json({ message: "Consulta não encontrada" });

    res.json({ message: "Consulta aprovada com sucesso!", consulta });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao aprovar consulta", error: error.message });
  }
});

// ==========================
// REJEITAR CONSULTA
// ==========================
router.put("/consulta/:id/rejeitar", async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await Consulta.findByIdAndUpdate(
      id,
      { status: "rejeitada" },
      { new: true }
    );
    if (!consulta)
      return res.status(404).json({ message: "Consulta não encontrada" });

    res.json({ message: "Consulta rejeitada com sucesso!", consulta });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao rejeitar consulta", error: error.message });
  }
});

// ==========================
// DIAS INDISPONÍVEIS DO MÉDICO
// ==========================

// GET dias indisponíveis
router.get("/:id/indisponibilidade", async (req, res) => {
  try {
    const medico = await Medico.findById(req.params.id).select(
      "diasIndisponiveis"
    );

    if (!medico) {
      return res.status(404).json({ message: "Médico não encontrado" });
    }

    res.json({
      ok: true,
      dias: medico.diasIndisponiveis || [],
    });
  } catch (error) {
    console.error("Erro ao buscar dias indisponíveis:", error.message);
    res.status(500).json({
      message: "Erro ao buscar dias indisponíveis",
      error: error.message,
    });
  }
});

// PUT dias indisponíveis
router.put("/:id/indisponibilidade", async (req, res) => {
  try {
    const { dias } = req.body; // array de strings 'YYYY-MM-DD'

    if (!Array.isArray(dias)) {
      return res
        .status(400)
        .json({ error: "Formato de dias inválido (esperado array)." });
    }

    const medico = await Medico.findByIdAndUpdate(
      req.params.id,
      { diasIndisponiveis: dias },
      { new: true }
    ).select("diasIndisponiveis");

    if (!medico) {
      return res.status(404).json({ message: "Médico não encontrado" });
    }

    res.json({
      ok: true,
      dias: medico.diasIndisponiveis || [],
    });
  } catch (error) {
    console.error("Erro ao salvar dias indisponíveis:", error.message);
    res.status(500).json({
      message: "Erro ao salvar dias indisponíveis",
      error: error.message,
    });
  }
});

export default router;
