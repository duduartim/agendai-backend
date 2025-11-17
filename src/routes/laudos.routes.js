import express from "express";
import uploadLaudo from "../config/multerLaudo.js";
import Consulta from "../models/Consulta.js";
import fs from "fs";
import path from "path";

const router = express.Router();

/* =====================================================
   📌 UPLOAD DE LAUDO (POST)
===================================================== */
router.post("/consulta/:id/laudo", uploadLaudo.single("laudo"), async (req, res) => {
  const consultaId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ ok: false, error: "Nenhum PDF enviado" });
  }

  const relativePath = `/laudos/${req.file.filename}`;
  const baseURL = process.env.BASE_URL || "http://localhost:5000";
  const url = baseURL.replace(/\/$/, "") + relativePath;

  try {
    await Consulta.findByIdAndUpdate(consultaId, { laudoUrl: url });

    return res.json({
      ok: true,
      message: "Laudo enviado com sucesso",
      url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao salvar laudo no banco" });
  }
});


/* =====================================================
   🗑️ DELETE DO LAUDO (APAGAR ARQUIVO + LIMPAR DO BANCO)
===================================================== */
router.delete("/consulta/:id/laudo", async (req, res) => {
  const consultaId = req.params.id;

  try {
    const consulta = await Consulta.findById(consultaId);

    if (!consulta) {
      return res.status(404).json({ ok: false, error: "Consulta não encontrada" });
    }

    if (!consulta.laudoUrl) {
      return res.status(400).json({ ok: false, error: "Nenhum laudo para excluir" });
    }

    // Extrair o nome do arquivo do caminho da URL
    const fileName = consulta.laudoUrl.split("/laudos/")[1];
    const filePath = path.resolve("src", "laudos", fileName);

    // Remover o arquivo fisicamente (se existir)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remover o laudo do banco
    consulta.laudoUrl = null;
    await consulta.save();

    return res.json({ ok: true, message: "Laudo excluído com sucesso" });

  } catch (err) {
    console.error("Erro ao excluir laudo:", err);
    return res.status(500).json({ ok: false, error: "Erro no servidor ao excluir laudo" });
  }
});

export default router;
