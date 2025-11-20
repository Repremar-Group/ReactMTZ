import React, { useState } from 'react';
import '../Reportes.css'; // Importa el archivo CSS
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import { ToastContainer, toast } from 'react-toastify';

const Reportesexpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [aerolinea, setAerolinea] = useState('');
  const backURL = import.meta.env.VITE_BACK_URL;
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
  const handleSubmitReporteExpo = async (e) => {
    e.preventDefault();
    if (!desde || !hasta) {
      toast("Debe seleccionar la fecha Desde y Hasta.");
      return;
    }

    if (!selectedCliente || !selectedCliente.RazonSocial) {
      toast("Debe seleccionar un cliente.");
      return;
    }

    if (!tipoPago) {
      toast("Debe seleccionar un tipo de pago válido (PP o CC).");
      return;
    }

    if (!aerolinea) {
      toast("Debe seleccionar una aerolínea.");
      return;
    }
    try {
      const params = {
        desde,
        hasta,
        cliente: selectedCliente ? selectedCliente.RazonSocial : "",
        tipoPago,
        aerolinea
      };

      // ⚙️ Llamamos al endpoint que genera el Excel
      const response = await axios.get(`${backURL}/api/reportedeembarqueguiasexpo`, {
        params,
        responseType: "blob", // Muy importante para recibir binarios
      });

      // 🧩 Crear un link temporal para forzar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // 📁 Nombre del archivo
      link.setAttribute(
        "download",
        `Reporte_Embarque_${params.desde}_a_${params.hasta}.xlsx`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      // ✅ (opcional) Mensaje visual o log
      console.log("Excel descargado correctamente");
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      setError("Error al generar o descargar el reporte");
    }
  };
  const handlepdfReporteExpo = async (e) => {
    e.preventDefault();
    if (!desde || !hasta) {
      toast("Debe seleccionar la fecha Desde y Hasta.");
      return;
    }

    if (!selectedCliente || !selectedCliente.RazonSocial) {
      toast("Debe seleccionar un cliente.");
      return;
    }

    if (!tipoPago) {
      toast("Debe seleccionar un tipo de pago válido (PP o CC).");
      return;
    }

    if (!aerolinea) {
      toast("Debe seleccionar una aerolínea.");
      return;
    }
    try {
      const params = {
        desde,
        hasta,
        cliente: selectedCliente ? selectedCliente.RazonSocial : "",
        tipoPago,
        aerolinea
      };

      // ⚙️ Llamada al endpoint que genera el PDF
      const response = await axios.get(`${backURL}/api/reportedeembarque/pdf`, {
        params,
        responseType: "arraybuffer", // 👈 importante para PDF binario
      });

      // 🧩 Crear un Blob con tipo PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // 📁 Crear link temporal para descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Reporte_Embarque_${params.desde}_a_${params.hasta}.pdf`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      // ✅ Log opcional
      console.log("PDF descargado correctamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      setError("Error al generar o descargar el reporte PDF");
    }
  };

  // Búsqueda de clientes al presionar Enter
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${searchTerm}`);
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
        <ToastContainer
          position="top-right"
          autoClose={4000}
          closeButton={false}
        />
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

            />
          </div>
          <div>
            <label htmlFor="aerolinea">Aerolinea:</label>

            <select
              id="aerolinea"
              value={aerolinea}
              onChange={(e) => setAerolinea(e.target.value)}
              required
            >
              <option value="">Seleccione la Aerolinea</option>
              <option value="ALL">Todas</option>
              <option value="AirEuropa">AirEuropa</option>
              <option value="Airclass">AirClass</option>
            </select>
          </div>
          <div>
            <label htmlFor="tipoPago">Tipo de Pago:</label>
            <select
              id="tipoPago"
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}

            >
              <option value="">Selecciona un tipo de pago</option>
              <option value="pp">PREPAID</option>
              <option value="cc">COLLECT</option>
            </select>
          </div>
        </div>
        <button type="button" onClick={handlepdfReporteExpo} >Generar PDF</button>
        <br />
        <button type="submit">Generar Excel</button>
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




