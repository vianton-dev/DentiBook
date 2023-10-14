const Cita = require('../js/Citas');
const jwt = require('jsonwebtoken');

// Citas
exports.addCita = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const cita = new Cita({
      ...req.body,
      owner: userId  // Establece el campo owner con el ObjectId del usuario
    });

    await cita.save();
    res.send('Cita has been added successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while adding cita: ' + err.message);
  }
};

exports.updateCita = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const cita = await Cita.findById(req.params.id);
    if (cita.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para actualizar esta cita');
    }

    await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send('Cita has been updated successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while updating cita: ' + err.message);
  }
};

exports.deleteCita = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const cita = await Cita.findById(req.params.id);
    if (cita.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para eliminar esta cita');
    }

    await Cita.findByIdAndDelete(req.params.id);
    res.send('Cita has been deleted successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while deleting cita: ' + err.message);
  }
};

exports.getCitas = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    // Busca las citas por el id del usuario
    const citas = await Cita.find({ owner: userId });
    res.json(citas);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while getting citas: ' + err.message);
  }
};
