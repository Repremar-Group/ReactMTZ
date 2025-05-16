import React from 'react';
import axios from 'axios';
import './eliminarusuario.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const EliminarUsuario = ({ id, usr, closeModal }) => {
  if (!id) return null;
  const backURL = import.meta.env.VITE_BACK_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('ID a eliminar:', id);
    try {
      const response = await axios.delete(`${backURL}/api/deleteusuario`, {
        data: { Id: id } // Enviando el ID en el cuerpo de la solicitud
      });
      toast.success(response.data.mensaje); // Mensaje de éxito
      closeModal(); // Cierra el modal después de la eliminación
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error desconocido'); // Mostrar el error al usuario
    }
  };

  return (
    <div>
      <ToastContainer />
      <form className='formularioschicos' onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar el usuario {usr} con ID: {id}?</p>
        <div className="botones">
          <button className='btn-eliminar-estandar' type="submit" >Eliminar</button>
          <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>
    </div>


  );
};

export default EliminarUsuario;