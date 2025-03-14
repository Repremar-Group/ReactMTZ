import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './clientes.css'; // Importa el archivo CSS
import { Link } from "react-router-dom";
import EliminarCliente from './eliminar/EliminarCliente';
import ModificarCliente from './modificar/ModificarCliente';

const Clientes = ({ isLoggedIn }) => {
  const backURL = import.meta.env.VITE_BACK_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  //Variables de estado para eliminar empresas
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null); // Razon Social
  const [rutAEliminar, setRutAEliminar] = useState(null); // rut
  const [idAEliminar, setIdAEliminar] = useState(null);

  //Variables de estado para modificar empresas
  const [empresaAModificar, setEmpresaAModificar] = useState(null); // Razon Social

  const [idAModificar, setIDAModificar] = useState(null); // ID
 

  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`${backURL}/api/previewclientes`);
      setClientes(response.data); // Asigna los datos de clientes al estado
    } catch (err) {
      setError('Error fetching clients');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClientes(); // Llama a la función para obtener los clientes
  }, []);

  const itemsPerPage = 8; // Cambia este número según tus necesidades
  const filteredData = clientes.filter((row) =>
    row.RazonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // Resetear la página actual al buscar
  };

  const handleEliminar = (razonSocial, rut, id) => {
    setEmpresaAEliminar(razonSocial); // Captura la razón social
    setRutAEliminar(rut); // Captura el RUT
    setIdAEliminar(id);
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
          <input className='input_buscar'
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <table className='tabla-clientes'>
          <thead>
            <tr>
              <th>Razón social</th>
              <th>RUT</th>
              <th>Id</th>
              <th>País</th>
              <th>Email</th>
              <th>Tel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((row) => (
              <tr key={row.Id}>
                <td title={row.razon_social}>{row.RazonSocial}</td>
                <td title={row.rut}>{row.Rut}</td>
                <td title={row.id}>{row.Id}</td>
                <td title={row.pais}>{row.Pais}</td>
                <td title={row.email}>{row.Email}</td>
                <td title={row.tel}>{row.Tel}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" onClick={() => handleModificar(row.RazonSocial,row.Id)}>✏️</button>
                    <button className="action-button" onClick={() => handleEliminar(row.RazonSocial, row.Rut, row.Id)}>❌</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ReactPaginate
          previousLabel={"Anterior"}
          nextLabel={"Siguiente"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>

      {/* Modal para eliminar cliente */}
      {empresaAEliminar && (
        <>
          <div className="modal-overlay active" onClick={closeModalEliminar}></div>
          <div className="modal-container active">
            <EliminarCliente empresa={empresaAEliminar} rut={rutAEliminar} id={idAEliminar} closeModal={closeModalEliminar} />
          </div>
        </>
      )}

      {/* Modal para modificar Cliente */}
      {empresaAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-container active">
            <ModificarCliente closeModal={closeModalModificar} id={idAModificar}  />
          </div>
        </>
      )}
    </div>
  );
};

export default Clientes;
