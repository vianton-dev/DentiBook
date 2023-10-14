const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NuevoUsuarioSchema = new Schema({
    id: Number,
    username: String,
    password: String,
    nombre: String,
    apellido: String,
    dni: String,
    owner: { type: Schema.Types.ObjectId, ref: 'Usuario' }  // Referencia al usuario
  });

module.exports = mongoose.model('NuevoUsuario', NuevoUsuarioSchema);
