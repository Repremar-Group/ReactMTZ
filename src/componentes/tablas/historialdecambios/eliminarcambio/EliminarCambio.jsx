import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de tener axios importado
import './eliminarcambio.css';

const Eliminarcambio = ({ fecha, cotizacion, closeModal, id }) => {
  if (!fecha || !cotizacion) return null; // No muestra nada si no hay empresa seleccionada

  const [loading, setLoading] = useState(false); // Estado para controlar el loading

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Confirma la eliminación y realiza la solicitud DELETE
    try {
      setLoading(true); // Establece loading en true mientras se realiza la solicitud
      const response = await axios.delete('http://localhost:3000/api/eliminartipocambio', {
        data: { id }, // Asegúrate de que el id es numérico, no una fecha
      });
  
      // Si la solicitud es exitosa
      alert('Tipo de cambio eliminado exitosamente');
      closeModal(); // Cierra el modal después de la eliminación
    } catch (error) {
      console.error('Error al eliminar el tipo de cambio:', error);
      alert('Hubo un error al eliminar el tipo de cambio');
    } finally {
      setLoading(false); // Vuelve a establecer loading en false después de la solicitud
    }
  };

  return (
    <form className='formularioschicos' onSubmit={handleSubmit}>
      <p>¿Estás seguro de que deseas eliminar el cambio del día {fecha}?</p>
      <div className="botoneseliminarcambio">
        <button className='btn-eliminar-estandar' type="submit" disabled={loading}>
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
        <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
      </div>
    </form>
  );
};

export default Eliminarcambio;