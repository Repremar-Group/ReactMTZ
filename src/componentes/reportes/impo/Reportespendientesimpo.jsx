import React, { useState, useEffect } from 'react';
import '../Reportespendientes.css'; // Importa el archivo CSS
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
//importaciones para exportar a excel
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Reportespendientesimpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [aerolinea, setAerolinea] = useState('');
  const [embarques, setEmbarques] = useState('');
  const [pcs, setPcs] = useState('');
  const [peso, setPeso] = useState('');
  const [cobrar, setCobrar] = useState('');
  const [guiaspendientes, setGuiaspendientes] = useState([]);
  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backURL = import.meta.env.VITE_BACK_URL;

  useEffect(() => {
    // Función para obtener la fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split("T")[0];
    setHasta(fechaActual);
  }, []);

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

  // Búsqueda de clientes al presionar Enter
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${searchTerm}`);
        console.log('Cliente: ', response.data);
        setFilteredClientes(response.data);
        setIsModalOpen(true); // Abre el modal con los resultados
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
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
        aerolinea,
      };

      // ⚙️ Llamada al endpoint que genera el PDF
      const response = await axios.get(`${backURL}/api/reportedeembarquependienteimpo/pdf`, {
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
  const handleSubmitReporteImpo = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`${backURL}/api/obtenerguiasimpopendientes`, {
        params: {
          cliente: searchTerm,
          desde: desde,
          hasta: hasta,
          tipoPago: tipoPago,
          aerolinea: aerolinea
        }
      });

      const data = response.data;

      if (!data || data.length === 0) {
        toast("No se encontraron guías pendientes para los filtros seleccionados.");
        setGuiaspendientes([]); 
        return;
      }


     
      const guiasFormateadas = data.map((guia) => ({
        awb: guia.guia,
        agente: guia.consignatario,
        pcs: guia.piezas,
        peso: guia.peso,
        vuelo: guia.vuelo,
        emision: guia.emision ? new Date(guia.emision).toLocaleDateString() : "",
        llegada: guia.fechavuelo ? new Date(guia.fechavuelo).toLocaleDateString() : "",
        ori: guia.origenguia,
        tipopago: guia.tipodepagoguia === 'P' ? 'PREPAID' : guia.tipodepagoguia === 'C' ? 'COLLECT' : guia.tipodepagoguia,
        cnx: guia.conexionguia,
        des: guia.destinoguia,
        tarifado: guia.pesovolumetrico,
        tarifa: guia.tarifa,
        flete: guia.flete,
        dc: guia.duecarrier ?? 0,
        da: guia.dueagent ?? 0,
        total: guia.totalguia,
        cobrar: guia.total

      }));

      setGuiaspendientes(guiasFormateadas);
      console.log(guiasFormateadas);
    } catch (error) {
      console.error("Error al obtener guías pendientes:", error);
    }
  };


  const exportaExcel = () => {
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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Guias Pendientes Impo');
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
    worksheet.getCell('G5').value = 'Origen';
    worksheet.getCell('H5').value = 'Tipo de Pago';
    worksheet.getCell('I5').value = 'Flete AWB';
    worksheet.getCell('J5').value = 'Due Agent';
    worksheet.getCell('K5').value = 'DC';
    worksheet.getCell('L5').value = 'Total a Pagar';
    // 👉 Estilos de encabezado (ahora filas 4 y 5)
    for (let row = 4; row <= 5; row++) {
      for (let col = 1; col <= 12; col++) {
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
    const parseFecha = (fechaStr) => {
      if (!fechaStr || typeof fechaStr !== 'string') return '';
      // Si ya está en formato ISO (YYYY-MM-DD o YYYY/MM/DD)
      if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(fechaStr)) return new Date(fechaStr);

      // Si viene como DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaStr)) {
        const [dia, mes, año] = fechaStr.split('/');
        return new Date(`${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T00:00:00`);
      }

      // Cualquier otro formato no se intenta parsear
      return '';
    };
    // 👉 Ahora los datos empiezan desde la fila 6
    guiaspendientes.forEach((guia) => {
      console.log('Guia A imprimir ', guia)
      const safe = (v) => (v == null ? '' : v);
      const row = worksheet.addRow([
        safe(guia.awb),
        parseFecha(guia.emision),
        safe(guia.vuelo),
        parseFecha(guia.llegada),
        guia.peso ?? 0,
        guia.tarifado ?? 0,
        safe(guia.ori),
        safe(guia.tipopago),
        guia.flete ?? 0,
        guia.da ?? 0,
        guia.dc ?? 0,
        guia.cobrar ?? 0,
      ]);
      row.getCell(2).numFmt = 'dd/mm/yyyy';
      row.getCell(4).numFmt = 'dd/mm/yyyy';
    });

    worksheet.autoFilter = {
      from: 'A5',
      to: 'L5',
    };

    // 👉 Sumo todos los cobrar:
    const totalCobrar = guiaspendientes.reduce(
      (acc, guia) => acc + parseFloat(guia.cobrar || 0),
      0
    );

    // 👉 Dejo una línea en blanco y agrego la fila resumen al final:
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.mergeCells(`A${lastRow}:K${lastRow}`);
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL A COBRAR:';
    worksheet.getCell(`A${lastRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`A${lastRow}`).font = { bold: true };

    worksheet.getCell(`L${lastRow}`).value = totalCobrar;
    worksheet.getCell(`L${lastRow}`).numFmt = '#,##0.00';
    worksheet.getCell(`L${lastRow}`).font = { bold: true };
    worksheet.getCell(`L${lastRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '9ACD33' },
    };


    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `GuiasPendientesImpo_${searchTerm}_${desde}_${hasta}.xlsx`);
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
      <form className='formulario-estandar' onSubmit={handleSubmitReporteImpo}>
        <ToastContainer />
        <h2 className='titulo-estandar'>Reporte de Embarque Pendiente Importación</h2>
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
          <button className='btn-estandar' type="button" onClick={exportaExcel}>Generar Excel</button>
          <button className='btn-estandar' type="button" onClick={handlepdfReporteExpo} >Generar PDF</button>
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

export default Reportespendientesimpo