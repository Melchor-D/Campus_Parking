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

function loadView(view) {
  const cont = document.getElementById("view");

switch (view) {
    case "dashboard":  renderDashboard();  break;
    case "parqueo":    renderParqueo();    break;
    case "historial":  renderHistorial();  break;
    case "perfil":     renderPerfil();     break;
}
  document.querySelectorAll(".navbar li").forEach(li => li.classList.remove("active"));
  const navItems = document.querySelectorAll(".navbar li");
  navItems.forEach(li => {
    if (li.getAttribute("onclick") && li.getAttribute("onclick").includes(view)) {
      li.classList.add("active");
    }
  });
  cont.classList.remove("fade");
  void cont.offsetWidth;
  cont.classList.add("fade");
}

function renderDashboard() {
  const parqueos = DB.get("parqueos");
  const historial = DB.get("historial");

  const libres = MAX_SLOTS - parqueos.length;
  const pct = Math.round((parqueos.length / MAX_SLOTS) * 100);

  const recaudado = historial.reduce((s, p) => s + p.totalPagado, 0);
  const hoy = historial.filter(p =>
    new Date(p.salida).toDateString() === new Date().toDateString()
  ).length;
  
  let slotDots = "";
  const used = usedSlots();
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const occ = used.includes(i);
    slotDots += `<div class="slot-dot ${occ ? "occ" : "free"}">${i}</div>`;
  }

  let filas = parqueos.length
    ? parqueos.map(p => `
      <tr>
        <td><span class="placa-badge">${p.placa}</span></td>
        <td>${tipoBadge(p.tipo)}</td>
        <td>${p.slot}</td>
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
      </div>

      <div class="stat-card red">
        <p class="stat-label">Ocupados</p>
        <p class="stat-value">${parqueos.length}</p>
      </div>

      <div class="stat-card purple">
        <p class="stat-label">Salidas hoy</p>
        <p class="stat-value">${hoy}</p>
      </div>

      <div class="stat-card amber">
        <p'stat-label">Recaudado</p>
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
          <tr>
            <th>Placa</th><th>Tipo</th><th>Espacio</th><th>Tiempo</th><th>Total</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `;
}
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
        <td>
          <button onclick="editarParqueo(${p.id})">Editar</button>
          <button class="btn-salida" onclick="registrarSalida(${p.id})">Salida</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="8" class="empty-td">Sin vehículos.</td></tr>`;

  document.getElementById("view").innerHTML = `
    <h2>Registro de Parqueo</h2>

    <!-- TABLA DE TARIFAS FIJAS -->
    <div class="table-section" style="margin-bottom: 20px;">
      <h3>Tarifas por tipo</h3>
      <table>
        <thead>
          <tr><th>Tipo</th><th>Tarifa por hora</th></tr>
        </thead>
        <tbody>
          <tr><td>Carro</td><td>Q20.00</td></tr>
          <tr><td>Moto</td><td>Q15.00</td></tr>
          <tr><td>Bici</td><td>Q10.00</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Buscador -->
    <div class="form-field">
      <label>Buscar por placa</label>
      <input id="buscarPlaca" oninput="filtrarParqueo()" placeholder="Ej: ABC123">
    </div>

    <div class="form-card">
      <h3>Nuevo ingreso</h3>
      <div class="form-grid">
        <div class="form-field">
          <label>Placa</label>
          <input id="placa" style="text-transform: uppercase">
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

        <button onclick="agregarParqueo()">Registrar entrada</button>
      </div>
    </div>

    <div class="table-section">
      <h3>Vehículos en parqueo</h3>
      <table>
        <thead>
          <tr>
            <th>Placa</th><th>Tipo</th><th>Espacio</th>
            <th>Entrada</th><th>Tiempo</th><th>Tarifa</th><th>Total</th><th>Acción</th>
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

  const tarifasFijas = { carro: 20, moto: 15, bici: 10 };
  const tarifa = tarifasFijas[tipo];

  const regexPlaca = /^[A-Z]{3}[0-9]{3}$/;
  if (!regexPlaca.test(placa)) {
    alert("Formato de placa incorrecto (Ej: ABC123)");
    return;
  }

  if (slot < 1 || slot > MAX_SLOTS) {
    alert("El slot no existe.");
    return;
  }

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
  alert("Vehículo ingresado con éxito 👍");
}

function registrarSalida(id) {
  const parqueos = DB.get("parqueos");
  const idx = parqueos.findIndex(p => p.id === id);
  if (idx === -1) return;

  const v = parqueos[idx];
  const salida = Date.now();

  const horas = Math.max(Math.ceil((salida - v.entrada) / 3600000), 1);
  const total = (horas * v.tarifaHora).toFixed(2);

  const historial = DB.get("historial");
  historial.unshift({
    ...v,
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

function filtrarParqueo() {
  const filtro = document.getElementById("buscarPlaca").value.trim().toUpperCase();
  const filas = [...document.querySelectorAll("#view table tbody tr")];

  filas.forEach(row => {
    const placa = row.querySelector(".placa-badge")?.textContent || "";
    row.style.display = placa.includes(filtro) ? "" : "none";
  });
}

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
            <th>Placa</th><th>Tipo</th><th>Espacio</th>
            <th>Entrada</th><th>Salida</th><th>Horas</th><th>Tarifa</th><th>Total</th>
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
setInterval(() => {
  DB.get("parqueos").forEach(p => {
    const te = document.getElementById("t-" + p.id);
    const tq = document.getElementById("q-" + p.id);
    if (te) te.textContent = fmt(Date.now() - p.entrada);
    if (tq) tq.textContent = "Q" + calcTarifa(p.entrada, p.tarifaHora);
  });
}, 60000);

function editarParqueo(id) {
  const parqueos = DB.get("parqueos");
  const v = parqueos.find(p => p.id === id);
  if (!v) return;

  // llenar los campos
  document.getElementById("editId").value = v.id;
  document.getElementById("editPlaca").value = v.placa;
  document.getElementById("editTipo").value = v.tipo;
  document.getElementById("editSlot").value = v.slot;

  document.getElementById("modalEditar").classList.remove("hidden");
}

function cerrarModalEditar() {
  document.getElementById("modalEditar").classList.add("hidden");
}

function guardarEdicion() {
  const id = parseInt(document.getElementById("editId").value);
  const placa = document.getElementById("editPlaca").value.trim().toUpperCase();
  const tipo = document.getElementById("editTipo").value;
  const slot = parseInt(document.getElementById("editSlot").value);

  const regexPlaca = /^[A-Z]{3}[0-9]{3}$/;
  if (!regexPlaca.test(placa)) {
    alert("Formato inválido. Ej: ABC123");
    return;
  }

  const parqueos = DB.get("parqueos");
  const idx = parqueos.findIndex(p => p.id === id);

  if (idx === -1) return;
  const ocupado = parqueos.find(p => p.slot === slot && p.id !== id);
  if (ocupado) {
    alert("Ese espacio ya está ocupado.");
    return;
  }
  parqueos[idx].placa = placa;
  parqueos[idx].tipo = tipo;
  parqueos[idx].slot = slot;

  DB.set("parqueos", parqueos);

  cerrarModalEditar();
  renderParqueo();

  alert("Vehículo actualizado con éxito 👍");
}



// Vista principal del reporte
function renderReporte() {

  document.getElementById("view").innerHTML = `
    <h2>Reporte por rango de fechas</h2>

    <div class="form-card">
      <div class="form-grid" style="grid-template-columns: 1fr 1fr auto;">
        
        <div class="form-field">
          <label>Fecha Inicial</label>
          <input type="date" id="fechaInicio">
        </div>

        <div class="form-field">
          <label>Fecha Final</label>
          <input type="date" id="fechaFin">
        </div>

        <button onclick="generarReporte()">Generar</button>

      </div>
    </div>

    <div id="reporteResultados"></div>
  `;
}
