import React, { useState } from 'react';
import '../Reportes.css'; // Importa el archivo CSS
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';


const Reportesexpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [tipoPago, setTipoPago] = useState('');

  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setNumeroCliente(cliente.Id);
    setTipoPago(cliente.Tcomprobante)
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Envío del formulario
  const handleSubmitReporteExpo = (e) => {
    e.preventDefault();
    console.log({
      desde,
      hasta,
      cliente: selectedCliente ? selectedCliente.RazonSocial : '', // Muestra el cliente seleccionado
      numeroCliente,
      tipoPago,
    });
  };


  // Búsqueda de clientes al presionar Enter
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`http://localhost:3000/api/obtenernombrecliente?search=${searchTerm}`);
        setFilteredClientes(response.data);
        setIsModalOpen(true); // Abre el modal con los resultados
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
    }
  };


  return (
    <div className="reporte-container">
      <form className='formularioschicos' onSubmit={handleSubmitReporteExpo}>
        <h2 className='titulo-estandar'>Reporte de Embarque Exportación</h2>
        <div className="date-container">
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
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Buscar cliente..."
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
            <label htmlFor="tipoPago">Tipo de Pago:</label>
            <select
              id="tipoPago"
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              required
            >
              <option value="">Selecciona un tipo de Comprobante</option>
              <option value="efactura">E-Factura</option>
              <option value="eticket">E-Ticket</option>
              <option value="efacturaca">E-Factura Cuenta Ajena</option>
              <option value="eticketca">E-Ticket Cuenta Ajena</option>
            </select>
          </div>
        </div>

        <button type="submit">Generar Reporte</button>
      </form>

      {/* Modal de búsqueda de clientes */}
      <ModalBusquedaClientes
        isOpen={isModalOpen}
        closeModal={closeModal}
        filteredClientes={filteredClientes}
        handleSelectCliente={handleSelectCliente}
      />
    </div>
  );
};

export default Reportesexpo;




