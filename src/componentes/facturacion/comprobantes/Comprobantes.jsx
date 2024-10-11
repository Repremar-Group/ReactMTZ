import React, { useState, useEffect } from 'react';
import './Comprobantes.css'
import { Link } from "react-router-dom";

const Comprobantes = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [ecid, setEcId] = useState('');
  const [ecnombre, setEcNombre] = useState('');
  const [ectipocomprobante, setEcTipoComprobante] = useState('');
  const [eccomprobanteelectronico, setEcComprobanteElectronico] = useState('');
  const [ecciudad, setEcCiudad] = useState('');
  const [ecpais, setEcPais] = useState('');
  const [ecrazonsocial, setEcRazonSocial] = useState('');
  const [ectipoiva, setEcTipoIva] = useState('');
  const [ecmoneda, setEcMoneda] = useState('');
  const [ecfecha, setEcFecha] = useState('');
  const [eccomprobante, setEcComprobante] = useState('');
  const [ecelectronico, setEcElectronico] = useState('');
  const [ecdireccionfiscal, setEcDireccionFiscal] = useState('');
  const [eccompania, setEcCompania] = useState('');
  const [ecrutcedula, setEcrutcedula] = useState('');
  const [eccass, setEcCass] = useState('');
  const [ectipodeembarque, setEcTipoDeEmbarque] = useState('');
  const [ectc, setEcTc] = useState('');
  const [ecguia, setEcGuia] = useState('');
  const [ecdescripcion, setEcDescripcion] = useState('');
  const [ecmonedaguia, setEcMonedaGuia] = useState('');
  const [ecimporte, setEcImporte] = useState('');
  const [ectotalacobrar, setEcTotalACobrar] = useState('');
  const [ecsubtotal, setEcsubtotal] = useState('');
  const [eciva, setEcIva] = useState('');
  const [ecredondeo, setEcRedondeo] = useState('');
  const [ectotal, setEcTotal] = useState('');
  const [eclistadeguiasasociadas, setEcListaDeGuiasAsociadas] = useState([]);


  // Estado para la cheque seleccionado
  const [ecguiaseleccionada, setEcGuiaSeleccionada] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarGuiaAsociada = (icindex) => {
    setEcGuiaSeleccionada(icindex);
  };



  // Función para eliminar el cheque seleccionado
  const handleEliminarGuiaAsociada = () => {
    if (ecguiaseleccionada !== null) {
      // Filtrar todos los cheques excepto el seleccionado
      const nuevoschequesseleccionados = eclistadeguiasasociadas.filter((_, icindex) => icindex !== ecguiaseleccionada);
      setEcListaDeGuiasAsociadas(nuevoschequesseleccionados);
      setEcGuiaSeleccionada(null); // Limpiar la selección
    }
  };
  // Función para agregar una factura asociada a la tabla
  const handleAgregarGuiaAsociada = () => {
    if (ecguia && ecdescripcion && ecmonedaguia && ecimporte) {
      const nuevaguiaasociada = { ecguia, ecdescripcion, ecmonedaguia, ecmonedaguia, ecimporte };
      setEcListaDeGuiasAsociadas([...eclistadeguiasasociadas, nuevaguiaasociada]);
      setEcGuia('');
      setEcDescripcion('');
      setEcMonedaGuia('');
      setEcImporte('');
    }
  };

  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setEcFecha(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarRecibo = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para enviar la información
    console.log({
      razonSocial
    });
  };




  return (
    <div className="EmitirComprobante-container">
      <h2 className='titulo-estandar'>Emisión de Comprobantes</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecID">ID:</label>
                <input
                  type="text"
                  id="ecID"
                  value={ecid}
                  onChange={(e) => setEcId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecnombre">Nombre:</label>
                <input
                  type="text"
                  id="ecnombre"
                  value={ecnombre}
                  onChange={(e) => setEcNombre(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectipocomprobante">Tipo de Comprobante:</label>
                <select
                  id="ectipocomprobante"
                  value={ectipocomprobante}
                  onChange={(e) => setEcTipoComprobante(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Tipo</option>
                  <option value="fcredito">Factura de Credito</option>
                  <option value="fcontado">Factura Contado</option>
                  <option value="etc">Etc</option>
                </select>
              </div>
              <div>
                <label htmlFor="eccomprobanteelectronico">Comprobante Electronico:</label>
                <input
                  type="text"
                  id="eccomprobanteelectronico"
                  value={eccomprobanteelectronico}
                  onChange={(e) => setEcComprobanteElectronico(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecciudad">Ciudad:</label>
                <input
                  type="text"
                  id="ecciudad"
                  value={ecciudad}
                  onChange={(e) => setEcCiudad(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecpais">Pais:</label>
                <input
                  type="text"
                  id="ecpais"
                  value={ecpais}
                  onChange={(e) => setEcPais(e.target.value)}
                  required
                />
              </div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecrazonsocial">Razon Social:</label>
                <input
                  type="text"
                  id="ecrazonsocial"
                  value={ecrazonsocial}
                  onChange={(e) => setEcRazonSocial(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectipoiva">Tipo de IVA:</label>
                <select
                  id="ectipoiva"
                  value={ectipoiva}
                  onChange={(e) => setEcTipoIva(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Tipo</option>
                  <option value="iva22">IVA 22 %</option>
                  <option value="ivax">IVA X %</option>
                  <option value="ivay">IVA Y %</option>
                </select>
              </div>
              <div>
                <label htmlFor="ecmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={ecmoneda}
                  onChange={(e) => setEcMoneda(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
                </select>
              </div>
              <div className="fecha-emision-comprobante">
                <label htmlFor="ecfecha">Fecha:</label>
                <input
                  type="date"
                  id="ecfecha"
                  value={ecfecha}
                  onChange={(e) => setEcFecha(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eccomprobante">Comprobante:</label>
                <input
                  type="text"
                  id="eccomprobante"
                  value={eccomprobante}
                  onChange={(e) => setEcComprobante(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecelectronico">Electronico:</label>
                <input
                  type="text"
                  id="ecelectronico"
                  value={ecelectronico}
                  onChange={(e) => setEcElectronico(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecdireccionfiscal">Dirección Fiscal:</label>
                <input
                  type="text"
                  id="ecdireccionfiscal"
                  value={ecdireccionfiscal}
                  onChange={(e) => setEcDireccionFiscal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eccompania">Compania:</label>
                <select
                  id="eccompania"
                  value={eccompania}
                  onChange={(e) => setEcCompania(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Compania</option>
                  <option value="Airclass">Airclass</option>
                  <option value="Aireuropa">AirEuropa</option>
                </select>
              </div>
              <div>
                <label htmlFor="ecrutcedula">RUT/Cedula:</label>
                <input
                  type="text"
                  id="ecrutcedula"
                  value={ecrutcedula}
                  onChange={(e) => setEcrutcedula(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eccass">Cass:</label>
                <select
                  id="eccass"
                  value={eccass}
                  onChange={(e) => setEcCass(e.target.value)}
                  required
                >
                  <option value="">Seleccione Cass</option>
                  <option value="Cass1">Cass1</option>
                  <option value="Cass2">Cass2</option>
                  <option value="Cass3">Cass3</option>
                </select>
              </div>
              <div>
                <label htmlFor="ectipoembarque">Tipo de Embarque:</label>
                <select
                  id="ectipoembarque"
                  value={ectipodeembarque}
                  onChange={(e) => setEcTipoDeEmbarque(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Impo">Impo</option>
                  <option value="Expo">Expo</option>
                </select>
              </div>
              <div>
                <label htmlFor="ectc">Tc:</label>
                <input
                  type="text"
                  id="ectc"
                  value={ectc}
                  onChange={(e) => setEcTc(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className='div-guias-asociadas'>
            <h3 className='subtitulo-estandar'>Guias Asociadas</h3>
            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecguia">Guia:</label>
                <input
                  type="text"
                  id="ecguia"
                  value={ecguia}
                  onChange={(e) => setEcGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecdescripcion">Descripción:</label>
                <input
                  type="text"
                  id="ecdescripcion"
                  value={ecdescripcion}
                  onChange={(e) => setEcDescripcion(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecmonedaguia">Moneda:</label>
                <select
                  id="ecmonedaguia"
                  value={ecmonedaguia}
                  onChange={(e) => setEcMonedaGuia(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
                </select>
              </div>
              <div>
                <label htmlFor="ecimporte">Importe:</label>
                <input
                  type="text"
                  id="ecimporte"
                  value={ecimporte}
                  onChange={(e) => setEcImporte(e.target.value)}
                  required
                />
              </div>

              <div className='botonesfacturasasociadas'>
                <button type="button" onClick={handleAgregarGuiaAsociada} className='btn-estandar'>Agregar</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-facturas-asociadas'>
            <br />

            <div className='div-primerrenglon-datos-recibos'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-guias-asociadas' >
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Guia</th>
                    <th>Descripción</th>
                    <th>Moneda</th>
                    <th>Importe</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eclistadeguiasasociadas.map((guia, indexec) => (
                    <tr
                      key={indexec}
                      onClick={() => handleSeleccionarGuiaAsociada(indexec)}
                      style={{
                        cursor: 'pointer' // Indica que la fila es clickeable
                      }}
                    >
                      <td>{guia.ectipo}</td>
                      <td>{guia.ecguia}</td>
                      <td>{guia.ecdescripcion}</td>
                      <td>{guia.ecmonedaguia}</td>
                      <td>{guia.ecimporte}</td>
                      <td><button type="button" className="action-button" onClick={handleEliminarGuiaAsociada} disabled={ecguiaseleccionada !== indexec}>❌</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>


            </div>


          </div>
          <div className='div-totales-comprobante'>
            <h3 className='subtitulo-estandar'>Totales</h3>
            <div className='div-primerrenglon-datos-comprobante'>

              <div>
                <label htmlFor="ecsubtotal">Subtotal:</label>
                <input
                  type="text"
                  id="ecsubtotal"
                  value={ecsubtotal}
                  onChange={(e) => setEcsubtotal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecivatotal">IVA:</label>
                <input
                  type="text"
                  id="ecivatotal"
                  value={eciva}
                  onChange={(e) => setEcIva(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecredondeo">Redondeo:</label>
                <input
                  type="text"
                  id="ecredondeo"
                  value={ecredondeo}
                  onChange={(e) => setEcRedondeo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectotal">Total:</label>
                <input
                  type="text"
                  id="ectotal"
                  value={ectotal}
                  onChange={(e) => setEcTotal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectotalacobrar">Total a Cobrar:</label>
                <input
                  type="text"
                  id="ectotalacobrar"
                  value={ectotalacobrar}
                  onChange={(e) => setEcTotalACobrar(e.target.value)}
                  required
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
    </div>
  );
}

export default Comprobantes