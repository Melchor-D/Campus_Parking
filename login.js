// Esperar que cargue la página
window.onload = () => {
  document.getElementById("loader").classList.add("hidden");
};

// Evento de login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Traemos todos los usuarios guardados
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Buscamos si existe
  const userFound = usuarios.find(
    (u) => u.email === email && u.password === password
  );

  if (!userFound) {
    alert("❌ Usuario o contraseña incorrecta");
    return;
  }

  // Guardamos la sesión del usuario
  localStorage.setItem("sesion", JSON.stringify(userFound));

  alert("✔️ Bienvenido " + userFound.nombre);

  // Redirige a la página principal (index.html)
  window.location.href = "index.html";
}); 