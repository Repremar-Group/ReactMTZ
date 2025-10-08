import React from 'react';
import Swal from 'sweetalert2';
import './modales.css';

const ModalAlerta = ({ isOpen, message, onConfirm = () => {}, onCancel = () => {}, type = 'alert' }) => {
  const hasOpened = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && !hasOpened.current) {
      hasOpened.current = true;

      Swal.fire({
        title: message,
        icon: type === 'confirm' ? 'warning' : 'info',
        showCancelButton: type === 'confirm',
        confirmButtonText: type === 'confirm' ? 'Sí' : 'Cerrar',
        cancelButtonText: type === 'confirm' ? 'No' : undefined,
        customClass: {
          confirmButton: 'custom-confirm-button',
          cancelButton: 'custom-cancel-button',
          actions: 'modal-buttons',
        },
        scrollbarPadding: false,
      }).then((result) => {
        setTimeout(() => {
          if (result.isConfirmed) {
            onConfirm();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            onCancel();
          }
          hasOpened.current = false; // reseteamos para permitir futuras aperturas
        }, 50);
      });
    }
  }, [isOpen, message, type, onConfirm, onCancel]);

  return null;
};
export default ModalAlerta;