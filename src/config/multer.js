import multer from "multer";
import path from "path";
import fs from "fs";

// Caminho absoluto para a pasta uploads dentro de /src
const uploadFolder = path.resolve("src", "uploads");

// Criar pasta se não existir
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
  console.log("📁 Pasta /src/uploads criada automaticamente.");
}

// Tipos permitidos (imagens, pdf, docs, vídeos leves)
const allowedMimes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "video/mp4",
];

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, `${timestamp}-${random}${ext}`);
  },
});

// Filtro para bloquear arquivos perigosos
function fileFilter(req, file, cb) {
  if (!allowedMimes.includes(file.mimetype)) {
    console.warn("⚠️ Tipo de arquivo bloqueado:", file.mimetype);
    return cb(new Error("Tipo de arquivo não permitido"), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

export default upload;
