import React, { useState, useEffect } from 'react';
import '../Reportespendientes.css'; // Importa el archivo CSS
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
//importaciones para exportar a excel
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';



const Reportespendientesexpo = ({ isLoggedIn }) => {
  const backURL = import.meta.env.VITE_BACK_URL;
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
  const [guiaspendientes, setGuiaspendientes] = useState([]);
  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    // Función para obtener la fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split("T")[0];
    setHasta(fechaActual);
  }, []);

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

  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setNumeroCliente(cliente.Id);
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Envío del formulario
  const handleSubmitReportePendienteExpo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${backURL}/api/obtenerguiasexpopendientes`, {
        params: {
          cliente: searchTerm,
          desde: desde,
          hasta: hasta,
          tipoPago: tipoPago
        }
      });

      const data = response.data;
      console.log(response.data);
      // Transformar la data al formato deseado (si es necesario)
      const guiasFormateadas = data.map((guia) => ({
        awb: guia.guia,
        agente: guia.agente,
        pcs: guia.piezas,
        peso: guia.pesobruto,
        vuelo: guia.vuelo,
        emision: guia.emision ? new Date(guia.emision).toLocaleDateString() : "",
        llegada: guia.fechavuelo ? new Date(guia.fechavuelo).toLocaleDateString() : "",
        ori: guia.origenvuelo,
        tipopago: guia.tipodepago === 'P' ? 'PREPAID' : guia.tipodepago === 'C' ? 'COLLECT' : guia.tipodepago,
        cnx: guia.conexionvuelo,
        des: guia.destinovuelo,
        tarifado: guia.pesotarifado,
        tarifa: guia.tarifaneta,
        flete: guia.fleteawb,
        fleteneto: guia.fleteneto,
        dc: guia.duecarrier ?? 0,
        da: guia.dueagent ?? 0,
        dbf: guia.dbf ?? 0,
        security: guia.security ?? 0,
        incentivo: -guia.fleteneto,
        total: guia.total,
        cobrar: guia.total

      }));

      setGuiaspendientes(guiasFormateadas);
      console.log(guiasFormateadas);
    } catch (error) {
      console.error("Error al obtener guías pendientes:", error);
    }
  };



  const exportaExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Guias Pendientes Expo');
    worksheet.columns = [
      { width: 15 }, // A — AWB Número
      { width: 12 }, // B — Emisión
      { width: 10 }, // C — Vuelo Número
      { width: 12 }, // D — Fecha
      { width: 10 }, // E — Bruto
      { width: 10 }, // F — Tarifado
      { width: 10 }, // G — Origen
      { width: 14 }, // H — Tipo de pago
      { width: 14 }, // I — Flete
      { width: 12 }, // J — Due Agent
      { width: 10 }, // K — DC
      { width: 15 }, // L — Total a pagar
    ];

    // Cliente
    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').value = `Cliente: ${searchTerm ?? 'Cliente no especificado'}`;
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9D9D9' },
    };
    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'left', vertical: 'middle' };

    // Período
    worksheet.mergeCells('A2:C2');
    worksheet.getCell('A2').value = `Período: ${desde} a ${hasta}`;
    worksheet.getCell('A2').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9D9D9' },
    };
    worksheet.getCell('A2').font = { bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'middle' };

    // Base
    worksheet.mergeCells('A3:C3');
    worksheet.getCell('A3').value = 'Base: MVD';
    worksheet.getCell('A3').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9D9D9' },
    };
    worksheet.getCell('A3').font = { bold: true };
    worksheet.getCell('A3').alignment = { horizontal: 'left', vertical: 'middle' };

    // Fila 1 — Headers principales combinados
    worksheet.mergeCells('A4:B4'); // AWB
    worksheet.mergeCells('C4:D4'); // Vuelo
    worksheet.mergeCells('E4:F4'); // Peso

    worksheet.getCell('A4').value = 'AWB';
    worksheet.getCell('C4').value = 'Vuelo';
    worksheet.getCell('E4').value = 'Peso';

    worksheet.getCell('A5').value = 'Número';
    worksheet.getCell('B5').value = 'Emisión';
    worksheet.getCell('C5').value = 'Número';
    worksheet.getCell('D5').value = 'Fecha';
    worksheet.getCell('E5').value = 'Bruto';
    worksheet.getCell('F5').value = 'Tarifado';
    worksheet.getCell('G5').value = 'Destino';
    worksheet.getCell('H5').value = 'Tipo de Pago';
    worksheet.getCell('I5').value = 'Tarifa Neta';
    worksheet.getCell('J5').value = 'Flete AWB';
    worksheet.getCell('K5').value = 'Total Flete';
    worksheet.getCell('L5').value = 'Due Agent';
    worksheet.getCell('M5').value = 'DBF';
    worksheet.getCell('N5').value = 'Due Carrier';
    worksheet.getCell('O5').value = 'Security';
    worksheet.getCell('P5').value = 'Incentivo';
    worksheet.getCell('Q5').value = 'Total ';
    // 👉 Estilos de encabezado (ahora filas 4 y 5)
    for (let row = 4; row <= 5; row++) {
      for (let col = 1; col <= 17; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '143361' },
        };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      }
    }

    guiaspendientes.forEach((guia) => {
      const row = worksheet.addRow([
        guia.awb,
        guia.emision ? new Date(guia.emision) : null,
        guia.vuelo,
        guia.llegada ? new Date(guia.llegada) : null,
        guia.peso,
        guia.tarifado,
        guia.des,
        guia.tipopago,
        guia.tarifa,
        guia.flete,
        guia.fleteneto,
        guia.da ?? 0,
        guia.dbf,
        guia.dc ?? 0,
        guia.security ?? 0,
        guia.incentivo,
        guia.cobrar,
      ]);
      row.getCell(2).numFmt = 'dd/mm/yyyy';
      row.getCell(4).numFmt = 'dd/mm/yyyy';
    });

    worksheet.autoFilter = {
      from: 'A5',
      to: 'Q5',
    };

    // 👉 Sumo todos los cobrar:
    const totalCobrar = guiaspendientes.reduce((acc, guia) => acc + (guia.cobrar || 0), 0);

    // 👉 Dejo una línea en blanco y agrego la fila resumen al final:
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.mergeCells(`A${lastRow}:P${lastRow}`);
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL A COBRAR:';
    worksheet.getCell(`A${lastRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`A${lastRow}`).font = { bold: true };

    worksheet.getCell(`Q${lastRow}`).value = totalCobrar;
    worksheet.getCell(`Q${lastRow}`).numFmt = '#,##0.00';
    worksheet.getCell(`Q${lastRow}`).font = { bold: true };
    worksheet.getCell(`Q${lastRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '9ACD33' },
    };


    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `GuiasPendientesExpo_${searchTerm}_${desde}_${hasta}.xlsx`);
    });
  };



  const TablaPendientes = ({ guia }) => (
    <div className='contenedor-tabla-buscarfacturas'>
      <table className='tabla-facturas' >
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
            <th>DC</th>
            <th>DA</th>
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
              <td>{guia.dc}</td>
              <td>{guia.da}</td>
              <td>{guia.total}</td>
              <td>{guia.cobrar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

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
              readOnly
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
              <option value="P">Prepaid</option>
              <option value="C">Collect</option>
              <option value="Cualquiera">Cualquiera</option>
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