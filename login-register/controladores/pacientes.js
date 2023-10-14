const Pacientes = require('../js/Pacientes');
const jwt = require('jsonwebtoken');

// Pacientes
exports.addPaciente = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const paciente = new Pacientes({
      ...req.body,
      owner: userId  // Establece el campo owner con el ObjectId del usuario
    });

    await paciente.save();
    res.send('Paciente has been added successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while adding paciente: ' + err.message);
  }
};

exports.updatePaciente = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const paciente = await Pacientes.findById(req.params.id);
    if (paciente.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para actualizar este paciente');
    }

    await Pacientes.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send('Paciente has been updated successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while updating paciente: ' + err.message);
  }
};

exports.deletePaciente = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    const paciente = await Pacientes.findById(req.params.id);
    if (paciente.owner.toString() !== userId) {  // Comprueba la propiedad usando el campo owner
      return res.status(403).send('No tienes permiso para eliminar este paciente');
    }

    await Pacientes.findByIdAndDelete(req.params.id);
    res.send('Paciente has been deleted successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while deleting paciente: ' + err.message);
  }
};

exports.getPacientes = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'TU_SECRETO');
    const userId = decodedToken.userId;

    // Busca los pacientes por el id del usuario
    const pacientes = await Pacientes.find({ owner: userId });
    res.json(pacientes);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error while getting pacientes: ' + err.message);
  }
};
