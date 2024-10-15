import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Eliminarcambio from './eliminarcambio/EliminarCambio';
import ModificarCambio from './modificarcambio/Modificarcambio';
import './Historialdecambios.css';

const Historialdecambios = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [hcfecha, setHcFecha] = useState('');
  const [hccotizacion, setHcCotizacion] = useState('');

  //Variables de estado para eliminar cambios
  const [hccotizacionAEliminar, setHcCotizacionAEliminar] = useState(null);
  const [hcfechaAEliminar, setHcFechaAEliminar] = useState(null);

  //Variables de estado para modificar documentos
  const [hcfechaAModificar, setFechaAModificar] = useState(null);
  const [hccotizacionAModificar, setCotizacionAModificar] = useState(null);

  //Handle Modificar lo que hace es cargar las variables de estado para la Modificacion con la info de la empresa.
  const handleModificar = (cotizacion, fecha) => {
    setFechaAModificar(fecha);
    setCotizacionAModificar(cotizacion);
  };

  //Handle Eliminar lo que hace es cargar las variables de estado para la eliminacion
  const handleEliminar = (cotizacion,fecha) => {
    setHcCotizacionAEliminar(cotizacion);
    setHcFechaAEliminar(fecha);
  };
  const closeModalModificar = () => {
    setCotizacionAModificar(null);
    setFechaAModificar(null);
  };

  //Los CloseModal Devuelven las variables de estados a null
  const closeModalEliminar = () => {
    setHcCotizacionAEliminar(null);
    setHcFechaAEliminar(null);
  };
  const datosIniciales = [
    { hcfecha: '2024-01-01', hccotizacion: '43.023' },
    { hcfecha: '2024-01-02', hccotizacion: '43.105' },
    { hcfecha: '2024-01-03', hccotizacion: '43.089' },
    { hcfecha: '2024-01-04', hccotizacion: '43.112' },
    { hcfecha: '2024-01-05', hccotizacion: '43.034' },
    { hcfecha: '2024-01-06', hccotizacion: '43.200' },
    { hcfecha: '2024-01-07', hccotizacion: '43.215' },
    { hcfecha: '2024-01-08', hccotizacion: '43.178' },
    { hcfecha: '2024-01-09', hccotizacion: '43.199' },
    { hcfecha: '2024-01-10', hccotizacion: '43.220' },
    { hcfecha: '2024-01-11', hccotizacion: '43.054' },
    { hcfecha: '2024-01-12', hccotizacion: '43.101' },
    { hcfecha: '2024-01-13', hccotizacion: '43.165' },
    { hcfecha: '2024-01-14', hccotizacion: '43.134' },
    { hcfecha: '2024-01-15', hccotizacion: '43.067' },
    { hcfecha: '2024-01-16', hccotizacion: '43.084' },
    { hcfecha: '2024-01-17', hccotizacion: '43.121' },
    { hcfecha: '2024-01-18', hccotizacion: '43.180' },
    { hcfecha: '2024-01-19', hccotizacion: '43.210' },
    { hcfecha: '2024-01-20', hccotizacion: '43.240' },
    { hcfecha: '2024-01-21', hccotizacion: '43.193' },
    { hcfecha: '2024-01-22', hccotizacion: '43.225' },
    { hcfecha: '2024-01-23', hccotizacion: '43.156' },
    { hcfecha: '2024-01-24', hccotizacion: '43.142' },
    { hcfecha: '2024-01-25', hccotizacion: '43.202' },
    { hcfecha: '2024-01-26', hccotizacion: '43.180' },
    { hcfecha: '2024-01-27', hccotizacion: '43.176' },
    { hcfecha: '2024-01-28', hccotizacion: '43.159' },
    { hcfecha: '2024-01-29', hccotizacion: '43.138' },
    { hcfecha: '2024-01-30', hccotizacion: '43.121' }
  ];

  const [hctablacambio, setHcTablaCambio] = useState(datosIniciales);

  // Estado para la cheque seleccionado
  const [hccotizacionseleccionado, setHcCotizacionSeleccionado] = useState(null);


  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarCambio = (icindex) => {
    setHcCotizacionSeleccionado(icindex);
  };

  // Función para agregar una factura asociada a la tabla
  const handleAgregarCambio = () => {
    if (hcfecha && hccotizacion) {
      const nuevocambio = { hcfecha, hccotizacion };
      setHcTablaCambio([nuevocambio, ...hctablacambio]);
      setHcCotizacion('');
    }
  };

  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setHcFecha(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para enviar la información
    console.log({
      razonSocial
    });
  };




  return (
    <div className="estandar-container">
      <h2 className='titulo-estandar'>Tipo de cambio</h2>
      <form onSubmit={handleSubmit} className='formulario-estandar'>

        <div className='Primerafila'>

          <div className='div-cambioactual'>
            <h3 className='subtitulo-estandar'>Cambio Actual</h3>
            <div className='primerrenglon-estandar'>
              <div className="fecha-emision-comprobante">
                <label htmlFor="hcfecha">Fecha:</label>
                <input
                  type="date"
                  id="hcfecha"
                  value={hcfecha}
                  onChange={(e) => setHcFecha(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="hccotizacion">Cotización:</label>
                <input
                  type="text"
                  id="hccotizacion"
                  value={hccotizacion}
                  onChange={(e) => setHcCotizacion(e.target.value)}
                  required
                />
              </div>

              <div className='botonesfacturasasociadas'>
                <button type="button" onClick={handleAgregarCambio} className='btn-estandar'>Agregar</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-hc'>
            <br />

            <div className='div-tabla'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-hc' >
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cotización</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {hctablacambio.map((cambio, indexec) => (
                    <tr
                      key={indexec}
                      onClick={() => handleSeleccionarCambio(indexec)}
                      style={{
                        cursor: 'pointer' // Indica que la fila es clickeable
                      }}
                    >
                      <td>{cambio.hcfecha}</td>
                      <td>{cambio.hccotizacion}</td>
                      <td>
                        <button type="button" className="action-button" disabled={hccotizacionseleccionado !== indexec} onClick={() => handleModificar(cambio.hccotizacion, cambio.hcfecha)}>✏️</button>
                        <button type="button" className="action-button" disabled={hccotizacionseleccionado !== indexec} onClick={() => handleEliminar(cambio.hccotizacion, cambio.hcfecha)}>❌</button>
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
      {hccotizacionAEliminar && (
        <>
          <div className="modal-overlay active" onClick={closeModalEliminar}></div>
          <div className="modal-containercambio active">
            <Eliminarcambio fecha={hcfechaAEliminar} cotizacion={hccotizacionAEliminar} closeModal={closeModalEliminar} />
          </div>
        </>
      )}

      {/* Modal para modificar Cliente */}
      {hccotizacionAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-containercambio active">
            <ModificarCambio fecha={hcfechaAModificar} cotizacion={hccotizacionAModificar} closeModal={closeModalModificar} />
          </div>
        </>
      )}
    </div>
  );
}

export default Historialdecambios