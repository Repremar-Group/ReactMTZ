import React, { useState } from 'react';
import '../Reportes.css'; // Importa el archivo CSS

const Reportesimpo = ({isLoggedIn}) => {
 // Estado para los campos del formulario
 const [desde, setDesde] = useState('');
 const [hasta, setHasta] = useState('');
 const [cliente, setCliente] = useState('');
 const [numeroCliente, setNumeroCliente] = useState('');
 const [tipoPago, setTipoPago] = useState('');

 // Función para manejar el envío del formulario
 const handleSubmitReporteImpo = (e) => {
   e.preventDefault();
   // Aquí puedes manejar la lógica para enviar la información
   console.log({
     desde,
     hasta,
     cliente,
     numeroCliente,
     tipoPago,
   });
 };

 return (
   <div className="reporte-container">
     <form className='formularioschicos' onSubmit={handleSubmitReporteImpo}>
     <h2 className='titulo-estandar'>Reporte de Embarque Importación</h2>
       <div className="date-container">
         <div className="date-field">
           <label htmlFor="desde">Desde:</label>
           <input
             type="date"
             id="desde"
             value={desde}
             onChange={(e) => setDesde(e.target.value)}
             required
           />
         </div>
         <div className="date-field">
           <label htmlFor="hasta">Hasta:</label>
           <input
             type="date"
             id="hasta"
             value={hasta}
             onChange={(e) => setHasta(e.target.value)}
             required
           />
         </div>
       </div>
       <div className='datoscliente-reporte'>
          <div >
            <label htmlFor="cliente">Cliente:</label>
            <input
              type="text"
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="numeroCliente">Número de Cliente:</label>
            <input
              type="text"
              id="numeroCliente"
              value={numeroCliente}
              onChange={(e) => setNumeroCliente(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="tipoPago">Tipo de Pago:</label>
            <select
              id="tipoPago"
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              required
            >
              <option value="">Selecciona un tipo de pago</option>
              <option value="credito">Crédito</option>
              <option value="contado">Contado</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>
       <button type="submit">Generar Reporte</button>
     </form>
   </div>
 );
}

export default Reportesimpo