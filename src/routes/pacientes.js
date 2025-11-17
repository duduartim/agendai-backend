import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Paciente from "../models/Paciente.js";

const router = express.Router();

// Cadastro
router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const existe = await Paciente.findOne({ email });
    if (existe)
      return res.status(400).json({ message: "Email já cadastrado." });

    const hashed = await bcrypt.hash(senha, 10);
    const novoPaciente = await Paciente.create({ nome, email, senha: hashed });

    res.json({
      message: "Paciente cadastrado com sucesso",
      paciente: {
        _id: novoPaciente._id,
        nome: novoPaciente.nome,
        email: novoPaciente.email,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    res.status(500).json({
      message: "Erro ao cadastrar paciente",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const paciente = await Paciente.findOne({ email });

    if (!paciente)
      return res.status(404).json({ message: "Paciente não encontrado" });

    const senhaOk = await bcrypt.compare(senha, paciente.senha);
    if (!senhaOk)
      return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign({ id: paciente._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔹 Agora o backend devolve o paciente completo
    res.json({
      message: "Login bem-sucedido",
      token,
      paciente: {
        _id: paciente._id,
        nome: paciente.nome,
        email: paciente.email,
      },
    });
  } catch (error) {
    console.error("Erro no login do paciente:", error);
    res.status(500).json({
      message: "Erro no login do paciente",
      error: error.message,
    });
  }
});

export default router;
