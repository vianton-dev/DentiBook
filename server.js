const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

const MONGO_URL = 'mongodb://127.0.0.1:27017/authentication';
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (err) => {
  throw err;
  process.exit(1);
})

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  autoReconnect: true
});

app.use(cors());

app.use(session({
  secret: 'ESTO ES SECRETO',
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 hora en milisegundos
  }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const controladorUsuario = require('./login-register/controladores/usuario');
const controladorNuevoUsuario = require('./login-register/controladores/nuevousuario');
const controladorRoles = require('./login-register/controladores/roles');
const controladorPacientes = require('./login-register/controladores/pacientes');
const controladorOdontologos = require('./login-register/controladores/odontologos');
const controladorCitas = require('./login-register/controladores/citas');

app.post('/register', controladorUsuario.postSignup);
app.post('/login', controladorUsuario.postLogin);
app.get('/user', controladorUsuario.getUser);

// Usuarios
app.get('/usuarios', controladorNuevoUsuario.getUsuarios);
app.post('/usuarios', controladorNuevoUsuario.addUsuario);
app.put('/usuarios/:id', controladorNuevoUsuario.updateUsuario);
app.delete('/usuarios/:id', controladorNuevoUsuario.deleteUsuario);

// Roles
app.post('/roles', controladorRoles.addRol);
app.put('/roles/:id', controladorRoles.updateRol);
app.delete('/roles/:id', controladorRoles.deleteRol);
app.get('/roles', controladorRoles.getRoles);

// Pacientes
app.post('/pacientes', controladorPacientes.addPaciente);
app.put('/pacientes/:id', controladorPacientes.updatePaciente);
app.delete('/pacientes/:id', controladorPacientes.deletePaciente);
app.get('/pacientes', controladorPacientes.getPacientes);

// Odontólogos
app.post('/odontologos', controladorOdontologos.addOdontologo);
app.put('/odontologos/:id', controladorOdontologos.updateOdontologo);
app.delete('/odontologos/:id', controladorOdontologos.deleteOdontologo);
app.get('/odontologos', controladorOdontologos.getOdontologos);

// Citas
app.post('/citas', controladorCitas.addCita);
app.put('/citas/:id', controladorCitas.updateCita);
app.delete('/citas/:id', controladorCitas.deleteCita);
app.get('/citas', controladorCitas.getCitas);

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000')
})
