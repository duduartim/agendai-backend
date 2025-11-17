const mongoose = require('mongoose');
const Medico = require('./src/models/medico'); // Ajuste o caminho

mongoose.connect("mongodb+srv://lucasduarterocha11_db_user:duduartim64@cluster0.eoripif.mongodb.net/agendai?retryWrites=true&w=majority")
  .then(async () => {
    console.log('✅ MongoDB conectado!');

    // Teste de inserção
    const medico = new Medico({
      nome: 'Teste',
      especialidade: 'Cardiologista',
      horarios: ['08:00', '10:00']
    });

    await medico.save();
    console.log('Médico salvo com sucesso!');

    const medicos = await Medico.find();
    console.log('Todos os médicos:', medicos);

    mongoose.connection.close();
  })
  .catch(err => console.error(err));
