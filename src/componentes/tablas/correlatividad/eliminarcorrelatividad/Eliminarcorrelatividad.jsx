import React from 'react';
import './eliminarcorrelatividad.css'
const Eliminarcorrelatividad = ({ documento, formulario, closeModal }) => {
  if (!documento || !formulario) return null; // No muestra nada si no hay empresa seleccionada

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmar(); // Llama a la función para confirmar la eliminación
  };

  return (

      <form className='formularioschicos' onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar la correlatividad entre el formulario {formulario} y el documento {documento}?</p>
        <div className="botoneseliminarcorrelatividad">
          <button className = 'btn-eliminar-estandar' type="submit" >Eliminar</button>
          <button className = 'btn-estandar'type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>

  );
};

export default Eliminarcorrelatividad