window.addEventListener('DOMContentLoaded', (event) => {
    // Comprueba si la URL contiene 'loginTrue'
    if (window.location.search.includes('loginTrue')) {
        // Si es así, elimina el elemento de inicio de sesión
        document.querySelector('.site-menu a[href="/login-register/login-register.html"]').parentElement.remove();
    }
});
