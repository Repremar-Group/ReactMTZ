import React from 'react';
import axios from 'axios';
import './eliminarcliente.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const EliminarCliente = ({ empresa, rut, id, CodigoGIA, closeModal }) => {
  if (!empresa || !rut) return null; // No muestra nada si no hay empresa seleccionada
  const backURL = import.meta.env.VITE_BACK_URL;
 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('ID a eliminar:', id);

  if (!id || !CodigoGIA) {
    toast.error('Faltan datos necesarios para eliminar el cliente');
    return;
  }

  try {
    const response = await axios.delete(`${backURL}/api/deleteclientes`, {
      data: { Id: id, CodigoGIA: CodigoGIA }
    });

    const { message, descripcionWS } = response.data;
    toast.success(`${message} - ${descripcionWS}`);
    closeModal(); // Cierra el modal si todo salió bien
  } catch (error) {
    const backendError = error.response?.data?.error;
    const descripcionWS = error.response?.data?.descripcion;

    if (backendError && descripcionWS) {
      toast.error(`${backendError} - ${descripcionWS}`);
    } else if (backendError) {
      toast.error(backendError);
    } else {
      toast.error('Error desconocido al intentar eliminar el cliente');
    }
  }
};

  return (
    <div>
      <ToastContainer  autoClose={5000}  />
      <form className='formularioschicos' onSubmit={handleSubmit}>
        <p>¿Estás seguro de que deseas eliminar la empresa {empresa} con RUT {rut} y su cuenta corriente?</p>
        <div className="botones">
          <button className='btn-eliminar-estandar' type="submit" >Eliminar</button>
          <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
        </div>
      </form>
    </div>


  );
};

export default EliminarCliente;