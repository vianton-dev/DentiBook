const bcrypt = require('bcryptjs'); // Usamos bcryptjs en lugar de bcrypt-nodejs
const Usuario = require('../js/Usuario');
const jwt = require('jsonwebtoken');

exports.postSignup = async (req, res, next) => {
  try {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email);
    if (!emailValido) {
      return res.status(400).send('Invalid email format');
    }

    const usuario = new Usuario({
      email: req.body.email,
      nombre: req.body.nombre,
      password: req.body.password
    });

    const nombreExistente = await Usuario.findOne({ nombre: req.body.nombre });
    if (nombreExistente) {
      return res.status(400).send('This name is already in use');
    }

    const usuarioExistente = await Usuario.findOne({ email: req.body.email });
    if (usuarioExistente) {
      return res.status(400).send('This email is already registered');
    }

    const nuevoUsuario = await usuario.save();
    return res.send('User has been registered successfully');
    
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error while signing up');
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email);
    if (!emailValido) {
      return res.status(400).send('Invalid email format');
    }

    const usuarioExistente = await Usuario.findOne({ email: req.body.email });
    if (!usuarioExistente) {
      return res.status(400).send('Invalid email or password');
    }

    const passwordValido = await bcrypt.compare(req.body.password, usuarioExistente.password);
    if (!passwordValido) {
      return res.status(400).send('Invalid email or password');
    }

    // Genera un token JWT
    const token = jwt.sign({ userId: usuarioExistente._id }, 'TU_SECRETO', { expiresIn: '1h' });

    // Envía el token al cliente
    return res.json({ message: 'User has been logged in successfully', token: token });

  } catch (err) {
    console.log(err);
    return res.status(500).send('Error while logging in');
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while getting user data');
  }
};
