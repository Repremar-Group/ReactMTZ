import React from 'react';
import Swal from 'sweetalert2';
import './modales.css';

const ModalAlerta = ({ isOpen, message, onConfirm = () => {}, onCancel = () => {}, type = 'alert' }) => {
  const [isAlertShown, setIsAlertShown] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && !isAlertShown) {
      setIsAlertShown(true);

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
        if (result.isConfirmed) {
          onConfirm();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          onCancel();
        }

        setTimeout(() => {
          setIsAlertShown(false); // Resetea el estado después de un pequeño delay para evitar reactivaciones no deseadas
        }, 100);
      });
    }
  }, [isOpen, isAlertShown, message, type, onConfirm, onCancel]);

  return null;
};

export default ModalAlerta;