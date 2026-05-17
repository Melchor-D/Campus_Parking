// Loader
setTimeout(() => {
  document.getElementById("loader").style.display = "none";
}, 1200);

// Cambiar vistas
function loadView(view) {
  const cont = document.getElementById("view");

  switch (view) {

    case "dashboard":
      cont.innerHTML = `
        <h2>Dashboard</h2>
        <p>Bienvenido al sistema Campus Parking.</p>
      `;
    break;

    case "vehiculos":
      renderVehiculos();
    break;

    case "parqueo":
      renderParqueo();
    break;
  }
}

// ===============================
// CRUD VEHÍCULOS
// ===============================
function renderVehiculos() {
  const lista = DB.get("vehiculos");

  view.innerHTML = `
    <h2>Vehículos</h2>
    <input id="codigo" placeholder="Código">
    <input id="nombreV" placeholder="Nombre">
    <input id="tarifa" placeholder="Tarifa">

    <button onclick="addVehiculo()">Agregar</button>

    <div id="listaVehiculos"></div>
  `;

  const cont = listaVehiculos;
  lista.forEach(v => {
    const card = document.createElement("card-vehiculo");
    card.data = v;
    cont.appendChild(card);
  });
}

function addVehiculo() {
  const vehiculos = DB.get("vehiculos");

  vehiculos.push({
    codigo: codigo.value,
    nombre: nombreV.value,
    tarifa: tarifa.value,
  });

  DB.set("vehiculos", vehiculos);
  loadView("vehiculos");
}

// ===============================
// PARQUEO
// ===============================
function renderParqueo() {
  const vehiculos = DB.get("vehiculos");
  const parqueos = DB.get("parqueos");

  view.innerHTML = `
    <h2>Registro Parqueo</h2>

    <input id="placa" placeholder="Placa">
    
    <select id="tipoVeh">
      ${vehiculos.map(v => `<option>${v.nombre}</option>`).join("")}
    </select>

    <input id="slot" placeholder="Slot">

    <button onclick="agregarParqueo()">Registrar</button>

    <div id="listaParqueo"></div>
  `;

  const cont = listaParqueo;
  parqueos.forEach(p => {
    const card = document.createElement("card-parqueo");
    card.data = p;
    cont.appendChild(card);
  });
}

function agregarParqueo() {
  const parqueos = DB.get("parqueos");

  parqueos.push({
    placa: placa.value,
    tipo: tipoVeh.value,
    hora: new Date().toLocaleTimeString(),
    fecha: new Date().toLocaleDateString(),
    slot: slot.value
  });

  DB.set("parqueos", parqueos);
  loadView("parqueo");
}