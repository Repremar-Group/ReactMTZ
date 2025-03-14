import React from 'react';
import Swal from 'sweetalert2';
import './modales.css';

const ModalAlertaGFE = ({ isOpen, title, message, onConfirm = () => {}, iconType = 'error' }) => {
  const [isAlertShown, setIsAlertShown] = React.useState(false);
  console.log('Message:', message);
  React.useEffect(() => {
    if (isOpen && !isAlertShown) {
      setIsAlertShown(true);

      Swal.fire({
        title: title,  // Título del modal
        html: `<p class="custom-message">${message}</p>`, // Mensaje en rojo debajo del título
        icon: iconType, // Icono parametrizado (success, error, etc.)
        showCancelButton: false, // No mostrar el botón de cancelar
        confirmButtonText: 'OK', // Texto del botón de OK
        customClass: {
            confirmButton: iconType === 'success' ? 'custom-success-button' : 'custom-confirm-button',
          },
        scrollbarPadding: false,
      }).then(() => {
        onConfirm();

        setTimeout(() => {
          setIsAlertShown(false); // Resetea el estado después de un pequeño delay
        }, 100);
      });
    }
  }, [isOpen, isAlertShown, title, message, onConfirm, iconType]);

  return null;
};

export default ModalAlertaGFE;