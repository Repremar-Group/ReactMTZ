import React, { useState } from 'react';
import './Deudores.css'

const Deudores = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [moneda, setMoneda] = useState('');

  // Función para manejar el envío del formulario
  const handleSubmitEmitirCuentaCorriente = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para enviar la información
    console.log({
      desde,
      hasta,
      cliente,
      numeroCliente,
      tipoPago,
    });
  };

  return (
    <div className="cuentacorriente-container">
      <form className='formularioschicos' onSubmit={handleSubmitEmitirCuentaCorriente}>
        <h2 className='titulo-estandar'>Cuenta Corriente de Clientes</h2>
        <div className="cuentacorrientedate-container">
          <div className="date-field">
            <label htmlFor="desde">Desde:</label>
            <input
              type="date"
              id="desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              required
            />
          </div>
          <div className="date-field">
            <label htmlFor="hasta">Hasta:</label>
            <input
              type="date"
              id="hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              required
            />
          </div>
        </div>
        <div className='datoscliente-reporte'>
          <div >
            <label htmlFor="cliente">Cliente:</label>
            <input
              type="text"
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="numeroCliente">Número de Cliente:</label>
            <input
              type="text"
              id="numeroCliente"
              value={numeroCliente}
              onChange={(e) => setNumeroCliente(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="moneda">Moneda:</label>
            <select
              id="moneda"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              required
            >
              <option value="">Selecciona una Moneda</option>
              <option value="Dolares">Dolares</option>
              <option value="Pesos">Pesos</option>
              <option value="Euros">Euros</option>
            </select>
          </div>
        </div>

        <button type="submit">Generar Reporte</button>
      </form>
    </div>
  );
};

export default Deudores