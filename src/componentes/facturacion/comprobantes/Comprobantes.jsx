import React, { useState, useEffect } from 'react';

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



  const [icnrocheque, setIcNroCheque] = useState('');
  const [icbanco, setIcBanco] = useState('');
  const [icfecha, setIcFecha] = useState('');
  const [ictipoMoneda, setIcTipoMoneda] = useState(false);//*
  const [icarbitraje, setIcArbitraje] = useState('');
  const [icimpdelcheque, setIcImpDelCheque] = useState('');
  const [icimporteendolares, setIcImporteEnDolares] = useState('');
  const [icfechavencimiento, setIcFechavencimiento] = useState('');
  const [ictotaldelasguias, setIcTotalDeLasGuias] = useState('');
  const [ictotalingresado, setIcTotalIngresado] = useState('');
  const [icsaldodelcheque, setIcSaldoDelCheque] = useState('');
  const [icimpdeldocumento, setIcImpDelDocumento] = useState('');
  const [icsaldodeldocumento, setIcSaldoDelDocumento] = useState('');
  const [iclistadecheques, setIcListaDeCheques] = useState([]);



  // Estado para la cheque seleccionado
  const [icchequeseleccionado, setIcChequeSeleccionado] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarChequeLista = (icindex) => {
    setIcChequeSeleccionado(icindex);
  };



  // Función para eliminar el cheque seleccionado
  const handleEliminarChequeCargado = () => {
    if (icchequeseleccionado !== null) {
      // Filtrar todos los cheques excepto el seleccionado
      const nuevoschequesseleccionados = iclistadecheques.filter((_, icindex) => icindex !== icchequeseleccionado);
      setIcListaDeCheques(nuevoschequesseleccionados);
      setIcChequeSeleccionado(null); // Limpiar la selección
    }
  };
  // Función para agregar una factura asociada a la tabla
  const handleAgregarChequeCargado = () => {
    if (icnrocheque && icbanco && icfecha && ictipoMoneda && icimpdelcheque && icfechavencimiento) {
      const nuevocheque = { icfecha, icbanco, icnrocheque, ictipoMoneda, icimpdelcheque, icfechavencimiento };
      setIcListaDeCheques([...iclistadecheques, nuevocheque]);
      setIcNroCheque('');
      setIcBanco('');
      setIcTipoMoneda(false);
      setIcArbitraje('');
      setIcImpDelCheque('');
      setIcImporteEnDolares('');
      setIcFechavencimiento('');
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
    <div className="IngresarCheque-container">
      <h2 className='Titulo-ingreso-recibos'>Emisión de Comprobantes</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-emitir-recibo'>

        <div className='primerafilaingresocheques'>
          <div className='div-datos-cheque'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Datos del Comprobante</h3>

            <div className='div-primerrenglon-datos-cheque'>
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


            <div className='div-primerrenglon-datos-cheque'>
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

            <div className='div-primerrenglon-datos-cheque'>
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

            


            <div className='div-segundorenglon-datos-cheque'>
              <div className='botonesfacturasasociadas'>
                <button type="button" className='btn-estandar'>Nuevo</button>
                <button type="button" className='btn-estandar'>Usar Anterior</button>
                <button type="button" className='btn-estandar'>Modificar</button>
                <button type="button" className='btn-eliminar-estandar'>Eliminar</button>
                <button type="button" onClick={handleAgregarChequeCargado} className='btn-estandar'>Confirmar</button>
              </div>
            </div>

          </div>



          <div className='div-totales-cheque'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Totales del Cheque</h3>

            <div className='div-primerrenglon-datos-recibos'>
              <div>
                <label htmlFor="ictotaldelasguias">Total de las Guias:</label>
                <input
                  type="text"
                  id="ictotaldelasguias"
                  value={ictotaldelasguias}
                  onChange={(e) => setIcTotalDeLasGuias(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ictotalingresado">Total Ingresado:</label>
                <input
                  type="text"
                  id="ictotalingresado"
                  value={ictotalingresado}
                  onChange={(e) => setIcTotalIngresado(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="icsaldodelcheque">Saldo Del Cheque:</label>
                <input
                  type="text"
                  id="icsaldodelcheque"
                  value={icsaldodelcheque}
                  onChange={(e) => setIcSaldoDelCheque(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="icimpdeldocumento">Imp. del Documento:</label>
                <input
                  type="text"
                  id="icimpdeldocumento"
                  value={icimpdeldocumento}
                  onChange={(e) => setIcImpDelDocumento(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="icsaldodeldocumento">Saldo del Documento:</label>
                <input
                  type="text"
                  id="icsaldodeldocumento"
                  value={icsaldodeldocumento}
                  onChange={(e) => setIcSaldoDelDocumento(e.target.value)}
                  required
                />
              </div>


            </div>
          </div>

          <div className='div-tabla-cheque'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Totales del Cheque</h3>

            <div className='div-primerrenglon-datos-recibos'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-cheques' >
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Banco</th>
                    <th>Nro. de Cheque</th>
                    <th>Moneda</th>
                    <th>Importe</th>
                    <th>Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {iclistadecheques.map((cheque, indexic) => (
                    <tr
                      key={indexic}
                      onClick={() => handleSeleccionarChequeLista(indexic)}
                      style={{
                        cursor: 'pointer' // Indica que la fila es clickeable
                      }}
                    >
                      <td>{cheque.icfecha}</td>
                      <td>{cheque.icbanco}</td>
                      <td>{cheque.icnrocheque}</td>
                      <td>{cheque.ictipoMoneda}</td>
                      <td>{cheque.icimpdelcheque}</td>
                      <td>{cheque.icfechavencimiento}</td>
                      <td><button type="button" className="action-button" onClick={handleEliminarChequeCargado} disabled={icchequeseleccionado !== indexic}>❌</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>


            </div>
          </div>

        </div>



        <div className='botonesagregarcheque'>
          <button type="submit" className='btn-estandar'>Confirmar</button>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
        </div>


      </form>
    </div>
  );
}

export default Comprobantes