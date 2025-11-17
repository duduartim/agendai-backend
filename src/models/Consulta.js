import mongoose from "mongoose";

const ConsultaSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  medico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medico",
    required: true,
  },
  horario: {
    type: Date, // ✅ Agora salva corretamente como data
    required: true,
  },
  especialidade: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pendente", "aprovada", "rejeitada"],
    default: "pendente",
  },
  dataCriacao: {
    type: Date,
    default: Date.now, // ✅ Cria automaticamente a data de criação
  },
  laudoUrl: {
  type: String,
  default: null
}
});

// ✅ Exportação padrão
export default mongoose.model("Consulta", ConsultaSchema);
