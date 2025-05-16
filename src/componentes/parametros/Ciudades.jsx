import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import'./ciudades.css';
import { useNavigate } from 'react-router-dom';

const Ciudades = ({ isLoggedIn }) => {

    const navigate = useNavigate();

    useEffect(() => {
        const rol = localStorage.getItem('rol');

        if (rol !== 'admin') {
            // Si no es admin, redirigir al home
            navigate('/home');
        }
    }, [navigate]);
    
    const [ciudad, setCiudad] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [ciudades, setCiudades] = useState([]);
    const [error, setError] = useState('');
    const backURL = import.meta.env.VITE_BACK_URL;
    const handleEliminar = async (id) => {
        try {
            await axios.delete(`${backURL}/api/eliminarciudad/${id}`);
            fetchCiudades(); // Actualiza la lista de ciudads después de eliminar
        } catch (error) {
            console.error('Error al eliminar ciudad:', error);
            setError('Error al eliminar ciudad');
        }
    };

    const fetchCiudades = async () => {
        try {
            const response = await axios.get(`${backURL}/api/previewciudades`); // Cambia este endpoint según tu backend
            setCiudades(response.data); // Asigna los datos de ciudads al estado
        } catch (err) {
            setError('Error fetching flights');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCiudades(); // Llama a la función para obtener los ciudads
    }, []);

    const itemsPerPage = 8;
    const filteredData = ciudades.filter((row) =>
        row.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarCiudad = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${backURL}/api/agregarCiudad`, { ciudad: ciudad });
            setCiudad(''); // Resetea el input después de enviar el ciudad
            fetchCiudades(); // Actualiza la lista de ciudads
        } catch (error) {
            console.error('Error al agregar ciudad:', error);
            setError('Error al agregar ciudad');
        }
    };

    return (
        <div className="formularioschicos">
            <div className='titulo-estandar'><h1>Ciudades</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarCiudad} >
                    <div className='div-ciudad'>
                        <input className='input_buscar'
                            type="text"
                            placeholder="Agregar Ciudad"
                            value={ciudad}
                            onChange={(e) => setCiudad(e.target.value)}
                        />
                        <button type='submit' className="add-button">➕</button>
                    </div>
                </form>

                <table className='tabla-ciudades'>
                    <thead>
                        <tr>
                            <th>Ciudad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idciudades}>
                                <td>{row.ciudad}</td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idciudades)}>❌</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <ReactPaginate
                    previousLabel={"Anterior"}
                    nextLabel={"Siguiente"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                />
            </div>
        </div>
    );
};

export default Ciudades;
