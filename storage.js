
if (!localStorage.getItem("usuarios")) {
  const admin = {
    email: "admin@campusparking.com",
    password: "Admin123",
    nombre: "Administrador"
  };
  localStorage.setItem("usuarios", JSON.stringify([admin]));
}

// Tipos de vehículo
if (!localStorage.getItem("vehiculos")) {
  localStorage.setItem("vehiculos", JSON.stringify([]));
}

// Parqueos activos
if (!localStorage.getItem("parqueos")) {
  localStorage.setItem("parqueos", JSON.stringify([]));
}

// Historial
if (!localStorage.getItem("historial")) {
  localStorage.setItem("historial", JSON.stringify([]));
}

const DB = {
  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const MAX_SLOTS = 35;