import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import './Buscarguias.css';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import ModalVerGuiaImpo from '../../modales/ModalVerGuiaImpo';
import ModalModificarGuiaImpo from '../../modales/ModalModificarGuiaImpo';
import ModalVerGuiaExpo from '../../modales/ModalVerGuiaExpo';
import ModalModificarGuiaExpo from '../../modales/ModalModificarGuiaExpo';
import ModalAlerta from '../../modales/Alertas';
import 'react-toastify/dist/ReactToastify.css';


const PreviewGuias = () => {
    const backURL = import.meta.env.VITE_BACK_URL;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [guias, setGuias] = useState([]);
    const [error, setError] = useState('');
    const [loadingtabla, setLoadingTabla] = useState(true);
    //Estados para las alertas
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('alert'); // 'alert' o 'confirm'
    const [guiaAEliminar, setGuiaAEliminar] = useState([]);

    //Funcion para modal de eliminar
    const openModalConfirmDelete = (guia) => {
        if (guia.facturada != 1) {
            console.log(guia)
            setModalMessage('Estás seguro de eliminar la guia ' + guia.guia);
            setModalType('confirm');
            setIsModalOpen(true);
            setGuiaAEliminar(guia);
        } else {
            toast.error("No se puede eliminar una guia facturada.")
        }

    };
    const handleConfirmDelete = async () => {
        try {
            let response; // Declarar la variable antes del bloque if-else

            if (guiaAEliminar.tipo === 'IMPO') {
                response = await axios.delete(`${backURL}/api/eliminarGuia/${guiaAEliminar.idguia}`);
            } else {
                response = await axios.delete(`${backURL}/api/eliminarGuiaExpo/${guiaAEliminar.idguiasexpo}`);
            }

            if (response.status === 200) {
                console.log('Guía eliminada:', guiaAEliminar);
                toast.success('Guía eliminada exitosamente');
                closeModal();
                fetchGuias();
            }
        } catch (error) {
            console.error('Error eliminando la guía:', error);
            toast.error('No se pudo eliminar la guía, por favor intenta nuevamente.');
        }
    };

    //Funcion para el modal de alerta
    const openModalAlert = (message) => {
        setModalMessage(message);
        setModalType('alert');
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
        setModalType('alert');
        setGuiaAEliminar([]);
    };

    const [isImpo, setIsImpo] = useState(true);

    const toggleSwitch = () => {
        setIsImpo((prevState) => !prevState);
    };

    // Función para obtener las Guias
    const fetchGuias = async () => {
        try {
            setLoadingTabla(true); // Activar indicador de carga

            // Hacer solicitudes a ambos endpoints
            const [guiasImpoResponse, guiasExpoResponse] = await Promise.all([
                axios.get(`${backURL}/api/previewguias`), // Endpoint para guías impo
                axios.get(`${backURL}/api/previewguiasexpo`) // Endpoint para guías expo
            ]);

            // Combinar los datos de ambas respuestas
            const combinedGuias = [
                ...guiasImpoResponse.data,
                ...guiasExpoResponse.data
            ];

            // Actualizar el estado con las guías combinadas
            setGuias(combinedGuias);
            console.log(combinedGuias);

        } catch (err) {
            console.error('Error al obtener las guías:', err);
            setError('No se pudieron cargar las guías.');
        } finally {
            setLoadingTabla(false); // Desactivar indicador de carga
        }
    };

    // Llama a fetchFacturas al cargar el componente
    useEffect(() => {
        fetchGuias();
    }, []);

    //Estados para controlar si esta abierto el modal de modificar
    const [isModalOpenModificar, setIsModalOpenModificar] = useState(false);
    const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);

    const openModalModificar = (guia) => {
        setGuiaSeleccionada(guia);
        setIsModalOpenModificar(true);
    };
    const closeModalModificar = () => {
        setIsModalOpenModificar(false);
        setGuiaSeleccionada(null);
        fetchGuias();
    };
    const closeModalModificarSinRecarga = () => {
        setIsModalOpenModificar(false);
        setGuiaSeleccionada(null);

    };


    const [isModalOpenModificarExpo, setIsModalOpenModificarExpo] = useState(false);

    const openModalModificarExpo = (guia) => {
        setGuiaSeleccionada(guia);
        setIsModalOpenModificarExpo(true);
    };
    const closeModalModificarExpo = () => {
        setIsModalOpenModificarExpo(false);
        setGuiaSeleccionada(null);
        fetchGuias();
    };
    const closeModalModificarExposinrecarga = () => {
        setIsModalOpenModificarExpo(false);
        setGuiaSeleccionada(null);

    };
    //Estados para el modal de ver 
    const [isModalOpenVer, setIsModalOpenVer] = useState(false);
    const openModalVer = (guia) => {
        setGuiaSeleccionada(guia);
        setIsModalOpenVer(true);
    };
    const closeModalVer = () => {
        setIsModalOpenVer(false);
        setGuiaSeleccionada(null);
    };

    //Estados para el modal de ver 
    const [isModalOpenVerExpo, setIsModalOpenVerExpo] = useState(false);
    const openModalVerExpo = (guia) => {
        setGuiaSeleccionada(guia);
        setIsModalOpenVerExpo(true);
    };
    const closeModalVerExpo = () => {
        setIsModalOpenVerExpo(false);
        setGuiaSeleccionada(null);
    };



    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(0);
    };

    const filteredGuias = Array.isArray(guias)
        ? guias.filter((row) =>
            (row.tipo === (isImpo ? 'IMPO' : 'EXPO')) &&  // Filtrar por tipo
            (
                (row.guia && row.guia.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (row.consignatario && row.consignatario.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (row.destinoguia && row.destinoguia.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        )
        : [];

    return (
        <div className="Contenedor_Principal">
            <ToastContainer />
            <div className='titulo-estandar-grande'><h1>Buscar Guías</h1></div>
            {loadingtabla ? (
                <div className="loading-spinner">
                    {/* El spinner se muestra cuando loading es true */}
                </div>
            ) : (
                <div className="table-container">
                    <div className="search-bar">
                        <div className="search-left">
                            <div className="switch-container">
                                <span className={`label ${isImpo ? 'active' : ''}`}>Impo</span>
                                <div
                                    className={`switch ${isImpo ? 'impo' : 'expo'}`}
                                    onClick={toggleSwitch}
                                >
                                    <div className="slider"></div>
                                </div>
                                <span className={`label ${!isImpo ? 'active' : ''}`}>Expo</span>
                            </div>
                            <input
                                className="input_buscar"
                                type="text"
                                placeholder="Buscar"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className='contenedor-tabla-buscarfacturas'>
                        <table className='tabla-facturas'>
                            <thead>
                                <tr>
                                    <th>Guía</th>
                                    <th>Vuelo</th>
                                    <th>Cliente / Agente</th>
                                    <th>Destino</th>
                                    <th>Tipo</th>
                                    <th>Monto</th>
                                    <th>Total / Guia</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuias.map((row) => (
                                    <tr key={row.idguia}>
                                        <td>{row.guia}</td>
                                        <td>{row.nombreVuelo + ' Fecha: ' + row.fechavuelo_formateada}</td>
                                        <td>{row.consignatario || row.agente}</td>
                                        <td>{row.destinoguia || row.destinovuelo || '-'}</td>
                                        <td>{row.tipo || '-'}</td>
                                        <td>
                                            {row.moneda
                                                ? (row.idguiasexpo ? row.cobrarpagar : row.total) + " " + 'USD'
                                                : (row.idguiasexpo ? row.cobrarpagar : row.total)+ " " + 'USD'
                                            }
                                        </td>

                                        <td>
                                            {row.moneda
                                                ? (row.idguiasexpo ? row.total : row.totalguia) + " " + 'USD'
                                                : (row.idguiasexpo ? row.total : row.totalguia)+ " " + 'USD'
                                            }
                                        </td>
                                        <td className="td-con-submenu">
                                            <div className="buscarfacturas-submenu-container">
                                                <button disabled className="buscarfacturas-submenu-toggle">☰</button>
                                                <div className="buscarfacturas-submenu">
                                                    <button className='botonsubmenubuscarfactura' onClick={() => row.tipo === "IMPO" ? openModalVer(row.guia) : openModalVerExpo(row.guia)}  >Visualizar Guía</button>
                                                    <button className='botonsubmenubuscarfactura' onClick={() => row.tipo === "IMPO" ? openModalModificar(row.guia) : openModalModificarExpo(row.guia)}>Modificar Guía</button>
                                                    <button className='botonsubmenubuscarfactura' onClick={() => openModalConfirmDelete(row)}>Eliminar Guía</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                </div>
            )}

            {/* Modal para modificar */}
            <ModalModificarGuiaImpo
                isOpen={isModalOpenModificar}
                closeModal={closeModalModificar}
                closeModalSinrecarga={closeModalModificarSinRecarga}
                guia={guiaSeleccionada}
            />
            <ModalVerGuiaImpo
                isOpen={isModalOpenVer}
                closeModal={closeModalVer}
                guia={guiaSeleccionada}
            />
            <ModalAlerta
                isOpen={isModalOpen}
                message={modalMessage}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancel}
                type={modalType}
            />
            <ModalVerGuiaExpo
                isOpen={isModalOpenVerExpo}
                closeModal={closeModalVerExpo}
                guia={guiaSeleccionada}
            />

            <ModalModificarGuiaExpo
                isOpen={isModalOpenModificarExpo}
                closeModal={closeModalModificarExpo}
                closeModalSinrecarga={closeModalModificarExposinrecarga}
                guia={guiaSeleccionada}
            />


        </div>
    );
};

export default PreviewGuias;
