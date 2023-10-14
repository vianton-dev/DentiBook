const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citaSchema = new Schema({
    id: Number,
    paciente_id: { type: Number, ref: 'Paciente' },
    odontologo_id: { type: Number, ref: 'Odontologo' },
    fecha: Date,
    hora: String,
    motivo: String,
    tipo_pago: String,
    owner: { type: Schema.Types.ObjectId, ref: 'NuevoUsuario' }  // Referencia al usuario
  });   

  module.exports = mongoose.model('Citas', citaSchema);