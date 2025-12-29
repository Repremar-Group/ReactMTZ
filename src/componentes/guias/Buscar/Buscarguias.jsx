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
import Swal from 'sweetalert2';
import JSZip from 'jszip';

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
    const [soloSinNotificar, setSoloSinNotificar] = useState(false);
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

    const descargarFacturasZip = async (guia) => {
        const resp = await axios.get(`${backURL}/api/guias/facturas-base64`, {
            params: { idguia: guia.idguia }
        });

        if (!resp.data.length) {
            toast.info('La guía no tiene facturas asociadas');
            return;
        }

        const zip = new JSZip();

        resp.data.forEach(factura => {
            zip.file(
                factura.nombreArchivo,
                factura.base64,
                { base64: true }
            );
        });

        const contenidoZip = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(contenidoZip);
        link.download = `Facturas_${guia.guia}.zip`;
        link.click();
    };
    const notificarPorEmail = async (row) => {
        await descargarFacturasZip(row);
        let costoGuia;
        let cliente;
        if (row.tipo == 'EXPO') {
            costoGuia = row.cobrarpagar;
            cliente = row.agente
        } else {
            costoGuia = row.total;
            cliente = row.consignatario
        }

        try {
            const resp = await axios.get(
                `${backURL}/api/clientes/emailrazonsocial`,
                {
                    params: {
                        razonSocial: cliente
                    }
                }
            );
            console.log(resp.data);

            const destinatarios = resp?.data?.email?.trim();

            if (!destinatarios) {
                toast.error(`El cliente "${cliente}" no tiene email configurado`);
                return;
            }
            const asunto = `Notificación de arribo - ${row.guia}`;
            const cuerpo = `Buenos días estimados.\n\nNotificamos arribo de carga en asunto. \nArribada con ${row.nombreVuelo} el ${row.fechavuelo_formateada}.\nGastos terminales USD ${costoGuia}.\n\nDatos bancarios:\nItaú cuenta corriente USD\n0584536 KIXOLER SA\n\nUna vez reciba el comprobante, les paso factura, recibo y transferido.\n\nMuchas gracias.\nSaludos.`;


            const mailtoLink = `mailto:${destinatarios}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

            window.location.href = mailtoLink;


            setTimeout(async () => {
                // 3️⃣ Confirmación manual
                const result = await Swal.fire({
                    title: 'Confirmación de envío',
                    text: '¿Enviaste el correo?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, enviado',
                    cancelButtonText: 'No'
                });

                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Confirmado',
                        text: 'El envío fue confirmado por el usuario'
                    });

                    try {
                        await axios.post(`${backURL}/api/guiasimpo/marcar-notificada`, {
                            guia: row.guia
                        });
                        window.location.reload();
                    } catch (err) {
                        console.error('Error marcando guía como notificada', err);
                        toast.error('No se pudo marcar la guía como notificada');
                    }


                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'No enviado',
                        text: 'El correo no fue enviado'
                    });
                }
            }, 1500);
        } catch (error) {
            console.error('Error obteniendo mail del cliente', error);
            toast.error(`No se pudo obtener el email para ${cliente}`);
        }
    };
    const notificada = async (row) => {

        setTimeout(async () => {
            // 3️⃣ Confirmación manual
            const result = await Swal.fire({
                title: 'Confirmación de notificación',
                text: '¿Notifico al cliente?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, notifique',
                cancelButtonText: 'No'
            });

            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Confirmado',
                    text: 'La Notificación fue confirmada por el usuario'
                });

                try {
                    await axios.post(`${backURL}/api/guiasimpo/marcar-notificada`, {
                        guia: row.guia
                    });
                    window.location.reload();
                } catch (err) {
                    console.error('Error marcando guía como notificada', err);
                    toast.error('No se pudo marcar la guía como notificada');
                }


            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'No Notificado',
                    text: 'El cliente no fue notificado'
                });
            }
        }, 0);
    };

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
            ) &&

            // Filtro “Sin notificar” (solo si el check está activo)
            (!soloSinNotificar || !row.notificada)
        )

            //  Ordenar: sin notificar arriba, luego por fecha
            .sort((a, b) => {
                // primero sin notificar
                if (a.notificada !== b.notificada) {
                    return a.notificada ? 1 : -1;
                }

                // luego por fecha (más vieja arriba)
                return new Date(a.fecha) - new Date(b.fecha);
            })
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
                            {isImpo && (
                                <label className="checkbox-estandar">
                                    <input
                                        type="checkbox"
                                        checked={soloSinNotificar}
                                        onChange={(e) => setSoloSinNotificar(e.target.checked)}
                                    />
                                    Sin notificar
                                </label>
                            )}
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
                        <table className='tabla-busguias'>
                            <thead>
                                <tr>
                                    <th>Guía</th>
                                    <th>Vuelo</th>
                                    <th>Cliente / Agente</th>
                                    <th>Destino</th>
                                    <th>Tipo</th>
                                    <th>Monto</th>
                                    <th>Total / Guia</th>
                                    <th>Facturada</th>
                                    {isImpo && <th>Notificada</th>}
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuias.map((row, index) => (
                                    <tr key={row.idguia}>
                                        <td>{row.guia}</td>
                                        <td>{row.nombreVuelo + ' Fecha: ' + row.fechavuelo_formateada}</td>
                                        <td>{row.consignatario || row.agente}</td>
                                        <td>{row.destinoguia || row.destinovuelo || '-'}</td>
                                        <td>{row.tipo || '-'}</td>
                                        <td>
                                            {row.moneda
                                                ? (row.idguiasexpo ? row.cobrarpagar : row.total) + " " + 'USD'
                                                : (row.idguiasexpo ? row.cobrarpagar : row.total) + " " + 'USD'
                                            }
                                        </td>

                                        <td>
                                            {row.moneda
                                                ? (row.idguiasexpo ? row.total : row.totalguia) + " " + 'USD'
                                                : (row.idguiasexpo ? row.total : row.totalguia) + " " + 'USD'
                                            }
                                        </td>
                                        <td>{row.facturada ? '✔️' : '❌'}</td>
                                        {isImpo && (
                                            <td>{row.notificada ? '✔️' : '❌'}</td>
                                        )}
                                        <td className="td-con-submenuguias">
                                            <div className="buscarguias-submenu-container">
                                                <button disabled className="buscarguias-submenu-toggle">☰</button>
                                                <div className={`buscarguias-submenu ${index < 1 ? 'submenu-ajustado' : ''
                                                    }`}
                                                >
                                                    {isImpo && row.facturada == 1 && row.notificada == 0 && (
                                                        <button
                                                            className='botonsubmenubuscarfactura'
                                                            onClick={() => notificarPorEmail(row)}
                                                        >
                                                            Notificar
                                                        </button>
                                                    )}
                                                    {isImpo && row.facturada == 1 && row.notificada == 0 && (
                                                        <button
                                                            className='botonsubmenubuscarfactura'
                                                            onClick={() => notificada(row)}
                                                        >
                                                            Notificada
                                                        </button>
                                                    )}

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
