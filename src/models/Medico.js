import mongoose from "mongoose";

const medicoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    crm: { type: String, required: true, unique: true },
    especialidade: { type: String, required: true },
    senha: { type: String, required: true },

    // 👇 datas em que o médico NÃO atende (formato 'YYYY-MM-DD')
    diasIndisponiveis: [
      {
        type: String,
        // ex: "2025-11-20"
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Medico", medicoSchema);
