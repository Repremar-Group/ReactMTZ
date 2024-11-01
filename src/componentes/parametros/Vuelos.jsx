import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './vuelos.css';

const Vuelos = ({ isLoggedIn }) => {
    const [vuelo, setVuelo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [vuelos, setVuelos] = useState([]);
    const [error, setError] = useState('');

    const [companias, setCompanias] = useState([]);
    const [companiaSeleccionada, setCompaniaSeleccionada] = useState('');
    const [isFetchedCompanias, setIsFetchedCompanias] = useState(false); // Para evitar múltiples llamadas

    const fetchCompanias = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/obtenercompanias');
            setCompanias(response.data);
            setIsFetchedCompanias(true); // Indica que ya se obtuvieron los datos
        } catch (error) {
            console.error('Error al obtener monedas:', error);
        }
    }

    const handleEliminar = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/eliminarvuelo/${id}`);
            fetchVuelos(); // Actualiza la lista de vuelos después de eliminar
        } catch (error) {
            console.error('Error al eliminar vuelo:', error);
            setError('Error al eliminar vuelo');
        }
    };

    const fetchVuelos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/previewvuelos'); // Cambia este endpoint según tu backend
            setVuelos(response.data); // Asigna los datos de vuelos al estado
        } catch (err) {
            setError('Error fetching flights');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchVuelos(); // Llama a la función para obtener los vuelos
    }, []);

    const itemsPerPage = 8;
    const filteredData = vuelos.filter((row) =>
        row.vuelo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarVuelo = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/agregarVuelo', { vuelo: vuelo, compania: companiaSeleccionada });
            setVuelo(''); // Resetea el input después de enviar el vuelo
            fetchVuelos(); // Actualiza la lista de vuelos
        } catch (error) {
            console.error('Error al agregar vuelo:', error);
            setError('Error al agregar vuelo');
        }
    };

    return (
        <div className="formularioschicos">
            <div className='titulo-estandar'><h1>Vuelos</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarVuelo} >
                    <div className='div-vuelo'>
                        <input className='input_buscar'
                            type="text"
                            placeholder="Agregar Vuelo"
                            value={vuelo}
                            onChange={(e) => setVuelo(e.target.value)}
                            required
                        />

                        <button type='submit' className="add-button">➕</button>
                    </div>
                    <div>
                        <select
                            className="select-compania"
                            id="companias"
                            required
                            value={companiaSeleccionada}
                            onChange={(e) => setCompaniaSeleccionada(e.target.value)}
                            onClick={() => {
                                if (!isFetchedCompanias) fetchCompanias();
                            }}
                        >
                            <option value="">Seleccione una compañía</option>
                            {companias.map((compania, index) => (
                                <option key={index} value={compania.compania}>
                                    {compania.compania}
                                </option>
                            ))}
                        </select>
                    </div>

                </form>

                <table className='tabla-vuelos'>
                    <thead>
                        <tr>
                            <th>Vuelo</th>
                            <th>Compañia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idVuelos}>
                                <td>{row.vuelo}</td>
                                <td>{row.compania}</td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idVuelos)}>❌</button>
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

export default Vuelos;
