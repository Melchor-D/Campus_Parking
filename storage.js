// Usuario inicial
if (!localStorage.getItem("usuarios")) {
  const admin = {
    email: "admin@campusparking.com",
    password: "Admin123",
    nombre: "Administrador"
  };
  localStorage.setItem("usuarios", JSON.stringify([admin]));
}

// Vehículos
if (!localStorage.getItem("vehiculos")) {
  localStorage.setItem("vehiculos", JSON.stringify([]));
}

// Parqueos
if (!localStorage.getItem("parqueos")) {
  localStorage.setItem("parqueos", JSON.stringify([]));
}

const DB = {
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};