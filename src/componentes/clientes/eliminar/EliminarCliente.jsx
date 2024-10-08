import React from 'react';
import './eliminarcliente.css'
const EliminarCliente = ({ empresa, rut, onConfirmar, onVolver }) => {
  if (!empresa || !rut) return null; // No muestra nada si no hay empresa seleccionada

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmar(); // Llama a la función para confirmar la eliminación falta crearla, ahi se eliminaria del sql
  };

  return (
    <div className="confirmacion-eliminacion">
      <form onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar la empresa {empresa} con RUT {rut}?</p>
        <div className="botones">
          <button type="submit" className="boton-confirmar">Eliminar</button>
          <button type="button" className="boton-volver" onClick={onVolver}>Volver</button>
        </div>
      </form>
    </div>
  );
};

export default EliminarCliente;
