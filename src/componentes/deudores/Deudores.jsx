import React, { useState, useEffect, useRef } from 'react';
import './Deudores.css'
import ModalBusquedaClientes from '../modales/ModalBusquedaClientes';
import axios from 'axios';

const Deudores = ({ isLoggedIn }) => {
  const backURL = import.meta.env.VITE_BACK_URL;
  // Estado para los campos del formulario
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [moneda, setMoneda] = useState('USD');

  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const hasFetched = useRef(false);

  const handleExportarExcelCuentaCorriente = async () => {
    try {
      const response = await axios.post(
        `${backURL}/api/generar-excel-cuentacorriente`,
        {
          desde,
          hasta,
          cliente,
          numeroCliente,
          moneda,
        },
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cuenta_corriente.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Hubo un problema al generar el Excel.');
    }
  };
  const handleSubmitEmitirCuentaCorriente = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${backURL}/api/generar-pdf-cuentacorriente`,
        {
          desde,
          hasta,
          cliente,
          numeroCliente,
          moneda,
        },
        {
          responseType: 'blob',
        }
      );

      // Crea un blob con la respuesta
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // Opcional: abrir en una nueva pestaña
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Hubo un problema al generar el PDF.');
    }
  }

  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setCliente(cliente.RazonSocial);
    setIsSelectEnabled(true);
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Búsqueda de clientes al presionar Enter
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${searchTerm}`);
        setFilteredClientes(response.data);
        setCliente(searchTerm);
        setIsModalOpen(true); // Abre el modal con los resultados
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
    }
  };

  // Actualizar el estado del formulario luego se seleccionar un cliente 
  useEffect(() => {
    if (selectedCliente) {
      setNumeroCliente(selectedCliente.Id);

    }
  }, [selectedCliente]);

  useEffect(() => {
    if (hasFetched.current) return; // Si ya se ejecutó, no vuelve a hacerlo
    hasFetched.current = true;

    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setHasta(icfechaactual);
    // Obtener la fecha actual
    const fechaActual = new Date();
    // Establecer la fecha al primer día del año
    const primerDiaAnio = new Date(fechaActual.getFullYear(), 0, 1);
    setDesde(primerDiaAnio.toISOString().split('T')[0]);

    const fetchMonedas = async () => {
      try {
        const response = await axios.get(`${backURL}/api/obtenermonedas`);
        setMonedas(response.data);
        setIsFetchedMonedas(true); // Indica que ya se obtuvieron los datos
      } catch (error) {
        console.error('Error al obtener monedas:', error);
      }
    }

    fetchMonedas();

  }, []);

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
              id="ecnombre"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Buscar Cliente"
              autoComplete="off"
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
              readOnly
            />
          </div>
          <div>
            <label htmlFor="moneda">Moneda:</label>
            <select
              id="ecmoneda"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              required
            >
              <option value="">Selecciona una Moneda</option>
              <option value="USD">USD</option>
              <option value="UYU">UYU</option>

            </select>
          </div>
        </div>
        <button type = "button" onClick={handleExportarExcelCuentaCorriente}>
          Generar Excel
        </button>
        <button type="submit">Generar PDF</button>
      </form>
      <ModalBusquedaClientes
        isOpen={isModalOpen}
        closeModal={closeModal}
        filteredClientes={filteredClientes}
        handleSelectCliente={handleSelectCliente}
      />
    </div>
  );
};

export default Deudores