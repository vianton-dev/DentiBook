window.addEventListener('load', () => {
    fetch('http://localhost:3000/user', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(user => {
      // Busca el elemento con la clase '.name' y cambia su texto al nombre del usuario
      document.querySelector('.name').innerText = user.nombre;
    })
    .catch(err => console.log(err));
    const usuarioLink = document.querySelector('.sidebar a');
    // Simula un clic en el enlace "Usuario"
    usuarioLink.click();
  });

let userIds = [];
let currentTable = '';
// Función para cargar los datos de los usuarios
function loadUsuarios() {
  currentTable = 'usuarios';  // Establece la tabla actual a 'usuarios'
  fetch('http://localhost:3000/usuarios', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(usuarios => {
      userIds = usuarios.map(usuario => usuario.id);
      // Busca la tabla con el id 'myTable'
      const table = document.getElementById('myTable');

      // Limpia la tabla antes de agregar nuevos datos
      table.innerHTML = '';

      // Crea las cabeceras de la tabla
      const headers = ['id', 'username', 'password', 'nombre', 'apellido', 'dni', 'Editar', 'Eliminar'];
      const headerRow = table.insertRow(-1);
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      // Para cada usuario, crea una nueva fila en la tabla
      usuarios.forEach(usuario => {
        const row = table.insertRow(-1);

        // Para cada propiedad del usuario, crea una nueva celda en la fila
        headers.slice(0, -2).forEach(header => {  // No incluye las cabeceras "Editar" y "Eliminar"
          const cell = row.insertCell(-1);
          cell.textContent = usuario[header];
          cell.style.textAlign = 'center';
        });

        // Añade las celdas para editar y eliminar
        const editCell = row.insertCell(-1);
        editCell.innerHTML = "✏️";
        editCell.className = "edit";
        editCell.style.textAlign = 'center';

        const deleteCell = row.insertCell(-1);
        deleteCell.innerHTML = "❌";
        deleteCell.className = "delete";
        deleteCell.style.textAlign = 'center';

         // Añade un controlador de eventos al botón de editar
        editCell.addEventListener('click', () => {
          // Crea los campos del formulario basándote en las cabeceras de la tabla y los datos actuales del rol
          let formFields = '<table style="border-collapse: collapse; width: 100%;">';
          headers.forEach((header, index) => {
            if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
              const currentValue = row.cells[index].textContent;
              if (header === 'usuario_id') {
                // Crea un combobox para el campo 'usuario_id'
                formFields += `<tr>
                                 <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                 <td style="padding: 0;">
                                   <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
                userIds.forEach(id => {
                  formFields += `<option value="${id}" ${id === currentValue ? 'selected' : ''}>${id}</option>`;
                });
                formFields += `  </select>
                                 </td>
                               </tr>`;
              } else {
                formFields += `<tr>
                                 <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                 <td style="padding: 0;"><input type="text" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" ${header === 'id' ? 'readonly' : ''} value="${currentValue}"></td>
                               </tr>`;
              }
            }
          });
          formFields += '</table>';

          Swal.fire({
            title: 'Editar usuario',
            html: formFields,
            focusConfirm: false,
            showCancelButton: true,  // Muestra el botón "Cancelar"
            confirmButtonText: 'Guardar',  // Cambia el texto del botón "OK" a "Guardar"
            preConfirm: () => {
              let updatedUser = {};
              let isValid = true;
              
              // Verifica si la tabla tiene un campo 'dni'
              const hasDni = headers.includes('dni');
              
              // Si la tabla tiene un campo 'dni', valida que sea numérico y tenga exactamente 8 dígitos
              if (hasDni) {
                const dniValue = document.getElementById('swal-input-dni').value;
                const dniRegex = /^\d{8}$/;
                if (!dniRegex.test(dniValue)) {
                  isValid = false;
                  Swal.showValidationMessage('El DNI debe ser numérico y tener exactamente 8 dígitos.');
                } else {
                  // Verifica si el DNI ya está registrado en la tabla
                  const dniIndex = headers.indexOf('dni') + 1; // Obtiene el índice del DNI en las cabeceras
                  const dniElements = Array.from(document.querySelectorAll(`#myTable td:nth-child(${dniIndex})`)); // Asume que el DNI está en la columna correspondiente al índice
                  const dniExists = dniElements.some(td => td.textContent === dniValue && td.parentNode.rowIndex !== row.rowIndex);
                  if (dniExists) {
                    isValid = false;
                    Swal.showValidationMessage('El DNI ya está registrado. Por favor, ingresa otro.');
                  }
                }
              }

              headers.forEach(header => {
                if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
                  const value = document.getElementById(`swal-input-${header}`).value;
                  if (!value) {
                    isValid = false;
                    Swal.showValidationMessage('Por favor, rellena todos los campos.');
                  }
                  updatedUser[header.toLowerCase()] = value;
                }
              });

              if (!isValid) {
                return false;
              }
              
              return updatedUser;
            }
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(`http://localhost:3000/usuarios/${usuario._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': localStorage.getItem('token')  // Incluye el token en los encabezados de la solicitud
                },
                body: JSON.stringify(result.value)
              })
                .then(response => response.text())
                .then(message => {
                  console.log(message);  // Imprime el mensaje
                  loadUsuarios();
                })
                .catch(err => console.log(err));
            }
          })
        });

        // Añade un controlador de eventos al botón de eliminar
        deleteCell.addEventListener('click', () => {
          Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, bórralo!'
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(`http://localhost:3000/usuarios/${usuario._id}`, { method: 'DELETE',
              headers: {
                'Authorization': localStorage.getItem('token')
              } })
                .then(() => {
                  Swal.fire(
                    '¡Eliminado!',
                    'El usuario ha sido eliminado.',
                    'success'
                  )
                  // Recarga los datos de los usuarios después de eliminar un usuario
                  loadUsuarios();
                })
                .catch(err => console.log(err));
            }
          })
        });
      });
    })
    .catch(err => console.log(err));
}

// Función para cargar los datos de los roles
function loadRoles() {
  currentTable = 'roles';  // Establece la tabla actual a 'roles'
  fetch('http://localhost:3000/roles', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(roles => {
      // Busca la tabla con el id 'myTable'
      const table = document.getElementById('myTable');

      // Limpia la tabla antes de agregar nuevos datos
      table.innerHTML = '';

      // Crea las cabeceras de la tabla
      const headers = ['id', 'rol', 'usuario_id', 'Editar', 'Eliminar'];
      const headerRow = table.insertRow(-1);
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      // Para cada rol, crea una nueva fila en la tabla
      roles.forEach(rol => {
        const row = table.insertRow(-1);

        // Para cada propiedad del rol, crea una nueva celda en la fila
        headers.slice(0, -2).forEach(header => {  // No incluye las cabeceras "Editar" y "Eliminar"
          const cell = row.insertCell(-1);
          cell.textContent = rol[header];
          cell.style.textAlign = 'center';
        });

        // Añade las celdas para editar y eliminar
        const editCell = row.insertCell(-1);
        editCell.innerHTML = "✏️";
        editCell.className = "edit";
        editCell.style.textAlign = 'center';

        const deleteCell = row.insertCell(-1);
        deleteCell.innerHTML = "❌";
        deleteCell.className = "delete";
        deleteCell.style.textAlign = 'center';

        // Añade un controlador de eventos al botón de edición
        editCell.addEventListener('click', () => {
          // Crea los campos del formulario basándote en las cabeceras de la tabla y los datos actuales del rol
          let formFields = '<table style="border-collapse: collapse; width: 100%;">';
          headers.forEach((header, index) => {
            if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
              const currentValue = row.cells[index].textContent;
              if (header === 'usuario_id') {
                // Crea un combobox para el campo 'usuario_id'
                formFields += `<tr>
                                <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                <td style="padding: 0;">
                                  <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
                userIds.forEach(id => {
                  formFields += `<option value="${id}" ${id === currentValue ? 'selected' : ''}>${id}</option>`;
                });
                formFields += `  </select>
                                </td>
                              </tr>`;
              } else {
                formFields += `<tr>
                                <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                <td style="padding: 0;"><input type="text" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" ${header === 'id' ? 'readonly' : ''} value="${currentValue}"></td>
                              </tr>`;
              }
            }
          });
          formFields += '</table>';

            Swal.fire({
              title: 'Editar rol',
              html: formFields,
              focusConfirm: false,
              showCancelButton: true,  // Muestra el botón "Cancelar"
              confirmButtonText: 'Guardar',  // Cambia el texto del botón "OK" a "Guardar"
              preConfirm: () => {
                let updatedRol = {};
                let isValid = true;
                
                headers.forEach(header => {
                  if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
                    const value = document.getElementById(`swal-input-${header}`).value;
                    if (!value) {
                      isValid = false;
                      Swal.showValidationMessage('Por favor, rellena todos los campos.');
                    }
                    updatedRol[header.toLowerCase()] = value;
                  }
                });

                if (!isValid) {
                  return false;
                }
                
                return updatedRol;
              }
            }).then((result) => {
              if (result.isConfirmed) {
                fetch(`http://localhost:3000/roles/${rol._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')  // Incluye el token en los encabezados de la solicitud
                  },
                  body: JSON.stringify(result.value)
                })
                  .then(response => response.text())
                  .then(message => {
                    console.log(message);  // Imprime el mensaje
                    loadRoles();
                  })
                  .catch(err => console.log(err));
              }
            })
          });
        
        // Añade un controlador de eventos al botón de eliminar
        deleteCell.addEventListener('click', () => {
          Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, bórralo!'
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(`http://localhost:3000/roles/${rol._id}`, { method: 'DELETE',
              headers: {
                'Authorization': localStorage.getItem('token')
              } })
                .then(() => {
                  Swal.fire(
                    '¡Eliminado!',
                    'El usuario ha sido eliminado.',
                    'success'
                  )
                  // Recarga los datos de los usuarios después de eliminar un usuario
                  loadRoles();
                })
                .catch(err => console.log(err));
            }
          })
        });
      });
    })
  .catch(err => console.log(err));
}

// Función para cargar los datos de los pacientes
function loadPacientes() {
  currentTable = 'pacientes';  // Establece la tabla actual a 'pacientes'
  fetch('http://localhost:3000/pacientes', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(pacientes => {
      // Busca la tabla con el id 'myTable'
      const table = document.getElementById('myTable');

      // Limpia la tabla antes de agregar nuevos datos
      table.innerHTML = '';

      // Crea las cabeceras de la tabla
      const headers = ['id', 'usuario_id', 'contacto_emergencia', 'Editar', 'Eliminar'];
      const headerRow = table.insertRow(-1);
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      // Para cada paciente, crea una nueva fila en la tabla
      pacientes.forEach(paciente => {
        const row = table.insertRow(-1);

        // Para cada propiedad del paciente, crea una nueva celda en la fila
        headers.slice(0, -2).forEach(header => {  // No incluye las cabeceras "Editar" y "Eliminar"
          const cell = row.insertCell(-1);
          cell.textContent = paciente[header];
          cell.style.textAlign = 'center';
        });

        // Añade las celdas para editar y eliminar
        const editCell = row.insertCell(-1);
        editCell.innerHTML = "✏️";
        editCell.className = "edit";
        editCell.style.textAlign = 'center';

        const deleteCell = row.insertCell(-1);
        deleteCell.innerHTML = "❌";
        deleteCell.className = "delete";
        deleteCell.style.textAlign = 'center';

        // Añade un controlador de eventos al botón de edición
        editCell.addEventListener('click', () => {
          // Crea los campos del formulario basándote en las cabeceras de la tabla y los datos actuales del paciente
          let formFields = '<table style="border-collapse: collapse; width: 100%;">';
          headers.forEach((header, index) => {
            if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
              const currentValue = row.cells[index].textContent;
              formFields += `<tr>
                                <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                <td style="padding: 0;"><input type="text" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" ${header === 'id' ? 'readonly' : ''} value="${currentValue}"></td>
                              </tr>`;
            }
          });
          formFields += '</table>';

            Swal.fire({
              title: 'Editar paciente',
              html: formFields,
              focusConfirm: false,
              showCancelButton: true,  // Muestra el botón "Cancelar"
              confirmButtonText: 'Guardar',  // Cambia el texto del botón "OK" a "Guardar"
              preConfirm: () => {
                let updatedPaciente = {};
                let isValid = true;
                
                headers.forEach(header => {
                  if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
                    const value = document.getElementById(`swal-input-${header}`).value;
                    if (!value) {
                      isValid = false;
                      Swal.showValidationMessage('Por favor, rellena todos los campos.');
                    }
                    updatedPaciente[header.toLowerCase()] = value;
                  }
                });

                if (!isValid) {
                  return false;
                }
                
                return updatedPaciente;
              }
            }).then((result) => {
              if (result.isConfirmed) {
                fetch(`http://localhost:3000/pacientes/${paciente._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')  // Incluye el token en los encabezados de la solicitud
                  },
                  body: JSON.stringify(result.value)
                })
                  .then(response => response.text())
                  .then(message => {
                    console.log(message);  // Imprime el mensaje
                    loadPacientes();
                  })
                  .catch(err => console.log(err));
              }
            })
          });
        
        // Añade un controlador de eventos al botón de eliminar
        deleteCell.addEventListener('click', () => {
          Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, bórralo!'
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(`http://localhost:3000/pacientes/${paciente._id}`, { method: 'DELETE',
              headers: {
                'Authorization': localStorage.getItem('token')
              } })
                .then(() => {
                  Swal.fire(
                    '¡Eliminado!',
                    'El paciente ha sido eliminado.',
                    'success'
                  )
                  // Recarga los datos de los pacientes después de eliminar un paciente
                  loadPacientes();
                })
                .catch(err => console.log(err));
            }
          })
        });
      });
    })
  .catch(err => console.log(err));
}

// Función para cargar los datos de los odontólogos
function loadOdontologos() {
  currentTable = 'odontologos';  // Establece la tabla actual a 'odontologos'
  fetch('http://localhost:3000/odontologos', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(odontologos => {
      // Busca la tabla con el id 'myTable'
      const table = document.getElementById('myTable');

      // Limpia la tabla antes de agregar nuevos datos
      table.innerHTML = '';

      // Crea las cabeceras de la tabla
      const headers = ['id', 'usuario_id', 'experiencia_laboral_anios', 'horario_atencion', 'salario', 'Editar', 'Eliminar'];
      const headerRow = table.insertRow(-1);
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      // Para cada odontólogo, crea una nueva fila en la tabla
      odontologos.forEach(odontologo => {
        const row = table.insertRow(-1);

        // Para cada propiedad del odontólogo, crea una nueva celda en la fila
        headers.slice(0, -2).forEach(header => {  // No incluye las cabeceras "Editar" y "Eliminar"
          const cell = row.insertCell(-1);
          cell.textContent = odontologo[header];
          cell.style.textAlign = 'center';
        });

        // Añade las celdas para editar y eliminar
        const editCell = row.insertCell(-1);
        editCell.innerHTML = "✏️";
        editCell.className = "edit";
        editCell.style.textAlign = 'center';

        const deleteCell = row.insertCell(-1);
        deleteCell.innerHTML = "❌";
        deleteCell.className = "delete";
        deleteCell.style.textAlign = 'center';

        // Añade un controlador de eventos al botón de edición
        editCell.addEventListener('click', () => {
          // Crea los campos del formulario basándote en las cabeceras de la tabla y los datos actuales del odontólogo
          let formFields = '<table style="border-collapse: collapse; width: 100%;">';
          headers.forEach((header, index) => {
            if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
              const currentValue = row.cells[index].textContent;
              formFields += `<tr>
                                <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                <td style="padding: 0;"><input type="text" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" ${header === 'id' ? 'readonly' : ''} value="${currentValue}"></td>
                              </tr>`;
            }
          });
          formFields += '</table>';

            Swal.fire({
              title: 'Editar odontólogo',
              html: formFields,
              focusConfirm: false,
              showCancelButton: true,  // Muestra el botón "Cancelar"
              confirmButtonText: 'Guardar',  // Cambia el texto del botón "OK" a "Guardar"
              preConfirm: () => {
                let updatedOdontologo = {};
                let isValid = true;
                
                headers.forEach(header => {
                  if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
                    const value = document.getElementById(`swal-input-${header}`).value;
                    if (!value) {
                      isValid = false;
                      Swal.showValidationMessage('Por favor, rellena todos los campos.');
                    }
                    updatedOdontologo[header.toLowerCase()] = value;
                  }
                });

                if (!isValid) {
                  return false;
                }
                
                return updatedOdontologo;
              }
            }).then((result) => {
              if (result.isConfirmed) {
                fetch(`http://localhost:3000/odontologos/${odontologo._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')  // Incluye el token en los encabezados de la solicitud
                  },
                  body: JSON.stringify(result.value)
                })
                  .then(response => response.text())
                  .then(message => {
                    console.log(message);  // Imprime el mensaje
                    loadOdontologos();
                  })
                  .catch(err => console.log(err));
              }
            })
          });
        
        // Añade un controlador de eventos al botón de eliminar
        deleteCell.addEventListener('click', () => {
          Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, bórralo!'
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(`http://localhost:3000/odontologos/${odontologo._id}`, { method: 'DELETE',
              headers: {
                'Authorization': localStorage.getItem('token')
              } })
                .then(() => {
                  Swal.fire(
                    '¡Eliminado!',
                    'El odontólogo ha sido eliminado.',
                    'success'
                  )
                  // Recarga los datos de los odontólogos después de eliminar un odontólogo
                  loadOdontologos();
                })
                .catch(err => console.log(err));
            }
          })
        });
      });
    })
  .catch(err => console.log(err));
}

// Función para cargar los datos de las citas
function loadCitas() {
  currentTable = 'citas';  // Establece la tabla actual a 'citas'
  fetch('http://localhost:3000/citas', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(citas => {
      // Busca la tabla con el id 'myTable'
      const table = document.getElementById('myTable');

      // Limpia la tabla antes de agregar nuevos datos
      table.innerHTML = '';

      // Crea las cabeceras de la tabla
      const headers = ['id', 'paciente_id', 'odontologo_id', 'fecha', 'hora', 'motivo', 'tipo_pago', 'Editar', 'Eliminar'];
      const headerRow = table.insertRow(-1);
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });

      // Para cada cita, crea una nueva fila en la tabla
      citas.forEach(cita => {
        const row = table.insertRow(-1);

        // Para cada propiedad de la cita, crea una nueva celda en la fila
        headers.slice(0, -2).forEach(header => {  // No incluye las cabeceras "Editar" y "Eliminar"
          const cell = row.insertCell(-1);
          cell.textContent = cita[header];
          cell.style.textAlign = 'center';
        });

        // Añade las celdas para editar y eliminar
        const editCell = row.insertCell(-1);
        editCell.innerHTML = "✏️";
        editCell.className = "edit";
        editCell.style.textAlign = 'center';

        const deleteCell = row.insertCell(-1);
        deleteCell.innerHTML = "❌";
        deleteCell.className = "delete";
        deleteCell.style.textAlign = 'center';

        editCell.addEventListener('click', () => {
          // Obtén los IDs de los pacientes y odontólogos
          Promise.all([
            fetch('http://localhost:3000/pacientes', { headers: { 'Authorization': localStorage.getItem('token') } }).then(response => response.json()),
            fetch('http://localhost:3000/odontologos', { headers: { 'Authorization': localStorage.getItem('token') } }).then(response => response.json())
          ]).then(([pacientes, odontologos]) => {
            const pacienteIds = pacientes.map(paciente => paciente.id);
            const odontologoIds = odontologos.map(odontologo => odontologo.id);
        
            // Crea los campos del formulario basándote en las cabeceras de la tabla y los datos actuales de la cita
            let formFields = '<table style="border-collapse: collapse; width: 100%;">';
            headers.forEach((header, index) => {
              if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
                const currentValue = row.cells[index].textContent;
                if (header === 'fecha') {
                  // Crea un campo de entrada de fecha para el campo 'fecha'
                  formFields += `<tr>
                                  <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                  <td style="padding: 0;"><input type="date" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" value="${currentValue.split('T')[0]}"></td>
                                </tr>`;
                } else if (header === 'hora') {
                  // Crea un campo de entrada de tiempo para el campo 'hora'
                  formFields += `<tr>
                                  <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                  <td style="padding: 0;"><input type="time" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" value="${currentValue}"></td>
                                </tr>`;
                } else if (header === 'paciente_id') {
                  // Crea un combobox para el campo 'paciente_id'
                  formFields += `<tr>
                                  <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                  <td style="padding: 0;">
                                    <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
                  pacienteIds.forEach(id => {
                    formFields += `<option value="${id}" ${id === currentValue ? 'selected' : ''}>${id}</option>`;
                  });
                  formFields += `</select>
                                  </td>
                                </tr>`;
                } else if (header === 'odontologo_id') {
                  // Crea un combobox para el campo 'odontologo_id'
                  formFields += `<tr>
                                  <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                  <td style="padding: 0;">
                                    <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
                  odontologoIds.forEach(id => {
                    formFields += `<option value="${id}" ${id === currentValue ? 'selected' : ''}>${id}</option>`;
                  });
                  formFields += `</select>
                                  </td>
                                </tr>`;
                } else {
                  formFields += `<tr>
                                  <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                                  <td style="padding: 0;"><input type="text" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" ${header === 'id' ? 'readonly' : ''} value="${currentValue}"></td>
                                </tr>`;
                }
              }
            });
            formFields += '</table>';
            Swal.fire({
              title: 'Editar cita',
              html: formFields,
              focusConfirm: false,
              showCancelButton: true,  // Muestra el botón "Cancelar"
              confirmButtonText: 'Guardar',  // Cambia el texto del botón "OK" a "Guardar"
              preConfirm: () => {
                let updatedCita = {};
                let isValid = true;
                
                headers.forEach(header => {
                  if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
                    const value = document.getElementById(`swal-input-${header}`).value;
                    if (!value) {
                      isValid = false;
                      Swal.showValidationMessage('Por favor, rellena todos los campos.');
                    }
                    updatedCita[header.toLowerCase()] = value;
                  }
                });

                if (!isValid) {
                  return false;
                }
                
                return updatedCita;
              }
            }).then((result) => {
              if (result.isConfirmed) {
                fetch(`http://localhost:3000/citas/${cita._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')  // Incluye el token en los encabezados de la solicitud
                  },
                  body: JSON.stringify(result.value)
                })
                  .then(response => response.text())
                  .then(message => {
                    console.log(message);  // Imprime el mensaje
                    loadCitas();
                  })
                  .catch(err => console.log(err));
              }
            })
          });
        });
        
        // Añade un controlador de eventos al botón de eliminar
        deleteCell.addEventListener('click', () => {
          Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, bórralo!'
          }).then((result) => {
            if (result.isConfirmed) {
              fetch(`http://localhost:3000/citas/${cita._id}`, { method: 'DELETE',
              headers: {
                'Authorization': localStorage.getItem('token')
              } })
                .then(() => {
                  Swal.fire(
                    '¡Eliminado!',
                    'La cita ha sido eliminada.',
                    'success'
                  )
                  // Recarga los datos de las citas después de eliminar una cita
                  loadCitas();
                })
                .catch(err => console.log(err));
            }
          })
        });
      });
    })
  .catch(err => console.log(err));
}

// Primero, selecciona todos los enlaces del menú lateral
const links = document.querySelectorAll('.sidebar a');
// Luego, añade un controlador de eventos a cada enlace
links.forEach(link => {
  link.addEventListener('click', event => {
    // Evita que el enlace navegue a otra página
    event.preventDefault();

    // Obtén el nombre de la tabla que quieres mostrar
    const tableName = link.innerText;

    // Si el enlace es 'usuario', carga los datos de los usuarios
    if (tableName === 'Usuario') {
        loadUsuarios();
    }
    else if (tableName === 'Roles') {
        loadRoles();
    }
    else if (tableName === 'Pacientes') {
        loadPacientes();
    }
    else if (tableName === 'Odontologo') {
        loadOdontologos();
    }
    else if (tableName === 'Cita') {
        loadCitas();
    }
    // Cambia el título de la página
    document.querySelector('.home-section .text').innerText = 'Tabla de ' + tableName;
  });
});

// Selecciona el botón
const button = document.getElementById('addRowButton');

// Añade un controlador de eventos al botón
button.addEventListener('click', () => {
  // Obtén las cabeceras de la tabla
  const headers = Array.from(document.querySelectorAll('#myTable th')).map(th => th.textContent);

  // Verifica si la tabla tiene un campo 'id'
  const hasId = headers.includes('id');

  // Si la tabla tiene un campo 'id', obtén el último id de la tabla
  const lastIdElement = document.querySelector('#myTable tr:last-child td:first-child');
  let lastId = 0;
  if (hasId && lastIdElement) {
    lastId = parseInt(lastIdElement.textContent, 10);
  }

  // Obtén los IDs de los pacientes y odontólogos
  Promise.all([
    fetch('http://localhost:3000/pacientes', { headers: { 'Authorization': localStorage.getItem('token') } }).then(response => response.json()),
    fetch('http://localhost:3000/odontologos', { headers: { 'Authorization': localStorage.getItem('token') } }).then(response => response.json())
  ]).then(([pacientes, odontologos]) => {
    const pacienteIds = pacientes.map(paciente => paciente.id);
    const odontologoIds = odontologos.map(odontologo => odontologo.id);

    // Crea los campos del formulario basándote en las cabeceras de la tabla
    let formFields = '<table style="border-collapse: collapse; width: 100%;">';
    headers.forEach((header, index) => {
      if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
        if (header === 'usuario_id') {
          // Crea un combobox para el campo 'usuario_id'
          formFields += `<tr>
                          <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                          <td style="padding: 0;">
                            <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
          userIds.forEach(id => {
            formFields += `<option value="${id}">${id}</option>`;
          });
          formFields += `  </select>
                          </td>
                        </tr>`;
        } else if (header === 'fecha') {
          // Crea un campo de entrada de fecha para el campo 'fecha'
          formFields += `<tr>
                          <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                          <td style="padding: 0;"><input type="date" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;"></td>
                        </tr>`;
        } else if (header === 'hora') {
          // Crea un campo de entrada de tiempo para el campo 'hora'
          formFields += `<tr>
                          <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                          <td style="padding: 0;"><input type="time" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;"></td>
                        </tr>`;
        } else if (header === 'paciente_id') {
          // Crea un combobox para el campo 'paciente_id'
          formFields += `<tr>
                          <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                          <td style="padding: 0;">
                            <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
          pacienteIds.forEach(id => {
            formFields += `<option value="${id}">${id}</option>`;
          });
          formFields += `</select>
                          </td>
                        </tr>`;
        } else if (header === 'odontologo_id') {
          // Crea un combobox para el campo 'odontologo_id'
          formFields += `<tr>
                          <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                          <td style="padding: 0;">
                            <select id="swal-input-${header}" class="swal2-input" style="margin-top: 0;">`;
          odontologoIds.forEach(id => {
            formFields += `<option value="${id}">${id}</option>`;
          });
          formFields += `</select>
                          </td>
                        </tr>`;
        } else {
          formFields += `<tr>
                          <td style="padding: 0;"><label for="swal-input-${header}">${header}</label></td>
                          <td style="padding: 0;"><input type="text" id="swal-input-${header}" class="swal2-input" style="margin-top: 0;" ${header === 'id' ? 'readonly' : ''} value="${header === 'id' ? (lastId !== null ? lastId + 1 : '') : ''}"></td>
                        </tr>`;
        }
      }
    });
    formFields += '</table>';
  
    let name = "";
  if (currentTable === 'usuarios') {
    name = 'Añadir nuevo usuario';
  } else if (currentTable === 'roles') {
    name = 'Añadir nuevo rol';
  } else if (currentTable === 'pacientes') {
    name = 'Añadir nuevo paciente';
  } else if (currentTable === 'odontologos') {
    name = 'Añadir nuevo odontologo';
  } else if (currentTable === 'citas') {
    name = 'Añadir nueva cita';
  }
  Swal.fire({
    title: name,
    html: formFields,
    focusConfirm: false,
    showCancelButton: true,  // Muestra el botón "Cancelar"
    confirmButtonText: 'Añadir',  // Cambia el texto del botón "OK" a "Añadir"
    preConfirm: () => {
      let newUser = {};
      let isValid = true;
      
      // Verifica si la tabla tiene un campo 'dni'
      const hasDni = headers.includes('dni');
      
      // Si la tabla tiene un campo 'dni', valida que sea numérico y tenga exactamente 8 dígitos
      if (hasDni) {
        const dniValue = document.getElementById('swal-input-dni').value;
        const dniRegex = /^\d{8}$/;
        if (!dniRegex.test(dniValue)) {
          isValid = false;
          Swal.showValidationMessage('El DNI debe ser numérico y tener exactamente 8 dígitos.');
        } else {
          // Verifica si el DNI ya está registrado en la tabla
          const dniIndex = headers.indexOf('dni') + 1; // Obtiene el índice del DNI en las cabeceras
          const dniElements = Array.from(document.querySelectorAll(`#myTable td:nth-child(${dniIndex})`)); // Asume que el DNI está en la columna correspondiente al índice
          const dniExists = dniElements.some(td => td.textContent === dniValue);
          if (dniExists) {
            isValid = false;
            Swal.showValidationMessage('El DNI ya está registrado. Por favor, ingresa otro.');
          }
        }
      }

      headers.forEach(header => {
        if (header !== 'Editar' && header !== 'Eliminar') {  // Excluye las cabeceras "Editar" y "Eliminar"
          const value = document.getElementById(`swal-input-${header}`).value;
          if (!value) {
            isValid = false;
            Swal.showValidationMessage('Por favor, rellena todos los campos.');
          }
          newUser[header.toLowerCase()] = value;
        }
      });

      if (!isValid) {
        return false;
      }
      
      return newUser;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      let url;
      let loadFunction;

      if (currentTable === 'usuarios') {
        url = 'http://localhost:3000/usuarios';
        loadFunction = loadUsuarios;
      } else if (currentTable === 'roles') {
        url = 'http://localhost:3000/roles';
        loadFunction = loadRoles;
      } else if (currentTable === 'pacientes') {
        url = 'http://localhost:3000/pacientes';
        loadFunction = loadPacientes;
      } else if (currentTable === 'odontologos') {
        url = 'http://localhost:3000/odontologos';
        loadFunction = loadOdontologos;
      } else if (currentTable === 'citas') {
        url = 'http://localhost:3000/citas';
        loadFunction = loadCitas;
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(result.value)
      })
        .then(response => response.text())
        .then(message => {
          console.log(message);  // Imprime el mensaje
          loadFunction();
        })
        .catch(err => console.log(err));
      }
    })
  });
})

const logoutButton = document.getElementById('log_out');

  logoutButton.addEventListener('click', () => {
    // Elimina el token del almacenamiento local
    localStorage.removeItem('token');
    
    // Redirige al usuario a la página de inicio de sesión
    window.location.href = '/login-register/login-register.html';
  });

  