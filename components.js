// Card tipo de vehículo (vista Vehículos)
class CardVehiculo extends HTMLElement {
  set data(v) {
    this.innerHTML = `
      <div class="card">
        <h3>${v.nombre}</h3>
        <p>Código: ${v.codigo}</p>
        <p>Tarifa: Q${v.tarifa}/hora</p>
      </div>
    `;
  }
}
customElements.define("card-vehiculo", CardVehiculo);