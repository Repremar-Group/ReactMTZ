import React, { useState, useEffect } from 'react'; // Asegúrate de importar useState
import './modificarcliente.css';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const ModificarCliente = ({ closeModal, id }) => {
  if (!id) return null; // No muestra nada si no hay empresa seleccionada

  // Establece el estado local para los campos que se pueden modificar
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [pais, setPais] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [iata, setIata] = useState(''); //*
  const [direccion, setDireccion] = useState('');//*
  const [zona, setZona] = useState('');//*
  const [ciudad, setCiudad] = useState('');//*
  const [codigopostal, setCodigoPostal] = useState('');//*
  const [cass, setCass] = useState('');//*
  const [tipoComprobante, setTipoComprobante] = useState(false);//*
  const [tipoMoneda, setTipoMoneda] = useState(false);//*
  const [tipoIVA, setTipoIVA] = useState(false);//*


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/api/actualizarcliente/${id}`, {
        nombre,
        rut,
        pais,
        email,
        tel,
        razonSocial,
        iata,
        direccion,
        zona,
        ciudad,
        codigopostal,
        cass,
        tipoComprobante,
        tipoMoneda,
        tipoIVA
      });
      toast.success(response.data.message); // Mensaje de éxito
      closeModal(); // Cerrar el modal después de modificar
    } catch (error) {
      console.error(':', error);
      toast.error('Error al modificar el cliente');
    }
  };

  //Obtengo los datos del cliente desde la base y los cargo en los campos.
  const fetchClienteData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/obtenerclientes/${id}`);
      const clienteData = response.data;

      // Establecer los datos en el estado del componente
      setNombre(clienteData.Nombre);
      setRazonSocial(clienteData.RazonSocial);
      setDireccion(clienteData.Direccion);
      setZona(clienteData.Zona);
      setCiudad(clienteData.Ciudad);
      setCodigoPostal(clienteData.CodigoPostal);
      setRut(clienteData.Rut);
      setIata(clienteData.IATA);
      setCass(clienteData.Cass);
      setPais(clienteData.Pais);
      setEmail(clienteData.Email);
      setTel(clienteData.Tel);
      setTipoComprobante(clienteData.Tcomprobante);
      setTipoIVA(clienteData.Tiva);
      setTipoMoneda(clienteData.Moneda)
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Error al obtener los datos del cliente');
    }
  };

  useEffect(() => {
    // Llamar a la función para obtener los datos del cliente al montar el componente
    if (id) {
      fetchClienteData(id);
    }
  }, [id]); // Dependencia: se vuelve a ejecutar si `clienteId` cambia



  return (
    <div className='estandar-container'>
      <ToastContainer />
      <form className='formulario-editar-cliente' onSubmit={handleSubmit}>
        <h2 className='subtitulo-estandar'>Modificar Empresa: {razonSocial} </h2>
        <div className="contenido-modificar-empresa">
          <div className='div_primerrenglon-modificarusuario'>
            <div>
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="razonsocial">Razon Social:</label>
              <input
                type="text"
                id="razonsocial"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                required
              />
            </div>
          </div>

          <div className='div_segundorenglon-modificarusuario'>
            <div>
              <label htmlFor="direccion">Direccion:</label>
              <input
                type="text"
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="Zona">Zona:</label>
              <input
                type="text"
                id="zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}

              />

            </div>
          </div>

          <div className='div_tercerrenglon-modificarusuario'>
            <div>
              <label htmlFor="Ciudad">Ciudad:</label>
              <input
                type="text"
                id="ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="codigo-postal">Codigo Postal:</label>
              <input
                type="text"
                id="codigo-postal"
                value={codigopostal}
                onChange={(e) => setCodigoPostal(e.target.value)}

              />
            </div>
          </div>



          <div className='div_cuartorenglon-modificarusuario'>
            <div>
              <label htmlFor="rut">Rut:</label>
              <input
                type="number"
                id="rut"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="iata">IATA:</label>
              <input
                type="text"
                id="iata"
                value={iata}
                onChange={(e) => setIata(e.target.value)}

              />
            </div>

            <div>
              <label htmlFor="cass">Cass:</label>
              <select
                id="cass"
                value={cass}
                onChange={(e) => setCass(e.target.value)}

              >
                <option value="">Selecciona el Cass</option>
                <option value="false">No</option>
                <option value="true">Si</option>
              </select>
            </div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
          </div>



          <div className='div_quintorenglon-modificarusuario'>
            <div>
              <label htmlFor="pais">País:</label>
              <input
                type="text"
                id="pais"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="mail"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}

              />
            </div>
            <div>
              <label htmlFor="tel">Tel:</label>
              <input
                type="text"
                id="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}

              />
            </div>
          </div>


          <div className='div_quintorenglon-modificarusuario'>
            <div>
              <label htmlFor="tipoComprobante">Tipo de Comprobante:</label>
              <select
                id="tipoComprobante"
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value)}
                required
              >
                <option value="">Selecciona un tipo de Comprobante</option>
                <option value="efactura">E-Factura</option>
                <option value="eticket">E-Ticket</option>
                <option value="efacturaca">E-Factura Cuenta Ajena</option>
                <option value="eticketca">E-Ticket Cuenta Ajena</option>
              </select>
            </div>

            <div>
              <label htmlFor="tipoMoneda">Moneda:</label>
              <select
                id="tipoMoneda"
                value={tipoMoneda}
                onChange={(e) => setTipoMoneda(e.target.value)}
                required
              >
                <option value="">Selecciona una Moneda</option>
                <option value="dolares">Dolares</option>
                <option value="pesos">Pesos</option>
                <option value="euros">Euros</option>
              </select>
            </div>

            <div>
              <label htmlFor="tipoIVA">Tipo de IVA:</label>
              <select
                id="tipoIVA"
                value={tipoIVA}
                onChange={(e) => setTipoIVA(e.target.value)}
                required
              >
                <option value="">Seleccione un tipo de IVA</option>
                <option value="iva22">IVA 22%</option>
                <option value="excento">Exento</option>
              </select>
            </div>
          </div>


          <div className='botones-formulario-modificar-cliente'>
            <button className='btn-eliminar-estandar' type="submit">Modificar</button> {/* Cambié "Eliminar" a "Modificar" para reflejar la acción */}
            <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
          </div>

        </div>
      </form>
    </div>

  );
};

export default ModificarCliente;