import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { Link } from "react-router-dom";
import ModificarUsuario from './manejousuarios/ModificarUsuario';
import EliminarUsuario from './manejousuarios/EliminarUsuario';



const Usuarios = ({ isLoggedIn }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    
    //Variables de estado para eliminar usuario
    const [idAEliminar, setIdAEliminar] = useState(null);
  
    //Variables de estado para modificar usuario
    const [idAModificar, setIDAModificar] = useState(null); // ID
   
  
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');
  
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/previewusuarios');
        setUsuarios(response.data); // Asigna los datos de clientes al estado
      } catch (err) {
        setError('Error fetching clients');
        console.error(err);
      }
    };
  
    useEffect(() => {
      fetchClientes(); // Llama a la función para obtener los clientes
    }, []);
  
    const itemsPerPage = 8; // Cambia este número según tus necesidades
    const filteredData = usuarios.filter((row) =>
      row.usuario.toLowerCase().includes(searchTerm.toLowerCase())
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
  
    const handleEliminar = (id) => {
      setIdAEliminar(id);
    };
  
    const handleModificar = (id) => {
      setIDAModificar(id);
    };
  
    const closeModalEliminar = () => {
      setIdAEliminar(null);
      fetchClientes();
    };
  
    const closeModalModificar = () => {
      setIDAModificar(null);
      fetchClientes();
    };
  
    return (
      <div className="Contenedor_Principal">
  
        <div className='titulo-estandar'><h1>Usuarios</h1></div>
  
        <div className="table-container">
          <div className="search-bar">
            <Link to="/parametros/agregar_usuarios"><button className="add-button">➕</button></Link>
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
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((row) => (
                <tr key={row.id}>
                  <td title={row.id}>{row.id}</td>
                  <td title={row.usuario}>{row.usuario}</td>
                  <td title={row.rol}>{row.rol}</td>
                  <td title={row.fechacreacion}>{row.fecha_creacion}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-button" onClick={() => handleModificar(row.id)}>✏️</button>
                      <button className="action-button" onClick={() => handleEliminar(row.id)}>❌</button>
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
        {idAEliminar && (
          <>
            <div className="modal-overlay active" onClick={closeModalEliminar}></div>
            <div className="modal-container active">
              <EliminarUsuario id={idAEliminar} closeModal={closeModalEliminar} />
            </div>
          </>
        )}
  
        {/* Modal para modificar Cliente */}
        {idAModificar && (
          <>
            <div className="modal-overlay active" onClick={closeModalModificar}></div>
            <div className="modal-container active">
              <ModificarUsuario closeModal={closeModalModificar} id={idAModificar}  />
            </div>
          </>
        )}
      </div>
    );
  };
  
export default Usuarios