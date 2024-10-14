import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import ModificarCorrelatividad from './modificarcorrelatividad/ModificarCorrelatividad';
import Eliminarcorrelatividad from './eliminarcorrelatividad/Eliminarcorrelatividad';
import './Correlatividad.css';

const Correlatividad = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [ccformulario, setCcFormulario] = useState('');
  const [ccdocumento, setCcDocumento] = useState('');
  const [cctipocomprobante, setCcTipoComprobante] = useState('');
  const [ccestado, setCcEstado] = useState('');
  const [ccfecha, setCcFecha] = useState('');

  //Variables de estado para eliminar empresas
  const [ccdocumentoAEliminar, setCcDocumentoAEliminar] = useState(null);
  const [ccformularioAEliminar, setCcFormularioAEliminar] = useState(null);

  //Variables de estado para modificar documentos
  const [ccformularioAModificar, setFormularioAModificar] = useState(null);
  const [ccdocumentoAModificar, setDocumentoAModificar] = useState(null);
  const [cctipocomprobanteAModificar, setTipoComprobanteAModificar] = useState(null);
  const [ccestadoAModificar, setEstadoAModificar] = useState(null);
  const [ccfechaAModificar, setFechaAModificar] = useState(null);

  //Handle Modificar lo que hace es cargar las variables de estado para la Modificacion con la info de la empresa.
  const handleModificar = (formulario, documento, fecha, tipocomprobante, estado) => {
    setFormularioAModificar(formulario);
    setDocumentoAModificar(documento);
    setTipoComprobanteAModificar(tipocomprobante);
    setEstadoAModificar(estado);
    setFechaAModificar(fecha);
  };

  //Handle Eliminar lo que hace es cargar las variables de estado para la eliminacion
  const handleEliminar = (documento, formulario) => {
    setCcDocumentoAEliminar(documento); 
    setCcFormularioAEliminar(formulario); 
  };
  const closeModalModificar = () => {
    setFormularioAModificar(null);
    setDocumentoAModificar(null);
    setTipoComprobanteAModificar(null);
    setEstadoAModificar(null);
    setFechaAModificar(null);
  };

  //Los CloseModal Devuelven las variables de estados a null
  const closeModalEliminar = () => {
    setCcDocumentoAEliminar(null);
    setCcFormularioAEliminar(null);
  };
  const datosIniciales = [
    { ccformulario: '1', ccdocumento: '1', ccfecha: '2024-01-01', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '2', ccdocumento: '2', ccfecha: '2024-01-02', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '3', ccdocumento: '3', ccfecha: '2024-01-03', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '4', ccdocumento: '4', ccfecha: '2024-01-04', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '5', ccdocumento: '5', ccfecha: '2024-01-05', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '6', ccdocumento: '6', ccfecha: '2024-01-06', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '7', ccdocumento: '7', ccfecha: '2024-01-07', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '8', ccdocumento: '8', ccfecha: '2024-01-08', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '9', ccdocumento: '9', ccfecha: '2024-01-09', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '10', ccdocumento: '10', ccfecha: '2024-01-10', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '11', ccdocumento: '11', ccfecha: '2024-01-11', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '12', ccdocumento: '12', ccfecha: '2024-01-12', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '13', ccdocumento: '13', ccfecha: '2024-01-13', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '14', ccdocumento: '14', ccfecha: '2024-01-14', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '15', ccdocumento: '15', ccfecha: '2024-01-15', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '16', ccdocumento: '16', ccfecha: '2024-01-16', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '17', ccdocumento: '17', ccfecha: '2024-01-17', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '18', ccdocumento: '18', ccfecha: '2024-01-18', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '19', ccdocumento: '19', ccfecha: '2024-01-19', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '20', ccdocumento: '20', ccfecha: '2024-01-20', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '21', ccdocumento: '21', ccfecha: '2024-01-21', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '22', ccdocumento: '22', ccfecha: '2024-01-22', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '23', ccdocumento: '23', ccfecha: '2024-01-23', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '24', ccdocumento: '24', ccfecha: '2024-01-24', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '25', ccdocumento: '25', ccfecha: '2024-01-25', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '26', ccdocumento: '26', ccfecha: '2024-01-26', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '27', ccdocumento: '27', ccfecha: '2024-01-27', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '28', ccdocumento: '28', ccfecha: '2024-01-28', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '29', ccdocumento: '29', ccfecha: '2024-01-29', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '30', ccdocumento: '30', ccfecha: '2024-01-30', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '31', ccdocumento: '31', ccfecha: '2024-01-31', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '32', ccdocumento: '32', ccfecha: '2024-02-01', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
    { ccformulario: '33', ccdocumento: '33', ccfecha: '2024-02-02', cctipocomprobante: 'Recibo', ccestado: 'Correcto' },
  ];

  const [cctablacorrelatividad, setCcTablaCorrelatividad] = useState(datosIniciales);

  // Estado para la cheque seleccionado
  const [ccdocumentoseleccionado, setEcGuiaSeleccionada] = useState(null);


  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarDocumento = (icindex) => {
    setEcGuiaSeleccionada(icindex);
  };



  // Función para eliminar el cheque seleccionado
  const handleEliminarDocumentocc = () => {
    if (ccdocumentoseleccionado !== null) {
      // Filtrar todos los cheques excepto el seleccionado
      const nuevoDocumentoseleccionado = cctablacorrelatividad.filter((_, icindex) => icindex !== ccdocumentoseleccionado);
      setCcTablaCorrelatividad(nuevoDocumentoseleccionado);
      setEcGuiaSeleccionada(null); // Limpiar la selección
    }
  };
  // Función para agregar una factura asociada a la tabla
  const handleAgregarDocumentoCorrelatividad = () => {
    if (ccformulario && ccdocumento && ccfecha && cctipocomprobante && ccestado) {
      const nuevocomprobante = { ccformulario, ccdocumento, ccfecha, cctipocomprobante, ccestado };
      setCcTablaCorrelatividad([...cctablacorrelatividad, nuevocomprobante]);
      setEcGuia('');
      setEcDescripcion('');
      setEcMonedaGuia('');
      setEcImporte('');
    }
  };

  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setCcFecha(icfechaactual);
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
      <h2 className='titulo-estandar'>Control de Correlatividad</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>

          <div className='div-guias-asociadas'>
            <h3 className='subtitulo-estandar'>Datos del Documento</h3>
            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ccformulario">Formulario:</label>
                <input
                  type="text"
                  id="ccformulario"
                  value={ccformulario}
                  onChange={(e) => setCcFormulario(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ccdocumento">Documento:</label>
                <input
                  type="text"
                  id="ccdocumento"
                  value={ccdocumento}
                  onChange={(e) => setCcDocumento(e.target.value)}
                  required
                />
              </div>
              <div className="fecha-emision-comprobante">
                <label htmlFor="ccfecha">Fecha:</label>
                <input
                  type="date"
                  id="ccfecha"
                  value={ccfecha}
                  onChange={(e) => setCcFecha(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="cctipocomprobante">Tipo de Comprobante:</label>
                <select
                  id="cctipocomprobante"
                  value={cctipocomprobante}
                  onChange={(e) => setCcTipoComprobante(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Tipo</option>
                  <option value="Recibo">Recibo</option>
                  <option value="Factura">Factura</option>
                  <option value="etc">Etc</option>
                </select>
              </div>

              <div>
                <label htmlFor="ccestado">Estado:</label>
                <input
                  type="text"
                  id="ccestado"
                  value={ccestado}
                  onChange={(e) => setCcEstado(e.target.value)}
                  required
                />
              </div>

              <div className='botonesfacturasasociadas'>
                <button type="button" onClick={handleAgregarDocumentoCorrelatividad} className='btn-estandar'>Agregar</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-facturas-asociadas'>
            <br />

            <div className='div-primerrenglon-datos-recibos'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-correlatividad' >
                <thead>
                  <tr>
                    <th>Formulario</th>
                    <th>Documento</th>
                    <th>Fecha</th>
                    <th>Comprobante</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cctablacorrelatividad.map((Documento, indexec) => (
                    <tr
                      key={indexec}
                      onClick={() => handleSeleccionarDocumento(indexec)}
                      style={{
                        cursor: 'pointer' // Indica que la fila es clickeable
                      }}
                    >
                      <td>{Documento.ccformulario}</td>
                      <td>{Documento.ccdocumento}</td>
                      <td>{Documento.ccfecha}</td>
                      <td>{Documento.cctipocomprobante}</td>
                      <td>{Documento.ccestado}</td>
                      <td>
                        <button type="button" className="action-button" disabled={ccdocumentoseleccionado !== indexec} onClick={() => handleModificar(Documento.ccformulario, Documento.ccdocumento, Documento.ccfecha, Documento.cctipocomprobante, Documento.ccestado)}>✏️</button>
                        <button type="button" className="action-button" disabled={ccdocumentoseleccionado !== indexec} onClick={() => handleEliminar(Documento.ccformulario, Documento.ccdocumento, Documento.ccfecha, Documento.cctipocomprobante, Documento.ccestado)}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>


            </div>


          </div>


        </div>



        <div className='botonesemitircomprobante'>
          <button type="submit" className='btn-estandar'>Confirmar</button>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
        </div>


      </form>

      {/* Modal para eliminar cliente */}
      {ccdocumentoAEliminar && (
        <>
          <div className="modal-overlay active" onClick={closeModalEliminar}></div>
          <div className="modal-containercorrelatividad active">
            <Eliminarcorrelatividad documento={ccdocumentoAEliminar} formulario={ccformularioAEliminar} closeModal={closeModalEliminar} />
          </div>
        </>
      )}

      {/* Modal para modificar Cliente */}
      {ccdocumentoAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-containercorrelatividad active">
            <ModificarCorrelatividad formulario={ccformularioAModificar} documento={ccdocumentoAModificar} fecha={ccfechaAModificar} tipocomprobante={cctipocomprobanteAModificar} estado={ccestadoAModificar} closeModal={closeModalModificar} />
          </div>
        </>
      )}
    </div>
  );
}

export default Correlatividad