import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import'./monedas.css';
import { useNavigate } from 'react-router-dom';

const Monedas = ({ isLoggedIn }) => {
    const navigate = useNavigate();
        
    useEffect(() => {
        const rol = localStorage.getItem('rol');
        
        if (rol !== 'admin') {
            // Si no es admin, redirigir al home
                navigate('/home');
            }
        }, [navigate]);
    const [moneda, setMoneda] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [monedas, setMonedas] = useState([]);
    const [error, setError] = useState('');
    const backURL = import.meta.env.VITE_BACK_URL;
    const handleEliminar = async (id) => {
        try {
            await axios.delete(`${backURL}/api/eliminarmoneda/${id}`);
            fetchMonedas(); // Actualiza la lista de ciudads después de eliminar
        } catch (error) {
            console.error('Error al eliminar ciudad:', error);
            setError('Error al eliminar ciudad');
        }
    };

    const fetchMonedas = async () => {
        try {
            const response = await axios.get(`${backURL}/api/previewmonedas`); // Cambia este endpoint según tu backend
            setMonedas(response.data); // Asigna los datos de ciudads al estado
        } catch (err) {
            setError('Error fetching flights');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMonedas(); // Llama a la función para obtener los ciudads
    }, []);

    const itemsPerPage = 8;
    const filteredData = monedas.filter((row) =>
        row.moneda.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarMoneda = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${backURL}/api/agregarMoneda`, { moneda: moneda });
            setMoneda(''); // Resetea el input después de enviar el ciudad
            fetchMonedas(); // Actualiza la lista de ciudads
        } catch (error) {
            console.error('Error al agregar ciudad:', error);
            setError('Error al agregar ciudad');
        }
    };

    return (
        <div className="formularioschicos">
            <div className='titulo-estandar'><h1>Monedas</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarMoneda} >
                    <div className='div-moneda'>
                        <input className='input_buscar'
                            type="text"
                            placeholder="Agregar Moneda"
                            value={moneda}
                            onChange={(e) => setMoneda(e.target.value)}
                        />
                        <button type='submit' className="add-button">➕</button>
                    </div>
                </form>

                <table className='tabla-monedas'>
                    <thead>
                        <tr>
                            <th>Moneda</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idmonedas}>
                                <td>{row.moneda}</td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idmonedas)}>❌</button>
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

export default Monedas;
