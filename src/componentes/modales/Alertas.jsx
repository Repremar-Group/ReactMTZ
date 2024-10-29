import React from 'react';
import './modales.css'; 

const Alertas = ({ message, onClose }) => {
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <p>{message}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default Alertas;