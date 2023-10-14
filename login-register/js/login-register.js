const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const registerFetch = document.getElementById('btn-signup');
const loginFetch = document.getElementById('btn-signin');

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

registerBtn.addEventListener('click', () => {
  container.classList.add("active");
});

registerFetch.addEventListener('click', (event) => {
  event.preventDefault();

  const name = document.querySelector('.sign-up input[type="text"]');
  const email = document.querySelector('.sign-up input[type="email"]');
  const password = document.querySelector('.sign-up input[type="password"]');

  // Validar que todos los campos estén llenos
  if (!name.value || !email.value || !password.value) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Todos los campos deben estar llenos!',
    });
    return;
  }

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: name.value,
      email: email.value,
      password: password.value
    })
  })
  .then(response => response.text()) // Cambia esto para tratar la respuesta como texto
  .then(data => {
    if (data === 'User has been registered successfully') {
      Swal.fire(
        'Registro exitoso!',
        'Tu cuenta ha sido creada.',
        'success'
      );
      
      // Limpiar los campos
      name.value = '';
      email.value = '';
      password.value = '';
      container.classList.remove("active");
    } else if (data === 'This email is already registered') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Este correo electrónico ya está registrado!',
      });
      
    } else if (data === 'This name is already in use')
    {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Este nombre de usuario ya está registrado!',
      });
    } else if (data === 'Invalid email format') { // Añade este bloque para manejar el nuevo error
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El formato del correo electrónico es inválido!',
      }); 
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Algo salió mal!',
      });
      
    } 
  })
});

loginFetch.addEventListener('click', (event) => {
  event.preventDefault();

  const email = document.querySelector('.sign-in input[type="email"]');
  const password = document.querySelector('.sign-in input[type="password"]');

  // Validar que todos los campos estén llenos
  if (!email.value || !password.value) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Todos los campos deben estar llenos!',
    });
    return;
  }

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(response => response.json()) // Cambia esto para tratar la respuesta como JSON
  .then(data => {
    if (data.message === 'User has been logged in successfully') {
      // Guarda el token en algún lugar del cliente, por ejemplo, en localStorage
      localStorage.setItem('token', data.token);
  
      // Redirigir al usuario a la página del panel de control
      window.location.href = '/dashboard/dashboard.html';
      
    } else if (data.message === 'Invalid email or password') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Correo electrónico o contraseña inválidos!',
      });
      
    } else if (data.message === 'Invalid email format') { 
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El formato del correo electrónico es inválido!',
      }); 
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Algo salió mal!',
      });    
    }   
  })  
});

window.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    // Si el formulario de registro está activo y visible
    if (container.classList.contains("active")) {
      registerFetch.click();
    } else {
      loginFetch.click();
    }
  }
});
