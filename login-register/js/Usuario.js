const bcrypt = require('bcryptjs'); // Usamos bcryptjs en lugar de bcrypt-nodejs
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true },
}, {
  timestamps: true
});

usuarioSchema.pre('save', function(next) {
  const usuario = this;
  if (!usuario.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(usuario.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      usuario.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('Usuario', usuarioSchema);
