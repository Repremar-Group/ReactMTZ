import React, { useState } from 'react';
import '../Reportes.css'; // Importa el archivo CSS
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';
const Reportesimpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const hoy = new Date().toISOString().split('T')[0];
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [numeroCliente, setNumeroCliente] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [aerolinea, setAerolinea] = useState('');

  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backURL = import.meta.env.VITE_BACK_URL;

  const exportarAExcel = async (data) => {
    if (!desde || !hasta) {
      toast("Debe seleccionar la fecha Desde y Hasta.");
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
    const worksheet = workbook.addWorksheet('Reporte Importe');

    worksheet.columns = [
      { header: 'Fecha', key: 'fechaVuelo', width: 15 },
      { header: 'Número AWB', key: 'guia', width: 20 },
      { header: 'Agente', key: 'consignatario', width: 25 },
      { header: 'Origen', key: 'origenguia', width: 15 },
      { header: 'Vuelo', key: 'vuelo', width: 15 },
      { header: 'Peso', key: 'peso', width: 12 },
      { header: 'PP Charges', key: 'PPChanges', width: 17 },
      { header: 'PP Others', key: 'ppothers', width: 17 },
      { header: 'CC Charges', key: 'cccharges', width: 17 },
      { header: 'CC Others', key: 'ccothers', width: 17 },
      { header: 'Collect Fee', key: 'collectfee', width: 17 },
      { header: 'CF IVA', key: 'cfiva', width: 12 },
      { header: 'Arbitraje', key: 'arbitraje', width: 14 },
      { header: 'Verificación', key: 'verificacion', width: 17 },
      { header: 'IVA 3%', key: 'ivas3', width: 12 },
      { header: 'Ajuste', key: 'ajuste', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Tipo', key: 'tipodepagoguia', width: 10 },
      { header: 'Factura', key: 'factura', width: 10 },
      { header: 'Factura CA', key: 'facturaca', width: 10 },
      { header: 'Recibo', key: 'recibo', width: 10 },
      { header: 'Notificada', key: 'notificada', width: 10 },
    ];
    // Estilo: encabezado con fondo azul y letras blancas
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '143361' }, // Azul correcto
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // Blanco con opacidad completa
        bold: true,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    worksheet.getColumn('fechaVuelo').numFmt = 'dd/mm/yyyy';

    // Filtro tipo Excel en los encabezados
    worksheet.autoFilter = {
      from: 'A1',
      to: worksheet.getRow(1).getCell(worksheet.getRow(1).cellCount)._address,
    };
    //Ordeno por consignatario y fecha
    const dataOrdenada = [...data].sort((a, b) => {
      const consA = (a.consignatario || '').toLowerCase();
      const consB = (b.consignatario || '').toLowerCase();

      if (consA < consB) return -1;
      if (consA > consB) return 1;

      const fechaA = new Date(a.fechavuelo);
      const fechaB = new Date(b.fechavuelo);

      return fechaA - fechaB;
    });
    // Agregar los datos aplicando la lógica de tipo de pago
    dataOrdenada.forEach((item) => {
      const tipoPago = item.tipodepagoguia;

      const ppcharges = tipoPago === 'C' ? 0 : item.flete || 0;
      const ppothers = tipoPago === 'C' ? 0 : (item.dcoriginal || 0) + (item.daoriginal || 0);
      const cccharges = tipoPago === 'P' ? 0 : item.fleteoriginal || 0;
      const ccothers = tipoPago === 'P' ? 0 : (item.dcoriginal || 0) + (item.daoriginal || 0);

      worksheet.addRow({
        fechaVuelo: item.fechavuelo ? new Date(item.fechavuelo) : null,
        guia: item.guia,
        consignatario: item.consignatario,
        origenguia: item.origenguia,
        vuelo: item.vuelo,
        peso: item.peso,
        PPChanges: ppcharges,
        ppothers: ppothers,
        cccharges: cccharges,
        ccothers: ccothers,
        collectfee: item.collectfee,
        cfiva: item.cfiva,
        arbitraje: item.arbitraje,
        verificacion: item.verificacion,
        ivas3: item.ivas3,
        ajuste: item.ajuste,
        total: item.total,
        tipodepagoguia: item.tipodepagoguia,
        factura: item.factura_cfe,
        facturaca: item.factura_ca_cfe,
        recibo: item.recibo_cfe,
        notificada: item.notificada === 1 ? 'SI' : 'NO',
      });
    });



    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'reporte_embarque_impo.xlsx');
  };

  const handlepdfReporteExpo = async (e) => {
    e.preventDefault();
    if (!desde || !hasta) {
      toast("Debe seleccionar la fecha Desde y Hasta.");
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
      const response = await axios.get(`${backURL}/api/reportedeembarqueimpo/pdf`, {
        params,
        responseType: "arraybuffer", // 👈 importante para PDF binario
      });
      if (!response.data || response.data.byteLength < 1000) {
        toast("No se encontraron datos para generar el reporte.");
        return;
      }

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


      console.log("PDF descargado correctamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast("Ocurrio un error o no se encontraron datos.");
    }
  };

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

  // Búsqueda de clientes al presionar Enter
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${searchTerm}`);
        console.log(response.data);
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
    setTipoPago(cliente.Tcomprobante)
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Envío del formulario
  const handleSubmitReporteImpo = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams({
      cliente: searchTerm,
      desde,
      hasta,
      tipoPago,
      aerolinea
    });

    try {
      const response = await fetch(`${backURL}/api/obtenerguiasimporeporte?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          toast.info('No se encontraron datos para el reporte');
          return;
        }
        exportarAExcel(data);
        toast.success('Excel Generado Correctamente.');
      } else {
        toast.error('Error al generar reporte');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    }
  };

  return (
    <div className="reporte-container">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        closeButton={false}
      />
      <form className='formularioschicos' onSubmit={handleSubmitReporteImpo}>
        <h2 className='titulo-estandar'>Reporte de Embarque Importación</h2>

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
          <div>
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
              required
            >
              <option value="">Seleccione el tipo de pago</option>
              <option value="ALL">Todos</option>
              <option value="cc">Collect</option>
              <option value="pp">PrePaid</option>
            </select>
          </div>
        </div>
        <button type="button" onClick={handlepdfReporteExpo} >Generar PDF</button>
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

export default Reportesimpo;
