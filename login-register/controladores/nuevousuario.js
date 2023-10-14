const NuevoUsuario  = require('../js/NuevoUsuario');
const jwt = require('jsonwebtoken');

// Usuarios
exports.addUsuario = async (req, res) => {
    try {
      const token = req.headers.authorization;
      const decodedToken = jwt.verify(token, 'TU_SECRETO');
      const userId = decodedToken.userId;
  
      const usuario = new NuevoUsuario({
        ...req.body,
        owner: userId  // Establece el campo owner con el ID del usuario
      });
  
      await usuario.save();
      res.send('User has been added successfully');
    } catch (err) {
      console.log(err);
      res.status(500).send('Error while adding user: ' + err.message);
    }
  };
  
  exports.updateUsuario = async (req, res) => {
    try {
      const token = req.headers.authorization;
      const decodedToken = jwt.verify(token, 'TU_SECRETO');
      const userId = decodedToken.userId;
  
      const usuario = await NuevoUsuario.findById(req.params.id);
      if (usuario.owner.toString() !== userId) {
        return res.status(403).send('No tienes permiso para actualizar este usuario');
      }
  
      await NuevoUsuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.send('User has been updated successfully');
    } catch (err) {
      console.log(err);
      res.status(500).send('Error while updating user: ' + err.message);
    }
  };
  
  exports.deleteUsuario = async (req, res) => {
    try {
      const token = req.headers.authorization;
      const decodedToken = jwt.verify(token, 'TU_SECRETO');
      const userId = decodedToken.userId;
  
      const usuario = await NuevoUsuario.findById(req.params.id);
      if (usuario.owner.toString() !== userId) {
        return res.status(403).send('No tienes permiso para eliminar este usuario');
      }
  
      await NuevoUsuario.findByIdAndDelete(req.params.id);
      res.send('User has been deleted successfully');
    } catch (err) {
      console.log(err);
      res.status(500).send('Error while deleting user: ' + err.message);
    }
  };
  
  exports.getUsuarios = async (req, res) => {
    try {
      const token = req.headers.authorization;
      const decodedToken = jwt.verify(token, 'TU_SECRETO');
      const userId = decodedToken.userId;
  
      const usuarios = await NuevoUsuario.find({ owner: userId });
      res.json(usuarios);
    } catch (err) {
      console.log(err);
      res.status(500).send('Error while getting users: ' + err.message);
    }
  };
  