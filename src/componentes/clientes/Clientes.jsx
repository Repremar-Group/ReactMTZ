import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './clientes.css';
import { Link } from "react-router-dom";
import EliminarCliente from './eliminar/EliminarCliente';
import ModificarCliente from './modificar/ModificarCliente';

const Clientes = ({ isLoggedIn }) => {
  const backURL = import.meta.env.VITE_BACK_URL;
  const [searchTerm, setSearchTerm] = useState('');

  const [clienteahabilitar, setClienteAHabilitar] = useState(null);
  const [clienteadeshabilitar, setClienteADeshabilitar] = useState(null);
  const [isModalOpenDeshabilitar, setIsModalOpenDeshabilitar] = useState(false);
  const [isModalOpenHabilitar, setIsModalOpenHabilitar] = useState(false);

  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  const [rutAEliminar, setRutAEliminar] = useState(null);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [codigoGiaAEliminar, setCodigoGIAAEliminar] = useState(null);

  const [empresaAModificar, setEmpresaAModificar] = useState(null);
  const [idAModificar, setIDAModificar] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`${backURL}/api/previewclientes`);
      setClientes(response.data);
    } catch (err) {
      setError('Error fetching clients');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredData = clientes.filter((row) =>
    row.RazonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEliminar = (razonSocial, rut, id, CodigoGIA) => {
    setEmpresaAEliminar(razonSocial);
    setRutAEliminar(rut);
    setIdAEliminar(id);
    setCodigoGIAAEliminar(CodigoGIA);
  };
  const deshabilitarUsuario = (cliente) => {
    setClienteADeshabilitar(cliente);
    setIsModalOpenDeshabilitar(true);
  };
  const habilitarUsuario = (cliente) => {
    setClienteAHabilitar(cliente);
    setIsModalOpenHabilitar(true);
  };

  const handleSubmitchangeEstadoCliente = async (cliente) => {
    try {
      await axios.post(`${backURL}/api/changeestadocliente`, {
        idCliente: cliente.Id
      });

      // Si salió bien → recargar lista
      await fetchClientes();

    } catch (error) {
      console.error("Error cambiando estado del cliente:", error);
      alert("Ocurrió un error al intentar deshabilitar el cliente");
    }
  };



  const handleModificar = (razonSocial, id) => {
    setIDAModificar(id);
    setEmpresaAModificar(razonSocial);
  };

  const closeModalEliminar = () => {
    setEmpresaAEliminar(null);
    setRutAEliminar(null);
    fetchClientes();
  };

  const closeModalModificar = () => {
    setEmpresaAModificar(null);
    setIDAModificar(null);
    fetchClientes();
  };

  return (
    <div className="Contenedor_Principal">
      <div className='titulo-estandar'><h1>Clientes</h1></div>

      <div className="table-container">
        <div className="search-bar">
          <Link to="/clientes/agregar"><button className="add-button">➕</button></Link>
          <input
            className='input_buscar'
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className='contenedor-tabla-buscarfacturas'>
          <table className='tabla-facturas'>
            <thead>
              <tr>
                <th>Razón social</th>
                <th>RUT</th>
                <th>Código GIA</th>
                <th>País</th>
                <th>Email</th>
                <th>Tel</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr
                  key={row.Id}
                  className={row.Estado === "I" ? "row-deshabilitado" : ""}
                >
                  <td title={row.razon_social}>{row.RazonSocial}</td>
                  <td title={row.rut}>{row.Rut}</td>
                  <td title={row.id}>{row.CodigoGIA}</td>
                  <td title={row.pais}>{row.Pais}</td>
                  <td title={row.email}>{row.Email}</td>
                  <td title={row.tel}>{row.Tel}</td>
                  <td className="td-con-submenu">
                    <div className="buscarfacturas-submenu-container">
                      <button disabled className="buscarfacturas-submenu-toggle">☰</button>
                      <div className="buscarfacturas-submenu">
                        <button className='botonsubmenubuscarfactura' onClick={() => handleModificar(row.RazonSocial, row.Id)}>Modificar Cliente</button>
                        <button className='botonsubmenubuscarfactura' onClick={() => handleEliminar(row.RazonSocial, row.Rut, row.Id, row.CodigoGIA)}>Eliminar Cliente</button>
                        <button className="botonsubmenubuscarfactura" onClick={() => { row.Estado === "A" ? deshabilitarUsuario(row) : habilitarUsuario(row); }}> {row.Estado === "A" ? "Deshabilitar" : "Habilitar"} </button>

                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>

      {empresaAEliminar && (
        <>
          <div className="modal-overlay active" onClick={closeModalEliminar}></div>
          <div className="modal-container active">
            <EliminarCliente
              empresa={empresaAEliminar}
              rut={rutAEliminar}
              id={idAEliminar}
              CodigoGIA={codigoGiaAEliminar}
              closeModal={closeModalEliminar}
            />
          </div>
        </>
      )}
      {isModalOpenDeshabilitar && (
        <div className='modal'>
          <div className='modal-content'>
            <h3 className='Titulo-ingreso-recibos'>Esta Deshabilitando el Cliente {clienteadeshabilitar.RazonSocial}</h3>

            <div className='modal-buttons'>
              <button
                className='btn-estandar'
                onClick={(e) => {
                  setIsModalOpenDeshabilitar(false);
                  handleSubmitchangeEstadoCliente(clienteadeshabilitar);
                }}
              >
                Deshabilitar
              </button>

              <button
                className='btn-estandar'
                onClick={() => setIsModalOpenDeshabilitar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpenHabilitar && (
        <div className='modal'>
          <div className='modal-content'>
            <h3 className='Titulo-ingreso-recibos'>Esta Habilitando el Cliente {clienteahabilitar.RazonSocial}</h3>

            <div className='modal-buttons'>
              <button
                className='btn-estandar'
                onClick={(e) => {
                  setIsModalOpenHabilitar(false);
                  handleSubmitchangeEstadoCliente(clienteahabilitar);
                }}
              >
                Habilitar
              </button>

              <button
                className='btn-estandar'
                onClick={() => setIsModalOpenHabilitar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {empresaAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-container active">
            <ModificarCliente
              closeModal={closeModalModificar}
              id={idAModificar}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Clientes;
