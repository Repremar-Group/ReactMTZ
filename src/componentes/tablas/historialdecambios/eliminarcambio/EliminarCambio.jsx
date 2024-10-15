import React from 'react';
import './eliminarcambio.css'
const Eliminarcambio = ({ fecha, cotizacion, closeModal }) => {
  if (!fecha || !cotizacion) return null; // No muestra nada si no hay empresa seleccionada

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmar(); // Llama a la función para confirmar la eliminación
  };

  return (

      <form className='formularioschicos' onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar el cambio del día {fecha}?</p>
        <div className="botoneseliminarcambio">
          <button className = 'btn-eliminar-estandar' type="submit" >Eliminar</button>
          <button className = 'btn-estandar'type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>

  );
};

export default Eliminarcambio