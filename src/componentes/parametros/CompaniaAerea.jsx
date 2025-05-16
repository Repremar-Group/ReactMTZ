import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import'./monedas.css';
import { useNavigate } from 'react-router-dom';

const CompaniaAerea = ({ isLoggedIn }) => {
    const navigate = useNavigate();
    
        useEffect(() => {
            const rol = localStorage.getItem('rol');
    
            if (rol !== 'admin') {
                // Si no es admin, redirigir al home
                navigate('/home');
            }
        }, [navigate]);

        
    const [compania, setCompania] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [companias, setCompanias] = useState([]);
    const [error, setError] = useState('');
    const backURL = import.meta.env.VITE_BACK_URL;
    const handleEliminar = async (id) => {
        try {
            await axios.delete(`${backURL}/api/eliminarcompania/${id}`);
            fetchCompanias(); // Actualiza la lista de companias después de eliminar
        } catch (error) {
            console.error('Error al eliminar compania:', error);
            setError('Error al eliminar compania');
        }
    };

    const fetchCompanias = async () => {
        try {
            const response = await axios.get(`${backURL}/api/previewcompanias`); // Cambia este endpoint según tu backend
            setCompanias(response.data); // Asigna los datos de ciudads al estado
        } catch (err) {
            setError('Error fetching flights');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCompanias(); // Llama a la función para obtener los ciudads
    }, []);

    const itemsPerPage = 8;
    const filteredData = companias.filter((row) =>
        row.compania.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarCompania = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${backURL}/api/agregarCompania`, { compania: compania });
            setCompania(''); // Resetea el input después de enviar el ciudad
            fetchCompanias(); // Actualiza la lista de ciudads
        } catch (error) {
            console.error('Error al agregar ciudad:', error);
            setError('Error al agregar ciudad');
        }
    };

    return (
        <div className="formularioschicos">
            <div className='titulo-estandar'><h1>Compañias Aereas</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarCompania} >
                    <div className='div-moneda'>
                        <input className='input_buscar'
                            type="text"
                            placeholder="Ingrese la Compañia Aerea"
                            value={compania}
                            onChange={(e) => setCompania(e.target.value)}
                        />
                        <button type='submit' className="add-button">➕</button>
                    </div>
                </form>

                <table className='tabla-monedas'>
                    <thead>
                        <tr>
                            <th>Compañias</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idcompanias}>
                                <td>{row.compania}</td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idcompanias)}>❌</button>
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

export default CompaniaAerea;
