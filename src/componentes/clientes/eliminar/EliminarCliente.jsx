import React from 'react';
import './eliminarcliente.css';

const EliminarCliente = ({ empresa, rut, closeModal }) => {
  if (!empresa || !rut) return null; // No muestra nada si no hay empresa seleccionada

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmar(); // Llama a la función para confirmar la eliminación
  };

  return (

      <form onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar la empresa {empresa} con RUT {rut}?</p>
        <div className="botones">
          <button className = 'btn-eliminar-cliente' type="submit" >Eliminar</button>
          <button className = 'btn-volver-eliminar-cliente'type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>

  );
};

export default EliminarCliente;