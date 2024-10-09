import React, { useState } from 'react'; // Asegúrate de importar useState
import './modificarcliente.css';

const ModificarCliente = ({ empresa, rut, closeModal, id, pais, email, tel }) => {
  if (!empresa || !rut) return null; // No muestra nada si no hay empresa seleccionada

  // Establece el estado local para los campos que se pueden modificar
  const [razonSocial, setRazonSocial] = useState(empresa);
  const [rutLocal, setRut] = useState(rut);
  const [idLocal, setID] = useState(id);
  const [paisLocal, setPais] = useState(pais);
  const [emailLocal, setEmail] = useState(email);
  const [telLocal, setTel] = useState(tel);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Llama a la función para controlar la modificación aquí
    onConfirmar(); // Debes implementar esta función según tus necesidades
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Modificar Empresa: {razonSocial} </h2>
      <div className="contenido-modificar-empresa">

        <div className='div_razonsocial_modificar'>
          <label htmlFor="razonsocial">Razón Social:</label>
          <input
            type="text"
            id="razonsocial"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="rut">RUT:</label>
          <input
            type="text"
            id="rut"
            value={rutLocal}
            onChange={(e) => setRut(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="id">ID:</label>
          <input
            type="text"
            id="id"
            value={idLocal}
            onChange={(e) => setID(e.target.value)}
            required
            readOnly // Mantén este campo como de solo lectura si no debe ser modificado
          />
        </div>
        <div>
          <label htmlFor="pais">País:</label>
          <input
            type="text"
            id="pais"
            value={paisLocal} // Usar el estado local para mostrar el país
            onChange={(e) => setPais(e.target.value)} // Permitir modificación
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email" // Cambiado a "email" para mayor precisión
            id="email"
            value={emailLocal}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="tel">Tel:</label>
          <input
            type="text"
            id="tel"
            value={telLocal}
            onChange={(e) => setTel(e.target.value)}
            required
          />
        </div>
        <div className='botones-formulario-modificar-cliente'>
          <button className='btn-modificar-cliente' type="submit">Modificar</button> {/* Cambié "Eliminar" a "Modificar" para reflejar la acción */}
          <button className='btn-volver-modificar-cliente' type="button" onClick={closeModal}>Volver</button>
        </div>

      </div>
    </form>
  );
};

export default ModificarCliente;