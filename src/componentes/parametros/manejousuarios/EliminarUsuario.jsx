import React from 'react';
import axios from 'axios';
import './eliminarusuario.css';

const EliminarUsuario = ({ empresa, rut, id, closeModal }) => {
  if (!empresa || !rut) return null; // No muestra nada si no hay empresa seleccionada

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('ID a eliminar:', id);
    try {
      const response = await axios.delete('http://localhost:3000/api/deleteclientes', {
        data: { Id: id } // Enviando el ID en el cuerpo de la solicitud
      });
      alert(response.data.message); // Mensaje de éxito
      closeModal(); // Cierra el modal después de la eliminación
    } catch (error) {
      alert(error.response?.data?.error || 'Error desconocido'); // Mostrar el error al usuario
    }
  };

  return (

      <form className='formularioschicos' onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar la empresa {empresa} con RUT {rut} y su cuenta corriente?</p>
        <div className="botones">
          <button className = 'btn-eliminar-estandar' type="submit" >Eliminar</button>
          <button className = 'btn-estandar'type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>

  );
};

export default EliminarUsuario;