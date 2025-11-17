import express from "express";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/upload", upload.single("arquivo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const filename = req.file.filename;
  const mimeType = req.file.mimetype;
  const tamanho = req.file.size;

  // Caminho relativo que será utilizado no chat
  const relativePath = `/uploads/${filename}`;

  res.json({
    ok: true,
    url: relativePath,   // sempre relativo
    path: relativePath,
    mime: mimeType,
    nomeArquivo: req.file.originalname,
    tamanho,
  });
});

export default router;
