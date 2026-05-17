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
  const cont = document.getElementById("view");
 
  cont.innerHTML = `
    <h2>Vehículos</h2>
    <input id="codigo" placeholder="Código">
    <input id="nombreV" placeholder="Nombre">
    <input id="tarifa" placeholder="Tarifa">
    <button onclick="addVehiculo()">Agregar</button>
    <div id="listaVehiculos"></div>
  `;
 
  const lista2 = document.getElementById("listaVehiculos");
  lista.forEach(v => {
    const card = document.createElement("card-vehiculo");
    card.data = v;
    lista2.appendChild(card);
  });
}
 
function addVehiculo() {
  const codigo = document.getElementById("codigo").value.trim();
  const nombreV = document.getElementById("nombreV").value.trim();
  const tarifa = document.getElementById("tarifa").value.trim();
 
  if (!codigo || !nombreV || !tarifa) {
    alert("Por favor completa todos los campos.");
    return;
  }
 
  const vehiculos = DB.get("vehiculos");
  vehiculos.push({ codigo, nombre: nombreV, tarifa });
  DB.set("vehiculos", vehiculos);
  loadView("vehiculos");
}
 
// ===============================
// PARQUEO
// ===============================
function renderParqueo() {
  const vehiculos = DB.get("vehiculos");
  const parqueos = DB.get("parqueos");
  const cont = document.getElementById("view");
 
  cont.innerHTML = `
    <h2>Registro Parqueo</h2>
    <input id="placa" placeholder="Placa">
    <select id="tipoVeh">
      ${vehiculos.length
        ? vehiculos.map(v => `<option value="${v.nombre}">${v.nombre}</option>`).join("")
        : `<option disabled>No hay vehículos registrados</option>`
      }
    </select>
    <input id="slot" placeholder="Slot">
    <button onclick="agregarParqueo()">Registrar</button>
    <div id="listaParqueo"></div>
  `;
 
  const lista = document.getElementById("listaParqueo");
  parqueos.forEach(p => {
    const card = document.createElement("card-parqueo");
    card.data = p;
    lista.appendChild(card);
  });
}
 
function agregarParqueo() {
  const placa = document.getElementById("placa").value.trim();
  const tipoVeh = document.getElementById("tipoVeh").value;
  const slot = document.getElementById("slot").value.trim();
 
  if (!placa || !slot) {
    alert("Por favor completa todos los campos.");
    return;
  }
 
  const parqueos = DB.get("parqueos");
  parqueos.push({
    placa,
    tipo: tipoVeh,
    hora: new Date().toLocaleTimeString(),
    fecha: new Date().toLocaleDateString(),
    slot
  });
 
  DB.set("parqueos", parqueos);
  loadView("parqueo");
}
 