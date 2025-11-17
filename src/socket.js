import { Server } from "socket.io";
import Mensagem from "./models/Mensagem.js";

export default function configurarSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
    path: "/socket.io"
  });

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    // ================================
    // 📥 Entrar na sala da consulta
    // ================================
    socket.on("entrarConsulta", async (consultaId) => {
      if (!consultaId) return;

      socket.join(consultaId);
      console.log(`📥 Sala acessada: ${consultaId}`);

      try {
        const historico = await Mensagem.find({ consultaId })
          .sort({ horario: 1 })
          .lean();

        socket.emit("historicoMensagens", historico);
      } catch (err) {
        console.error("❌ Erro no histórico:", err);
      }
    });

    // ================================
    // 💬 Nova mensagem
    // ================================
    socket.on("enviarMensagem", async (msg) => {
      try {
        if (!msg.consultaId) {
          console.warn("⚠️ Mensagem sem consultaId");
          return;
        }

        // Dados básicos de qualquer mensagem
        const baseData = {
          consultaId: msg.consultaId,
          autorId: String(msg.autorId),
          autorNome: msg.autorNome,
          tipo: msg.tipo === "medico" ? "medico" : "paciente",
          horario: new Date(),
        };

        let novaMensagem;

        // ------------------------------
        // 📄 ARQUIVO
        // ------------------------------
        if (msg.arquivo === true) {
          if (!msg.arquivoUrl || !msg.arquivoTipo) {
            console.warn("⚠️ Arquivo inválido:", msg);
            return;
          }

          novaMensagem = await Mensagem.create({
            ...baseData,
            arquivo: true,
            arquivoUrl: msg.arquivoUrl,
            arquivoTipo: msg.arquivoTipo,
          });
        }

        // ------------------------------
        // 💬 TEXTO
        // ------------------------------
        else {
          if (!msg.texto || msg.texto.trim() === "") {
            console.warn("⚠️ Texto vazio recebido");
            return;
          }

          novaMensagem = await Mensagem.create({
            ...baseData,
            texto: msg.texto,
          });
        }

        console.log("💬 Mensagem registrada:", novaMensagem);

        // Envia para todos que estão na consulta
        io.to(msg.consultaId).emit("novaMensagem", novaMensagem);
      } catch (err) {
        console.error("❌ Erro ao salvar mensagem:", err);
      }
    });

    // ================================
    // 🔌 Desconectar
    // ================================
    socket.on("disconnect", () => {
      console.log("🔴 Cliente saiu:", socket.id);
    });
  });
}
