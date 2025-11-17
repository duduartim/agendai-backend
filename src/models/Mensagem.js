import mongoose from "mongoose";

const MensagemSchema = new mongoose.Schema({
  consultaId: { type: String, required: true },

  // Texto da mensagem
  texto: { type: String, default: "" },

  // Identificação do autor
  autorId: { type: String, required: true },
  autorNome: { type: String, required: true },
  tipo: { type: String, enum: ["paciente", "medico"], required: true },

  // Horário
  horario: { type: Date, default: Date.now },

  // Arquivo (imagem/pdf/etc)
  arquivo: { type: Boolean, default: false },
  arquivoUrl: { type: String, default: null },   // URL pública
  arquivoTipo: { type: String, default: null },  // MIME type
  nomeArquivo: { type: String, default: null },  // ex: "exame.pdf"
  tamanho: { type: Number, default: null },      // bytes
});

// Função automática que garante URL absoluta
MensagemSchema.methods.getArquivoUrlCompleta = function (baseURL) {
  if (!this.arquivo || !this.arquivoUrl) return null;

  if (this.arquivoUrl.startsWith("http")) return this.arquivoUrl;

  const cleanBase = baseURL.replace(/\/$/, ""); // remove trailing slash
  const cleanPath = this.arquivoUrl.startsWith("/")
    ? this.arquivoUrl
    : "/" + this.arquivoUrl;

  return cleanBase + cleanPath;
};

export default mongoose.model("Mensagem", MensagemSchema);
