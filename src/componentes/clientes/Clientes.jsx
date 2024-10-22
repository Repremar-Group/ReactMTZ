import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './clientes.css'; // Importa el archivo CSS
import { Link } from "react-router-dom";
import EliminarCliente from './eliminar/EliminarCliente';
import ModificarCliente from './modificar/ModificarCliente';

const Clientes = ({ isLoggedIn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  //Variables de estado para eliminar empresas
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null); // Razon Social
  const [rutAEliminar, setRutAEliminar] = useState(null); // rut

  //Variables de estado para modificar empresas
  const [empresaAModificar, setEmpresaAModificar] = useState(null); // Razon Social
  const [rutAModificar, setRutAModificar] = useState(null); // Rut
  const [idAModificar, setIDAModificar] = useState(null); // ID
  const [paisAModificar, setPaisAModificar] = useState(null); // Pais
  const [emailAModificar, setEmailAModificar] = useState(null); // Email
  const [telAModificar, setTelAModificar] = useState(null); // Tel

  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('https://cielosurinvoiceappservice-g3d0f5efafczage9.eastus2-01.azurewebsites.net/clientes');
        setClientes(response.data); // Asigna los datos de clientes al estado
      } catch (err) {
        setError('Error fetching clients');
        console.error(err);
      }
    };

    fetchClientes();
  }, []);

  const itemsPerPage = 8; // Cambia este número según tus necesidades
  const filteredData = clientes.filter((row) =>
    row.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEliminar = (razonSocial, rut) => {
    setEmpresaAEliminar(razonSocial); // Captura la razón social
    setRutAEliminar(rut); // Captura el RUT
  };

  const handleModificar = (razonSocial, rut, id, pais, email, tel) => {
    setEmpresaAModificar(razonSocial);
    setRutAModificar(rut);
    setIDAModificar(id);
    setPaisAModificar(pais);
    setEmailAModificar(email);
    setTelAModificar(tel);
  };

  const closeModalEliminar = () => {
    setEmpresaAEliminar(null);
    setRutAEliminar(null);
  };

  const closeModalModificar = () => {
    setEmpresaAModificar(null);
    setRutAModificar(null);
    setIDAModificar(null);
    setPaisAModificar(null);
    setEmailAModificar(null);
    setTelAModificar(null);
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
              <tr key={row.id}>
                <td title={row.razon_social}>{row.razon_social}</td>
                <td title={row.rut}>{row.rut}</td>
                <td title={row.id}>{row.Id}</td>
                <td title={row.pais}>{row.pais}</td>
                <td title={row.email}>{row.email}</td>
                <td title={row.tel}>{row.tel}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">👥</button>
                    <button className="action-button" onClick={() => handleModificar(row.razon_social, row.rut, row.id, row.pais, row.email, row.tel)}>✏️</button>
                    <button className="action-button" onClick={() => handleEliminar(row.razon_social, row.rut)}>❌</button>
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
            <EliminarCliente empresa={empresaAEliminar} rut={rutAEliminar} closeModal={closeModalEliminar} />
          </div>
        </>
      )}

      {/* Modal para modificar Cliente */}
      {empresaAModificar && (
        <>
          <div className="modal-overlay active" onClick={closeModalModificar}></div>
          <div className="modal-container active">
            <ModificarCliente empresa={empresaAModificar} rut={rutAModificar} closeModal={closeModalModificar} id={idAModificar} pais={paisAModificar} email={emailAModificar} tel={telAModificar} />
          </div>
        </>
      )}
    </div>
  );
};

export default Clientes;
