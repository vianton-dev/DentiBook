const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rolSchema = new Schema({
    id: Number,
    rol: String,
    usuario_id: { type: Number, ref: 'NuevoUsuario' },
    owner: { type: Schema.Types.ObjectId, ref: 'NuevoUsuario' }  // Referencia al usuario
  });
  
module.exports = mongoose.model('Roles', rolSchema);
