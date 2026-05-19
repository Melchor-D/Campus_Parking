function usedSlots() {
  return DB.get("parqueos").map(p => p.slot);
}

function fmt(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function calcTarifa(entrada, tarifaHora) {
  const horas = Math.max(Math.ceil((Date.now() - entrada) / 3600000), 1);
  return (horas * tarifaHora).toFixed(2);
}

function tipoBadge(tipo) {
  const map = {
    carro: { cls: "badge-carro", icon: "🚗", label: "Carro" },
    moto:  { cls: "badge-moto",  icon: "🏍️", label: "Moto"  },
    bici:  { cls: "badge-bici",  icon: "🚲", label: "Bici"  }
  };
  const t = map[tipo] || map.carro;
  return `<span class="tipo-badge ${t.cls}">${t.icon} ${t.label}</span>`;
}

// ───────────────────── Vista principal ─────────────────────
function loadView(view) {
  const cont = document.getElementById("view");

  switch (view) {
    case "dashboard":  renderDashboard();  break;
    case "vehiculos":  renderVehiculos();  break;
    case "parqueo":    renderParqueo();    break;
    case "historial":  renderHistorial();  break;
  }

  document.querySelectorAll(".navbar li").forEach(li => li.classList.remove("active"));
  const navItems = document.querySelectorAll(".navbar li");
  navItems.forEach(li => {
    if (li.getAttribute("onclick") && li.getAttribute("onclick").includes(view)) {
      li.classList.add("active");
    }
  });
}

// ───────────────────── panel ─────────────────────
function renderDashboard() {
  const parqueos= DB.get("parqueos");
  const historial= DB.get("historial");
  const libres= MAX_SLOTS - parqueos.length;
  const pct= Math.round((parqueos.length / MAX_SLOTS) * 100);

  const recaudado = historial.reduce((s, p) => s + p.totalPagado, 0);
  const hoy = historial.filter(p =>
    new Date(p.salida).toDateString() === new Date().toDateString()
  ).length;

  // mapa
  const used = usedSlots();
  let slotDots = "";
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const occ = used.includes(i);
    slotDots += `<div class="slot-dot ${occ ? "occ" : "free"}">${i}</div>`;
  }

  // tabla
  let filas = parqueos.length
    ? parqueos.map(p => `
      <tr>
        <td><span class="placa-badge">${p.placa}</span></td>
        <td>${tipoBadge(p.tipo)}</td>
        <td><b>${p.slot}</b></td>
        <td>${fmt(Date.now() - p.entrada)}</td>
        <td class="tarifa-col">Q${calcTarifa(p.entrada, p.tarifaHora)}</td>
      </tr>`).join("")
    : `<tr><td colspan="5" class="empty-td">No hay vehículos.</td></tr>`;

  document.getElementById("view").innerHTML = `
    <h2>Dashboard</h2>

    <div class="stats-row">
      <div class="stat-card green">
        <p class="stat-label">Libres</p>
        <p class="stat-value">${libres}</p>
        <p class="stat-sub">de ${MAX_SLOTS}</p>
      </div>
      <div class="stat-card red">
        <p class="stat-label">Ocupados</p>
        <p class="stat-value">${parqueos.length}</p>
        <p class="stat-sub">${pct}%</p>
      </div>
      <div class="stat-card purple">
        <p class="stat-label">Salidas hoy</p>
        <p class="stat-value">${hoy}</p>
      </div>
      <div class="stat-card amber">
        <p class="stat-label">Recaudado</p>
        <p class="stat-value">Q${recaudado.toFixed(2)}</p>
      </div>
    </div>

    <div class="cap-section">
      <div class="cap-header">
        <span>Mapa</span>
        <span class="cap-pct">${pct}% ocupado</span>
      </div>
      <div class="cap-bar"><div class="cap-fill" style="width:${pct}%"></div></div>
      <div class="slots-grid">${slotDots}</div>
    </div>

    <div class="table-section">
      <h3>Vehículos activos</h3>
      <table>
        <thead>
          <tr><th>Placa</th><th>Tipo</th><th>Espacio</th><th>Tiempo</th><th>Total</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `;
}

// ───────────────────── Parqueo (ingresos) ─────────────────────
function renderParqueo() {
  const parqueos = DB.get("parqueos");
  const used = usedSlots();

  let slotOptions = "";
  for (let i = 1; i <= MAX_SLOTS; i++) {
    if (!used.includes(i)) slotOptions += `<option value="${i}">Espacio ${i}</option>`;
  }
  if (!slotOptions) slotOptions = `<option disabled>No hay espacios</option>`;

  let filas = parqueos.length
    ? parqueos.map(p => `
      <tr>
        <td><span class="placa-badge">${p.placa}</span></td>
        <td>${tipoBadge(p.tipo)}</td>
        <td>${p.slot}</td>
        <td>${new Date(p.entrada).toLocaleString()}</td>
        <td id="t-${p.id}" class="time-col">${fmt(Date.now() - p.entrada)}</td>
        <td>Q${p.tarifaHora}/h</td>
        <td id="q-${p.id}" class="tarifa-col">Q${calcTarifa(p.entrada, p.tarifaHora)}</td>
        <td style="display:flex; gap:6px;">
  <button onclick="editarParqueo(${p.id})">
    Editar
  </button>

  <button class="btn-salida"
    onclick="registrarSalida(${p.id})">
    Salida
  </button>
</td>
      </tr>`).join("")
    : `<tr><td colspan="8" class="empty-td">Sin vehículos.</td></tr>`;

  document.getElementById("view").innerHTML = `
    <h2>Registro de Parqueo</h2>

    <div class="form-card">
      <h3>Nuevo ingreso</h3>
      <div class="form-grid">
        <div class="form-field">
          <label>Placa</label>
          <input id="placa" style="text-transform:uppercase">
        </div>
        <div class="form-field">
          <label>Tipo</label>
          <select id="tipoVeh">
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
            <option value="bici">Bici</option>
          </select>
        </div>
        <div class="form-field">
          <label>Espacio</label>
          <select id="slot">${slotOptions}</select>
        </div>
        <div class="form-field">
          <label>Tarifa</label>
          <input id="tarifa" type="number" value="5">
        </div>
        <button onclick="agregarParqueo()">Registrar entrada</button>
      </div>
    </div>

    <div class="table-section">
      <h3>Vehículos en parqueo</h3>
      <table>
        <thead>
          <tr>
            <th>Placa</th><th>Tipo</th><th>Espacio</th><th>Entrada</th>
            <th>Tiempo</th><th>Tarifa</th><th>Total</th><th>Acción</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `;
}

function agregarParqueo() {
  const placa  = document.getElementById("placa").value.trim().toUpperCase();
  const tipo   = document.getElementById("tipoVeh").value;
  const slot   = parseInt(document.getElementById("slot").value);
  const tarifa = parseFloat(document.getElementById("tarifa").value) || 5;

 const regexPlaca = /^[A-Z]{3}[0-9]{3}$/;
if (!regexPlaca.test(placa)) {
  alert("Formato de placa incorrecto (Ej: ABC123)");
  return;
}   
  if (!slot)  { alert("No hay espacio."); return; }

  const parqueos = DB.get("parqueos");

  if (parqueos.find(p => p.placa === placa)) {
    alert("Esta placa ya está ingresada.");
    return;
  }

  parqueos.push({
    id: Date.now(),
    placa,
    tipo,
    slot, 
    entrada: Date.now(),
    tarifaHora: tarifa
  });

  DB.set("parqueos", parqueos);
  renderParqueo();
}

// ───────────────────── Salidas ─────────────────────
function registrarSalida(id) {
  const parqueos = DB.get("parqueos");
  const idx = parqueos.findIndex(p => p.id === id);
  if (idx === -1) return;

  const p = parqueos[idx];
  const salida = Date.now();

  const horas = Math.max(Math.ceil((salida - p.entrada) / 3600000), 1);
  const total = (horas * p.tarifaHora).toFixed(2);

  const historial = DB.get("historial");

  historial.unshift({
    ...p,
    salida,
    horas,
    totalPagado: parseFloat(total)
  });

  DB.set("historial", historial);
  parqueos.splice(idx, 1);
  DB.set("parqueos", parqueos);

  alert(`Salida registrada.\nTiempo: ${horas}h\nTotal: Q${total}`);
  renderParqueo();
}

//----------------------------------
function editarParqueo(id) {

  const parqueos = DB.get("parqueos");

  const vehiculo = parqueos.find(p => p.id === id);

  if (!vehiculo) return;

  document.getElementById("editId").value = vehiculo.id;

  document.getElementById("editPlaca").value = vehiculo.placa;

  document.getElementById("editTipo").value = vehiculo.tipo;

  document.getElementById("editSlot").value = vehiculo.slot;

  document.getElementById("editTarifa").value = vehiculo.tarifaHora;

  document.getElementById("modalEditar")
    .classList.remove("hidden");
}
function cerrarModalEditar() {

  document.getElementById("modalEditar")
    .classList.add("hidden");

}

// ───────────────────── Historial ─────────────────────
function renderHistorial() {
  const historial = DB.get("historial");
  const total = historial.reduce((s, p) => s + p.totalPagado, 0);

  let filas = historial.length
    ? historial.map(p => `
      <tr>
        <td><span class="placa-badge">${p.placa}</span></td>
        <td>${tipoBadge(p.tipo)}</td>
        <td>${p.slot}</td>
        <td>${new Date(p.entrada).toLocaleString()}</td>
        <td>${new Date(p.salida).toLocaleString()}</td>
        <td>${p.horas}h</td>
        <td>Q${p.tarifaHora}/h</td>
        <td class="tarifa-col">Q${p.totalPagado.toFixed(2)}</td>
      </tr>`).join("")
    : `<tr><td colspan="8" class="empty-td">Aún no hay historial.</td></tr>`;

  document.getElementById("view").innerHTML = `
    <h2>Historial de Parqueos</h2>

    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th>Placa</th><th>Tipo</th><th>Espacio</th><th>Entrada</th>
            <th>Salida</th><th>Horas</th><th>Tarifa</th><th>Total</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>

      <div class="total-row">
        <span>Total recaudado:</span>
        <span class="total-val">Q${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// ───────────────────── Actualizar cada minuto ─────────────────────
setInterval(() => {
  DB.get("parqueos").forEach(p => {
    const te = document.getElementById("t-" + p.id);
    const tq = document.getElementById("q-" + p.id);
    if (te) te.textContent = fmt(Date.now() - p.entrada);
    if (tq) tq.textContent = "Q" + calcTarifa(p.entrada, p.tarifaHora);
  });
}, 60000);

function openProfile() {
  const user = JSON.parse(localStorage.getItem("sesion"));

  document.getElementById("perfilNombre").value = user.nombre;
  document.getElementById("perfilCorreo").value = user.email;
  document.getElementById("perfilPass").value = "";

  document.getElementById("modalPerfil").classList.remove("hidden");
}

function closeProfile() {
  document.getElementById("modalPerfil").classList.add("hidden");
}
function guardarPerfil() {
  const nombre = document.getElementById("perfilNombre").value.trim();
  const correo = document.getElementById("perfilCorreo").value.trim();
  const pass   = document.getElementById("perfilPass").value.trim();

  if (!nombre || !correo) {
    alert("Nombre y correo no pueden estar vacíos.");
    return;
  }

  let usuarios = DB.get("usuarios");
  let sesion   = JSON.parse(localStorage.getItem("sesion"));

  const idx = usuarios.findIndex(u => u.email === sesion.email);

  usuarios[idx].nombre = nombre;
  usuarios[idx].email  = correo;
  if (pass) usuarios[idx].password = pass;

  DB.set("usuarios", usuarios);
  localStorage.setItem("sesion", JSON.stringify(usuarios[idx]));

  alert("Datos actualizados 👍");
  closeProfile();
}

//-ediatar usuarios registrados

function guardarEdicion() {
  const id = parseInt(
    document.getElementById("editId").value
  );
  const placa = document.getElementById("editPlaca")
    .value
    .trim()
    .toUpperCase();
  const tipo = document.getElementById("editTipo").value;
  const slot = parseInt(
    document.getElementById("editSlot").value
  );
  const tarifa = parseFloat(
    document.getElementById("editTarifa").value
  );
  const parqueos = DB.get("parqueos");
  const idx = parqueos.findIndex(p => p.id === id);
  if (idx === -1) {
    alert("Vehículo no encontrado");
    return;
  }
  const regexPlaca = /^[A-Z]{3}[0-9]{3}$/;
  if (!regexPlaca.test(placa)) {
    alert("Formato inválido");
    return;
  }
  const ocupado = parqueos.find(p =>
    p.slot === slot && p.id !== id
  );
  if (ocupado) {
    alert("Ese espacio ya está ocupado");
    return;
  }
  parqueos[idx].placa = placa;
  parqueos[idx].tipo = tipo;
  parqueos[idx].slot = slot;
  parqueos[idx].tarifaHora = tarifa;

  DB.set("parqueos", parqueos);
  cerrarModalEditar();
  renderParqueo();
  alert("Vehículo actualizado correctamente");
}

