import React, { useState, useEffect } from 'react';

const ModalBusquedaEmbarque = ({ showModal, onClose, embarques, onSelectEmbarques }) => {
    const [selectedEmbarques, setSelectedEmbarques] = useState([]); // Estado de los embarques seleccionados

    // Reinicia las selecciones al cambiar el listado de embarques
    useEffect(() => {
        if (showModal) {
            setSelectedEmbarques([]); // Reiniciar el estado de seleccionados
        }
    }, [embarques, showModal]);

    if (!showModal) return null; // Si no debe mostrarse el modal, no renderiza nada

    // Función para manejar la selección de un checkbox
    const handleCheckboxChange = (embarque, checked) => {
        const embarqueId = embarque.idguiasexpo ? embarque.idguiasexpo : embarque.idguia; // Verificar cuál clave usar

        if (checked) {
            // Agregar el embarque al estado seleccionado
            setSelectedEmbarques((prevState) => [...prevState, embarque]);
        } else {
            // Eliminar el embarque del estado seleccionado
            setSelectedEmbarques((prevState) =>
                prevState.filter(
                    (item) => item.idguiasexpo !== embarqueId && item.idguia !== embarqueId
                )
            );
        }
    };

    const handleSelect = () => {
        // Envía solo los embarques seleccionados al padre
        onSelectEmbarques(selectedEmbarques);
        onClose(); // Cierra el modal
    };

    return (
        <div className="modal" onClick={onClose}>
            {/* Cerrar modal si se hace clic fuera */}
            <div className="modal-content-grande" onClick={(e) => e.stopPropagation()}>
                {/* Evita cerrar el modal al hacer clic dentro */}

                <h2 className="subtitulo-estandar">Embarques de Cliente</h2>

                {embarques.length > 0 ? (
                    <>
                        <table className="tabla-clientesbusqueda">
                            <thead>
                                <tr>
                                    <th>Guía</th>
                                    <th>Fecha Vuelo</th>
                                    <th>Origen</th>
                                    <th>Destino</th>
                                    <th>Seleccionar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {embarques.map((embarque) => {
                                    const embarqueId = embarque.idguiasexpo
                                        ? embarque.idguiasexpo
                                        : embarque.idguia; // Verificación de clave
                                    return (
                                        <tr key={embarqueId}>
                                            {/* Asegurarse de que la clave sea única */}
                                            <td>{embarque.guia}</td>
                                            <td>{embarque.fechavuelo}</td>
                                            <td>{embarque.origenguia}</td>
                                            <td>
                                                {embarque.destinoguia || embarque.destinovuelo}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmbarques.some(
                                                        (item) =>
                                                            item.idguiasexpo === embarqueId ||
                                                            item.idguia === embarqueId
                                                    )}
                                                    onChange={(e) =>
                                                        handleCheckboxChange(
                                                            embarque,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <button className="btn-estandar" onClick={handleSelect}>
                            Aceptar
                        </button>
                        {/* Botón para confirmar selección */}
                    </>
                ) : (
                    <p>No se encontraron embarques.</p> // Mensaje cuando no hay resultados
                )}
            </div>
        </div>
    );
};

export default ModalBusquedaEmbarque;
