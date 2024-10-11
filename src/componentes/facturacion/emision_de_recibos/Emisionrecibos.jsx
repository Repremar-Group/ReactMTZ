import React, { useState, useEffect } from 'react';
import './Emisionrecibos.css';
import { Link } from "react-router-dom";

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


  // Estado para el documento y el importe de facturas asociadas
  const [erdocumentoasociado, setErDocumentoAsociado] = useState('');
  const [erimportefacturaasociada, setErImporteFacturaAsociada] = useState('');
  const [erfacturasasociadas, setErFacturasAsociadas] = useState([]);

  // Estado para la factura seleccionada
  const [erfacturaSeleccionada, setErFacturaSeleccionada] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarFacturaAsociada = (index) => {
    setErFacturaSeleccionada(index);
  };

  // Función para eliminar la factura seleccionada
  const handleEliminarFacturaAsociada = () => {
    if (erfacturaSeleccionada !== null) {
      const nuevasFacturasasociadas = erfacturasasociadas.filter((_, index) => index !== erfacturaSeleccionada);
      setErFacturasAsociadas(nuevasFacturasasociadas);
      setErFacturaSeleccionada(null); // Limpiar la selección
    }
  };

  // Ejemplo de datos para la tabla
  const movimientos = [
    { fecha: "2024-10-01", tipo: "R", descuento: "", recibo: "1001", debe: "", haber: "$30" },
    { fecha: "2024-10-02", tipo: "F", descuento: "500", recibo: "1002", debe: "$150", haber: "" },
    { fecha: "2024-10-03", tipo: "R", descuento: "", recibo: "1003", debe: "", haber: "$60" },
    { fecha: "2024-10-04", tipo: "F", descuento: "1000", recibo: "1004", debe: "$250", haber: "" },
    { fecha: "2024-10-05", tipo: "R", descuento: "", recibo: "1005", debe: "", haber: "$80" },
    { fecha: "2024-10-06", tipo: "F", descuento: "1200", recibo: "1006", debe: "$400", haber: "" },
    { fecha: "2024-10-07", tipo: "R", descuento: "", recibo: "1007", debe: "", haber: "$90" },
    { fecha: "2024-10-08", tipo: "F", descuento: "700", recibo: "1008", debe: "$100", haber: "" },
    { fecha: "2024-10-09", tipo: "R", descuento: "", recibo: "1009", debe: "", haber: "$100" },
    { fecha: "2024-10-10", tipo: "F", descuento: "2000", recibo: "1010", debe: "$300", haber: "" },
    { fecha: "2024-10-11", tipo: "R", descuento: "", recibo: "1011", debe: "", haber: "$120" },
    { fecha: "2024-10-12", tipo: "F", descuento: "1500", recibo: "1012", debe: "$180", haber: "" },
    { fecha: "2024-10-13", tipo: "R", descuento: "", recibo: "1013", debe: "", haber: "$110" },
    { fecha: "2024-10-14", tipo: "F", descuento: "300", recibo: "1014", debe: "$220", haber: "" },
    { fecha: "2024-10-15", tipo: "R", descuento: "", recibo: "1015", debe: "", haber: "$140" },
    { fecha: "2024-10-16", tipo: "F", descuento: "600", recibo: "1016", debe: "$130", haber: "" },
    { fecha: "2024-10-17", tipo: "R", descuento: "", recibo: "1017", debe: "", haber: "$160" },
    { fecha: "2024-10-18", tipo: "F", descuento: "400", recibo: "1018", debe: "$170", haber: "" },
    { fecha: "2024-10-19", tipo: "R", descuento: "", recibo: "1019", debe: "", haber: "$180" },
    { fecha: "2024-10-20", tipo: "F", descuento: "900", recibo: "1020", debe: "$190", haber: "" },
  ];

  const TablaMovimientos = ({ datos }) => (
    <table className='tabla-cuentacorriente-recibos' >
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Descuento</th>
          <th>Recibo</th>
          <th>Debe</th>
          <th>Haber</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((movimiento, index) => (
          <tr key={index}>
            <td>{movimiento.fecha}</td>
            <td>{movimiento.tipo}</td>
            <td>{movimiento.descuento}</td>
            <td>{movimiento.recibo}</td>
            <td>{movimiento.debe}</td>
            <td>{movimiento.haber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  useEffect(() => {
    const erfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setErFechaRecibo(erfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarRecibo = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para enviar la información
    console.log({
      razonSocial
    });
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


  return (
    <div className="EmitirRecibos-container">
      <h2 className='Titulo-ingreso-recibos'>Ingreso de Recibos</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-emitir-recibo'>

        <div className='primerafilaemitirrecibo'>
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
                />
              </div>
              <div>
                <label htmlFor="ernombre">Nombre:</label>
                <input
                  type="text"
                  id="ernombre"
                  value={ernombre}
                  onChange={(e) => setErNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-tercerrenglon-datos-recibos'>
              <div>
                <label htmlFor="ertipoMoneda">Moneda:</label>
                <select
                  id="ertipoMoneda"
                  value={ertipoMoneda}
                  onChange={(e) => setErTipoMoneda(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
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
                  <option value="x">X</option>
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
                />
              </div>
            </div>

          </div>

          <div className='div-ercuentacorriente'>
            <h3 className='Titulos-formularios-ingreso-recibos'>Cuenta Corriente</h3>
            <TablaMovimientos datos={movimientos} />
          </div>

        </div>

        <div className='segundafilaemitirrecibo'>
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
                    required
                  />
                </div>
                <div>
                  <label htmlFor="importeFactura">Importe:</label>
                  <input
                    type="number"
                    id="importeFactura"
                    value={erimportefacturaasociada}
                    onChange={(e) => setErImporteFacturaAsociada(e.target.value)}
                    required
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
                        cursor: 'pointer' // Indica que la fila es clickeable
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
              <button type="button" onClick={handleAgregarFacturaAsociada} className='btn-agregar-Recibo'>Agregar</button>
              <button type="button" onClick={handleEliminarFacturaAsociada} disabled={erfacturaSeleccionada === null} className='btn-eliminar-fasociada'>Eliminar Factura</button>
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
                required
              />
            </div>
          </div>

        </div>

        <div className='botonesagregarrecibo'>
          <Link to="/facturacion/recibos/ingresocheques"><button type="submit" className='btn-agregar-Recibo'>Confirmar</button></Link>

          <Link to="/home"><button className="btn-Salir-Agregar-Recibo">Volver</button></Link>
        </div>


      </form>
    </div>
  );
}
export default Emisionrecibos