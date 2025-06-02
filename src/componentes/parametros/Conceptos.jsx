import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './monedas.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './conceptos.css';

const Conceptos = ({ isLoggedIn }) => {

    const navigate = useNavigate();

    useEffect(() => {
        const rol = localStorage.getItem('rol');

        if (rol !== 'admin') {
            // Si no es admin, redirigir al home
            navigate('/home');
        }
    }, [navigate]);

    const [codigo, setCodigo] = useState('');
    const [codigoGIA, setCodigoGIA] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [conceptos, setConceptos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [monedas, setMonedas] = useState([]);
    const [error, setError] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const backURL = import.meta.env.VITE_BACK_URL;
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const [selectedIva, setSelectedIva] = useState("iva_basica");

    const handleIvaChange = (e) => {
        setSelectedIva(e.target.value);
    };

    const handleEliminar = async (id) => {
        try {
            await axios.delete(`${backURL}/api/eliminarconcepto/${id}`); // Endpoint de eliminación de concepto
            fetchConceptos(); // Actualiza la lista de conceptos después de eliminar
        } catch (error) {
            console.error('Error al eliminar concepto:', error);
            setError('Error al eliminar concepto');
        }
    };

    const fetchConceptos = async () => {
        try {
            const response = await axios.get(`${backURL}/api/previewconceptos`); // Cambia este endpoint según tu backend
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
            toast.error("Por favor, completa todos los campos.");
            return;
        }

        try {
            const response = await axios.post(`${backURL}/api/agregarconcepto`, {
                codigo,
                codigoGIA,
                descripcion,
                selectedIva
            });

            toast.success("Concepto agregado con éxito!");
            setCodigo("");
            setCodigoGIA("");
            setDescripcion("");
            setSelectedIva("iva_basica");
            fetchConceptos();
        } catch (error) {
            console.error("Error al agregar el concepto:", error);
            toast.error("Error al agregar el concepto.");
        }
    };

    return (
        <div className="formulariosgrandes">
            <ToastContainer />
            <div className='titulo-estandar'><h1>Conceptos</h1></div>

            <div className='table-container'>
                <form onSubmit={handleAgregarConcepto} >
                    <div className='div-primerrenglon-datos-comprobante'>
                        <div>
                            <input className='selectIvaconcepto'
                                type="text"
                                placeholder="Código interno"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                            />
                        </div>
                        <div>
                            <input className='selectIvaconcepto'
                                type="text"
                                placeholder="Código GIA"
                                value={codigoGIA}
                                onChange={(e) => setCodigoGIA(e.target.value)}
                            />
                        </div>
                        <div>
                            <input className='selectIvaconcepto'
                                type="text"
                                placeholder="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>
                        <div >
                            <select
                                id="selectIva"
                                value={selectedIva}
                                onChange={handleIvaChange}
                                className='selectIvaconcepto'
                            >
                                <option value="iva_basica">IVA Básica 22%</option>
                                <option value="iva_minimo">IVA Mínimo 10%</option>
                                <option value="exento">Exento</option>
                            </select>
                        </div>
                        <button type='submit' className="btn-estandar">Agregar</button>

                    </div>

                </form>
                <div className="table-containerSinCobrar">
                    <table className='tabla-guiassinfacturar'>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Código GIA</th>
                                <th>Descripción</th>
                                <th>Impuesto</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedItems.map((row) => (
                                <tr key={row.idconcepto}>
                                    <td>{row.codigo}</td>
                                    <td>{row.codigoGIA}</td>
                                    <td>{row.descripcion}</td>
                                    <td>
                                        {{
                                            iva_basica: "IVA Básica 22%",
                                            iva_minimo: "IVA Mínimo 10%",
                                            exento: "Exento"
                                        }[row.impuesto] || "Sin definir"}
                                    </td>
                                    <td>
                                        <button className="action-button" onClick={() => handleEliminar(row.idconcepto)}>❌</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default Conceptos;
