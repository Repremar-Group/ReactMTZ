import React, { useState, useEffect } from 'react'; // Asegúrate de importar useEffect
import './modificarcorrelatividad.css';

const ModificarCorrelatividad = ({ formulario, documento, fecha, tipocomprobante, estado, closeModal }) => {
    if (!formulario || !documento) return null; // No muestra nada si no hay empresa seleccionada

    // Establece el estado local para los campos que se pueden modificar
    const [modformulario, setModFormulario] = useState(formulario);
    const [moddocumento, setModDocumento] = useState(documento);
    const [modfecha, setModFecha] = useState(fecha);
    const [modtipocomprobante, setModTipoComprobante] = useState(tipocomprobante);
    const [modestado, setModEstado] = useState(estado);

    // Opcional: Si cambian las props, actualiza el estado local
    useEffect(() => {
        setModFormulario(formulario);
        setModDocumento(documento);
        setModFecha(fecha);
        setModTipoComprobante(tipocomprobante);
        setModEstado(estado);
    }, [formulario, documento, fecha, tipocomprobante, estado]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Llama a la función para controlar la modificación aquí
        onConfirmar(); // Debes implementar esta función según tus necesidades
    };

    return (
        <form className='formulario-editar-correlatividad' onSubmit={handleSubmit}>
            <h2 className='subtitulo-estandar'>Modificar Correlatividad: </h2>
            <div className="contenido-modificar-empresa">
                <div className='div_primerrenglon-modificarcorrelatividad'>
                    <div>
                        <label htmlFor="modformulario">Formulario:</label>
                        <input
                            type="text"
                            id="modformulario"
                            value={modformulario}
                            onChange={(e) => setModFormulario(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="moddocumento">Documento:</label>
                        <input
                            type="text"
                            id="moddocumento"
                            value={moddocumento}
                            onChange={(e) => setModDocumento(e.target.value)}
                            required
                        />
                    </div>
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
                        <label htmlFor="modcomprobante">Tipo de Comprobante:</label>
                        <select
                            id="modcomprobante"
                            value={modtipocomprobante}
                            onChange={(e) => setModTipoComprobante(e.target.value)}
                            required
                        >
                            <option value="">Selecciona una Tipo</option>
                            <option value="Recibo">Recibo</option>
                            <option value="Factura">Factura</option>
                            <option value="etc">Etc</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="modestado">Estado:</label>
                        <input
                            type="text"
                            id="modestado"
                            value={modestado}
                            onChange={(e) => setModEstado(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className='botones-formulario-modificar-correlatividad'>
                    <button className='btn-estandar' type="submit">Modificar</button>
                    <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
                </div>
            </div>
        </form>
    );
};

export default ModificarCorrelatividad;
