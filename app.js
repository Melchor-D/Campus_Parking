// ── Helpers ──────────────────────────────────────────────
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
 
// ── Cambiar vistas (estructura original) ─────────────────
function loadView(view) {
  const cont = document.getElementById("view");
 
  switch (view) {
    case "dashboard":  renderDashboard();  break;
    case "vehiculos":  renderVehiculos();  break;
    case "parqueo":    renderParqueo();    break;
    case "historial":  renderHistorial();  break;
  }
 
  // Marcar nav activo
  document.querySelectorAll(".navbar li").forEach(li => li.classList.remove("active"));
  const navItems = document.querySelectorAll(".navbar li");
  navItems.forEach(li => {
    if (li.getAttribute("onclick") && li.getAttribute("onclick").includes(view)) {
      li.classList.add("active");
    }
  });
}
 
// ── DASHBOARD ────────────────────────────────────────────
function renderDashboard() {
  const parqueos = DB.get("parqueos");
  const historial = DB.get("historial");
  const libres    = MAX_SLOTS - parqueos.length;
  const pct       = Math.round((parqueos.length / MAX_SLOTS) * 100);
  const recaudado = historial.reduce((s, p) => s + p.totalPagado, 0);
  const hoy       = historial.filter(p =>
    new Date(p.entrada).toDateString() === new Date().toDateString()
  ).length;
 
  // Mapa de slots
  const used = usedSlots();
  let slotDots = "";
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const occ = used.includes(i);
    slotDots += `<div class="slot-dot ${occ ? "occ" : "free"}" title="Espacio ${i}: ${occ ? "Ocupado" : "Libre"}">${i}</div>`;
  }
 
  // Filas de activos
  let filas = parqueos.length
    ? parqueos.map(p => `
        <tr>
          <td><span class="placa-badge">${p.placa}</span></td>
          <td>${tipoBadge(p.tipo)}</td>
          <td><b>${p.slot}</b></td>
          <td>${fmt(Date.now() - p.entrada)}</td>
          <td class="tarifa-col">Q${calcTarifa(p.entrada, p.tarifaHora)}</td>
        </tr>`).join("")
    : `<tr><td colspan="5" class="empty-td">No hay vehículos en el parqueo ahora mismo.</td></tr>`;
 
  document.getElementById("view").innerHTML = `
    <h2>Dashboard</h2>
 
    <div class="stats-row">
      <div class="stat-card green">
        <p class="stat-label">Espacios libres</p>
        <p class="stat-value">${libres}</p>
        <p class="stat-sub">de ${MAX_SLOTS} totales</p>
      </div>
      <div class="stat-card red">
        <p class="stat-label">Ocupados ahora</p>
        <p class="stat-value">${parqueos.length}</p>
        <p class="stat-sub">${pct}% ocupación</p>
      </div>
      <div class="stat-card purple">
        <p class="stat-label">Salidas hoy</p>
        <p class="stat-value">${hoy}</p>
        <p class="stat-sub">vehículos procesados</p>
      </div>
      <div class="stat-card amber">
        <p class="stat-label">Total recaudado</p>
        <p class="stat-value">Q${recaudado.toFixed(2)}</p>
        <p class="stat-sub">acumulado histórico</p>
      </div>
    </div>
 
    <div class="cap-section">
      <div class="cap-header">
        <span>Mapa de espacios (${MAX_SLOTS} totales)</span>
        <span class="cap-pct">${pct}% ocupado</span>
      </div>
      <div class="cap-bar"><div class="cap-fill" style="width:${pct}%"></div></div>
      <div class="slots-grid">${slotDots}</div>
    </div>
 
    <div class="table-section">
      <h3>Vehículos activos</h3>
      <table>
        <thead>
          <tr><th>Placa</th><th>Tipo</th><th>Espacio</th><th>Tiempo</th><th>Total acum.</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `;
}
 
// ── VEHÍCULOS (original conservado) ──────────────────────
function renderVehiculos() {
  const lista = DB.get("vehiculos");
  const cont  = document.getElementById("view");
 
  cont.innerHTML = `
    <h2>Tipos de Vehículo</h2>
    <div class="form-inline">
      <input id="codigo"  placeholder="Código">
      <input id="nombreV" placeholder="Nombre">
      <input id="tarifa"  placeholder="Tarifa por hora (Q)" type="number" min="1">
      <button onclick="addVehiculo()">Agregar</button>
    </div>
    <div id="listaVehiculos"></div>
  `;
 
  const listaEl = document.getElementById("listaVehiculos");
  if (!lista.length) {
    listaEl.innerHTML = `<p class="empty-msg">No hay tipos de vehículo registrados.</p>`;
    return;
  }
  lista.forEach(v => {
    const card = document.createElement("card-vehiculo");
    card.data  = v;
    listaEl.appendChild(card);
  });
}
 
function addVehiculo() {
  const codigo  = document.getElementById("codigo").value.trim();
  const nombreV = document.getElementById("nombreV").value.trim();
  const tarifa  = document.getElementById("tarifa").value.trim();
 
  if (!codigo || !nombreV || !tarifa) {
    alert("Por favor completa todos los campos."); return;
  }
 
  const vehiculos = DB.get("vehiculos");
  vehiculos.push({ codigo, nombre: nombreV, tarifa });
  DB.set("vehiculos", vehiculos);
  loadView("vehiculos");
}
 
// ── PARQUEO ───────────────────────────────────────────────
function renderParqueo() {
  const parqueos = DB.get("parqueos");
  const used     = usedSlots();
  const cont     = document.getElementById("view");
 
  // Slots disponibles
  let slotOptions = "";
  for (let i = 1; i <= MAX_SLOTS; i++) {
    if (!used.includes(i)) {
      slotOptions += `<option value="${i}">Espacio ${i}</option>`;
    }
  }
  if (!slotOptions) slotOptions = `<option disabled>Sin espacios disponibles</option>`;
 
  // Filas de tabla
  let filas = parqueos.length
    ? parqueos.map(p => `
        <tr>
          <td><span class="placa-badge">${p.placa}</span></td>
          <td>${tipoBadge(p.tipo)}</td>
          <td><b>${p.slot}</b></td>
          <td>${new Date(p.entrada).toLocaleDateString("es-GT")} ${new Date(p.entrada).toLocaleTimeString("es-GT",{hour:"2-digit",minute:"2-digit"})}</td>
          <td class="time-col" id="t-${p.id}">${fmt(Date.now() - p.entrada)}</td>
          <td>Q${p.tarifaHora}/h</td>
          <td class="tarifa-col" id="q-${p.id}">Q${calcTarifa(p.entrada, p.tarifaHora)}</td>
          <td><button class="btn-salida" onclick="registrarSalida(${p.id})">Registrar salida</button></td>
        </tr>`).join("")
    : `<tr><td colspan="8" class="empty-td">No hay vehículos en el parqueo.</td></tr>`;
 
  cont.innerHTML = `
    <h2>Registro de Parqueo</h2>
 
    <div class="form-card">
      <h3>Nuevo ingreso</h3>
      <div class="form-grid">
        <div class="form-field">
          <label>Placa</label>
          <input id="placa" placeholder="ABC-1234" style="text-transform:uppercase">
        </div>
        <div class="form-field">
          <label>Tipo de vehículo</label>
          <select id="tipoVeh">
            <option value="carro">🚗 Carro</option>
            <option value="moto">🏍️ Moto</option>
            <option value="bici">🚲 Bicicleta</option>
          </select>
        </div>
        <div class="form-field">
          <label>Espacio</label>
          <select id="slot">${slotOptions}</select>
        </div>
        <div class="form-field">
          <label>Tarifa / hora (Q)</label>
          <input id="tarifa" type="number" value="5" min="1">
        </div>
        <button onclick="agregarParqueo()">Registrar entrada</button>
      </div>
    </div>
 
    <div class="table-section">
      <h3>Vehículos en parqueo</h3>
      <table id="tabla-parqueo">
        <thead>
          <tr>
            <th>Placa</th><th>Tipo</th><th>Espacio</th><th>Entrada</th>
            <th>Tiempo</th><th>Tarifa</th><th>Total acum.</th><th>Acción</th>
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
 
  if (!placa) { alert("Ingresa la placa del vehículo."); return; }
  if (!slot)  { alert("No hay espacios disponibles.");   return; }
 
  const parqueos = DB.get("parqueos");
  if (parqueos.find(p => p.placa === placa)) {
    alert("Esta placa ya está registrada."); return;
  }
 
  parqueos.push({
    id: Date.now(),
    placa,
    tipo,
    slot,
    entrada:    Date.now(),
    tarifaHora: tarifa
  });
 
  DB.set("parqueos", parqueos);
  loadView("parqueo");
}
 
function registrarSalida(id) {
  const parqueos = DB.get("parqueos");
  const idx      = parqueos.findIndex(p => p.id === id);
  if (idx === -1) return;
 
  const p      = parqueos[idx];
  const salida = Date.now();
  const horas  = Math.max(Math.ceil((salida - p.entrada) / 3600000), 1);
  const total  = (horas * p.tarifaHora).toFixed(2);
 
  const historial = DB.get("historial");
  historial.unshift({ ...p, salida, horas, totalPagado: parseFloat(total) });
  DB.set("historial", historial);
 
  parqueos.splice(idx, 1);
  DB.set("parqueos", parqueos);
 
  alert(`✅ ${p.placa} salió.\nTiempo: ${horas}h\nTotal: Q${total}`);
  loadView("parqueo");
}
 
// ── HISTORIAL ─────────────────────────────────────────────
function renderHistorial() {
  const historial = DB.get("historial");
  const cont      = document.getElementById("view");
  const total     = historial.reduce((s, p) => s + p.totalPagado, 0);
 
  let filas = historial.length
    ? historial.map(p => {
        const ent = new Date(p.entrada).toLocaleString("es-GT", {dateStyle:"short", timeStyle:"short"});
        const sal = new Date(p.salida).toLocaleString("es-GT",  {dateStyle:"short", timeStyle:"short"});
        return `<tr>
          <td><span class="placa-badge">${p.placa}</span></td>
          <td>${tipoBadge(p.tipo)}</td>
          <td><b>${p.slot}</b></td>
          <td>${ent}</td>
          <td>${sal}</td>
          <td>${p.horas}h</td>
          <td>Q${p.tarifaHora}/h</td>
          <td class="tarifa-col"><b>Q${p.totalPagado.toFixed(2)}</b></td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="8" class="empty-td">No hay registros en el historial aún.</td></tr>`;
 
  cont.innerHTML = `
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
        <span>Total recaudado</span>
        <span class="total-val">Q${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}
 
// ── Ticker: actualiza tiempo y tarifa cada 60s ────────────
setInterval(() => {
  DB.get("parqueos").forEach(p => {
    const te = document.getElementById("t-" + p.id);
    const tq = document.getElementById("q-" + p.id);
    if (te) te.textContent = fmt(Date.now() - p.entrada);
    if (tq) tq.textContent = "Q" + calcTarifa(p.entrada, p.tarifaHora);
  });
}, 60000);


// ===============================
// HISTORIAL ─ Mostrar registros eliminados
// ===============================
function renderHistorial() {
    const historial = DB.get("historial");

    view.innerHTML = `
        <h2>Historial de Movimientos</h2>

        <div class="table-section">
            <h3>Vehículos procesados</h3>
            <table>
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Tipo</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Tiempo</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody id="historialBody"></tbody>
            </table>
        </div>
    `;

    const body = document.getElementById("historialBody");

    if (historial.length === 0) {
        body.innerHTML = `
            <tr><td class="empty-td" colspan="6">No hay registros aún.</td></tr>
        `;
        return;
    }

    historial.forEach(h => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><span class="placa-badge">${h.placa}</span></td>
            <td>${h.tipo}</td>
            <td>${h.fechaEntrada} ${h.horaEntrada}</td>
            <td>${h.fechaSalida} ${h.horaSalida}</td>
            <td class="time-col">${h.tiempo}</td>
            <td class="tarifa-col">Q${h.total}</td>
        `;

        body.appendChild(row);
    });
}