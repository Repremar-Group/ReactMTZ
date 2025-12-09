import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './saldos.css';
import { Link } from "react-router-dom";


const Saldos = ({ isLoggedIn }) => {
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

  const [isModalSaldoOpen, setIsModalSaldoOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [nuevoSaldo, setNuevoSaldo] = useState("");


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
  const handleModificar = (row) => {
    setEmpresaAModificar(row);
    setIDAModificar(row.Id);
    setNuevoSaldo(row.Saldo);
  };
  const closeModalModificar = () => {
    setEmpresaAModificar(null);
    setNuevoSaldo("");
  };

  const confirmarModificarSaldo = async (idCliente) => {
    try {
      await axios.put(`${backURL}/api/modificarsaldo`, {
        idCliente,
        nuevoSaldo
      });

      fetchClientes(); // refrescar
      closeModalModificar();

    } catch (err) {
      console.error(err);
      alert("Error modificando saldo");
    }
  };
  return (
    <div className="Contenedor_Principal">
      <div className='titulo-estandar'><h1>Saldos</h1></div>

      <div className="table-container">
        <div className="search-bar">
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
                <th>Saldo Inicial</th>
                <th>Usr. Modifica Saldo</th>
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
                  <td title={row.saldo}>{row.Saldo}</td>
                  <td title={row.usuariomodificasaldo}>{row.usuariomodificasaldo}</td>
                  <td className="td-con-submenu">
                    <div className="buscarfacturas-submenu-container">
                      <button
                        className='btn-estandar'
                        onClick={() => handleModificar(row)}
                      >
                        Modificar Saldo
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>
      {empresaAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-container active">
            <div className="modal-content">
              <h2>Modificar Saldo</h2>

              <div className="modal-item">
                <label>Razón Social:</label>
                <input
                  type="text"
                  value={empresaAModificar.RazonSocial}
                  disabled
                />
              </div>

              <div className="modal-item">
                <label>Nuevo Saldo:</label>
                <input
                  type="number"
                  value={nuevoSaldo}
                  onChange={(e) => setNuevoSaldo(e.target.value)}
                  placeholder="Ingrese nuevo saldo"
                />
              </div>

              <div className="modal-buttons">
                <button className="btn-estandar" onClick={() => confirmarModificarSaldo(idAModificar)}>
                  Confirmar
                </button>

                <button className="btn-estandar" onClick={closeModalModificar}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Saldos;
