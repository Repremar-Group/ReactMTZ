import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Facturasmanuales.css'

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


  // Estado para la cheque seleccionado
  const [fmconceptoseleccionado, setFmConceptoSeleccionado] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarConceptoAsociado = (icindex) => {
    setFmConceptoSeleccionado(icindex);
  };



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
      const nuevoconceptoasociado = { fmcodigoconcepto, fmdescripcion, fmmonedaconcepto,fmivaconcepto, fmimporte };
      setFmListaDeConceptos([...fmlistadeconceptos, nuevoconceptoasociado]);
      setFmCodigoConcepto('');
      setFmDescripcion('');
      setFmMonedaConcepto('');
      setFmIvaConcepto('');
      setFmImporte('');
    }
  };

  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setFmFecha(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFm = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para enviar la información
    console.log({
      razonSocial
    });
  };




  return (
    <div className="EmitirFacturaManual-container">
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
                <label htmlFor="fmnombre">Nombre:</label>
                <input
                  type="text"
                  id="fmnombre"
                  value={fmnombre}
                  onChange={(e) => setFmNombre(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmtipocomprobante">Tipo de Comprobante:</label>
                <select
                  id="fmtipocomprobante"
                  value={fmtipocomprobante}
                  onChange={(e) => setFmTipoComprobante(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Tipo</option>
                  <option value="fcredito">Factura de Credito</option>
                  <option value="fcontado">Factura Contado</option>
                  <option value="etc">Etc</option>
                </select>
              </div>
              <div>
                <label htmlFor="fmcomprobanteelectronico">Comprobante Electronico:</label>
                <input
                  type="text"
                  id="fmcomprobanteelectronico"
                  value={fmcomprobanteelectronico}
                  onChange={(e) => setFmComprobanteElectronico(e.target.value)}
                  required
                />
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
                  <option value="">Selecciona una Tipo</option>
                  <option value="iva22">IVA 22 %</option>
                  <option value="ivax">IVA X %</option>
                  <option value="ivay">IVA Y %</option>
                </select>
              </div>
              <div>
                <label htmlFor="fmmoneda">Moneda:</label>
                <select
                  id="fmmoneda"
                  value={fmmoneda}
                  onChange={(e) => setFmMoneda(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
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
                  id="fmcass"
                  value={fmcass}
                  onChange={(e) => setFmCass(e.target.value)}
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
                  required
                />
              </div>
              <div>
                <label htmlFor="fmdescripcion">Descripción:</label>
                <input
                  type="text"
                  id="fmdescripcion"
                  value={fmdescripcion}
                  onChange={(e) => setFmDescripcion(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmmonedaconcepto">Moneda:</label>
                <select
                  id="fmmonedaconcepto"
                  value={fmmonedaconcepto}
                  onChange={(e) => setFmMonedaConcepto(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
                </select>
              </div>
              <div>
                <label htmlFor="fmimporte">IVA:</label>
                <input
                  type="text"
                  id="fmimporte"
                  value={fmivaconcepto}
                  onChange={(e) => setFmIvaConcepto(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmimporte">Importe:</label>
                <input
                  type="text"
                  id="fmimporte"
                  value={fmimporte}
                  onChange={(e) => setFmImporte(e.target.value)}
                  required
                />
              </div>

              <div className='botonesfacturasasociadas'>
                <button type="button" onClick={handleAgregarConceptoAsociado} className='btn-estandar'>Agregar</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-facturas-asociadas'>
            <br />

            <div className='div-primerrenglon-datos-recibos'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-conceptos' >
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
                  required
                />
              </div>
              <div>
                <label htmlFor="fmivatotal">IVA:</label>
                <input
                  type="text"
                  id="fmivatotal"
                  value={fmiva}
                  onChange={(e) => setFmIva(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmredondeo">Redondeo:</label>
                <input
                  type="text"
                  id="fmredondeo"
                  value={fmredondeo}
                  onChange={(e) => setFmRedondeo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmtotal">Total:</label>
                <input
                  type="text"
                  id="fmtotal"
                  value={fmtotal}
                  onChange={(e) => setFmTotal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fmtotalacobrar">Total a Cobrar:</label>
                <input
                  type="text"
                  id="fmtotalacobrar"
                  value={fmtotalacobrar}
                  onChange={(e) => setFmTotalACobrar(e.target.value)}
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

export default Facturasmanuales