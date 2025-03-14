import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de tener axios importado
import './eliminarcambio.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const Eliminarcambio = ({ fecha, cotizacion, closeModal, id }) => {
  if (!fecha || !cotizacion) return null; // No muestra nada si no hay empresa seleccionada

  const [loading, setLoading] = useState(false); // Estado para controlar el loading
  const backURL = import.meta.env.VITE_BACK_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirma la eliminación y realiza la solicitud DELETE
    try {
      setLoading(true); // Establece loading en true mientras se realiza la solicitud
      const response = await axios.delete(`${backURL}/api/eliminartipocambio`, {
        data: { id, fecha }, // Asegúrate de que el id es numérico, no una fecha
      });

      // Si la solicitud es exitosa
      toast.success('Tipo de cambio eliminado exitosamente');
      closeModal(); // Cierra el modal después de la eliminación
    } catch (error) {
      console.error('Error al eliminar el tipo de cambio:', error);
      // Acceder al error y mostrar el mensaje adecuado
      if (error.response && error.response.status === 450) {
        toast.error(error.response.data.error); // Mostrar el mensaje de error desde el backend
      } else {
        toast.error('Hubo un error al eliminar el tipo de cambio');
      }
    } finally {
      setLoading(false); // Vuelve a establecer loading en false después de la solicitud
    }
  };

  return (
    <div>
      <ToastContainer />
      <form className='formularioschicos' onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar el cambio del día {fecha}?</p>
        <div className="botoneseliminarcambio">
          <button className='btn-eliminar-estandar' type="submit" disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>
    </div>

  );
};

export default Eliminarcambio;