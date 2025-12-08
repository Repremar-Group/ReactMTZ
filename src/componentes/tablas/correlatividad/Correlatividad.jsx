import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import ModificarCorrelatividad from './modificarcorrelatividad/ModificarCorrelatividad';
import Eliminarcorrelatividad from './eliminarcorrelatividad/Eliminarcorrelatividad';
import './Correlatividad.css';
import axios from 'axios';

const Correlatividad = ({ isLoggedIn }) => {
  const backURL = import.meta.env.VITE_BACK_URL;

  useEffect(() => {
    const fetchCorrelatividad = async () => {
      try {
        const { data } = await axios.get(`${backURL}/api/obtenercorrelatividad`);
        // data = { ultimoFormularioRecibo: ..., ultimoDocumentoRecibo: ... }

        if (data) {
          setCcFormulario(data.ultimoFormularioRecibo ?? '');
          setCcDocumento(data.ultimoDocumentoRecibo ?? '');
        }
      } catch (err) {
        console.error('Error al obtener correlatividad:', err);
        // opcional: mostrar alerta al usuario
      }
    };

    fetchCorrelatividad();
  }, []);

  // Estado para los campos del formulario

  const [ccformulario, setCcFormulario] = useState('');
  const [ccdocumento, setCcDocumento] = useState('');
  const [cctipocomprobante, setCcTipoComprobante] = useState('');
  const [ccestado, setCcEstado] = useState('');
  const [ccfecha, setCcFecha] = useState('');

  const [accionPendiente, setAccionPendiente] = useState(null); // 'editar' | 'eliminar'
  const [datosPendientes, setDatosPendientes] = useState(null);

  //Estados para controlar la correlatividad
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [mostrarModalPasswordediciones, setMostrarModalPasswordEdiciones] = useState(false);
  const [campoADesbloquear, setCampoADesbloquear] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const abrirModalPassword = (campo) => {
    setCampoADesbloquear(campo);
    setInputPassword('');
    setMostrarModalPassword(true);
  };

  const abrirModalPasswordEdiciones = (accion, datos) => {
    setAccionPendiente(accion);         // 'editar' o 'eliminar'
    setDatosPendientes(datos);         // lo que le pasás a handleModificar / handleEliminar
    setInputPassword('');
    setMostrarModalPasswordEdiciones(true);
  };

  const confirmarPassword = () => {
    if (inputPassword === 'SistemasAirbill2025') {
      if (campoADesbloquear === 'ultimoFormularioRecibo') setCcFormularioEditable(true);
      if (campoADesbloquear === 'ultimoDocumentoRecibo') setCcDocumentoEditable(true);
      setMostrarModalPassword(false);
    } else {
      alert("Contraseña incorrecta");
    }
  };
  const confirmarPasswordEdiciones = () => {
    if (inputPassword === 'SistemasAirbill2025') {
      if (accionPendiente === 'editar') {
        handleModificar(
          datosPendientes.ccformulario,
          datosPendientes.ccdocumento,
          datosPendientes.ccfecha,
          datosPendientes.cctipocomprobante,
          datosPendientes.ccestado
        );
      }
      if (accionPendiente === 'eliminar') {
        handleEliminar(
          datosPendientes.ccformulario,
          datosPendientes.ccdocumento,
          datosPendientes.ccfecha,
          datosPendientes.cctipocomprobante,
          datosPendientes.ccestado
        );
      }
      setMostrarModalPasswordEdiciones(false);
    } else {
      alert('Contraseña incorrecta');
    }
  };


  const [ccformularioEditable, setCcFormularioEditable] = useState(false);
  const [ccdocumentoEditable, setCcDocumentoEditable] = useState(false);

  const desbloquearCampo = async (campo) => {
    if (campo === 'formulario') {
      if (ccformularioEditable) {
        guardarDato('formulario', ccformulario);
        setCcFormularioEditable(false);
      } else {
        const ok = await verificarContraseña();
        if (ok) {
          setCcFormularioEditable(true);
        } else {
          alert("Contraseña incorrecta");
        }
      }
    }

    if (campo === 'documento') {
      if (ccdocumentoEditable) {
        guardarDato('documento', ccdocumento);
        setCcDocumentoEditable(false);
      } else {
        const ok = await verificarContraseña();
        if (ok) {
          setCcDocumentoEditable(true);
        } else {
          alert("Contraseña incorrecta");
        }
      }
    }
  };
  const guardarDato = async (campo, valor) => {
    try {
      const response = await axios.post(`${backURL}/api/actualizarcorrelatividad`, {
        campo,
        valor,
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error al guardar el dato:', error);
      alert('Hubo un error al guardar el dato');
    }
  };

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


  const [cctablacorrelatividad, setCcTablaCorrelatividad] = useState([]);
  useEffect(() => {
    const fetchTablaCorrelatividad = async () => {
      try {
        const { data } = await axios.get(`${backURL}/api/obtenercorrelatividadtabla`);
        setCcTablaCorrelatividad(data);
      } catch (err) {
        console.error('Error al obtener tabla correlatividad:', err);
      }
    };

    fetchTablaCorrelatividad();
  }, []);
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
    <div className="estandar-container">
      <h2 className='titulo-estandar'>Control de Correlatividad</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>

          <div className='div-guias-asociadas'>
            <h3 className='subtitulo-estandar'>Datos del Documento</h3>
            <div className='div-primerrenglon-datos-comprobante'>
              <div style={{ position: 'relative' }}>
                <label htmlFor="ccformulario">Ultimo Nro. Formulario:</label>
                <input
                  type="text"
                  id="ccformulario"
                  value={ccformulario}
                  onChange={(e) => setCcFormulario(e.target.value)}
                  required
                  readOnly={!ccformularioEditable}
                />
                <span
                  onClick={() => {
                    if (ccformularioEditable) {
                      guardarDato('ultimoFormularioRecibo', ccformulario);
                      setCcFormularioEditable(false);
                    } else {
                      abrirModalPassword('ultimoFormularioRecibo');
                    }
                  }}
                  style={{ cursor: 'pointer', position: 'absolute', top: '24px', right: '10px' }}
                  title={ccformularioEditable ? "Guardar y bloquear" : "Desbloquear"}
                >
                  {ccformularioEditable ? '🔓' : '🔒'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <label htmlFor="ccdocumento">Ultimo Nro. Documento:</label>
                <input
                  type="text"
                  id="ccdocumento"
                  value={ccdocumento}
                  onChange={(e) => setCcDocumento(e.target.value)}
                  required
                  readOnly={!ccdocumentoEditable}
                />
                <span
                  onClick={() => {
                    if (ccdocumentoEditable) {
                      guardarDato('ultimoDocumentoRecibo', ccdocumento);
                      setCcDocumentoEditable(false);
                    } else {
                      abrirModalPassword('ultimoDocumentoRecibo');
                    }
                  }}
                  style={{ cursor: 'pointer', position: 'absolute', top: '24px', right: '10px' }}
                  title={ccdocumentoEditable ? "Guardar y bloquear" : "Desbloquear"}
                >
                  {ccdocumentoEditable ? '🔓' : '🔒'}
                </span>


              </div>
              <div>
                <button
                  type="button"
                  className="btn-estandar"
                  onClick={async () => {
                    try {
                      const res = await axios.post(`${backURL}/api/insertarReciboAnulado`);
                      alert(res.data.mensaje);
                      window.location.reload();
                    } catch (error) {
                      console.error(error);
                      alert("Error al Anular Recibo");
                    }
                  }}
                >
                  Anular Recibo
                </button>
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
                        <button
                          type="button"
                          className="action-button"
                          disabled={ccdocumentoseleccionado !== indexec}
                          onClick={() => abrirModalPasswordEdiciones('editar', Documento)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="action-button"
                          disabled={ccdocumentoseleccionado !== indexec}
                          onClick={() => abrirModalPasswordEdiciones('eliminar', Documento)}
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
      {mostrarModalPassword && (
        <div
          className="modal"
          onClick={() => setMostrarModalPassword(false)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              minWidth: '300px',
              textAlign: 'center',
            }}
          >
            <h3 className="subtitulo-estandar">Ingrese la contraseña</h3>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="new-password"
              style={{
                padding: '8px',
                width: '100%',
                marginTop: '10px',
                marginBottom: '20px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="btn-estandartablas"
                onClick={confirmarPassword}
                style={{ padding: '8px 12px' }}
              >
                Confirmar
              </button>
              <button
                className="btn-estandartablas"
                onClick={() => setMostrarModalPassword(false)}
                style={{ padding: '8px 12px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarModalPasswordediciones && (
        <div
          className="modal"
          onClick={() => setMostrarModalPasswordEdiciones(false)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              minWidth: '300px',
              textAlign: 'center',
            }}
          >
            <h3 className="subtitulo-estandar">Ingrese la contraseña</h3>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="new-password"
              style={{
                padding: '8px',
                width: '100%',
                marginTop: '10px',
                marginBottom: '20px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="btn-estandartablas"
                onClick={confirmarPasswordEdiciones}
                style={{ padding: '8px 12px' }}
              >
                Confirmar
              </button>
              <button
                className="btn-estandartablas"
                onClick={() => setMostrarModalPasswordEdiciones(false)}
                style={{ padding: '8px 12px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Correlatividad