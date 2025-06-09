import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import './BuscarFacturas.css';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import ModalVerGuiaImpo from '../../modales/ModalVerGuiaImpo';
import ModalModificarGuiaImpo from '../../modales/ModalModificarGuiaImpo';
import ModalVerGuiaExpo from '../../modales/ModalVerGuiaExpo';
import ModalModificarGuiaExpo from '../../modales/ModalModificarGuiaExpo';
import ModalAlerta from '../../modales/Alertas';
import ModalAlertaGFE from '../../modales/AlertasGFE';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { descargarPDFBase64, impactarEnGIA } from '../../../ConexionGFE/Funciones';

const BuscarFacturas = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const rol = localStorage.getItem('rol');

        if (rol == '') {
            navigate('/');
        }
    }, [navigate]);

    const [submenuVisibleId, setSubmenuVisibleId] = useState(null);

    const toggleSubmenu = (id) => {
        setSubmenuVisibleId((prevId) => (prevId === id ? null : id));
    };
    const backURL = import.meta.env.VITE_BACK_URL;
    const [loadingEnvioGFE, setLoadingEnvioGFE] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState('');
    const [loadingtabla, setLoadingTabla] = useState(true);
    //Estados para Modal Alerta GFE
    const [isModalOpenAlertaGFE, setIsModalOpenAlertaGFE] = useState(false);
    const [tituloAlertaGfe, setTituloAlertaGfe] = useState('');
    const [mensajeAlertaGFE, setmensajeAlertaGFE] = useState('');
    const [iconoAlertaGFE, setIconoAlertaGFE] = useState('');
    const handleConfirmAlertaGFE = () => {
        setIsModalOpenAlertaGFE(false);
        fetchFacturas();
    };
    //Estados para las alertas
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('alert'); // 'alert' o 'confirm'
    const [guiaAEliminar, setGuiaAEliminar] = useState([]);
    //Estados para los filtros
    const [searchField, setSearchField] = useState('');

    const handleCheckboxChange = (e) => {
        setSearchField(e.target.value);
    };



    // Función para obtener las Guias
    const fetchFacturas = async () => {
        try {
            setLoadingTabla(true); // Activar indicador de carga

            // Hacer solicitudes a ambos endpoints
            const response = await axios.get(`${backURL}/api/previewfacturas`);// Endpoint para guías expo


            // Actualizar el estado con las guías combinadas
            setFacturas(response.data);
            console.log('Facturas desde la Base: ', response.data);

        } catch (err) {
            console.error('Error al obtener las facturas:', err);
            setError('No se pudieron cargar las Facturas.');
        } finally {
            setLoadingTabla(false); // Desactivar indicador de carga
        }
    };

    // Llama a fetchFacturas al cargar el componente
    useEffect(() => {
        fetchFacturas();
    }, []);




    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    const facturasFiltradas = (!searchField || searchTerm.trim() === '')
        ? facturas
        : facturas.filter((row) =>
            row[searchField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="Contenedor_Principal">
            {loadingEnvioGFE && (
                <div className="overlaybuscarfactura">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <ToastContainer />
            <div className='titulo-estandar'><h1>Buscar Facturas</h1></div>
            {loadingtabla ? (
                <div className="loading-spinner">
                    {/* El spinner se muestra cuando loading es true */}
                </div>
            ) : (
                <div className="table-container">
                    <div className="search-bar">
                        <div className="search-left">

                            <input
                                className="input_buscar"
                                type="text"
                                placeholder="Buscar"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <div className="filtros">
                                <label>
                                    <input
                                        type="radio"
                                        value="NumeroCFE"
                                        checked={searchField === 'NumeroCFE'}
                                        onChange={handleCheckboxChange}
                                    />
                                    Nro. CFE
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="idrecibo"
                                        checked={searchField === 'idrecibo'}
                                        onChange={handleCheckboxChange}
                                    />
                                    Nro. Recibo
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="RazonSocial"
                                        checked={searchField === 'RazonSocial'}
                                        onChange={handleCheckboxChange}
                                    />
                                    Cliente
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="RutCedula"
                                        checked={searchField === 'RutCedula'}
                                        onChange={handleCheckboxChange}
                                    />
                                    RUT
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="Fecha"
                                        checked={searchField === 'Fecha'}
                                        onChange={handleCheckboxChange}
                                    />
                                    Fecha
                                </label>
                            </div>
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className='contenedor-tabla-buscarfacturas'>
                        <table className='tabla-facturas'>
                            <thead>
                                <tr>
                                    <th>Nro. CFE</th>
                                    <th>Tipo Comprobante CFE</th>
                                    <th>Recibo</th>
                                    <th>Cliente</th>
                                    <th>RUT</th>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Estado GFE</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturasFiltradas.map((row) => (
                                    <tr key={row.Id}>
                                        <td>{row.NumeroCFE === null
                                            ? '-' : row.NumeroCFE}</td>
                                        <td>
                                            {row.TipoDocCFE === 'FCD' ? (
                                                'E-Factura'
                                            ) : (row.TipoDocCFE === 'FCA' || row.TipoDocCFE === 'efacturaca') ? (
                                                'E-Factura Cuenta Ajena'
                                            ) : (row.TipoDocCFE === 'TCD') ? (
                                                'E-Ticket'
                                            ) : row.TipoDocCFE === 'TCA' ? (
                                                'E-Ticket Cuenta Ajena'
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td>{row.idrecibo === null
                                            ? '-' : row.idrecibo}</td>
                                        <td>{row.RazonSocial}</td>
                                        <td>{row.RutCedula}</td>
                                        <td>{row.Fecha}</td>
                                        <td>{[row.Total, row.Moneda].join(' ')}</td>
                                        <td>{row.NumeroCFE ? '✔️' : '❌'}</td>
                                        <td className="td-con-submenu">
                                            <div className="buscarfacturas-submenu-container">
                                                <button disabled className="buscarfacturas-submenu-toggle">☰</button>
                                                <div className="buscarfacturas-submenu">
                                                    {row.NumeroCFE && (
                                                        <button className='botonsubmenubuscarfactura' onClick={() => descargarPDFBase64(row.PdfBase64, row.NumeroCFE)}>Descargar PDF</button>
                                                    )}

                                                    {!row.NumeroCFE && (
                                                        <button
                                                            className='botonsubmenubuscarfactura'
                                                            onClick={async () => {
                                                                try {
                                                                    setLoadingEnvioGFE(true);
                                                                    const response = await impactarEnGIA(row, backURL);
                                                                    if (response.success) {
                                                                        const doc = response.documento;
                                                                        const nombreArchivo = `${doc.tipo}_${doc.serie}_${doc.numero}.pdf`;

                                                                        // Descargar PDF
                                                                        descargarPDFBase64(doc.pdfBase64, nombreArchivo); // asegurate que esta func esté importada

                                                                        // Mostrar alerta
                                                                        setTituloAlertaGfe('Factura Ingresada Correctamente');
                                                                        setmensajeAlertaGFE('');
                                                                        setIconoAlertaGFE('success');
                                                                        setIsModalOpenAlertaGFE(true);
                                                                    } else {
                                                                        // Mostrar error
                                                                        setTituloAlertaGfe('Error al impactar la factura');
                                                                        setmensajeAlertaGFE(response.descripcion || 'Intente nuevamente.');
                                                                        setIconoAlertaGFE('error');
                                                                        setIsModalOpenAlertaGFE(true);
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error inesperado:', error);

                                                                    const descripcion =
                                                                        error?.response?.data?.descripcion ||
                                                                        error?.response?.data?.message ||
                                                                        'Ocurrió un error al comunicarse con el servidor.';

                                                                    setTituloAlertaGfe('Error inesperado');
                                                                    setmensajeAlertaGFE(descripcion);
                                                                    setIconoAlertaGFE('error');
                                                                    setIsModalOpenAlertaGFE(true);
                                                                } finally {
                                                                    setLoadingEnvioGFE(false); // Ocultar overlay
                                                                }
                                                            }}
                                                        >
                                                            Enviar a GFE
                                                        </button>
                                                    )}
                                                    {!row.NumeroCFE && (
                                                        <button className='botonsubmenubuscarfactura' onClick={() => alert(`Enviar PDF de ${row.Id}`)}>
                                                            Modificar
                                                        </button>
                                                    )}
                                                    {!row.NumeroCFE && (
                                                        <button className='botonsubmenubuscarfactura' onClick={() => alert(`Enviar PDF de ${row.Id}`)}>
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ModalAlertaGFE
                        isOpen={isModalOpenAlertaGFE}
                        title={tituloAlertaGfe}
                        message={mensajeAlertaGFE}
                        onConfirm={handleConfirmAlertaGFE}
                        iconType={iconoAlertaGFE}
                    />

                </div>
            )}


        </div>
    );
};

export default BuscarFacturas;
