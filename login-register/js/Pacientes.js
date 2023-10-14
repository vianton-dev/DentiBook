const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pacienteSchema = new Schema({
    id: Number,
    usuario_id: { type: Number, ref: 'NuevoUsuario' },
    contacto_emergencia: String,
    owner: { type: Schema.Types.ObjectId, ref: 'NuevoUsuario' }  // Referencia al usuario
  });
  
module.exports = mongoose.model('Pacientes', pacienteSchema);
