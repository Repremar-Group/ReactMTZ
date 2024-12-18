import React from 'react';
import Swal from 'sweetalert2';
import './modales.css';

const ModalAlerta = ({ isOpen, message, onConfirm, onCancel, type }) => {
  if (!isOpen) return null; // Si el modal no está abierto, no renderiza nada.

  const showAlert = () => {
    Swal.fire({
      title: message,
      icon: 'warning', // Puedes usar 'success', 'error', 'info', etc.
      imageAlt: 'Alerta',
      showCancelButton: type === 'confirm',  // Solo muestra el botón de cancelar si es confirmación
      confirmButtonText: type === 'confirm' ? 'Sí' : 'Cerrar',
      cancelButtonText: type === 'confirm' ? 'No' : undefined,
      customClass: {
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        actions: 'modal-buttons',  // Clase para el contenedor de los botones
      },
      scrollbarPadding: false, 
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();  // Si se confirma, ejecuta la función onConfirm
      } else {
        onCancel();  // Si se cancela, ejecuta la función onCancel
      }
    });
  };

  // Llamar a la alerta cuando el modal esté abierto
  React.useEffect(() => {
    if (isOpen) {
      showAlert();
    }
  }, [isOpen]);

  return null;  // No es necesario renderizar nada, la alerta se maneja por SweetAlert2
};

export default ModalAlerta;