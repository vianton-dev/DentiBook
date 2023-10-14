const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const odontologoSchema = new Schema({
    id: Number,
    usuario_id: { type: Number, ref: 'NuevoUsuario' },
    experiencia_laboral_anios: Number,
    horario_atencion: String,
    salario: Number,
    owner: { type: Schema.Types.ObjectId, ref: 'NuevoUsuario' }  // Referencia al usuario
  });
  
  module.exports = mongoose.model('Odontologos', odontologoSchema);