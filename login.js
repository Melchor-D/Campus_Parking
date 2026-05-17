// Ocultar loader cuando la página cargue
window.onload = () => {
  document.getElementById("loader").classList.add("hidden");
 
  // Si ya hay sesión activa, mostrar la app directamente
  const sesion = localStorage.getItem("sesion");
  if (sesion) {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    loadView("dashboard");
  }
};
 
// Función de login llamada desde el botón
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("login-error");
 
  if (!email || !password) {
    errorEl.textContent = "Por favor ingresa correo y contraseña.";
    return;
  }
 
  // Traemos todos los usuarios guardados
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
 
  // Buscamos si existe
  const userFound = usuarios.find(
    (u) => u.email === email && u.password === password
  );
 
  if (!userFound) {
    errorEl.textContent = "❌ Usuario o contraseña incorrecta.";
    return;
  }
 
  // Guardamos la sesión
  localStorage.setItem("sesion", JSON.stringify(userFound));
 
  // Ocultamos login y mostramos la app
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  errorEl.textContent = "";
 
  loadView("dashboard");
}
 
// Función de logout
function logout() {
  localStorage.removeItem("sesion");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}