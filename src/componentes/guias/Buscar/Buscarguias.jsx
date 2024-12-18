import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import './Buscarguias.css';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import ModalVerGuiaImpo from '../../modales/ModalVerGuiaImpo';
import ModalModificarGuiaImpo from '../../modales/ModalModificarGuiaImpo';
import ModalAlerta from '../../modales/Alertas';
import 'react-toastify/dist/ReactToastify.css';

const PreviewGuias = () => {
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
        console.log(guia)
        setModalMessage('Estás seguro de eliminar la guia '+ guia.guia );
        setModalType('confirm');
        setIsModalOpen(true);
        setGuiaAEliminar(guia);
    };
    const handleConfirmDelete = async () => {
        try {
          const response = await axios.delete(`http://localhost:3000/api/eliminarGuia/${guiaAEliminar.idguia}`); // Realiza la solicitud DELETE
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
            const response = await axios.get(`http://localhost:3000/api/previewguias`);
            console.log(response.data);
            setGuias(response.data);
        } catch (err) {
            console.error('Error al obtener facturas:', err);
            setError('No se pudieron cargar las facturas.');
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



    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(0);
    };

    const filteredGuias = Array.isArray(guias)
        ? guias.filter((row) =>
            (row.guia && row.guia.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (row.consignatario && row.consignatario.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (row.destinoguia && row.destinoguia.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : [];

    return (
        <div className="Contenedor_Principal">
            <ToastContainer />
            <div className='titulo-estandar'><h1>Buscar Guías</h1></div>
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
                    <table className='tabla-guias'>
                        <thead>
                            <tr>
                                <th>Guía</th>
                                <th>Vuelo</th>
                                <th>Cliente</th>
                                <th>Destino</th>
                                <th>Monto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGuias.map((row) => (
                                <tr key={row.idguia}>
                                    <td>{row.guia}</td>
                                    <td>{row.nombreVuelo + ' Fecha: ' + row.fechavuelo}</td>
                                    <td>{row.consignatario}</td>
                                    <td>{row.destinoguia}</td>
                                    <td>{row.total + " " + row.moneda}</td>

                                    <td>
                                        <div className="action-buttons">
                                            <button type="button" className="action-button" onClick={() => openModalVer(row.guia)}  >🔍</button>
                                            <button type="button" className="action-button" onClick={() => openModalModificar(row.guia)}>✏️</button>
                                            <button className="action-button"  onClick={() => openModalConfirmDelete(row)}>❌</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
    
            {/* Modal para modificar */}
            <ModalModificarGuiaImpo
                isOpen={isModalOpenModificar}
                closeModal={closeModalModificar}
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
            


        </div>
    );
};

export default PreviewGuias;
