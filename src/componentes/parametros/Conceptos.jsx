import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './monedas.css';

const Conceptos = ({ isLoggedIn }) => {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [conceptos, setConceptos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [monedas, setMonedas] = useState([]);
    const [error, setError] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleEliminar = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/eliminarconcepto/${id}`); // Endpoint de eliminación de concepto
            fetchConceptos(); // Actualiza la lista de conceptos después de eliminar
        } catch (error) {
            console.error('Error al eliminar concepto:', error);
            setError('Error al eliminar concepto');
        }
    };

    const fetchConceptos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/previewconceptos'); // Cambia este endpoint según tu backend
            setConceptos(response.data); // Asigna los datos de conceptos al estado
            console.log('Conceptos desde la base:', response.data);
        } catch (err) {
            setError('Error fetching conceptos');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConceptos(); // Llama a la función para obtener los conceptos
    }, []);

    const itemsPerPage = 8;
    const filteredData = conceptos.filter((row) =>
        row.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const displayedItems = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleAgregarConcepto = async (e) => {
        e.preventDefault();

        if (!codigo.trim() || !descripcion.trim()) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/agregarconcepto", {
                codigo,
                descripcion,
                exento: isChecked, // Enviamos true o false
            });

            alert("Concepto agregado con éxito!");
            setCodigo("");
            setDescripcion("");
            setIsChecked(false);
            fetchConceptos();
        } catch (error) {
            console.error("Error al agregar el concepto:", error);
            alert("Error al agregar el concepto.");
        }
    };

    return (
        <div className="formulariosmedianos">
            <div className='titulo-estandar'><h1>Conceptos</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarConcepto} >
                    <div className='div-primerrenglon-datos-comprobante'>
                        <div>
                            <input className='input_buscar'
                                type="text"
                                placeholder="Código del Concepto"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                            />
                        </div>
                        <div>
                            <input className='input_buscar'
                                type="text"
                                placeholder="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label htmlFor="Checkboxexento" style={{ display: "flex", alignItems: "center" }}>
                                Exento
                            </label>
                            <input
                                type="checkbox"
                                id="Checkboxexento"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                                style={{ transform: "scale(1.2)", verticalAlign: "middle" }} // Ajusta el tamaño y alineación
                            />
                        </div>
                        <button type='submit' className="btn-estandar">Agregar</button>

                    </div>
                    <div className='div-moneda'>


                    </div>

                </form>

                <table className='tabla-monedas'>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Exento</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((row) => (
                            <tr key={row.idconcepto}>
                                <td>{row.codigo}</td>
                                <td>{row.descripcion}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={row.exento === 1} // Marca el checkbox si 'exento' es 1
                                        disabled // Hace que el checkbox sea solo de lectura (no editable)
                                    />
                                </td>
                                <td>
                                    <button className="action-button" onClick={() => handleEliminar(row.idconcepto)}>❌</button>
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

export default Conceptos;
