import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import './clientes.css'; // Importa el archivo CSS

const Clientes = ({ isLoggedIn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const data = [
    { id: 1, razonSocial: 'Repremar SA', rut: '01010101010', pais: 'UY', email: 'mpena@repremar.com', tel: '123123123' },
    { id: 2, razonSocial: 'Tech Solutions', rut: '02020202020', pais: 'UY', email: 'info@techsolutions.com', tel: '234234234' },
    { id: 3, razonSocial: 'Global Ventures', rut: '03030303030', pais: 'UY', email: 'contact@globalventures.com', tel: '345345345' },
    { id: 4, razonSocial: 'Eco Materials', rut: '04040404040', pais: 'UY', email: 'sales@ecomaterials.com', tel: '456456456' },
    { id: 5, razonSocial: 'FinTech Innovations', rut: '05050505050', pais: 'UY', email: 'support@fintechinnovations.com', tel: '567567567' },
    { id: 6, razonSocial: 'AgroTech Co.', rut: '06060606060', pais: 'UY', email: 'hello@agrotech.com', tel: '678678678' },
    { id: 7, razonSocial: 'Smart Homes', rut: '07070707070', pais: 'UY', email: 'info@smarthomes.com', tel: '789789789' },
    { id: 8, razonSocial: 'HealthFirst', rut: '08080808080', pais: 'UY', email: 'contact@healthfirst.com', tel: '890890890' },
    { id: 9, razonSocial: 'Digital Marketing Hub', rut: '09090909090', pais: 'UY', email: 'info@digitalmarketinghub.com', tel: '901901901' },
    { id: 10, razonSocial: 'Fashion Line', rut: '10101010101', pais: 'UY', email: 'support@fashionline.com', tel: '012012012' },
    { id: 11, razonSocial: 'Event Planners', rut: '11111111111', pais: 'UY', email: 'info@eventplanners.com', tel: '123456789' },
    { id: 12, razonSocial: 'Construction Group', rut: '12121212121', pais: 'UY', email: 'contact@constructiongroup.com', tel: '234567890' },
    { id: 13, razonSocial: 'Foodies Inc.', rut: '13131313131', pais: 'UY', email: 'info@foodiesinc.com', tel: '345678901' },
    { id: 14, razonSocial: 'Travel World', rut: '14141414141', pais: 'UY', email: 'support@travelworld.com', tel: '456789012' },
    { id: 15, razonSocial: 'Green Energy Solutions', rut: '15151515151', pais: 'UY', email: 'hello@greenenergy.com', tel: '567890123' },
    { id: 16, razonSocial: 'Innovative Designs', rut: '16161616161', pais: 'UY', email: 'info@innovative.com', tel: '678901234' },
    { id: 17, razonSocial: 'Real Estate Group', rut: '17171717171', pais: 'UY', email: 'contact@realestategroup.com', tel: '789012345' },
    { id: 18, razonSocial: 'Online Courses', rut: '18181818181', pais: 'UY', email: 'info@onlinecourses.com', tel: '890123456' },
    { id: 19, razonSocial: 'Gaming Studio', rut: '19191919191', pais: 'UY', email: 'support@gamingstudio.com', tel: '901234567' },
    { id: 20, razonSocial: 'Consulting Services', rut: '20202020202', pais: 'UY', email: 'info@consultingservices.com', tel: '012345678' }
  ];

  const itemsPerPage = 8; // Cambia este número según tus necesidades
  const filteredData = data.filter((row) =>
    row.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="Contenedor_Principal">

      <div className="Titulo"><h1>Clientes</h1></div>
      
      <div className="table-container">
        <div className="search-bar">
          <button className="add-button">➕</button>
          <input className='input_buscar'
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <table>
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
                <td title={row.razonSocial}>{row.razonSocial}</td>
                <td title={row.rut}>{row.rut}</td>
                <td title={row.id}>{row.id}</td>
                <td title={row.pais}>{row.pais}</td>
                <td title={row.email}>{row.email}</td>
                <td title={row.tel}>{row.tel}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">👥</button>
                    <button className="action-button">✏️</button>
                    <button className="action-button">❌</button>
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
    </div>

  );
};

export default Clientes;