import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import'./datosempresa.css';
import { useNavigate } from 'react-router-dom';

const DatosEmpresa = ({ isLoggedIn }) => {

  useEffect(() => {
    const fetchDatosEmpresa = async () => {
      try {
        const response = await axios.get(`${backURL}/api/obtener-datos-empresa`);
        const data = response.data;
  
        setUsuario(data.usuarioGfe || '');
        setPassword(data.passwordGfe || '');
        setCodigoEmpresa(data.codigoEmpresa || '');
        setContraseñaEmpresa(data.contraseñaEmpresa || '');
        setConjuntoClientesGIA(data.conjuntoClientes || '');
        setServerFacturacion(data.serverFacturacion || '');
      } catch (error) {
        console.error('Error al obtener datos de empresa:', error);
      }
    };
  
    fetchDatosEmpresa();
  }, []);
  
  const navigate = useNavigate();
  const backURL = import.meta.env.VITE_BACK_URL;
  useEffect(() => {
      const rol = localStorage.getItem('rol');

      if (rol !== 'admin') {
          // Si no es admin, redirigir al home
          navigate('/home');
      }
  }, [navigate]);
  
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [conjuntoClientesGIA, setConjuntoClientesGIA] = useState('');
  const [contraseñaEmpresa, setContraseñaEmpresa] = useState('');
  const [serverFacturacion, setServerFacturacion] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const datos = {
    usuarioGfe: usuario,
    passwordGfe: password,
    codigoEmpresa: codigoEmpresa,
    contraseñaEmpresa: contraseñaEmpresa,
    conjuntoClientes: conjuntoClientesGIA,
    serverFacturacion: serverFacturacion
  };

  const handleConfirmarGuardar = async () => {
    try {
      const response = await axios.post(`${backURL}/api/guardar-datos-empresa`, datos);
      alert('Datos guardados correctamente');
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error al guardar los datos');
      setShowModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true); // Mostrar modal antes de guardar
  };


  return (
    <div className="formularioschicos">
      <div className='titulo-estandar'>
        <h1>Datos de la Empresa</h1>
      </div>

      <div className='div-datos-comprobante'>
        <form onSubmit={handleSubmit}>
           <div className="div-datosempresa">
            <label>Server de Facturación</label>
            <input
              type="text"
              value={serverFacturacion}
              onChange={(e) => setServerFacturacion(e.target.value)}
              required
            />
          </div>
          <div className="div-datosempresa">
            <label>Usuario GIA</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="div-datosempresa">
            <label>Contraseña Usuario GIA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="div-datosempresa">
            <label>Código de Empresa GIA</label>
            <input
              type="text"
              value={codigoEmpresa}
              onChange={(e) => setCodigoEmpresa(e.target.value)}
              required
            />
          </div>

          <div className="div-datosempresa">
            <label>Constraseña de Empresa GIA</label>
            <input
              type="password"
              value={contraseñaEmpresa}
              onChange={(e) => setContraseñaEmpresa(e.target.value)}
              required
            />
          </div>
          <div className="div-datosempresa">
            <label>Conjunto de Clientes GIA</label>
            <input
              type="text"
              value={conjuntoClientesGIA}
              onChange={(e) => setConjuntoClientesGIA(e.target.value)}
              required
            />
          </div>


          <button className='btn-guardar' type="submit">Guardar</button>
        </form>
      </div>
    {/* Modal de confirmación */}
    {showModal && (
      <div className="modal">
        <div className="modal-content">
          <div className='titulo-estandar'>
           <h2>¿Estás seguro?</h2>
          </div>
            
            <p>Cambiar los datos de validación de facturación electrónica puede romper la conexión entre el servicio de facturación electrónica y la aplicación.</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmarGuardar} className="btn-confirmarGFE">Confirmar</button>
              <button onClick={() => setShowModal(false)} className="btn-cancelarGFE">Cancelar</button>
            </div>
        </div>
      </div>
      )}
    </div>
  );
};


export default DatosEmpresa