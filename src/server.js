import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);

// =========================
// CORS + JSON
// =========================
const allowedOrigins = [
  "http://localhost:3000",              // frontend local
  "https://agendai-frontend.vercel.app" // frontend em produção
];

app.use(
  cors({
    origin: (origin, callback) => {
      // permite também chamadas sem origin (Postman, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// responde pré-flight (OPTIONS) com os headers de CORS
app.options("*", cors());

app.use(express.json());

// =========================
// SOCKET.IO
// =========================
import configurarSocket from "./socket.js";
configurarSocket(server);

// =========================
// ARQUIVOS ESTÁTICOS
// =========================

// 🔹 uploads usados pelo chat (multer salva em src/uploads)
app.use("/uploads", express.static(path.resolve("src", "uploads")));

// 🔹 laudos (PDFs enviados no laudo da consulta)
app.use("/laudos", express.static(path.resolve("src", "laudos")));

// =========================
// ROTAS
// =========================
import uploadRoutes from "./routes/upload.routes.js";
import laudosRoutes from "./routes/laudos.routes.js";
import pacienteRoutes from "./routes/pacientes.js";
import medicoRoutes from "./routes/medicos.js";
import consultaRoutes from "./routes/consultas.js";

// upload de arquivos do chat
app.use("/api", uploadRoutes);

// upload/download de laudos
app.use("/api", laudosRoutes);

// demais rotas
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/consultas", consultaRoutes);

app.get("/", (req, res) => {
  res.send("API rodando com uploads + laudos!");
});

// =========================
// MONGO + SERVER
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado"))
  .catch((err) => console.error("Erro Mongo:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
