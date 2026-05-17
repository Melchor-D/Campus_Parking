class CardVehiculo extends HTMLElement {
  set data(v) {
    this.innerHTML = `
      <div class="card">
        <h3>${v.nombre}</h3>
        <p>Código: ${v.codigo}</p>
        <p>Tarifa: Q${v.tarifa}</p>
      </div>
    `;
  }
}
customElements.define("card-vehiculo", CardVehiculo);

class CardParqueo extends HTMLElement {
  set data(p) {
    this.innerHTML = `
      <div class="card">
        <h3>${p.placa}</h3>
        <p>Tipo: ${p.tipo}</p>
        <p>Slot: ${p.slot}</p>
        <p>Entrada: ${p.fecha} - ${p.hora}</p>
      </div>
    `;
  }
}
customElements.define("card-parqueo", CardParqueo);