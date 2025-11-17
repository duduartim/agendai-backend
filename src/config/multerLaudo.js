import multer from "multer";
import path from "path";
import fs from "fs";

// Garante que a pasta existe
const pastaLaudos = path.resolve("src/laudos");
if (!fs.existsSync(pastaLaudos)) {
  fs.mkdirSync(pastaLaudos, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaLaudos);
  },
  filename: (req, file, cb) => {
    const consultaId = req.consultaId; // agora existe de verdade
    const ext = path.extname(file.originalname);
    cb(null, `${consultaId}-laudo${ext}`);
  }
});

const uploadLaudo = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(null, false);
    }
    cb(null, true);
  }
});

export default uploadLaudo;
