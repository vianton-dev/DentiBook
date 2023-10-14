const Odontologo = require('../js/Odontologos');
const jwt = require('jsonwebtoken');

// Odontologos
exports.addOdontologo = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const odontologo = new Odontologo({
      ...req.body,
      owner: userId  // Establece el campo owner con el ObjectId del usuario
    });

    await odontologo.save();
    res.send('Odontologo has been added successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while adding odontologo: ' + err.message);
  }
};

exports.updateOdontologo = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const odontologo = await Odontologo.findById(req.params.id);
    if (odontologo.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para actualizar este odontologo');
    }

    await Odontologo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send('Odontologo has been updated successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while updating odontologo: ' + err.message);
  }
};

exports.deleteOdontologo = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const odontologo = await Odontologo.findById(req.params.id);
    if (odontologo.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para eliminar este odontologo');
    }

    await Odontologo.findByIdAndDelete(req.params.id);
    res.send('Odontologo has been deleted successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while deleting odontologo: ' + err.message);
  }
};

exports.getOdontologos = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    // Busca los odontólogos por el id del usuario
    const odontologos = await Odontologo.find({ owner: userId });
    res.json(odontologos);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while getting odontólogos: ' + err.message);
  }
};
