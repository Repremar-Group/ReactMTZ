import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import './Facturasmanuales.css'
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
const Facturasmanuales = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [fmid, setFmId] = useState('');
  const [fmnombre, setFmNombre] = useState('');
  const [fmtipocomprobante, setFmTipoComprobante] = useState('');
  const [fmcomprobanteelectronico, setFmComprobanteElectronico] = useState('');
  const [fmciudad, setFmCiudad] = useState('');
  const [fmpais, setFmPais] = useState('');
  const [fmrazonsocial, setFmRazonSocial] = useState('');
  const [fmtipoiva, setFmTipoIva] = useState('');
  const [fmmoneda, setFmMoneda] = useState('');
  const [fmfecha, setFmFecha] = useState('');
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
  const [fmmonedaconcepto, setFmMonedaConcepto] = useState('');
  const [fmimporte, setFmImporte] = useState('');
  const [fmtotalacobrar, setFmTotalACobrar] = useState('');
  const [fmsubtotal, setFmsubtotal] = useState('');
  const [fmiva, setFmIva] = useState('');
  const [fmredondeo, setFmRedondeo] = useState('');
  const [fmtotal, setFmTotal] = useState('');
  const [fmivaconcepto, setFmIvaConcepto] = useState('');
  const [fmlistadeconceptos, setFmListaDeConceptos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const [conceptoactual, setConceptoActual] = useState([]);
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const [botonActivo, setBotonActivo] = useState(false);
  

  // Estado para la cheque seleccionado
  const [fmconceptoseleccionado, setFmConceptoSeleccionado] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarConceptoAsociado = (icindex) => {
    setFmConceptoSeleccionado(icindex);
  };
  // Llamar al endpoint para obtener el tipo de cambio

  const fetchConceptoPorCodigo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/buscarconcepto/${fmcodigoconcepto}`);
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
      const response = await axios.get('http://localhost:3000/api/obtenermonedas');
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
    if (conceptoactual?.exento === 0 && fmimporte) {
      const ivaCalculado = (parseFloat(fmimporte) * 0.22).toFixed(2); // 22% de IVA
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
    if (fmcodigoconcepto && fmdescripcion && fmmonedaconcepto && fmivaconcepto && fmimporte) {
      const nuevoconceptoasociado = { fmcodigoconcepto, fmdescripcion, fmmonedaconcepto, fmivaconcepto, fmimporte };
      setFmListaDeConceptos([...fmlistadeconceptos, nuevoconceptoasociado]);
      setFmCodigoConcepto('');
      setFmDescripcion('');
      setFmIvaConcepto('');
      setFmImporte('');
      setBotonActivo(false);
    }
  };


  useEffect(() => {
    if (hasFetched.current) return; // Si ya se ejecutó, no vuelve a hacerlo
    hasFetched.current = true;

    // Llamar al endpoint para obtener el tipo de cambio
    const obtenerTipoCambio = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/obtenertipocambioparacomprobante");
        if (response.data.tipo_cambio == undefined) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/tablas/cambio");
        } else {
          setFmTc(response.data.tipo_cambio);
        }
        console.log(response.data.tipo_cambio);
      } catch (error) {
        if (error.response) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/tablas/cambio");
        } else {
          console.error("Error en la consulta:", error);
          navigate("/tablas/cambio");
        }
      }
    };
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setFmFecha(icfechaactual);
    fetchMonedas();
    obtenerTipoCambio();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFm = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Recopilar los datos del formulario en un objeto
    const datosFormulario = {
      IdCliente: fmid,
      Nombre: searchTerm,
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
      TipoIVA:fmtipoiva,
      CASS: fmcass,
      TipoEmbarque: fmtipodeembarque,
      TC: parseFloat(fmtc).toFixed(2),
      Subtotal: parseFloat(fmsubtotal).toFixed(2),
      IVA: parseFloat(fmiva).toFixed(2),
      Redondeo: parseFloat(fmredondeo).toFixed(2),
      Total: parseFloat(fmtotal).toFixed(2),
      TotalCobrar: parseFloat(fmtotalacobrar).toFixed(2),
      DetalleFactura: fmlistadeconceptos,
      
    };
    console.log('info al backend: ', datosFormulario);


    try {
      // Enviar los datos del formulario a tu servidor
      console.log('Datos del formulario a Backend: ', datosFormulario);
      const response = await axios.post('http://localhost:3000/api/insertfacturamanual', datosFormulario);

      // Si la respuesta es exitosa, puedes manejar la respuesta aquí
      console.log('Factura Agregada:', response.data);

      // Opcionalmente, puedes redirigir o actualizar el estado
      toast.success('Factura agregado exitosamente');
    } catch (error) {
      // Si ocurre un error, manejarlo aquí
      console.error('Error al agregar la factura:', error);
      toast.error('Hubo un error al facturar');
    } finally{
      window.location.reload();
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
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsSelectEnabled(true);
    setIsModalOpen(false); // Cierra el modal
  };

  // Actualizar el estado del formulario luego se seleccionar un cliente 
  useEffect(() => {
    if (selectedCliente) {
      setFmComprobanteElectronico(selectedCliente.Tcomprobante);
      setFmId(selectedCliente.Id);
      setFmCiudad(selectedCliente.Ciudad);
      setFmPais(selectedCliente.Pais);
      setFmRazonSocial(selectedCliente.RazonSocial);
      setFmTipoIva(selectedCliente.Tiva);
      setFmMoneda(selectedCliente.Moneda);
      setFmDireccionFiscal(selectedCliente.Direccion);
      setFmCass(selectedCliente.Cass);
      setFmRutCedula(selectedCliente.Rut);
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
      const importe = parseFloat(concepto.fmimporte) || 0;
      const iva = parseFloat(concepto.fmivaconcepto) || 0; // Se asume que ya viene calculado
  
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


  return (
    <div className="EmitirFacturaManual-container">
      <ToastContainer />
      <h2 className='titulo-estandar'>Emisión de Factura Manual</h2>
      <form onSubmit={handleSubmitAgregarFm} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

            <div className='div-renglon-datos-facturasmanuales'>
              <div>
                <label htmlFor="ecID">ID:</label>
                <input
                  type="text"
                  id="ecID"
                  value={fmid}
                  onChange={(e) => setFmId(e.target.value)}
                  required
                />
              </div>
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
              <div>
                <label htmlFor="fmciudad">Ciudad:</label>
                <input
                  type="text"
                  id="fmciudad"
                  value={fmciudad}
                  onChange={(e) => setFmCiudad(e.target.value)}
                  required
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
                />
              </div>
              <div></div>
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
              <div>
                <label htmlFor="fmmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={fmmoneda}
                  onChange={(e) => setFmMoneda(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  {monedas.map((moneda, index) => (
                    <option key={index} value={moneda.moneda}>
                      {moneda.moneda}
                    </option>
                  ))}
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
              <div>
                <label htmlFor="fmcomprobante">Comprobante:</label>
                <input
                  type="text"
                  id="fmcomprobante"
                  value={fmcomprobante}
                  onChange={(e) => setFmComprobante(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmelectronico">Electronico:</label>
                <input
                  type="text"
                  id="fmelectronico"
                  value={fmelectronico}
                  onChange={(e) => setFmElectronico(e.target.value)}
                  required
                />
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
              <div></div>
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
                  value={fmcodigoconcepto}
                  onChange={(e) => setFmCodigoConcepto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchConceptoPorCodigo();
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
                  <option value="">Selecciona una Moneda</option>
                  {monedas.map((moneda, index) => (
                    <option key={index} value={moneda.moneda}>
                      {moneda.moneda}
                    </option>
                  ))}
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
                <button type="button"  disabled={!botonActivo} onClick={handleAgregarConceptoAsociado} className='btn-estandar'>Agregar</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-facturas-asociadas'>
            <br />

            <div className='div-primerrenglon-datos-recibos'>
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
                      <td>{concepto.fmcodigoconcepto}</td>
                      <td>{concepto.fmdescripcion}</td>
                      <td>{concepto.fmmonedaconcepto}</td>
                      <td>{concepto.fmivaconcepto}</td>
                      <td>{concepto.fmimporte}</td>
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
                <label htmlFor="fmredondeo">Redondeo:</label>
                <input
                  type="text"
                  id="fmredondeo"
                  value={fmredondeo}
                  onChange={(e) => setFmRedondeo(e.target.value)}
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
          <button type="submit" className='btn-estandar'>Confirmar</button>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
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

export default Facturasmanuales