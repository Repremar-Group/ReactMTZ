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
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ModificarFacturasManuales from '../facturas_manuales/ModificarFacturasManuales';
import { impactarReciboEnGIA } from '../../../ConexionGFE/Funciones';

const BuscarRecibos = () => {
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

    //Estados para Modal Modificar Factura
    const [isModalOpenModificarFactura, SetIsModalOpenModificarFactura] = useState(false);
    const [facturaamodificar, setFacturaAModificar] = useState([]);
    const onCloseModificarFactura = () => {
        SetIsModalOpenModificarFactura(false);

    };
    const onFinallyModificarFactura = () => {
        SetIsModalOpenModificarFactura(false);
        fetchFacturas();
    };
    const handleSuccess = () => {
        toast.success('Factura actualizada correctamente', {
            autoClose: 1500,
            onClose: () => {
                onCloseModificarFactura();  // cerrar modal cuando la toast desaparezca
                onFinallyModificarFactura(); // hacer otras cosas si querés (recargar, etc)
            },
        });
    };
    const handleError = () => {
        toast.error('Ocurrió un error al actualizar', {
            autoClose: 1500,
            onClose: () => {
                onCloseModificarFactura();
            },
        });
    };

    const [loadingEnvioGFE, setLoadingEnvioGFE] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState('');
    const [loadingtabla, setLoadingTabla] = useState(true);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
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
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const handleFechaDesdeChange = (e) => {
        setFechaDesde(e.target.value);
    };

    const handleFechaHastaChange = (e) => {
        setFechaHasta(e.target.value);
        setBusquedaRealizada(true);
    };

    const handleCheckboxChange = (e) => {
        setSearchField(e.target.value);
        setBusquedaRealizada(true);
    };



    const descargarFacturasEnZip = async (facturas) => {
        const zip = new JSZip();
        let descargadas = 0;
        let omitidas = 0;

        facturas.forEach((factura, index) => {
            if (factura.PdfBase64 && factura.NumeroCFE) {
                // Limpiar el base64 (eliminar encabezado si lo tiene)
                const base64Data = factura.PdfBase64.includes(',')
                    ? factura.PdfBase64.split(',')[1]
                    : factura.PdfBase64;

                const nombreArchivo = `${factura.NumeroCFE}_${index + 1}.pdf`;

                // Convertir correctamente base64 a binario
                zip.file(nombreArchivo, base64Data, { base64: true });

                descargadas++;
            } else {
                omitidas++;
            }
        });

        if (descargadas > 0) {
            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, 'facturas.zip');
        }

        if (descargadas > 0 || omitidas > 0) {
            toast.info(`Se descargaron ${descargadas} factura(s). ${omitidas > 0 ? omitidas + ' omitida(s) por falta de PDF.' : ''}`);
        }
    };

    // Función para obtener las Guias
    const fetchFacturas = async () => {
        try {
            setLoadingTabla(true); // Activar indicador de carga

            // Hacer solicitudes a ambos endpoints
            const response = await axios.get(`${backURL}/api/previewRecibos`);// Endpoint para guías expo


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
        setBusquedaRealizada(true);
    };
    const facturasFiltradas = facturas.filter((factura) => {
        const term = searchTerm.toLowerCase();

        const matchesSearch = searchTerm.trim() === ''
            ? true
            : searchField === 'idrecibo'
                ? factura.numeroDocumentoCFE?.toString().toLowerCase().includes(term)
                : searchField === 'RazonSocial'
                    ? factura.razonsocial?.toLowerCase().includes(term)
                    : searchField === 'Rut'
                        ? factura.rut?.toLowerCase().includes(term)
                        : searchField === 'Formulario'
                            ? factura.tipoDocumentoCFE?.toLowerCase().includes(term)
                            : true;

        const fechaFactura = new Date(factura.fecha.split('/').reverse().join('-')); // Convierte dd/mm/yyyy a yyyy-mm-dd
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;

        const matchesFechaDesde = desde ? fechaFactura >= desde : true;
        const matchesFechaHasta = hasta ? fechaFactura <= hasta : true;

        return matchesSearch && matchesFechaDesde && matchesFechaHasta;
    });
    useEffect(() => {
        const filtrosVacios =
            searchTerm.trim() === '' &&
            !fechaDesde &&
            !fechaHasta &&
            searchField === '';

        setBusquedaRealizada(!filtrosVacios);
    }, [searchTerm, fechaDesde, fechaHasta, searchField]);

    return (
        <div className="Contenedor_Principal">
            {loadingEnvioGFE && (
                <div className="overlaybuscarfactura">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <ToastContainer />
            <div className='titulo-estandar'><h1>Buscar Recibos</h1></div>
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
                                        value="Rut"
                                        checked={searchField === 'Rut'}
                                        onChange={handleCheckboxChange}
                                    />
                                    RUT
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="Formulario"
                                        checked={searchField === 'Formulario'}
                                        onChange={handleCheckboxChange}
                                    />
                                    Formulario
                                </label>
                                <div className="fecha-rango">
                                    <label>Desde:</label>
                                    <input type="date" value={fechaDesde} onChange={handleFechaDesdeChange} />
                                    <label>Hasta:</label>
                                    <input type="date" value={fechaHasta} onChange={handleFechaHastaChange} />
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className='contenedor-tabla-buscarfacturas'>
                        <table className='tabla-facturas'>
                            <thead>
                                <tr>
                                    <th>Nro. Recibo</th>
                                    <th>Formulario</th>
                                    <th>Cliente</th>
                                    <th>Rut</th>
                                    <th>Fecha</th>
                                    <th>Importe</th>
                                    <th>Moneda</th>
                                    <th>Estado GFE</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturasFiltradas.map((row) => (
                                    <tr key={row.Id}>
                                        <td>{row.nrorecibo === null
                                            ? '-' : row.nrorecibo}</td>
                                        <td>{row.nroformulario === null
                                            ? '-' : row.nroformulario}</td>
                                        <td>{row.razonsocial === null
                                            ? '-' : row.razonsocial}
                                        </td>
                                        <td>{row.rut === null
                                            ? '-' : row.rut}</td>
                                        <td>{row.fecha}</td>
                                        <td>{row.importe}</td>
                                        <td>{row.moneda}</td>
                                        <td>{row.numeroDocumentoCFE ? '✔️' : '❌'}</td>
                                        <td className="td-con-submenu">
                                            <div className="buscarfacturas-submenu-container">
                                                <button disabled className="buscarfacturas-submenu-toggle">☰</button>
                                                <div className="buscarfacturas-submenu">
                                                    {row.numeroDocumentoCFE && (
                                                        <button className='botonsubmenubuscarfactura' onClick={() => descargarPDFBase64(row.PdfBase64, row.NumeroCFE)}>Ver</button>
                                                    )}

                                                    {!row.numeroDocumentoCFE && (
                                                        <button
                                                            className='botonsubmenubuscarfactura'
                                                            onClick={async () => {
                                                                try {
                                                                    setLoadingEnvioGFE(true);
                                                                    console.log('Factura antes del back', row);
                                                                    const response = await impactarReciboEnGIA(row.idrecibo, backURL);
                                                                    if (response.success) {
                                                                        setTituloAlertaGfe('Recibo Impactado Correctamente');
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
                                                    {!row.numeroDocumentoCFE && (
                                                        <button
                                                            className='botonsubmenubuscarfactura'
                                                            onClick={async () => {
                                                                try {
                                                                    const response = await axios.get(`${backURL}/api/obtenerModificarFactura?id=${row.Id}`);
                                                                    setFacturaAModificar(response.data);
                                                                    setLoadingEnvioGFE(true);
                                                                    SetIsModalOpenModificarFactura(true)
                                                                } catch {

                                                                } finally {
                                                                    setLoadingEnvioGFE(false);
                                                                }
                                                            }
                                                            }
                                                        >
                                                            Modificar
                                                        </button>
                                                    )}
                                                    {!row.numeroDocumentoCFE && (
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
                    <ModificarFacturasManuales
                        isOpen={isModalOpenModificarFactura}
                        onClose={onCloseModificarFactura}
                        onFinally={onFinallyModificarFactura}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        factura={facturaamodificar}
                    />

                </div>
            )}


        </div>
    );
};

export default BuscarRecibos;
