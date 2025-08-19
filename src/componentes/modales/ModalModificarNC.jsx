import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import ModalBusquedaClientes from './ModalBusquedaClientes';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import ModalAlertaGFE from './AlertasGFE';
import Swal from 'sweetalert2';

const ModificarNC = ({ isLoggedIn, isOpen, onClose, onFinally, onSuccess, onError, factura }) => {
  console.log(factura);
  const navigate = useNavigate();
  useEffect(() => {
    const rol = localStorage.getItem('rol');

    if (rol == '') {
      navigate('/');
    }
  }, [navigate]);

  // Estado para los campos del formulario
  const backURL = import.meta.env.VITE_BACK_URL;
  const [fmid, setFmId] = useState('');
  const [fmnombre, setFmNombre] = useState('');
  const [fmtipocomprobante, setFmTipoComprobante] = useState('');
  const [fmcomprobanteelectronico, setFmComprobanteElectronico] = useState('');
  const [fmciudad, setFmCiudad] = useState('');
  const [fmpais, setFmPais] = useState('');
  const [fmrazonsocial, setFmRazonSocial] = useState('');
  const [fmtipoiva, setFmTipoIva] = useState('');
  const [fmmoneda, setFmMoneda] = useState('USD');
  const [fmfecha, setFmFecha] = useState('');
  const [fmfechaVencimiento, setFmFechaVencimiento] = useState('');
  const [fmcomprobante, setFmComprobante] = useState('');
  const [fmelectronico, setFmElectronico] = useState('');
  const [fmdireccionfiscal, setFmDireccionFiscal] = useState('');
  const [fmrutcedula, setFmRutCedula] = useState('');
  const [fmcass, setFmCass] = useState('');
  const [fmtipodeembarque, setFmTipoDeEmbarque] = useState('');
  const [fmtc, setFmTc] = useState('');
  const [fmguia, setFmGuia] = useState('');
  const [fmcodigoconcepto, setFmCodigoConcepto] = useState('');
  const [fmdescripcion, setFmDescripcion] = useState('');
  const [fmmonedaconcepto, setFmMonedaConcepto] = useState('USD');
  const [fmimporte, setFmImporte] = useState('');
  const [fmtotalacobrar, setFmTotalACobrar] = useState('');
  const [fmsubtotal, setFmsubtotal] = useState('');
  const [fmiva, setFmIva] = useState('');
  const [fmredondeo, setFmRedondeo] = useState('');
  const [fmtotal, setFmTotal] = useState('');
  const [fmivaconcepto, setFmIvaConcepto] = useState('');
  const [fmlistadeconceptos, setFmListaDeConceptos] = useState([]);
  const [facturasCliente, setFacturasCliente] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const [conceptoactual, setConceptoActual] = useState([]);
  const [codigoClienteGIA, setCodigoClienteGIA] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingtabla, setLoadingTabla] = useState(false);


  const [isModalOpenAlertaGFE, setIsModalOpenAlertaGFE] = useState(false);
  const [tituloAlertaGfe, setTituloAlertaGfe] = useState('');
  const [mensajeAlertaGFE, setmensajeAlertaGFE] = useState('');
  const [iconoAlertaGFE, setIconoAlertaGFE] = useState('');
  const handleConfirmAlertaGFE = () => {
    setIsModalOpenAlertaGFE(false);
    window.location.reload();
  };
  const [erdocumentoasociado, setErDocumentoAsociado] = useState('');
  const handleKeyPressDocumento = (event) => {

  };

  const handleEliminarFacturaSeleccionada = (numeroCFE) => {
    setFacturasSeleccionadas(prev => prev.filter(f => f.NumeroCFE !== numeroCFE));
  };


  const handleAgregarFacturaSeleccionada = (factura) => {
    if (facturasSeleccionadas.length === 0) {
      setFacturasSeleccionadas([factura]);
    } else {
      const monedaExistente = facturasSeleccionadas[0].Moneda; // moneda de la primera factura
      const tipoDocExistente = facturasSeleccionadas[0].TipoDocCFE; // tipo doc de la primera factura

      if (factura.Moneda !== monedaExistente) {
        toast.error("No se pueden mezclar facturas con monedas diferentes.");
        return;
      }

      if (factura.TipoDocCFE !== tipoDocExistente) {
        toast.error("No se pueden mezclar facturas de diferentes tipos.");
        return;
      }

      const existe = facturasSeleccionadas.some(f => f.NumeroCFE === factura.NumeroCFE);
      if (!existe) {
        setFacturasSeleccionadas(prev => [...prev, factura]);
      } else {
        toast.error("Esta factura ya está seleccionada.");
      }
    }
  };
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]);
  const hasFetched = useRef(false);
  const [botonActivo, setBotonActivo] = useState(false);


  // Estado para la cheque seleccionado
  const [fmconceptoseleccionado, setFmConceptoSeleccionado] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarConceptoAsociado = (icindex) => {
    setFmConceptoSeleccionado(icindex);
  };

  const [conceptosEncontrados, setConceptosEncontrados] = useState([]);
  const [mostrarModalBuscarConcepto, setMostrarModalBuscarConcepto] = useState(false);
  const fetchTodosLosConceptos = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtener-conceptos`);
      setConceptosEncontrados(response.data);
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
      toast.error('Error al obtener la lista de conceptos');
    }
  };

  useEffect(() => {
    if (mostrarModalBuscarConcepto == true) {
      fetchTodosLosConceptos();
    }
  }, [mostrarModalBuscarConcepto]);
  const fetchConceptoPorCodigo = async () => {
    try {
      const response = await axios.get(`${backURL}/api/buscarconcepto/${fmcodigoconcepto}`);
      if (response.data) {
        setFmDescripcion(response.data.descripcion || '');
        setFmCodigoConcepto(response.data.codigo || '');
        setConceptoActual(response.data);
        console.log('Concepto Actual:', response.data);
        setBotonActivo(true);
      } else {
        toast.error('Concepto no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener el concepto:', error);
      toast.error('Error al obtener el concepto');
    }
  };
  const fetchMonedas = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtenermonedas`);
      setMonedas(response.data);
      setIsFetchedMonedas(true); // Indica que ya se obtuvieron los datos
    } catch (error) {
      console.error('Error al obtener monedas:', error);
    }
  }
  useEffect(() => {
    setFmMonedaConcepto(fmmoneda);
  }, [fmmoneda]);

  useEffect(() => {
    console.log('Concepto actual', conceptoactual)
    if (conceptoactual?.impuesto === 'iva_basica' && fmimporte) {
      const ivaCalculado = (parseFloat(fmimporte) * 0.22).toFixed(2); // 22% de IVA
      setFmIvaConcepto(ivaCalculado);
    } else if (conceptoactual?.impuesto === 'iva_minimo' && fmimporte) {
      const ivaCalculado = (parseFloat(fmimporte) * 0.10).toFixed(2); // 10% de IVA
      setFmIvaConcepto(ivaCalculado);

    } else {
      setFmIvaConcepto('0'); // Si es exento, el IVA es 0
    }
  }, [fmimporte, conceptoactual]);

  // Función para eliminar el cheque seleccionado
  const handleEliminarConceptoAsociado = () => {
    if (fmconceptoseleccionado !== null) {
      // Filtrar todos los cheques excepto el seleccionado
      const nuevosconceptoseleccionados = fmlistadeconceptos.filter((_, icindex) => icindex !== fmconceptoseleccionado);
      setFmListaDeConceptos(nuevosconceptoseleccionados);
      setFmConceptoSeleccionado(null); // Limpiar la selección
    }
  };
  // Función para agregar una factura asociada a la tabla
  const handleAgregarConceptoAsociado = () => {
    if (fmcodigoconcepto && fmdescripcion && fmmonedaconcepto && fmivaconcepto && fmimporte && conceptoactual) {
      const nuevoconceptoasociado = {
        ...conceptoactual, // todos los datos que vienen de la base
        ivaCalculado: fmivaconcepto,
        importe: fmimporte,
        moneda: fmmonedaconcepto,
      };
      setFmListaDeConceptos([...fmlistadeconceptos, nuevoconceptoasociado]);

      console.log('Conceptos Actuales:', [...fmlistadeconceptos, nuevoconceptoasociado]);

      // Reset inputs
      setFmCodigoConcepto('');
      setFmDescripcion('');
      setFmIvaConcepto('');
      setFmImporte('');
      setConceptoActual(null);
      setBotonActivo(false);
    }
  };


  useEffect(() => {
    if (!isOpen) return; // Solo ejecuta cuando el modal se abre

    const icfechaactual = new Date().toISOString().split("T")[0];
    setFmFecha(icfechaactual);
    setFmFechaVencimiento(icfechaactual);
    fetchMonedas();

    if (factura?.cliente) {
      handleSelectCliente(factura.cliente);
    }
    factura.facturasAfectadas.forEach(f => {
      handleAgregarFacturaSeleccionada(f);
      console.log('factura Agregada: ', f);
    });
  }, [isOpen, factura]);

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFm = () => {
    setLoading(true);
    if (facturasSeleccionadas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay facturas seleccionadas',
        text: 'Por favor seleccioná al menos una factura.',
      });
      return;
    }

    // Armar texto con números y series
    const detalles = facturasSeleccionadas
      .map(f => `Número: ${f.NumeroCFE}, Serie: ${f.SerieCFE}`)
      .join('<br>');

    Swal.fire({
      title: 'Confirmar Generación',
      html: `
    <p style="color:#0a2d54; text-align:center;">
      Se generará N/C para las siguientes facturas:
    </p>
    <p style="color:#0a2d54; text-align:center;">
      ${detalles}
    </p>
  `,
      icon: 'question',
      color: '#0a2d54', // color general del texto
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0a2d54', // color botón confirmar
      cancelButtonColor: '#0a2d54',  // color botón cancelar
    }).then((result) => {

      if (result.isConfirmed) {
        const importeTotal = facturasSeleccionadas.reduce(
          (acc, factura) => acc + (parseFloat(factura.TotalCobrar) || 0),
          0
        );
        const datosNC = {
          idNC: factura.nc.idNC, // la NC que ya existe y queremos reimpactar
          idCliente: selectedCliente.Id,
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
          DocsAfectados: facturasSeleccionadas.map(f => f.Id).join(','), // separadas por coma
          CFEsAfectados: facturasSeleccionadas.map(f => f.NumeroCFE).join(','),
          ImporteTotal: importeTotal,
          CodigoClienteGIA: selectedCliente.CodigoGIA,
          Moneda: facturasSeleccionadas[0]?.Moneda || ''
        };

        console.log("Datos que voy a enviar para reimpactar:", datosNC);
        axios.post(`${backURL}/api/reimpactarnc`, datosNC)
          .then((response) => {
            Swal.fire({
              icon: 'success',
              title: response.data.wsResultado?.descripcion || 'N/C generada correctamente',
              color: '#0a2d54',
              confirmButtonColor: '#0a2d54'
            }).then(() => window.location.reload());
          })
          .catch(err => {
            Swal.fire({
              icon: 'error',
              title: 'Error al generar la N/C',
              text: err.message,
              color: '#0a2d54',
              confirmButtonColor: '#0a2d54'
            });
          }).finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  };

  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

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
  const handleSelectCliente = async (cliente) => {

    setSelectedCliente(cliente);
    console.log('Cliente desde la base: ', cliente);
    setSearchTerm(cliente.RazonSocial);
    setIsSelectEnabled(true);
    setIsModalOpen(false);

    try {
      setLoadingTabla(true);
      const response = await axios.get(`${backURL}/api/historialfacturacionnc/${cliente.Id}`);
      console.log("Facturas del cliente:", response.data);

      // Si las querés guardar en un estado
      setFacturasCliente(response.data);
      console.log('Estas son las facturas del cliente', response.data);
    } catch (error) {
      console.error("Error al obtener facturas del cliente:", error);
    } finally {
      setLoadingTabla(false);
    }
  };

  // Actualizar el estado del formulario luego se seleccionar un cliente 
  useEffect(() => {
    if (selectedCliente) {
      setFmId(selectedCliente.Id);
      setFmCiudad(selectedCliente.Ciudad);
      setFmPais(selectedCliente.Pais);
      setFmRazonSocial(selectedCliente.RazonSocial);
      setFmTipoIva(selectedCliente.Tiva);
      setFmDireccionFiscal(selectedCliente.Direccion);
      setFmCass(selectedCliente.Cass);
      setFmRutCedula(selectedCliente.Rut);
      setCodigoClienteGIA(selectedCliente.CodigoGIA);


      // 🔁 Limpiar campos de conceptos al cambiar de cliente

    }
  }, [selectedCliente]);

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);
  //Actualización de campos de totales
  useEffect(() => {
    let nuevoSubtotal = 0;
    let nuevoIVA = 0;

    // Recorrer la lista de conceptos y sumar los valores directamente
    fmlistadeconceptos.forEach((concepto) => {
      const importe = parseFloat(concepto.importe) || 0;
      const iva = parseFloat(concepto.ivaCalculado) || 0; // Se asume que ya viene calculado

      nuevoSubtotal += importe;
      nuevoIVA += iva; // Sumar IVA directamente en lugar de calcularlo
    });

    const nuevoTotal = nuevoSubtotal + nuevoIVA;
    const nuevoRedondeo = Math.ceil(nuevoTotal) - nuevoTotal; // Redondeo siempre hacia arriba
    const nuevoTotalACobrar = nuevoTotal + nuevoRedondeo;

    // Actualizar estados
    setFmsubtotal(nuevoSubtotal.toFixed(2));
    setFmIva(nuevoIVA.toFixed(2)); // IVA ahora es la suma directa de los valores fmivaconcepto
    setFmTotal(nuevoTotal.toFixed(2));
    setFmRedondeo(nuevoRedondeo.toFixed(2));
    setFmTotalACobrar(nuevoTotalACobrar.toFixed(2));

  }, [fmlistadeconceptos]); // Se ejecuta cada vez que cambia la lista de conceptos
  const facturasFiltradas = facturasCliente.filter(factura =>
    factura.NumeroCFE.toString().toLowerCase().includes(erdocumentoasociado.toLowerCase())
  );
  if (!isOpen) return null;
  return (
    <div className="modal" onClick={closeModal}>
      <div className="EmitirFacturaManual-container">
        <ToastContainer />
        {loading && (
          <div className="loading-overlay">
            {/* El spinner se muestra cuando loading es true */}
            <div className="loading-spinner"></div>
          </div>
        )}
        <h2 className='titulo-estandar'>Modificar de Nota de Credito</h2>
        <form className='formulario-estandar'>

          <div className='primerafilaemisiondecomprobantes'>
            <div className='div-datos-comprobante'>
              <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

              <div className='div-renglon-datos-facturasmanuales'>
                <div>
                  <label htmlFor="ecnombre">Nombre:</label>
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
                  <label htmlFor="ecID">Código GIA:</label>
                  <input
                    type="text"
                    id="ecID"
                    value={codigoClienteGIA}
                    onChange={(e) => setCodigoClienteGIA(e.target.value)}
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="fmrazonsocial">Razon Social:</label>
                  <input
                    type="text"
                    id="fmrazonsocial"
                    value={fmrazonsocial}
                    onChange={(e) => setFmRazonSocial(e.target.value)}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="fmmoneda">Moneda:</label>
                  <select
                    id="ecmoneda"
                    value={fmmoneda}
                    onChange={(e) => setFmMoneda(e.target.value)}
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="UYU">UYU</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fmdireccionfiscal">Dirección Fiscal:</label>
                  <input
                    type="text"
                    id="fmdireccionfiscal"
                    value={fmdireccionfiscal}
                    onChange={(e) => setFmDireccionFiscal(e.target.value)}
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="fmrutcedula">RUT/Cedula:</label>
                  <input
                    type="text"
                    id="fmrutcedula"
                    value={fmrutcedula}
                    onChange={(e) => setFmRutCedula(e.target.value)}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="fmcass">Cass:</label>
                  <select
                    id="eccass"
                    value={fmcass}
                    onChange={(e) => setFmCass(e.target.value)}
                    required
                  >
                    <option value="">Selecciona el Cass</option>
                    <option value="false">No</option>
                    <option value="true">Si</option>
                  </select>
                </div>
              </div>

            </div>



            <div className='contenedor-tablasNC'>
              <br />
              <h3 className='subtitulo-estandar'>Historial de facturación</h3>
              <div className='div-primerrenglon-datos-recibos2'>
                <div className='contenedor-tabla-historial'>
                  {/* Tabla que muestra las facturas agregadas */}
                  <table className='tabla-historialfacturacion' >
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Número CFE</th>
                        <th>Serie CFE</th>
                        <th>Tipo de Doc.</th>
                        <th>Importe</th>
                        <th>
                          <div>
                            <input
                              type="text"
                              id="documento"
                              value={erdocumentoasociado}
                              onChange={(e) => setErDocumentoAsociado(e.target.value)}
                              onKeyDown={handleKeyPressDocumento}
                              placeholder='Nro. Comprobante'
                              autoComplete="off"
                              disabled={!searchTerm}
                            />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingtabla ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>
                            <div className="loading-spinner">
                              {/* Aquí tu spinner */}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        facturasFiltradas.map((factura, indexec) => (
                          <tr
                            key={indexec}
                            onDoubleClick={() => handleAgregarFacturaSeleccionada(factura)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{factura.FechaFormateada}</td>
                            <td>{factura.NumeroCFE}</td>
                            <td>{factura.SerieCFE}</td>
                            <td>
                              {factura.TipoDocCFE === 'TCD'
                                ? 'Eticket'
                                : factura.TipoDocCFE === 'TCA'
                                  ? 'Eticket CA'
                                  : factura.TipoDocCFE === 'FCD'
                                    ? 'Efactura'
                                    : factura.TipoDocCFE === 'FCA'
                                      ? 'Efactura CA'
                                      : factura.TipoDocCFE}
                            </td>
                            <td>{factura.TotalCobrar}</td>
                            <td>{factura.Moneda}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Flecha */}
                <div className="flecha-tables">
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#0a2d54" viewBox="0 0 24 24">
                    <path d="M10 17l5-5-5-5v10zM4 17l5-5-5-5v10z" />
                    <path fill="none" d="M0 24V0h24v24H0z" />
                  </svg>
                </div>
                <div className='contenedor-tabla-historial'>
                  <table className='tabla-historialfacturacion' >
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Número CFE</th>
                        <th>Serie CFE</th>
                        <th>Tipo de Doc.</th>
                        <th>Importe</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturasSeleccionadas.map((factura, indexec) => (
                        <tr
                          key={indexec}
                          onClick={() => handleSeleccionarConceptoAsociado(indexec)}
                          style={{
                            cursor: 'pointer' // Indica que la fila es clickeable
                          }}
                        >
                          <td>{factura.FechaFormateada}</td>
                          <td>{factura.NumeroCFE}</td>
                          <td>{factura.SerieCFE}</td>
                          <td>{factura.TipoDocCFE === 'TCD'
                            ? 'Eticket'
                            : factura.TipoDocCFE === 'TCA'
                              ? 'Eticket CA'
                              : factura.TipoDocCFE === 'FCD'
                                ? 'Efactura'
                                : factura.TipoDocCFE === 'FCA'
                                  ? 'Efactura CA'
                                  : factura.TipoDocCFE}</td>
                          <td>{factura.TotalCobrar} {factura.Moneda}</td>
                          <td>
                            <button
                              className='action-button'
                              type="button"
                              onClick={() => handleEliminarFacturaSeleccionada(factura.NumeroCFE)}
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>



          </div>
          <br />
          <br />


          <div className='botonesemitirnc'>
            <div></div>
            <Link to="/home"><button type="button" className="btn-estandar">Volver</button></Link>
            <button type="button" className='btn-facturar' onClick={handleSubmitAgregarFm}>Generar N/C</button>
            <div></div>
          </div>


        </form>
        {mostrarModalBuscarConcepto && (
          <div className="modal" onClick={() => setMostrarModalBuscarConcepto(false)}>
            <div className="modal-content-conceptos">
              <div className='titulo-estandar'>
                <h2>Buscar concepto</h2>
              </div>

              <p>Seleccioná un concepto de la lista:</p>
              <div className="table-containerSinCobrar">
                <table className="tabla-guiassinfacturar">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Impuesto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conceptosEncontrados.map((concepto) => (
                      <tr
                        key={concepto.idconcepto}
                        onClick={() => {
                          setFmCodigoConcepto(concepto.codigo);
                          setFmDescripcion(concepto.descripcion);
                          setConceptoActual(concepto);
                          setMostrarModalBuscarConcepto(false);
                          setBotonActivo(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{concepto.codigo}</td>
                        <td>{concepto.descripcion}</td>
                        <td>{concepto.impuesto === 'iva_basica'
                          ? '22%'
                          : concepto.impuesto === 'iva_minimo'
                            ? '10%'
                            : concepto.impuesto === 'exento'
                              ? 'Exento' : concepto.impuesto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Modal de búsqueda de clientes */}
        <ModalBusquedaClientes
          isOpen={isModalOpen}
          closeModal={closeModal}
          filteredClientes={filteredClientes}
          handleSelectCliente={handleSelectCliente}
        />
        <ModalAlertaGFE
          isOpen={isModalOpenAlertaGFE}
          title={tituloAlertaGfe}
          message={mensajeAlertaGFE}
          onConfirm={handleConfirmAlertaGFE}
          iconType={iconoAlertaGFE}
        />
      </div>
    </div>
  );
}

export default ModificarNC