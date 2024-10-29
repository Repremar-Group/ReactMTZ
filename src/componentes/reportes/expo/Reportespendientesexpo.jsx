import React, { useState } from 'react';
import '../Reportespendientes.css'; // Importa el archivo CSS
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
//importaciones para exportar a excel
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';



const Reportespendientesexpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [embarques, setEmbarques] = useState('');
  const [pcs, setPcs] = useState('');
  const [peso, setPeso] = useState('');
  const [cobrar, setCobrar] = useState('');
  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

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

  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Envío del formulario
  const handleSubmitReportePendienteExpo = (e) => {
    e.preventDefault();
    console.log({
      desde,
      hasta,
      cliente: selectedCliente ? selectedCliente.RazonSocial : '', // Muestra el cliente seleccionado
      numeroCliente,
      tipoPago,
    });
  };

  const guiaspendientes = [
    { awb: "1", agente: "prueba1", pcs: "1", peso: "500", llegada: "10/10/24", ori: "EZE", cnx: "MVD", des: "MVD", tarifado: "si", tarifa: "x", flete: "x", com: "x", dc: "x", da: "x", over: "x", total: "x", cobrar: "x" },
    { awb: "2", agente: "prueba2", pcs: "2", peso: "600", llegada: "11/10/24", ori: "JFK", cnx: "GRU", des: "MVD", tarifado: "no", tarifa: "y", flete: "y", com: "y", dc: "y", da: "y", over: "y", total: "y", cobrar: "y" },
    { awb: "3", agente: "prueba3", pcs: "3", peso: "700", llegada: "12/10/24", ori: "LAX", cnx: "SCL", des: "MVD", tarifado: "si", tarifa: "z", flete: "z", com: "z", dc: "z", da: "z", over: "z", total: "z", cobrar: "z" },
    { awb: "4", agente: "prueba4", pcs: "4", peso: "800", llegada: "13/10/24", ori: "EZE", cnx: "BOG", des: "MVD", tarifado: "no", tarifa: "a", flete: "a", com: "a", dc: "a", da: "a", over: "a", total: "a", cobrar: "a" },
    { awb: "5", agente: "prueba5", pcs: "5", peso: "900", llegada: "14/10/24", ori: "MIA", cnx: "PTY", des: "MVD", tarifado: "si", tarifa: "b", flete: "b", com: "b", dc: "b", da: "b", over: "b", total: "b", cobrar: "b" },
    { awb: "6", agente: "prueba6", pcs: "6", peso: "1000", llegada: "15/10/24", ori: "EZE", cnx: "MVD", des: "MVD", tarifado: "no", tarifa: "c", flete: "c", com: "c", dc: "c", da: "c", over: "c", total: "c", cobrar: "c" },
    { awb: "7", agente: "prueba7", pcs: "7", peso: "1100", llegada: "16/10/24", ori: "JFK", cnx: "GRU", des: "MVD", tarifado: "si", tarifa: "d", flete: "d", com: "d", dc: "d", da: "d", over: "d", total: "d", cobrar: "d" },
    { awb: "8", agente: "prueba8", pcs: "8", peso: "1200", llegada: "17/10/24", ori: "LAX", cnx: "SCL", des: "MVD", tarifado: "no", tarifa: "e", flete: "e", com: "e", dc: "e", da: "e", over: "e", total: "e", cobrar: "e" },
    { awb: "9", agente: "prueba9", pcs: "9", peso: "1300", llegada: "18/10/24", ori: "EZE", cnx: "BOG", des: "MVD", tarifado: "si", tarifa: "f", flete: "f", com: "f", dc: "f", da: "f", over: "f", total: "f", cobrar: "f" },
    { awb: "10", agente: "prueba10", pcs: "10", peso: "1400", llegada: "19/10/24", ori: "MIA", cnx: "PTY", des: "MVD", tarifado: "no", tarifa: "g", flete: "g", com: "g", dc: "g", da: "g", over: "g", total: "g", cobrar: "g" },
    { awb: "11", agente: "prueba11", pcs: "11", peso: "1500", llegada: "20/10/24", ori: "EZE", cnx: "MVD", des: "MVD", tarifado: "si", tarifa: "h", flete: "h", com: "h", dc: "h", da: "h", over: "h", total: "h", cobrar: "h" },
    { awb: "12", agente: "prueba12", pcs: "12", peso: "1600", llegada: "21/10/24", ori: "JFK", cnx: "GRU", des: "MVD", tarifado: "no", tarifa: "i", flete: "i", com: "i", dc: "i", da: "i", over: "i", total: "i", cobrar: "i" },
    { awb: "13", agente: "prueba13", pcs: "13", peso: "1700", llegada: "22/10/24", ori: "LAX", cnx: "SCL", des: "MVD", tarifado: "si", tarifa: "j", flete: "j", com: "j", dc: "j", da: "j", over: "j", total: "j", cobrar: "j" },
    { awb: "14", agente: "prueba14", pcs: "14", peso: "1800", llegada: "23/10/24", ori: "EZE", cnx: "BOG", des: "MVD", tarifado: "no", tarifa: "k", flete: "k", com: "k", dc: "k", da: "k", over: "k", total: "k", cobrar: "k" },
    { awb: "15", agente: "prueba15", pcs: "15", peso: "1900", llegada: "24/10/24", ori: "MIA", cnx: "PTY", des: "MVD", tarifado: "si", tarifa: "l", flete: "l", com: "l", dc: "l", da: "l", over: "l", total: "l", cobrar: "l" },
    { awb: "16", agente: "prueba16", pcs: "16", peso: "2000", llegada: "25/10/24", ori: "EZE", cnx: "MVD", des: "MVD", tarifado: "no", tarifa: "m", flete: "m", com: "m", dc: "m", da: "m", over: "m", total: "m", cobrar: "m" },
    { awb: "17", agente: "prueba17", pcs: "17", peso: "2100", llegada: "26/10/24", ori: "JFK", cnx: "GRU", des: "MVD", tarifado: "si", tarifa: "n", flete: "n", com: "n", dc: "n", da: "n", over: "n", total: "n", cobrar: "n" },
    { awb: "18", agente: "prueba18", pcs: "18", peso: "2200", llegada: "27/10/24", ori: "LAX", cnx: "SCL", des: "MVD", tarifado: "no", tarifa: "o", flete: "o", com: "o", dc: "o", da: "o", over: "o", total: "o", cobrar: "o" },
    { awb: "19", agente: "prueba19", pcs: "19", peso: "2300", llegada: "28/10/24", ori: "EZE", cnx: "BOG", des: "MVD", tarifado: "si", tarifa: "p", flete: "p", com: "p", dc: "p", da: "p", over: "p", total: "p", cobrar: "p" },
    { awb: "20", agente: "prueba20", pcs: "20", peso: "2400", llegada: "29/10/24", ori: "MIA", cnx: "PTY", des: "MVD", tarifado: "no", tarifa: "q", flete: "q", com: "q", dc: "q", da: "q", over: "q", total: "q", cobrar: "q" },
    { awb: "21", agente: "prueba21", pcs: "21", peso: "2500", llegada: "30/10/24", ori: "EZE", cnx: "MVD", des: "MVD", tarifado: "si", tarifa: "r", flete: "r", com: "r", dc: "r", da: "r", over: "r", total: "r", cobrar: "r" },
    { awb: "22", agente: "prueba22", pcs: "22", peso: "2600", llegada: "31/10/24", ori: "JFK", cnx: "GRU", des: "MVD", tarifado: "no", tarifa: "s", flete: "s", com: "s", dc: "s", da: "s", over: "s", total: "s", cobrar: "s" },
    { awb: "23", agente: "prueba23", pcs: "23", peso: "2700", llegada: "01/11/24", ori: "LAX", cnx: "SCL", des: "MVD", tarifado: "si", tarifa: "t", flete: "t", com: "t", dc: "t", da: "t", over: "t", total: "t", cobrar: "t" },
    { awb: "24", agente: "prueba24", pcs: "24", peso: "2800", llegada: "02/11/24", ori: "EZE", cnx: "BOG", des: "MVD", tarifado: "no", tarifa: "u", flete: "u", com: "u", dc: "u", da: "u", over: "u", total: "u", cobrar: "u" },
    { awb: "25", agente: "prueba25", pcs: "25", peso: "2900", llegada: "03/11/24", ori: "MIA", cnx: "PTY", des: "MVD", tarifado: "si", tarifa: "v", flete: "v", com: "v", dc: "v", da: "v", over: "v", total: "v", cobrar: "v" },
    { awb: "26", agente: "prueba26", pcs: "26", peso: "3000", llegada: "04/11/24", ori: "EZE", cnx: "MVD", des: "MVD", tarifado: "no", tarifa: "w", flete: "w", com: "w", dc: "w", da: "w", over: "w", total: "w", cobrar: "w" },
    { awb: "27", agente: "prueba27", pcs: "27", peso: "3100", llegada: "05/11/24", ori: "JFK", cnx: "GRU", des: "MVD", tarifado: "si", tarifa: "x", flete: "x", com: "x", dc: "x", da: "x", over: "x", total: "x", cobrar: "x" },
    { awb: "28", agente: "prueba28", pcs: "28", peso: "3200", llegada: "06/11/24", ori: "LAX", cnx: "SCL", des: "MVD", tarifado: "no", tarifa: "y", flete: "y", com: "y", dc: "y", da: "y", over: "y", total: "y", cobrar: "y" },
    { awb: "29", agente: "prueba29", pcs: "29", peso: "3300", llegada: "07/11/24", ori: "EZE", cnx: "BOG", des: "MVD", tarifado: "si", tarifa: "z", flete: "z", com: "z", dc: "z", da: "z", over: "z", total: "z", cobrar: "z" },
    { awb: "30", agente: "prueba30", pcs: "30", peso: "3400", llegada: "08/11/24", ori: "MIA", cnx: "PTY", des: "MVD", tarifado: "no", tarifa: "aa", flete: "aa", com: "aa", dc: "aa", da: "aa", over: "aa", total: "aa", cobrar: "aa" }
  ];

  const exportaExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Guias Pendientes');

    // Agregar encabezados
    worksheet.columns = [
      { header: 'AWB', key: 'awb', width: 10 },
      { header: 'Agente', key: 'agente', width: 15 },
      { header: 'Pcs', key: 'pcs', width: 10 },
      { header: 'Peso', key: 'peso', width: 10 },
      { header: 'Llegada', key: 'llegada', width: 15 },
      { header: 'ORI', key: 'ori', width: 10 },
      { header: 'CNX', key: 'cnx', width: 10 },
      { header: 'DES', key: 'des', width: 10 },
      { header: 'Tarifado', key: 'tarifado', width: 10 },
      { header: 'Tarifa', key: 'tarifa', width: 10 },
      { header: 'Flete', key: 'flete', width: 10 },
      { header: 'COM', key: 'com', width: 10 },
      { header: 'DC', key: 'dc', width: 10 },
      { header: 'DA', key: 'da', width: 10 },
      { header: 'Over', key: 'over', width: 10 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Cobrar', key: 'cobrar', width: 10 },
    ];

    // Establecer el color de fondo para las celdas de encabezado desde A1 hasta J1
    for (let col = 1; col <= 17; col++) { // Desde la columna 1 (A) hasta la columna 17 (Q)
      const cell = worksheet.getCell(1, col); // Obtener la celda en la fila 1
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '143361' } // Color de fondo deseado
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // Texto en negrita y color blanco
      cell.alignment = { horizontal: 'center' }; // Centrar texto
    }
    // Agregar filas de datos
    guiaspendientes.forEach((guia) => {
      worksheet.addRow(guia);
    });

    worksheet.autoFilter = {
      from: 'A1',
      to: 'O1',
     }

    // Generar archivo Excel y descargarlo
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'GuiasPendientesExpo.xlsx');
    }).catch((error) => {
      console.error("Error al escribir el buffer: ", error);
    });
  };



  const TablaPendientes = ({ guia }) => (
    <table className='tabla-pendientes' >
      <thead>
        <tr>
          <th>AWB</th>
          <th>Agente</th>
          <th>Pcs</th>
          <th>Peso</th>
          <th>Llegada</th>
          <th>Ori</th>
          <th>CNX</th>
          <th>Des</th>
          <th>Tarifado</th>
          <th>Tarifa</th>
          <th>Flete</th>
          <th>Com.</th>
          <th>DC</th>
          <th>DA</th>
          <th>Over</th>
          <th>Total</th>
          <th>Cobrar</th>
        </tr>
      </thead>
      <tbody>
        {guia.map((guia, index) => (
          <tr key={index}>
            <td>{guia.awb}</td>
            <td>{guia.agente}</td>
            <td>{guia.pcs}</td>
            <td>{guia.peso}</td>
            <td>{guia.llegada}</td>
            <td>{guia.ori}</td>
            <td>{guia.cnx}</td>
            <td>{guia.des}</td>
            <td>{guia.tarifado}</td>
            <td>{guia.tarifa}</td>
            <td>{guia.flete}</td>
            <td>{guia.com}</td>
            <td>{guia.dc}</td>
            <td>{guia.da}</td>
            <td>{guia.over}</td>
            <td>{guia.total}</td>
            <td>{guia.cobrar}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );



  return (
    <div className="EmitirComprobante-container">
      <form className='formulario-estandar' onSubmit={handleSubmitReportePendienteExpo}>
        <h2 className='titulo-estandar'>Reporte de Embarque Pendiente Exportación</h2>
        <div className="primerrenglon-estandar">
          <div className="">
            <label htmlFor="desde">Desde:</label>
            <input
              type="date"
              id="desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              required
            />
          </div>
          <div className="">
            <label htmlFor="hasta">Hasta:</label>
            <input
              type="date"
              id="hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              required
            />
          </div>


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
              <option value="">Selecciona un tipo de pago</option>
              <option value="credito">Crédito</option>
              <option value="contado">Contado</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
          <div>
            <button className='btn-estandar' type="submit">Generar Reporte</button>
          </div>
        </div>
        <div className='primerrenglon-estandar'>
          <br />
        </div>
        <div>
          <TablaPendientes guia={guiaspendientes} />
        </div>
        <div className='primerrenglon-estandar'>
          <div >
            <label htmlFor="embarques">Embarques:</label>
            <input
              type="text"
              id="embarques"
              value={embarques}
              onChange={(e) => setEmbarques(e.target.value)}
              required
            />
          </div>
          <div >
            <label htmlFor="pcs">Pcs:</label>
            <input
              type="text"
              id="pcs"
              value={pcs}
              onChange={(e) => setPcs(e.target.value)}
              required
            />
          </div>
          <div >
            <label htmlFor="peso">Peso:</label>
            <input
              type="text"
              id="peso"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              required
            />
          </div>
          <div >
            <label htmlFor="cobrar">Cobrar:</label>
            <input
              type="text"
              id="cobrar"
              value={cobrar}
              onChange={(e) => setCobrar(e.target.value)}
              required
            />
          </div>
        </div>

        <div className='botones-reportes'>
          <button className='btn-estandar' type="button" onClick={exportaExcel} >Generar Excel</button>
          <button className='btn-estandar' type="button">Volver</button>
        </div>

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
}

export default Reportespendientesexpo