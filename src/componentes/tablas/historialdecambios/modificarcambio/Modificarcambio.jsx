import React, { useState, useEffect } from 'react'; // Asegúrate de importar useEffect
import'./Modificarcambio.css';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const ModificarCambio = ({fecha, cotizacion, closeModal, id }) => {
    if (!fecha || !cotizacion) return null; // No muestra nada si no hay empresa seleccionada

    // Establece el estado local para los campos que se pueden modificar
    const [modfecha, setModFecha] = useState(fecha);
    const [modcotizacion, setModCotizacion] = useState(fecha);
    const [modid, setModId] = useState(id);

    // Opcional: Si cambian las props, actualiza el estado local
    useEffect(() => {
        setModFecha(fecha);
        setModCotizacion(cotizacion)
        setModId(id)
    }, [fecha, cotizacion, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Llamar al endpoint para modificar el tipo de cambio
        try {
          const response = await axios.put('http://localhost:3000/api/modificartipocambio', {
            id: modid,
            fecha: modfecha,
            tipo_cambio: modcotizacion,
          });
    
          // Si la solicitud es exitosa
          toast.success('Tipo de cambio modificado exitosamente');
          closeModal(); // Cierra el modal después de la modificación
        } catch (error) {
            console.error('Error al modificar el tipo de cambio:', error);
          
            // Acceder al error y mostrar el mensaje adecuado
            if (error.response && error.response.status === 450) {
              toast.error(error.response.data.error); // Mostrar el mensaje de error desde el backend
            } else {
              toast.error('Hubo un error al modificar el tipo de cambio');
            }
          }
      };

    return (
        <div>
            <ToastContainer />
            <form className='formulario-editar-cambio' onSubmit={handleSubmit}>
            <h2 className='subtitulo-estandar'>Modificar Cambio: {modfecha}</h2>
            <div className="formulario-estandar">
                <div className='div_primerrenglon-modificarccambio'>
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
        </div>
        
    );
};

export default ModificarCambio;
