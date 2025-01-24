import React from 'react';

const ModalComprobanteGSM = ({ isOpen, onClose, datos }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <button onClick={onClose} style={styles.closeButton}>Cerrar</button>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Tipo</th>
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
                <td>{concepto.guia}</td>
                <td>{concepto.descripcion}</td>
                <td>{concepto.moneda}</td>
                <td>{concepto.importe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '80%',
      maxWidth: '800px',
    },
    closeButton: {
      marginBottom: '10px',
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
  };
export default ModalComprobanteGSM;