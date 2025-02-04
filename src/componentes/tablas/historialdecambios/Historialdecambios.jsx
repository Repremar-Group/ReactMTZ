import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Eliminarcambio from './eliminarcambio/EliminarCambio';
import ModificarCambio from './modificarcambio/Modificarcambio';
import './Historialdecambios.css';
import axios from 'axios';

const Historialdecambios = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [hcfecha, setHcFecha] = useState('');
  const [hccotizacion, setHcCotizacion] = useState('');

  //Variables de estado para eliminar cambios
  const [hccotizacionAEliminar, setHcCotizacionAEliminar] = useState(null);
  const [hcfechaAEliminar, setHcFechaAEliminar] = useState(null);
  const [idAEliminar, setIdAEliminar] = useState(null);

  //Variables de estado para modificar documentos
  const [hcfechaAModificar, setFechaAModificar] = useState(null);
  const [hccotizacionAModificar, setCotizacionAModificar] = useState(null);
  const [idAModificar, setIdAModificar] = useState(null);

  //Handle Modificar lo que hace es cargar las variables de estado para la Modificacion con la info de la empresa.
  const handleModificar = (cotizacion, fecha, id) => {
    setFechaAModificar(fecha);
    setCotizacionAModificar(cotizacion);
    setIdAModificar(id);
  };

  //Handle Eliminar lo que hace es cargar las variables de estado para la eliminacion
  const handleEliminar = (cotizacion, fecha, id) => {
    setHcCotizacionAEliminar(cotizacion);
    setHcFechaAEliminar(fecha);
    setIdAEliminar(id);
    FetchTiposDeCambio();
  };
  const closeModalModificar = () => {
    setCotizacionAModificar(null);
    setFechaAModificar(null);
    FetchTiposDeCambio();
    FetchTiposDeCambio();
  };

  //Los CloseModal Devuelven las variables de estados a null
  const closeModalEliminar = () => {
    setHcCotizacionAEliminar(null);
    setHcFechaAEliminar(null);
  };

  const [hctablacambio, setHcTablaCambio] = useState([]);
  // Estado para la cheque seleccionado
  const [hccotizacionseleccionado, setHcCotizacionSeleccionado] = useState(null);

  // Función para cargar los datos de tipos de cambio
  const FetchTiposDeCambio = async () => {
    try {
      // Realizamos la solicitud GET para obtener los tipos de cambio
      const response = await axios.get('http://localhost:3000/api/obtenertipocambio');
      console.log(response.data);
      // Actualizamos el estado con los datos recibidos
      setHcTablaCambio(response.data);
    } catch (error) {
      console.error('Error al cargar los tipos de cambio:', error);
      alert('Hubo un error al cargar los tipos de cambio');
    }
  };

  // Usamos useEffect para cargar los datos al montar el componente
  useEffect(() => {
    FetchTiposDeCambio();
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarCambio = (icindex) => {
    setHcCotizacionSeleccionado(icindex);
  };

  // Función para agregar una factura asociada a la tabla
  const handleAgregarCambio = async () => {
    if (hcfecha && hccotizacion) {
      try {
        // Crear el objeto con los datos a enviar
        const nuevocambio = { fecha: hcfecha, tipo_cambio: hccotizacion };

        // Realizar la solicitud POST al endpoint
        const response = await axios.post('http://localhost:3000/api/agregartipocambio', nuevocambio);

        // Si la respuesta es exitosa, actualizamos la tabla localmente
        if (response.status === 200) {
          setHcCotizacion('');
          alert('Tipo de cambio agregado/actualizado correctamente');
          FetchTiposDeCambio();
        }
      } catch (error) {
        console.log('Error al agregar el tipo de cambio:', error);
        alert('Error al agregar el tipo de cambio. Verifique los datos e intente nuevamente.');
      }
    } else {
      alert('Debe completar ambos campos: fecha y cotización.');
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
                      <td>{cambio.fecha}</td>
                      <td>{cambio.tipo_cambio}</td>
                      <td>
                        <button type="button" className="action-button" disabled={hccotizacionseleccionado !== indexec} onClick={() => handleModificar(cambio.tipo_cambio, cambio.fecha, cambio.id)}>✏️</button>
                        <button type="button" className="action-button" disabled={hccotizacionseleccionado !== indexec} onClick={() => handleEliminar(cambio.tipo_cambio, cambio.fecha, cambio.id)}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>


            </div>


          </div>


        </div>



        <div className='botonesemitircomprobante'>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
        </div>


      </form>

      {/* Modal para eliminar cliente */}
      {hccotizacionAEliminar && (
        <>
          <div className="modal-overlay active" onClick={closeModalEliminar}></div>
          <div className="modal-containercambio active">
            <Eliminarcambio fecha={hcfechaAEliminar} cotizacion={hccotizacionAEliminar} closeModal={closeModalEliminar} id = {idAEliminar} />
          </div>
        </>
      )}

      {/* Modal para modificar Cliente */}
      {hccotizacionAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-containercambio active">
            <ModificarCambio fecha={hcfechaAModificar} cotizacion={hccotizacionAModificar} closeModal={closeModalModificar} id = {idAModificar} />
          </div>
        </>
      )}
    </div>
  );
}

export default Historialdecambios