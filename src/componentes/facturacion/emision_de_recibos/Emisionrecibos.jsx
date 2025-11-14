import React, { useState, useEffect } from 'react';
import './Emisionrecibos.css';
import { Link } from "react-router-dom";
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import axios from 'axios';
import Ingresodecheques from './ingresocheques/Ingresodecheques';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ModalTipoCambio from '../../modales/TipoCambioRecibos';

const Emisionrecibos = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const rol = localStorage.getItem('rol');

    if (rol == '') {
      navigate('/');
    }
  }, [navigate]);
  // Estado para los campos del formulario
  const backURL = import.meta.env.VITE_BACK_URL;

  const [aCuenta, setACuenta] = useState(false);
  const [isModalOpenAcuenta, setIsModalOpenACuenta] = useState(false);
  const [comentario, setComentario] = useState('');

  const [ernumrecibo, setErNumRecibo] = useState('');
  const [erfecharecibo, setErFechaRecibo] = useState('');

  const [ernombre, setErNombre] = useState('');
  const [erid, setErID] = useState('');

  //Estados para manejar la moneda del cheque
  const [ertipoMoneda, setErTipoMoneda] = useState('USD');//*
  const [isModalTipoCambioAbierto, setIsModalTipoCambioAbierto] = useState(false);
  const [tipoCambio, setTipoCambio] = useState(null);

  const [erimporte, setErImporte] = useState('');

  const [erformadepago, setErFormaDePago] = useState('');

  const [errazonSocial, setErRazonSocial] = useState('');
  const [errut, setErRut] = useState('');

  const [erdireccion, setErDireccion] = useState('');//*

  const [erimportedelrecibo, setErImporteDelRecibo] = useState('');//*
  const [ersaldodelrecibo, setErSaldoDelRecibo] = useState('');//*
  //Estados para traer las monedas
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);

  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteGIA, setClienteGIA] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldoSelectedCliente, setSaldoSelectedCliente] = useState(0);
  const [loading, setLoading] = useState(false);

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

  // Manejar la búsqueda al presionar "Enter"
  const handleKeyPressDocumento = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Evita que el formulario se envíe
      if (erdocumentoasociado.trim() !== "") {
        buscarFactura(erdocumentoasociado);
      }
    }
  };

  const buscarFactura = (comprobante) => {
    axios.get(`${backURL}/api/buscarfacturaporcomprobante/${comprobante}`)
      .then(response => {
        console.log("Factura encontrada:", response.data);
        setErDocumentoAsociado("");
        // Comprobar si la factura ya está facturada
        if (response.data.message && response.data.message === 'Tiene Recibo.') {
          toast.error('Esta factura ya tiene un recibo asociado.');
          return; // Salir de la función para evitar agregarla a las facturas asociadas
        }
        //comprobamos si la factura ya esta en GFE
        const factura = response.data;
        if (
          factura.TipoDocCFE == null ||
          factura.NumeroCFE == null ||
          factura.fechaVencimiento == null ||
          factura.TotalCobrar == null
        ) {
          toast.error('La factura no tiene todos los campos requeridos por GFE, verifique que fue dada de alta en GFE.');
          return;
        }

        // Comprobar si la factura ya está en el array de facturas asociadas
        setErFacturasAsociadas(prevFacturas => {
          const existe = prevFacturas.some(f => f.erdocumentoasociado === response.data.Id);
          if (existe) {
            toast.error('Esta factura ya ha sido agregada.');
            return prevFacturas; // Si ya existe, no la agrega
          }

          return [...prevFacturas, {
            erdocumentoasociado: response.data.Id,
            erimportefacturaasociada: response.data.TotalCobrar,
            ermonedafacturaasociada: response.data.Moneda,
            ertasadecambiofacturaasociada: response.data.TC
          }];
        });
      })
      .catch(error => {
        console.error("Error al buscar factura:", error);
        toast.error('Factura no encontrada. Favor de ingresar un Nro Correcto');
      });
  };

  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setClienteGIA(cliente.CodigoGIA);
    setIsSelectEnabled(true);
    setIsModalOpen(false); // Cierra el modal
  };
  //Cerrar modal de clientes
  const closeModal = () => setIsModalOpen(false);

  const [movimientos, setMovimientos] = useState([]);

  //UseEffect que trae los movimientos de la cuenta corriente luego de selecionar el cliente
  useEffect(() => {
    if (selectedCliente?.Id) {
      setLoading(true);

      Promise.all([
        axios.get(`${backURL}/api/historialfac/${selectedCliente.Id}`, {
          headers: { 'Cache-Control': 'no-cache' },
          params: { t: Date.now() }
        }),
        axios.get(`${backURL}/api/saldo/${selectedCliente.Id}`, {
          headers: { 'Cache-Control': 'no-cache' },
          params: { t: Date.now() }
        })
      ])
        .then(([movimientosRes, saldoRes]) => {
          const movimientos = movimientosRes.data;
          const saldo = saldoRes.data.saldo;

          console.log('Movimientos recibidos:', movimientos);
          console.log('Saldo recibido:', saldo);

          // Si no hay facturas, igual mostramos el saldo actual
          if (!movimientos || movimientos.length === 0) {
            setMovimientos([]);
            setSaldoSelectedCliente(saldo);
          } else {
            setMovimientos(movimientos);
            setSaldoSelectedCliente(saldo);
          }

          setErFacturasAsociadas([]);
          setErID(selectedCliente.Id);
          setErRazonSocial(selectedCliente.RazonSocial);
          setErRut(selectedCliente.Rut);
          setErDireccion(selectedCliente.Direccion);
        })
        .catch(error => {
          console.error('Error al obtener datos:', error);
          // Incluso si una de las promesas falla, intentamos recuperar el saldo
          axios.get(`${backURL}/api/saldo/${selectedCliente.Id}`, {
            headers: { 'Cache-Control': 'no-cache' },
            params: { t: Date.now() }
          })
            .then(saldoRes => setSaldoSelectedCliente(saldoRes.data.saldo))
            .catch(() => setSaldoSelectedCliente(0));
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCliente]);

  //Traigo las monedas desde la BD
  const fetchMonedas = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtenermonedas`);
      setMonedas(response.data);
      setIsFetchedMonedas(true); // Indica que ya se obtuvieron los datos
    } catch (error) {
      console.error('Error al obtener monedas:', error);
    }
  }





  // Estado para el documento y el importe de facturas asociadas
  const [erdocumentoasociado, setErDocumentoAsociado] = useState('');
  const [erimportefacturaasociada, setErImporteFacturaAsociada] = useState('');
  const [erfacturasasociadas, setErFacturasAsociadas] = useState([]);
  const [ertotaldefacturas, setErTotalDeFacturas] = useState('');
  // Estado para la factura seleccionada
  const [erfacturaSeleccionada, setErFacturaSeleccionada] = useState(null);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setACuenta(e.target.checked);
    setErFacturasAsociadas([]);
    setErSaldoDelRecibo(0);
    if (checked) {
      setIsModalOpenACuenta(true);
    }
  };

  const handleGuardarComentario = () => {
    console.log('Comentario:', comentario);
    setIsModalOpenACuenta(false); // Cerramos el modal al guardar
  };

  const handleCerrarModalAcuenta = () => {
    setIsModalOpenACuenta(false);
    setACuenta(false); // opcional: desmarcar si se cierra sin guardar
  };

  //UseEffect para actualizar el saldo y el total de los recibos.
  useEffect(() => {
    // Copiar erimporte en erimportedelrecibo
    setErImporteDelRecibo(erimporte);
  }, [erimporte]);

  useEffect(() => {
    const totalFacturas = erfacturasasociadas.reduce((total, factura) => {
      const importe = Number(factura.erimportefacturaasociada || 0);
      const monedaFactura = factura.ermonedafacturaasociada;

      let importeConvertido = importe;

      if (ertipoMoneda === 'USD' && monedaFactura === 'UYU') {
        // Convertir de UYU a USD
        importeConvertido = importe / tipoCambio;
      } else if (ertipoMoneda === 'UYU' && monedaFactura === 'USD') {
        // Convertir de USD a UYU
        importeConvertido = importe * tipoCambio;
      }

      return total + importeConvertido;
    }, 0);

    setErTotalDeFacturas(totalFacturas);
    if (!aCuenta) {
      setErSaldoDelRecibo((erimportedelrecibo - totalFacturas).toFixed(2));
    }
  }, [erimportedelrecibo, erfacturasasociadas, tipoCambio, ertipoMoneda]);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarFacturaAsociada = (index) => {
    setErFacturaSeleccionada(index);
  };

  const [isModalOpenCheque, setIsModalOpenCheque] = useState(false);
  const closeModalCheque = () => setIsModalOpenCheque(false);

  // Función para eliminar la factura seleccionada
  const handleEliminarFacturaAsociada = () => {
    if (erfacturaSeleccionada !== null) {
      const nuevasFacturasasociadas = erfacturasasociadas.filter((_, index) => index !== erfacturaSeleccionada);
      setErFacturasAsociadas(nuevasFacturasasociadas);
      setErFacturaSeleccionada(null); // Limpiar la selección
    }
  };



  const TablaMovimientos = ({ datos, loading }) => (
    <div className="contenedor-tabla-cuentacorriente">

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <table className="tabla-cuentaco">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Documento</th>
            <th>Recibo</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((factura, index) => (
            <tr
              key={index}
              onDoubleClick={() => {
                if (aCuenta) {
                  toast.warning('No podés agregar facturas mientras esté marcado "A Cuenta"');
                  return;
                }

                if (factura.Id) {
                  buscarFactura(factura.Id);
                }
              }}
              style={{
                cursor: aCuenta ? 'not-allowed' : 'pointer',
                opacity: aCuenta ? 0.6 : 1,
              }}
            >
              <td>{factura.FechaCFEFormateada || factura.Fecha}</td>
              <td>{factura.TipoDocCFE || factura.ComprobanteElectronico}</td>
              <td>{factura.NumeroCFE}</td>
              <td>{factura.idrecibo || '-'}</td>
              <td>{factura.TotalCobrar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  useEffect(() => {
    const erfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setErFechaRecibo(erfechaactual);
    fetchMonedas();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarRecibo = (e) => {
    e.preventDefault();
    if (ersaldodelrecibo != 0 && !aCuenta) {
      toast.error("El recibo debe cancelar exactamente el total de las facturas");
      return;

    } else if (erfacturasasociadas.length === 0 && !aCuenta) {
      toast.error("Debes asociar al menos una factura antes de continuar.");
      return; // Detiene la ejecución y no abre el modal
    }


    setIsModalOpenCheque(true);
  };

  // Función para agregar una factura asociada a la tabla
  const handleAgregarFacturaAsociada = () => {
    if (erdocumentoasociado && erimportefacturaasociada) {
      const nuevaFactura = { erdocumentoasociado, erimportefacturaasociada };
      setErFacturasAsociadas([...erfacturasasociadas, nuevaFactura]);
      setErDocumentoAsociado(''); // Limpiar el input
      setErImporteFacturaAsociada(''); // Limpiar el input
    }
  };
  const datosRecibo = {
    ernumrecibo,
    erfecharecibo,
    erid,
    clienteGIA,
    searchTerm,
    ertipoMoneda,
    erimporte,
    erformadepago,
    errazonSocial,
    errut,
    erdireccion,
    aCuenta,
    comentario,
  };


  return (
    <div className="EmitirRecibos-wrapper">
      <ToastContainer />
      <h2 className="Titulo-ingreso-recibos">Ingreso de Recibos</h2>
      <div className="EmitirRecibos-container">
        {isModalOpenAcuenta && (
          <div className='modal'>
            <div className='modal-content'>
              <h3 className='Titulo-ingreso-recibos'>Ingrese el Detalle del Recibo</h3>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escriba su comentario aquí..."
                style={{
                  width: '480px',
                  height: '150px',
                  resize: 'none',
                  padding: '8px',
                  fontSize: '14px'
                }}
              />
              <div className='modal-buttons'>
                <button className='btn-estandar' onClick={handleGuardarComentario}>Guardar</button>
                <button className='btn-estandar' onClick={handleCerrarModalAcuenta}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitAgregarRecibo} className='formulario-emitir-recibo2'>


          <div className='div-datos-recibos'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Datos del Recibo</h3>

            <div className='div-primerrenglon-datos-recibos'>
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
              <div className="fechas-emision-recibos">
                <label htmlFor="fechaemisionrecibos">Fecha:</label>
                <input
                  type="date"
                  id="fechaemisionrecibos"
                  value={erfecharecibo}
                  onChange={(e) => setErFechaRecibo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-segundorenglon-datos-recibos'>
              <div>
                <label htmlFor="errazonsocial">Razon Social:</label>
                <input
                  type="text"
                  id="ererrazonsocial"
                  value={errazonSocial}
                  onChange={(e) => setErRazonSocial(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="errut">Rut:</label>
                <input
                  type="number"
                  id="errut"
                  value={errut}
                  onChange={(e) => setErRut(e.target.value)}
                  required
                  readOnly
                />
              </div>

            </div>

            <div className='div-sextorenglon-datos-recibos'>
              <div>
                <label htmlFor="erdireccion">Direccion:</label>
                <input
                  type="text"
                  id="erdireccion"
                  value={erdireccion}
                  onChange={(e) => setErDireccion(e.target.value)}
                  required
                  readOnly
                />
              </div>

            </div>

            <div className='div-cuartorenglon-datos-recibos'>
              <div>
                <label htmlFor="erformadepago">Forma de Pago:</label>
                <select
                  id="erformadepago"
                  value={erformadepago}
                  onChange={(e) => setErFormaDePago(e.target.value)}
                  required
                >
                  <option value="">Forma de pago</option>
                  <option value="CHQDOL">Cheque</option>
                  <option value="TRANDOL">Transferencia</option>
                  <option value="EFEDOL">Efectivo</option>
                  <option value="DOCVZ">Documento</option>
                </select>
              </div>
            </div>

            <div className='div-quintorenglon-datos-recibos'>
              <div>
                <label htmlFor="ecmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={ertipoMoneda}
                  onChange={(e) => {
                    const nuevaMoneda = e.target.value;
                    setErTipoMoneda(nuevaMoneda);

                    if (nuevaMoneda === 'UYU') {
                      setIsModalTipoCambioAbierto(true);
                    }
                  }}
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="USD">USD</option>
                  <option value="UYU">UYU / TC: ${tipoCambio}</option>
                </select>
              </div>
              <div>
                <label htmlFor="erimporte">Importe:</label>
                <input
                  type="number"
                  id="erimporte"
                  value={erimporte}
                  onChange={(e) => setErImporte(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-sextorenglon-datos-recibos'>

            </div>

          </div>

          <div className='erfacturasasociadas'>
            <div className='encabezado-facturas'>
              <h3 className='Titulos-formularios-ingreso-recibos'>Facturas Asociadas</h3>

              <label className='checkbox-estandar'>
                <input
                  type='checkbox'
                  checked={aCuenta}
                  onChange={handleCheckboxChange}
                />
                A Cuenta
              </label>
            </div>
            <div className='primerafilafacturasasociadas'>



            </div>
            {/* Tabla que muestra las facturas agregadas */}
            <div className='contenedor-tabla-facasociadas'>
              <table className='tabla-cuentaco2'>
                <thead>
                  <tr>

                    <th>Documento</th>
                    <th>Importe</th>
                    <th>Moneda</th>
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
                          disabled={aCuenta || !searchTerm}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {erfacturasasociadas.map((factura, index) => (
                    <tr
                      key={index}
                      onClick={() => handleSeleccionarFacturaAsociada(index)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: erfacturaSeleccionada === index ? "bold" : "normal"
                      }}
                    >

                      <td>{factura.erdocumentoasociado}</td>
                      <td>{factura.erimportefacturaasociada}</td>
                      <td>{factura.ermonedafacturaasociada}</td>
                      <td>

                        <button type="button" onClick={handleEliminarFacturaAsociada} disabled={erfacturaSeleccionada !== index} className='action-button' >❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='botonesfacturasasociadas'>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

          </div>

          <div className='ersaldodelrecibo'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Saldo del Recibo</h3>
            <div>
              <label htmlFor="erimportedelrecibo">Importe del Recibo:</label>
              <input
                type="text"
                id="erimportedelrecibo"
                value={erimportedelrecibo}
                onChange={(e) => setErImporteDelRecibo(e.target.value)}
                readOnly
                required
              />
            </div>
            <div>
              <label htmlFor="ersaldodelrecibo">Saldo del Recibo:</label>
              <input
                type="text"
                id="ersaldodelrecibo"
                value={ersaldodelrecibo}
                onChange={(e) => setErSaldoDelRecibo(e.target.value)}
                readOnly
                required
              />
            </div>
          </div>

          <div className='div-ercuentacorriente'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Cuenta Corriente</h3>
            <TablaMovimientos datos={movimientos} loading={loading} />
            <div>
              <label htmlFor="Saldo"><strong>Saldo: </strong> {saldoSelectedCliente ?? '0.00'}</label>
            </div>
          </div>
          <div></div>
          <div className='botonesagregarrecibo'>
            <button type="submit" className='btn-agregar-Recibo'>Confirmar</button>

            <Link to="/home"><button className="btn-Salir-Agregar-Recibo">Volver</button></Link>
          </div>


        </form>
        {/* Modal de búsqueda de clientes */}
        <ModalBusquedaClientes
          isOpen={isModalOpen}
          closeModal={closeModal}
          filteredClientes={filteredClientes}
          handleSelectCliente={handleSelectCliente}
        />

        <Ingresodecheques
          isOpen={isModalOpenCheque}
          closeModal={closeModalCheque}
          facturasAsociadas={erfacturasasociadas}
          datosRecibo={datosRecibo}
          fechaActual={erfecharecibo}
          totalfacturas={ertotaldefacturas}
          clienteAsociado={erid}
        />

        <ModalTipoCambio
          isOpen={isModalTipoCambioAbierto}
          closeModal={() => setIsModalTipoCambioAbierto(false)}
          onConfirm={(valor) => {
            setTipoCambio(valor);
            console.log('Tipo de cambio establecido:', valor);
          }}
        />
      </div>
    </div>
  );
}
export default Emisionrecibos