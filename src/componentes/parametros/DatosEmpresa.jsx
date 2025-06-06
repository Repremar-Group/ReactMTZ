import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './datosempresa.css';
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
        setRubVentas(data.rubVentas || '');
        setRubCompras(data.rubCompras || '');
        setRubCostos(data.rubCostos || '');
        setCodEfac(data.codEfac || '');
        setCodEfacCA(data.codEfacCA || '');
        setCodETick(data.codETick || '');
        setCodETickCA(data.codETickCA || '');
      } catch (error) {
        console.error('Error al obtener datos de empresa:', error);
      }
    };

    fetchDatosEmpresa();
  }, []);

  const navigate = useNavigate();
  const backURL = import.meta.env.VITE_BACK_URL;
  const usr = localStorage.getItem('usuario');
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
  const [rubVentas, setRubVentas] = useState('');
  const [rubCompras, setRubCompras] = useState('');
  const [rubCostos, setRubCostos] = useState('');
  const [codEfac, setCodEfac] = useState('');
  const [codEfacCA, setCodEfacCA] = useState('');
  const [codETick, setCodETick] = useState('');
  const [codETickCA, setCodETickCA] = useState('');


  const datos = {
    usuarioGfe: usuario,
    passwordGfe: password,
    codigoEmpresa: codigoEmpresa,
    contraseñaEmpresa: contraseñaEmpresa,
    conjuntoClientes: conjuntoClientesGIA,
    serverFacturacion: serverFacturacion,
    rubVentas: rubVentas,
    rubCompras: rubCompras,
    rubCostos: rubCostos,
    codEfac: codEfac,
    codEfacCA: codEfacCA,
    codETick: codETick,
    codETickCA: codETickCA,
    usuModifica: usr,
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
    <div className="formulariodatosempresa">
      <div className='titulo-estandar'>
        <h1>Datos de la Empresa</h1>
      </div>

      <div className='div-datos-comprobante'>
        <form onSubmit={handleSubmit}>
          <div className='contenedor-bloques'>
            {/* 🔹 BLOQUE 1: CONEXIÓN CON EL SERVIDOR */}
            <div className="bloque-datos">
              <h3>Conexión con el Servidor</h3>

              <div className="div-datosempresa">
                <label>Server de Facturación</label>
                <input type="text" value={serverFacturacion} onChange={(e) => setServerFacturacion(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Usuario GIA</label>
                <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Contraseña Usuario GIA</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Código de Empresa GIA</label>
                <input type="text" value={codigoEmpresa} onChange={(e) => setCodigoEmpresa(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Contraseña de Empresa GIA</label>
                <input type="password" value={contraseñaEmpresa} onChange={(e) => setContraseñaEmpresa(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Conjunto de Clientes GIA</label>
                <input type="text" value={conjuntoClientesGIA} onChange={(e) => setConjuntoClientesGIA(e.target.value)} required />
              </div>
            </div>

            {/* 🔹 BLOQUE 2: DATOS PARA LOS CONCEPTOS */}
            <div className="bloque-datos">
              <h3>Datos para los Conceptos</h3>

              <div className="div-datosempresa">
                <label>Rubro de Ventas</label>
                <input type="text" value={rubVentas} onChange={(e) => setRubVentas(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Rubro de Compras</label>
                <input type="text" value={rubCompras} onChange={(e) => setRubCompras(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Rubro de Costos</label>
                <input type="text" value={rubCostos} onChange={(e) => setRubCostos(e.target.value)} required />
              </div>
            </div>

            {/* 🔹 BLOQUE 3: CÓDIGOS DE FACTURACIÓN GIA */}
            <div className="bloque-datos">
              <h3>Códigos de Facturación GIA</h3>

              <div className="div-datosempresa">
                <label>Código GIA E-Factura</label>
                <input type="text" value={codEfac} onChange={(e) => setCodEfac(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Código GIA E-Factura Cuenta Ajena</label>
                <input type="text" value={codEfacCA} onChange={(e) => setCodEfacCA(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Código GIA E-Ticket</label>
                <input type="text" value={codETick} onChange={(e) => setCodETick(e.target.value)} required />
              </div>
              <div className="div-datosempresa">
                <label>Código GIA E-Ticket Cuenta Ajena</label>
                <input type="text" value={codETickCA} onChange={(e) => setCodETickCA(e.target.value)} required />
              </div>
            </div>
          </div>

          <button className='btn-guardarempresa' type="submit">Guardar</button>
        </form>
      </div>

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