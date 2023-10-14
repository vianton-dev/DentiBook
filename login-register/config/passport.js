const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../js/Usuario');

passport.serializeUser((user, done) => {
  done(null, user.id);
 });
 
 passport.deserializeUser((id, done) => {
  Usuario.findById(id, (err, user) => {
  done(err, user);
  });
 }); 

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
          return done(null, false, { message: `Este email: ${email} no esta registrado` });
        } else {
          usuario.compararPassword(password, (err, sonIguales) => {
            if (sonIguales) {
              return done(null, usuario);
            } else {
              return done(null, false, { message: 'La contraseña no es valida' });
            }
          });
        }
      } catch (err) {
        done(err);
      }
    }
  ));

  exports.estaAutenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send('No estás autorizado');
   }
   