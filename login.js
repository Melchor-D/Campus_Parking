window.onload = () => {
  document.getElementById("loader").classList.add("hidden");

  const sesion = localStorage.getItem("sesion");

  if (sesion) {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    loadView("dashboard");
  } else {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
  }
};

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

  localStorage.setItem("sesion", JSON.stringify(userFound));

  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadView("dashboard");
}

function logout() {
  localStorage.removeItem("sesion");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("email").value    = "";
  document.getElementById("password").value = "";
}