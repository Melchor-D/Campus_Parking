// Ocultar loader y siempre mostrar login al cargar la página
window.onload = () => {
  document.getElementById("loader").classList.add("hidden");

  // Siempre pedir login al abrir la página
  localStorage.removeItem("sesion");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
};

// Función llamada desde el botón "Ingresar"
function login() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl  = document.getElementById("login-error");

  if (!email || !password) {
    errorEl.textContent = "Por favor ingresa correo y contraseña.";
    return;
  }

  const usuarios  = DB.get("usuarios");
  const userFound = usuarios.find(u => u.email === email && u.password === password);

  if (!userFound) {
    errorEl.textContent = "❌ Usuario o contraseña incorrecta.";
    return;
  }

  errorEl.textContent = "";
  localStorage.setItem("sesion", JSON.stringify(userFound));
  mostrarApp(userFound);
}

function mostrarApp(user) {
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadView("dashboard");
}

// Cerrar sesión
function logout() {
  localStorage.removeItem("sesion");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("email").value    = "";
  document.getElementById("password").value = "";
}