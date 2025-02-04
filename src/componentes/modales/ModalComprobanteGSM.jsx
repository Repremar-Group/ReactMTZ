import React, { useState, useEffect } from 'react';

const ModalComprobanteGSM = ({ isOpen, onClose, datos }) => {
  if (!isOpen) return null;
  console.log('Datos Comprobante GSM', datos);

  const [ectotalacobrar, setEcTotalACobrar] = useState(0);
  const [ecsubtotal, setEcsubtotal] = useState(0);
  const [eciva, setEcIva] = useState(0);
  const [ecredondeo, setEcRedondeo] = useState(0);
  const [ectotal, setEcTotal] = useState(0);

  useEffect(() => {
    if (datos.length > 0) {
      // Sumar los importes
      const subtotal = datos.reduce((acc, concepto) => acc + parseFloat(concepto.importe || 0), 0);
      const iva = 0;
      const total = subtotal + iva;
      const redondeo = Math.round(total) - total; // Redondeo
      const totalACobrar = total + redondeo;

      setEcsubtotal(subtotal.toFixed(2));
      setEcIva(iva.toFixed(2));
      setEcTotal(total.toFixed(2));
      setEcRedondeo(redondeo.toFixed(2));
      setEcTotalACobrar(totalACobrar.toFixed(2));
    }
  }, [datos]);

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content-grande">
        <table className='tabla-comprobantegsm'>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Código</th>
              <th>Guía</th>
              <th>Descripción</th>
              <th>Moneda</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((concepto, index) => (
              <tr key={index}>
                <td>{concepto.tipo}</td>
                <td>{concepto.id_concepto}</td>
                <td>{concepto.guia}</td>
                <td>{concepto.descripcion}</td>
                <td>{concepto.moneda}</td>
                <td>{concepto.importe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='div-totales-comprobante'>
          <h3 className='subtitulo-estandar'>Totales</h3>
          <div className='div-primerrenglon-datos-comprobante'>
            <div>
              <label htmlFor="ecsubtotal">Subtotal:</label>
              <input type="text" id="ecsubtotal" value={ecsubtotal} readOnly />
            </div>
            <div>
              <label htmlFor="ecivatotal">IVA:</label>
              <input type="text" id="ecivatotal" value={eciva} readOnly />
            </div>
            <div>
              <label htmlFor="ecredondeo">Redondeo:</label>
              <input type="text" id="ecredondeo" value={ecredondeo} readOnly />
            </div>
            <div>
              <label htmlFor="ectotal">Total:</label>
              <input type="text" id="ectotal" value={ectotal} readOnly />
            </div>
            <div>
              <label htmlFor="ectotalacobrar">Total a Cobrar:</label>
              <input type="text" id="ectotalacobrar" value={ectotalacobrar} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalComprobanteGSM;