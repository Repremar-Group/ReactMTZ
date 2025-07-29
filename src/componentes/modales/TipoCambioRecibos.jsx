import React, { useState } from 'react';

const ModalTipoCambio = ({ isOpen, closeModal, onConfirm }) => {
  const [tipoCambio, setTipoCambio] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!tipoCambio || isNaN(tipoCambio)) {
      alert('Por favor ingresa un número válido');
      return;
    }
    onConfirm(parseFloat(tipoCambio));
    closeModal();
    setTipoCambio('');
  };

  return (
    <div className="modal" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className='titulo-estandar'>Ingresar Tipo de Cambio Especial</h2>
        <input
          type="text"
          className="input-estandar"
          value={tipoCambio}
          onChange={(e) => setTipoCambio(e.target.value)}
          placeholder="Ej: 42.50"
        />
        <div className="modal-buttons">
          <button className='btn-estandar' onClick={handleConfirm}>Confirmar</button>
          <button className='btn-estandar' onClick={closeModal}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalTipoCambio;