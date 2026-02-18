import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import './Facturasmanuales.css'
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import ModalAlertaGFE from '../../modales/AlertasGFE';
import { descargarPDFBase64 } from '../../../ConexionGFE/Funciones';
const Facturasmanuales = ({ isLoggedIn }) => {

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
  const [fmredondeo, setFmRedondeo] = useState(0);
  const [fmtotal, setFmTotal] = useState('');
  const [fmivaconcepto, setFmIvaConcepto] = useState('');
  const [fmlistadeconceptos, setFmListaDeConceptos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const [conceptoactual, setConceptoActual] = useState([]);
  const [codigoClienteGIA, setCodigoClienteGIA] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalAdendaOpen, setIsModalAdendaOpen] = useState(false);
  const [adenda, setAdenda] = useState('');

  const [isModalOpenAlertaGFE, setIsModalOpenAlertaGFE] = useState(false);
  const [tituloAlertaGfe, setTituloAlertaGfe] = useState('');
  const [mensajeAlertaGFE, setmensajeAlertaGFE] = useState('');
  const [iconoAlertaGFE, setIconoAlertaGFE] = useState('');
  const handleConfirmAlertaGFE = () => {
    setIsModalOpenAlertaGFE(false);
    window.location.reload();
  };


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
    if (hasFetched.current) return; // Si ya se ejecutó, no vuelve a hacerlo
    hasFetched.current = true;

    // Llamar al endpoint para obtener el tipo de cambio
    const obtenerTipoCambio = async () => {
      try {
        const response = await axios.get(`${backURL}/api/obtenertipocambioparacomprobante`);
        if (response.data.tipo_cambio == undefined) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/home");
        } else {
          setFmTc(response.data.tipo_cambio);
        }
        console.log(response.data.tipo_cambio);
      } catch (error) {
        if (error.response) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/home");
        } else {
          console.error("Error en la consulta:", error);
          navigate("/home");
        }
      }
    };
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setFmFecha(icfechaactual);
    setFmFechaVencimiento(icfechaactual);
    fetchMonedas();
    obtenerTipoCambio();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFm = async (event, adendaValor) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setLoading(true);
    // Recopilar los datos del formulario en un objeto
    const datosFormulario = {
      IdCliente: fmid,
      Nombre: searchTerm,
      codigoClienteGIA: codigoClienteGIA,
      RazonSocial: fmrazonsocial,
      DireccionFiscal: fmdireccionfiscal,
      Ciudad: fmciudad,
      Pais: fmpais,
      RutCedula: fmrutcedula,
      ComprobanteElectronico: fmcomprobanteelectronico,
      Comprobante: fmcomprobante,
      Electronico: fmelectronico,
      Moneda: fmmoneda,
      Fecha: fmfecha,
      FechaVencimiento: fmfechaVencimiento,
      TipoIVA: fmtipoiva,
      CASS: fmcass,
      TipoEmbarque: fmtipodeembarque,
      TC: parseFloat(fmtc).toFixed(2),
      Subtotal: parseFloat(fmsubtotal).toFixed(2),
      IVA: parseFloat(fmiva).toFixed(2),
      Redondeo: parseFloat(fmredondeo).toFixed(2),
      Total: parseFloat(fmtotal).toFixed(2),
      TotalCobrar: parseFloat(fmtotalacobrar).toFixed(2),
      DetalleFactura: fmlistadeconceptos,
      Adenda: adendaValor,

    };
    console.log('info al backend: ', datosFormulario);


    try {
      // Enviar los datos del formulario a tu servidor
      console.log('Datos del formulario a Backend: ', datosFormulario);
      const response = await axios.post(`${backURL}/api/insertfacturamanual`, datosFormulario);
      console.log('Respuesta HTTP recibida:', response.status, response.data);


      if (response.status >= 200 && response.status < 300) {
        if (response.data?.success) {
          const documento = response.data.documento;

          if (documento) {
            console.log('Documento generado:', documento);

            const nombreArchivo = `${documento.tipo}_${documento.serie}_${documento.numero}.pdf`;
            descargarPDFBase64(documento.pdfBase64, nombreArchivo);
          }
          let mensajeExito = `Documento ${documento.tipo}_${documento.serie}_${documento.numero} guardado correctamente.`;
          setTituloAlertaGfe('Factura Ingresada Correctamente');
          setmensajeAlertaGFE(mensajeExito || '');
          setIconoAlertaGFE('success');
          setIsModalOpenAlertaGFE(true);
        } else {
          const descripcion = response.data?.descripcion;
          const mensajeError = descripcion || response.data?.message || 'Error desconocido al ingresar la factura';

          setTituloAlertaGfe('Error al Impactar en GFE');
          setmensajeAlertaGFE(mensajeError);
          setIconoAlertaGFE('error');
          setIsModalOpenAlertaGFE(true);
        }
      } else {
        // Status no 2xx
        console.warn('Respuesta HTTP inesperada:', response.status);
        setTituloAlertaGfe('Error Desconocido');
        setmensajeAlertaGFE(`Error HTTP ${response.status}`);
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);
      }
    } catch (error) {
      console.error('Error atrapado:', error);

      if (error.response) {
        console.log('Error response:', error.response);
        console.log('Error response data:', error.response.data);

        if (error.response.status === 422) {
          const { errores, mensaje, message } = error.response.data;
          let mensajeError = error.response.data?.descripcion || mensaje || message || 'Error al procesar los documentos.';

          if (Array.isArray(errores) && errores.length > 0) {
            const detalles = errores
              .map((err, i) => `Documento ${i + 1}: ${err.descripcion || 'Error desconocido'}`)
              .join('\n');

            mensajeError += '\n\n' + detalles;
          }

          setTituloAlertaGfe('Error al Impactar en GFE');
          setmensajeAlertaGFE(mensajeError);
          setIconoAlertaGFE('error');
          setIsModalOpenAlertaGFE(true);
        } else if (error.response.status === 500) {
          const mensaje = error.response.data?.message || 'Error interno en el servidor';

          setTituloAlertaGfe('Error al Cargar la Factura');
          setmensajeAlertaGFE(mensaje);
          setIconoAlertaGFE('error');
          setIsModalOpenAlertaGFE(true);
        } else {
          setTituloAlertaGfe('Error Desconocido');
          setmensajeAlertaGFE(`Error HTTP ${error.response.status}`);
          setIconoAlertaGFE('error');
          setIsModalOpenAlertaGFE(true);
        }
      } else if (error.request) {
        // No se recibió respuesta
        console.error('No se recibió respuesta del servidor', error.request);
        setTituloAlertaGfe('Error de Conexión');
        setmensajeAlertaGFE('No se pudo conectar con el servidor.');
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);
      } else {
        // Otro error al configurar la solicitud
        setTituloAlertaGfe('Error Desconocido');
        setmensajeAlertaGFE(error.message || 'Error desconocido en el ERP');
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);
      }
    } finally {
      setLoading(false);
    }
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
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsSelectEnabled(true);
    setIsModalOpen(false); // Cierra el modal
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
   
    const nuevoTotalACobrar = nuevoTotal;

    // Actualizar estados
    setFmsubtotal(nuevoSubtotal.toFixed(2));
    setFmIva(nuevoIVA.toFixed(2)); // IVA ahora es la suma directa de los valores fmivaconcepto
    setFmTotal(nuevoTotal.toFixed(2));
  
    setFmTotalACobrar(nuevoTotalACobrar.toFixed(2));

  }, [fmlistadeconceptos]); // Se ejecuta cada vez que cambia la lista de conceptos


  return (
    <div className="EmitirFacturaManual-container">
      <ToastContainer />
      {loading && (
        <div className="loading-overlay">
          {/* El spinner se muestra cuando loading es true */}
          <div className="loading-spinner"></div>
        </div>
      )}
      <h2 className='titulo-estandar'>Emisión de Factura Manual</h2>
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
                <label htmlFor="eccomprobanteelectronico">Comprobante Electronico:</label>
                <select
                  id="tipoComprobante"
                  value={fmcomprobanteelectronico}
                  onChange={(e) => setFmComprobanteElectronico(e.target.value)}
                  required
                >
                  <option value="">Comprobante Electronico</option>
                  <option value="efactura">E-Factura</option>
                  <option value="eticket">E-Ticket</option>
                  <option value="efacturaca">E-Factura Cuenta Ajena</option>
                  <option value="eticketca">E-Ticket Cuenta Ajena</option>
                </select>

              </div>
              <div className="fecha-emision-comprobante">
                <label htmlFor="fmfecha">Fecha:</label>
                <input
                  type="date"
                  id="fmfecha"
                  value={fmfecha}
                  onChange={(e) => setFmFecha(e.target.value)}
                  required
                />
              </div>
              <div className="fecha-emision-comprobante">
                <label htmlFor="fmfecha">Fecha Vencimiento:</label>
                <input
                  type="date"
                  id="fmfecha"
                  value={fmfechaVencimiento}
                  onChange={(e) => setFmFechaVencimiento(e.target.value)}
                  required
                />
              </div>


            </div>


            <div className='div-renglon-datos-facturasmanuales'>
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
                <label htmlFor="fmciudad">Ciudad:</label>
                <input
                  type="text"
                  id="fmciudad"
                  value={fmciudad}
                  onChange={(e) => setFmCiudad(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="fmpais">Pais:</label>
                <input
                  type="text"
                  id="fmpais"
                  value={fmpais}
                  onChange={(e) => setFmPais(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="fmtipoiva">Tipo de IVA:</label>
                <select
                  id="fmtipoiva"
                  value={fmtipoiva}
                  onChange={(e) => setFmTipoIva(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo de IVA</option>
                  <option value="iva22">IVA 22%</option>
                  <option value="excento">Exento</option>
                </select>
              </div>
            </div>

            <div className='div-renglon-datos-facturasmanuales'>
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
              <div>
                <label htmlFor="ectipoembarque">Tipo de Embarque:</label>
                <select
                  id="ectipoembarque"
                  value={fmtipodeembarque}
                  onChange={(e) => setFmTipoDeEmbarque(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Impo">Impo</option>
                  <option value="Expo">Expo</option>
                </select>
              </div>
              <div>
                <label htmlFor="fmtc">Tc:</label>
                <input
                  type="text"
                  id="fmtc"
                  value={fmtc}
                  onChange={(e) => setFmTc(e.target.value)}
                  required
                />
              </div>

            </div>
          </div>

          <div className='div-guias-asociadas'>
            <h3 className='subtitulo-estandar'>Concepto</h3>
            <div className='div-renglon-datos-facturasmanuales'>
              <div>
                <label htmlFor="fmguia">Codigo:</label>
                <input
                  type="text"
                  id="fmguia"
                  autoComplete="off"
                  value={fmcodigoconcepto}
                  onChange={(e) => setFmCodigoConcepto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!fmcodigoconcepto.trim()) {
                        setMostrarModalBuscarConcepto(true); // Mostrar modal si está vacío
                      } else {
                        fetchConceptoPorCodigo(); // Buscar si hay algo escrito
                      }
                    }
                  }}

                />
              </div>
              <div>
                <label htmlFor="fmdescripcion">Descripción:</label>
                <input
                  type="text"
                  id="fmdescripcion"
                  value={fmdescripcion}
                  onChange={(e) => setFmDescripcion(e.target.value)}

                />
              </div>
              <div>
                <label htmlFor="fmmonedaconcepto">Moneda:</label>
                <select
                  id="fmmonedaconcepto"
                  value={fmmonedaconcepto}
                  onChange={(e) => setFmMonedaConcepto(e.target.value)}
                  disabled
                >
                  <option value="USD">USD</option>
                  <option value="UYU">UYU</option>
                </select>
              </div>
              <div>
                <label htmlFor="fmimporte">IVA:</label>
                <input
                  type="text"
                  id="fmimporte"
                  value={fmivaconcepto}
                  onChange={(e) => setFmIvaConcepto(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="fmimporte">Importe:</label>
                <input
                  type="number"
                  id="fmimporte"
                  value={fmimporte}
                  onChange={(e) => setFmImporte(e.target.value)}

                />
              </div>

              <div className='botonesfacturasasociadas'>
                <button type="button" disabled={!botonActivo} onClick={handleAgregarConceptoAsociado} className='btn-estandar'>Agregar</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-facturas-asociadas'>
            <br />

            <div className='contenedor-tabla-conceptos-asociados'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-conceptos-asociados' >
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Descripción</th>
                    <th>Moneda</th>
                    <th>IVA</th>
                    <th>Importe</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fmlistadeconceptos.map((concepto, indexec) => (
                    <tr
                      key={indexec}
                      onClick={() => handleSeleccionarConceptoAsociado(indexec)}
                      style={{
                        cursor: 'pointer' // Indica que la fila es clickeable
                      }}
                    >
                      <td>{concepto.codigo}</td>
                      <td>{concepto.descripcion}</td>
                      <td>{concepto.moneda}</td>
                      <td>{concepto.ivaCalculado}</td>
                      <td>{concepto.importe}</td>
                      <td><button type="button" className="action-button" onClick={handleEliminarConceptoAsociado} disabled={fmconceptoseleccionado !== indexec}>❌</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>


            </div>


          </div>
          <div className='div-totales-comprobante'>
            <h3 className='subtitulo-estandar'>Totales</h3>
            <div className='div-renglon-datos-facturasmanuales'>

              <div>
                <label htmlFor="fmsubtotal">Subtotal:</label>
                <input
                  type="text"
                  id="fmsubtotal"
                  value={fmsubtotal}
                  onChange={(e) => setFmsubtotal(e.target.value)}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="fmivatotal">IVA:</label>
                <input
                  type="text"
                  id="fmivatotal"
                  value={fmiva}
                  onChange={(e) => setFmIva(e.target.value)}
                  readOnly
                />
              </div>
            
              <div>
                <label htmlFor="fmtotal">Total:</label>
                <input
                  type="text"
                  id="fmtotal"
                  value={fmtotal}
                  onChange={(e) => setFmTotal(e.target.value)}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="fmtotalacobrar">Total a Cobrar:</label>
                <input
                  type="text"
                  id="fmtotalacobrar"
                  value={fmtotalacobrar}
                  onChange={(e) => setFmTotalACobrar(e.target.value)}
                  readOnly
                />
              </div>
            </div>
          </div>


        </div>



        <div className='botonesemitircomprobante'>
          <button
            type="button"
            className='btn-facturar'
            onClick={() => setIsModalAdendaOpen(true)}
          >
            Facturar
          </button>

          <Link to="/home"><button type="button" className="btn-estandar">Volver</button></Link>
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
      {isModalAdendaOpen && (
        <div className='modal'>
          <div className='modal-content'>
            <h3 className='Titulo-ingreso-recibos'>Ingrese la Adenda</h3>

            <textarea
              value={adenda}
              onChange={(e) => setAdenda(e.target.value)}
              placeholder="Ingrese la adenda"
              style={{
                width: '480px',
                height: '150px',
                resize: 'none',
                padding: '8px',
                fontSize: '14px'
              }}
            />

            <div className='modal-buttons'>
              <button
                className='btn-estandar'
                onClick={(e) => {
                  setIsModalAdendaOpen(false);
                  handleSubmitAgregarFm(e, adenda);
                }}
              >
                Guardar
              </button>

              <button
                className='btn-estandar'
                onClick={() => setIsModalAdendaOpen(false)}
              >
                Cancelar
              </button>
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
  );
}

export default Facturasmanuales