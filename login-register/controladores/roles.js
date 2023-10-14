const Roles = require('../js/Roles');
const jwt = require('jsonwebtoken');

// Roles
exports.addRol = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const rol = new Roles({
      ...req.body,
      owner: userId  // Establece el campo owner con el ObjectId del usuario
    });

    await rol.save();
    res.send('Rol has been added successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while adding rol: ' + err.message);
  }
};

exports.updateRol = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const rol = await Roles.findById(req.params.id);
    if (rol.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para actualizar este rol');
    }

    await Roles.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send('Rol has been updated successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while updating rol: ' + err.message);
  }
};

exports.deleteRol = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const rol = await Roles.findById(req.params.id);
    if (rol.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para eliminar este rol');
    }

    await Roles.findByIdAndDelete(req.params.id);
    res.send('Rol has been deleted successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while deleting rol: ' + err.message);
  }
};

exports.getRoles = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    // Busca los roles por el id del usuario
    const roles = await Roles.find({ owner: userId });
    res.json(roles);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while getting roles: ' + err.message);
  }
};
