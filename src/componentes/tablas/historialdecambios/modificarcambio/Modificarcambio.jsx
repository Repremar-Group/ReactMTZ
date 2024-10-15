import React, { useState, useEffect } from 'react'; // Asegúrate de importar useEffect
import'./Modificarcambio.css';

const ModificarCambio = ({fecha, cotizacion, closeModal }) => {
    if (!fecha || !cotizacion) return null; // No muestra nada si no hay empresa seleccionada

    // Establece el estado local para los campos que se pueden modificar
    const [modfecha, setModFecha] = useState(fecha);
    const [modcotizacion, setModCotizacion] = useState(fecha);

    // Opcional: Si cambian las props, actualiza el estado local
    useEffect(() => {
        setModFecha(fecha);
        setModCotizacion(cotizacion)

    }, [fecha, cotizacion]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Llama a la función para controlar la modificación aquí
        onConfirmar(); // Debes implementar esta función según tus necesidades
    };

    return (
        <form className='formulario-editar-cambio' onSubmit={handleSubmit}>
            <h2 className='subtitulo-estandar'>Modificar Cambio: </h2>
            <div className="formulario-estandar">
                <div className='div_primerrenglon-modificarccambio'>
                    <div>
                        <label htmlFor="modfecha">Fecha:</label>
                        <input
                            type="date"
                            id="modfecha"
                            value={modfecha}
                            onChange={(e) => setModFecha(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="modcotizacion">Cotización:</label>
                        <input
                            type="text"
                            id="modcotizacion"
                            value={modcotizacion}
                            onChange={(e) => setModCotizacion(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className='botones-formulario-modificar-cambio'>
                    <button className='btn-estandar' type="submit">Modificar</button>
                    <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
                </div>
            </div>
        </form>
    );
};

export default ModificarCambio;
