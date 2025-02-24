import React, { useState, useEffect } from 'react';
import './Emisionrecibos.css';
import { Link } from "react-router-dom";
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import axios from 'axios';
import Ingresodecheques from './ingresocheques/Ingresodecheques';

const Emisionrecibos = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [ernumrecibo, setErNumRecibo] = useState('');
  const [erfecharecibo, setErFechaRecibo] = useState('');

  const [ernombre, setErNombre] = useState('');
  const [erid, setErID] = useState('');

  const [ertipoMoneda, setErTipoMoneda] = useState(false);//*
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
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldoSelectedCliente, setSaldoSelectedCliente] = useState(0);

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
    axios.get(`http://localhost:3000/api/buscarfacturaporcomprobante/${comprobante}`)
      .then(response => {
        console.log("Factura encontrada:", response.data);
        setErDocumentoAsociado("");
        // Comprobar si la factura ya está facturada
        if (response.data.message && response.data.message === 'Tiene Recibo.') {
          alert('Esta factura ya tiene un recibo asociado.');
          return; // Salir de la función para evitar agregarla a las facturas asociadas
        }
       // Comprobar si la factura ya está en el array de facturas asociadas
      setErFacturasAsociadas(prevFacturas => {
        const existe = prevFacturas.some(f => f.erdocumentoasociado === response.data.Id);
        if (existe) {
          alert('Esta factura ya ha sido agregada.');
          return prevFacturas; // Si ya existe, no la agrega
        }

        return [...prevFacturas, {
          erdocumentoasociado: response.data.Id,
          erimportefacturaasociada: response.data.TotalCobrar
        }];
      });
    })
    .catch(error => {
      console.error("Error al buscar factura:", error);
      alert('Factura no encontrada. Favor de ingresar un Nro Correcto');
    });
};

  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsSelectEnabled(true);
    setIsModalOpen(false); // Cierra el modal
  };
  //Cerrar modal de clientes
  const closeModal = () => setIsModalOpen(false);

  const [movimientos, setMovimientos] = useState([]);

  //UseEffect que trae los movimientos de la cuenta corriente luego de selecionar el cliente
  useEffect(() => {

    if (selectedCliente?.Id) {
      // Realiza ambas solicitudes en paralelo
      Promise.all([
        axios.get(`http://localhost:3000/api/movimientos/${selectedCliente.Id}`),
        axios.get(`http://localhost:3000/api/saldo/${selectedCliente.Id}`)
      ])
        .then(([movimientosRes, saldoRes]) => {
          console.log('Movimientos recibidos:', movimientosRes.data);
          console.log('Saldo recibido:', saldoRes.data.saldo);

          setMovimientos(movimientosRes.data);
          setSaldoSelectedCliente(saldoRes.data.saldo); // Guarda el saldo en el estado
          //Actualizo todos los campos del formulario 
          setErID(selectedCliente.Id);
          setErRazonSocial(selectedCliente.RazonSocial);
          setErRut(selectedCliente.Rut);
          setErDireccion(selectedCliente.Direccion);
          setErTipoMoneda(selectedCliente.Moneda)
        })
        .catch(error => console.error('Error al obtener datos:', error));
    }
  }, [selectedCliente]);

  //Traigo las monedas desde la BD
  const fetchMonedas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/obtenermonedas');
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

  //UseEffect para actualizar el saldo y el total de los recibos.
  useEffect(() => {
    // Copiar erimporte en erimportedelrecibo
    setErImporteDelRecibo(erimporte);
  }, [erimporte]);

  useEffect(() => {
    // Calcular ersaldodelrecibo
    const totalFacturas = erfacturasasociadas.reduce(
      (total, factura) => total + Number(factura.erimportefacturaasociada || 0),
      0
    );
    setErTotalDeFacturas(totalFacturas);
    setErSaldoDelRecibo(erimportedelrecibo - totalFacturas);
  }, [erimportedelrecibo, erfacturasasociadas]);

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



  const TablaMovimientos = ({ datos }) => (
    <table className='tabla-cuentacorriente' >
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Documento</th>
          <th>Recibo</th>
          <th>Debe</th>
          <th>Haber</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((movimiento, index) => (
          <tr key={index}>
            <td>{movimiento.Fecha}</td>
            <td>{movimiento.TipoDocumento === 'Factura' ? 'F' : movimiento.TipoDocumento === 'Recibo' ? 'R' : movimiento.TipoDocumento}</td>
            <td>{movimiento.IdFactura}</td>
            <td>{movimiento.NumeroRecibo}</td>
            <td>{movimiento.Debe}</td>
            <td>{movimiento.Haber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  useEffect(() => {
    const erfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setErFechaRecibo(erfechaactual);
    fetchMonedas();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarRecibo = (e) => {
    e.preventDefault();
    if(ersaldodelrecibo != 0){
      alert("El recibo debe cancelar exactamente el total de las facturas");
      return;
      
    } else if (erfacturasasociadas.length === 0 ) {
      alert("Debes asociar al menos una factura antes de continuar.");
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
    searchTerm,
    ertipoMoneda,
    erimporte,
    erformadepago,
    errazonSocial,
    errut,
    erdireccion,
  };


  return (
    <div className="EmitirRecibos-wrapper">
      <h2 className="Titulo-ingreso-recibos">Ingreso de Recibos</h2>
      <div className="EmitirRecibos-container">

        <form onSubmit={handleSubmitAgregarRecibo} className='formulario-emitir-recibo2'>


          <div className='div-datos-recibos'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Datos del Recibo</h3>

            <div className='div-primerrenglon-datos-recibos'>
              <div>
                <label htmlFor="recibo">Recibo:</label>
                <input
                  type="text"
                  id="recibo"
                  value={ernumrecibo}
                  onChange={(e) => setErNumRecibo(e.target.value)}
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
                <label htmlFor="erid">ID:</label>
                <input
                  type="text"
                  id="erid"
                  value={erid}
                  onChange={(e) => setErID(e.target.value)}
                  required
                  readOnly
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
            </div>

            <div className='div-tercerrenglon-datos-recibos'>
              <div>
                <label htmlFor="ecmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={ertipoMoneda}
                  onChange={(e) => setErTipoMoneda(e.target.value)}
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
                  <option value="cheques">Cheque</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>
            </div>

            <div className='div-quintorenglon-datos-recibos'>
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

          </div>

          <div className='erfacturasasociadas'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Facturas Asociadas</h3>
            <div className='primerafilafacturasasociadas'>
              <div classname='inputsfacturasasociadas'>
                {/* Inputs para Documento y Importe */}
                <div>
                  <label htmlFor="documento">Documento:</label>
                  <input
                    type="text"
                    id="documento"
                    value={erdocumentoasociado}
                    onChange={(e) => setErDocumentoAsociado(e.target.value)}
                    onKeyDown={handleKeyPressDocumento}
                    placeholder='Nro. Comprobante'

                  />
                </div>

              </div>

              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-facturasasociadas' >
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {erfacturasasociadas.map((factura, index) => (
                    <tr
                      key={index}
                      onClick={() => handleSeleccionarFacturaAsociada(index)}
                      style={{
                        cursor: 'pointer', fontWeight: erfacturaSeleccionada === index ? "bold" : "normal"
                      }}
                    >
                      <td>{factura.erdocumentoasociado}</td>
                      <td>{factura.erimportefacturaasociada}</td>
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
              <button type="button" onClick={handleEliminarFacturaAsociada} disabled={erfacturaSeleccionada === null} className='btn-eliminar-fasociada'>Eliminar Factura</button>
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
            <TablaMovimientos datos={movimientos} />
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
      </div>
    </div>
  );
}
export default Emisionrecibos